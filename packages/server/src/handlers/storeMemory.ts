/**
 * src/handlers/storeMemory.ts
 *
 * MCP Tool: store_memory
 *
 * Security flow (in order):
 *   1. Injection check    → hard reject, never queued
 *   2. Sanitize           → redacted copy for Librarian + embedding
 *   3. Encrypt verbatim   → stored in memories.content (BYTEA)
 *   4. Insert to DB       → episodic layer row, indexed_at = NULL, spaceId = NULL (Librarian will set it)
 *   5. Queue Librarian    → enqueue AgentRun (picked up by worker.ts)
 *   6. Audit log          → written automatically by withAudit wrapper
 *
 * The Librarian receives SANITIZED content, never the verbatim original.
 * Verbatim is only decrypted by get_timeline when explicitly requested.
 *
 * Phase 1D/E: Librarian uses local-model.ts (Ollama/mistral/rule-based).
 * No external LLM API calls.
 */

import { withUserContext, withUserContextRaw } from '../db/client.js';
import { withAudit }                           from '../middleware/audit.js';
import { checkForInjection, sanitizeForIndexing } from '../security/sanitize.js';
import { encryptContent, prepareForEmbedding }    from '../security/encryption.js';
import { processLibrarianJob }                 from '../librarian/processJob.js';
import type { StoreMemoryInput, StoreMemoryOutput } from '../types/mcp.js';
import type { LibrarianJob }                   from '../types/domain.js';

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export const storeMemoryHandler = withAudit(
  'store_memory',
  async (
    input:  StoreMemoryInput,
    userId: string,
  ): Promise<StoreMemoryOutput & { memoryId: string }> => {

    // ------------------------------------------------------------------
    // 1. Injection check — hard reject before anything else runs
    // ------------------------------------------------------------------
    const contentCheck = checkForInjection(input.content);
    if (!contentCheck.safe) {
      throw Object.assign(
        new Error('Potential prompt injection detected — request rejected'),
        { code: 'InjectionDetected', matchedPattern: contentCheck.matchedPattern },
      );
    }

    if (input.hint) {
      const hintCheck = checkForInjection(input.hint);
      if (!hintCheck.safe) {
        throw Object.assign(
          new Error('Potential prompt injection in hint field — request rejected'),
          { code: 'InjectionDetected', matchedPattern: hintCheck.matchedPattern },
        );
      }
    }

    // ------------------------------------------------------------------
    // 2. Sanitize — produce redacted copy for Librarian + embedding
    // ------------------------------------------------------------------
    const { redacted: sanitizedContent, hadApiKeys, hadPii } =
      sanitizeForIndexing(input.content);

    if (hadApiKeys) {
      console.warn(`[store_memory] API key detected in content for ${userId} — redacted`);
    }
    if (hadPii) {
      console.warn(`[store_memory] PII detected in content for ${userId} — redacted`);
    }

    const embeddingInput = prepareForEmbedding(sanitizedContent);

    // ------------------------------------------------------------------
    // 3. Encrypt verbatim original
    // ------------------------------------------------------------------
    const { ciphertext, iv } = await encryptContent(input.content, userId);

    // ------------------------------------------------------------------
    // 4. Insert episodic row
    //    spaceId is intentionally NULL here — the Librarian worker will
    //    classify and assign it after embedding + space similarity search.
    //    This is the correct Phase 1D architecture: store first, classify async.
    // ------------------------------------------------------------------
    const memoryId = await withUserContext(userId, async (tx) => {
      const memory = await tx.memory.create({
        data: {
          userId,
          spaceId:   null,   // Librarian will assign after classification
          content:   ciphertext as any,
          contentIv: iv as any,
          source:    'mcp',
          hint:      input.hint ?? null,
          status:    'active',
        },
        select: { id: true },
      });
      return memory.id;
    });

    // Auto-tag with caller-provided tags (source LLM, device, etc.)
    if (input.tags && input.tags.length > 0) {
      try {
        await withUserContextRaw(userId, async (client) => {
          for (const tag of input.tags!) {
            await client.query(
              `INSERT INTO memory_tags (memory_id, user_id, tag) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
              [memoryId, userId, tag],
            );
          }
        });
      } catch (e) {
        console.warn('[store_memory] Failed to insert caller-provided tags:', e);
      }
    }

    // ------------------------------------------------------------------
    // 5. Enqueue Librarian via AgentRun
    //    worker.ts polls this table every 15s and runs processLibrarianJob.
    //    Falls back to direct (in-process) call if AgentRun insert fails.
    // ------------------------------------------------------------------
    const librarianJob: LibrarianJob = {
      memoryId,
      userId,
      content:   embeddingInput,   // sanitized — no API keys or PII
      hint:      input.hint ?? null,
      createdAt: new Date(),
    };

    try {
      await withUserContext(userId, async (tx) => {
        await tx.agentRun.create({
          data: {
            userId,
            task:      'librarian',
            status:    'pending',
            result:    { job: librarianJob } as any,
            memoryIds: [memoryId],
          },
        });
      });
    } catch (e) {
      // Fallback: run in-process if AgentRun table unavailable
      console.warn('[store_memory] Could not enqueue via AgentRun, running Librarian inline', e);
      processLibrarianJob(librarianJob).catch((err) => {
        console.error(`[Librarian] Inline processing failed for ${memoryId}:`, err);
      });
    }

    return {
      memoryId,
      status:              'queued',
      estimatedIndexingMs: 1_200,
    };
  },
);
