/**
 * src/handlers/supersedeMemory.ts
 *
 * MCP Tool: supersede_memory
 *
 * Marks an existing memory as outdated. Two modes:
 *
 *   1. Simple supersession (memoryId only)
 *      The target memory is marked status='superseded'. No replacement stored.
 *      Use when information is no longer relevant and shouldn't be replaced.
 *
 *   2. Replace + supersede (memoryId + content)
 *      A new memory is stored (same pipeline as store_memory: encrypt, Librarian
 *      queue, etc.) and the old memory is linked to it via superseded_by.
 *      Use when correcting a fact: "I changed jobs" → old job memory is
 *      superseded, new one is created and indexed.
 *
 * Why this matters:
 *   recall_context and search_memories filter to status='active' by default.
 *   Without supersession, stale facts compete with correct ones forever.
 *   get_timeline still returns superseded entries for full historical recall.
 *
 * Security:
 *   - withUserContext enforces RLS — users can only supersede their own memories
 *   - Replacement content goes through the same injection + encryption pipeline
 *     as store_memory before touching the DB
 *   - Audit logging via withAudit wrapper
 */

import { withUserContext, pool }                        from '../db/client.js';
import { withAudit }                              from '../middleware/audit.js';
import { checkForInjection, sanitizeForIndexing } from '../security/sanitize.js';
import { encryptContent, prepareForEmbedding }    from '../security/encryption.js';
import { processLibrarianJob }                    from '../librarian/processJob.js';
import type {
  SupersedeMemoryInput,
  SupersedeMemoryOutput,
} from '../types/mcp.js';
import type { LibrarianJob } from '../types/domain.js';

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export const supersedeMemoryHandler = withAudit(
  'supersede_memory',
  async (
    input:  SupersedeMemoryInput,
    userId: string,
  ): Promise<SupersedeMemoryOutput & { memoryId?: string }> => {

    // ------------------------------------------------------------------
    // 1. Validate target memory exists and belongs to this user (RLS does
    //    the ownership check; we just need to confirm the row exists first).
    // ------------------------------------------------------------------
    const target = await withUserContext(userId, async (client) => {
      const res = await client.query<{ id: string; status: string }>(
        `SELECT id, status FROM memories
          WHERE id      = $1
            AND user_id = current_user_id()::uuid`,
        [input.memoryId],
      );
      return res.rows[0] ?? null;
    });

    if (!target) {
      throw Object.assign(
        new Error(`Memory ${input.memoryId} not found or does not belong to you`),
        { code: 'NotFound', statusCode: 404 },
      );
    }

    if (target.status === 'superseded') {
      throw Object.assign(
        new Error(`Memory ${input.memoryId} is already superseded`),
        { code: 'AlreadySuperseded', statusCode: 409 },
      );
    }

    // ------------------------------------------------------------------
    // 2. If replacement content provided — run the full store pipeline
    //    to create the new memory BEFORE marking the old one superseded.
    //    This way: if anything fails (injection check, Voyage, DB insert)
    //    the original memory stays active rather than being orphaned.
    // ------------------------------------------------------------------
    let replacementId: string | null = null;

    if (input.content) {
      // Injection check
      const contentCheck = checkForInjection(input.content);
      if (!contentCheck.safe) {
        throw Object.assign(
          new Error('Potential prompt injection detected in replacement content'),
          { code: 'InjectionDetected', matchedPattern: contentCheck.matchedPattern },
        );
      }

      if (input.hint) {
        const hintCheck = checkForInjection(input.hint);
        if (!hintCheck.safe) {
          throw Object.assign(
            new Error('Potential prompt injection in hint field'),
            { code: 'InjectionDetected', matchedPattern: hintCheck.matchedPattern },
          );
        }
      }

      // Sanitize for Librarian
      const { redacted: sanitizedContent, hadApiKeys, hadPii } =
        sanitizeForIndexing(input.content);

      if (hadApiKeys) console.warn(`[supersede_memory] API key redacted for ${userId}`);
      if (hadPii)     console.warn(`[supersede_memory] PII redacted for ${userId}`);

      const embeddingInput = prepareForEmbedding(sanitizedContent);

      // Encrypt verbatim original
      const { ciphertext, iv } = await encryptContent(input.content, userId);

      // Insert new memory row
      replacementId = await withUserContext(userId, async (client) => {
        const res = await client.query<{ id: string }>(
          `INSERT INTO memories
             (user_id, content, content_iv, source, hint, status)
           VALUES (current_user_id()::uuid, $1, $2, 'mcp', $3, 'active')
           RETURNING id`,
          [ciphertext, iv, input.hint ?? null],
        );
        return res.rows[0].id;
      });

      // Enqueue via AgentRun for the worker (preferred)
      const job: LibrarianJob = {
        memoryId:  replacementId,
        userId,
        content:   embeddingInput,
        hint:      input.hint ?? null,
        createdAt: new Date(),
      };

      try {
        await pool.query(
          `INSERT INTO agent_runs (id, user_id, task, status, result, memory_ids, created_at, updated_at)
           VALUES (gen_random_uuid(), $1, 'librarian', 'pending', $2, $3, NOW(), NOW())`,
          [userId, JSON.stringify({ job }), [replacementId]]
        );
      } catch (e) {
        console.warn('[Supersede] AgentRun enqueue failed, fallback direct', e);
        processLibrarianJob(job).catch((err) =>
          console.error(`[Librarian] Failed to process replacement ${replacementId}:`, err),
        );
      }
    }

    // ------------------------------------------------------------------
    // 3. Mark the old memory as superseded (atomic single UPDATE)
    // ------------------------------------------------------------------
    await withUserContext(userId, async (client) => {
      await client.query(
        `UPDATE memories
            SET status        = 'superseded',
                superseded_at = NOW(),
                superseded_by = $2
          WHERE id      = $1
            AND user_id = current_user_id()::uuid`,
        [input.memoryId, replacementId],   // replacementId is null if no content
      );
    });

    return {
      supersededId:  input.memoryId,
      replacementId,
      status:        'superseded',
      // withAudit reads memoryId for audit log — point to new memory if it exists
      memoryId:      replacementId ?? input.memoryId,
    };
  },
);
