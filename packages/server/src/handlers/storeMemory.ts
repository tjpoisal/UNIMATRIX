/**
 * src/handlers/storeMemory.ts
 *
 * MCP Tool: store_memory
 *
 * Security flow (in order):
 *   1. Injection check    → hard reject, never queued
 *   2. Sanitize           → redacted copy for Librarian + embedding
 *   3. Encrypt verbatim   → stored in memories.content (BYTEA)
 *   4. Insert to DB       → episodic layer row, indexed_at = NULL
 *   5. Queue Librarian    → fire-and-forget (does not block the response)
 *   6. Audit log          → written automatically by withAudit wrapper
 *
 * The Librarian receives SANITIZED content, never the verbatim original.
 * Verbatim is only decrypted by get_timeline when explicitly requested.
 */

import { withUserContext }                        from '../db/client.js';
import { withAudit }                              from '../middleware/audit.js';
import { checkForInjection, sanitizeForIndexing } from '../security/sanitize.js';
import { encryptContent, prepareForEmbedding }    from '../security/encryption.js';
import { processLibrarianJob }                    from '../librarian/processJob.js';
import type { StoreMemoryInput, StoreMemoryOutput } from '../types/mcp.js';
import type { LibrarianJob }                      from '../types/domain.js';

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

    // prepareForEmbedding sanitizes again — used by Librarian, not here directly
    const embeddingInput = prepareForEmbedding(sanitizedContent);

    // ------------------------------------------------------------------
    // 3. Encrypt verbatim original
    // ------------------------------------------------------------------
    const { ciphertext, iv } = await encryptContent(input.content, userId);

    // ------------------------------------------------------------------
    // 4. Insert episodic row — indexed_at is NULL until Librarian runs
    // ------------------------------------------------------------------
    const memoryId = await withUserContext(userId, async (client) => {
      const result = await client.query<{ id: string }>(
        `INSERT INTO memories
           (user_id, content, content_iv, source, hint, status)
         VALUES ($1, $2, $3, 'mcp', $4, 'active')
         RETURNING id`,
        [userId, ciphertext, iv, input.hint ?? null],
      );
      return result.rows[0].id;
    });

    // ------------------------------------------------------------------
    // 5. Queue Librarian — fire-and-forget, does not block the response
    // ------------------------------------------------------------------
    const librarianJob: LibrarianJob = {
      memoryId,
      userId,
      content:   embeddingInput,   // sanitized — no API keys or PII
      hint:      input.hint ?? null,
      createdAt: new Date(),
    };

    // intentionally not awaited — Librarian runs async
    processLibrarianJob(librarianJob).catch((err) => {
      console.error(`[Librarian] Failed to process ${memoryId}:`, err);
    });

    return {
      memoryId,
      status:              'queued',
      estimatedIndexingMs: 1_200,
    };
  },
);
