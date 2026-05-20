/**
 * src/security/sanitize.ts
 *
 * Input sanitization and injection detection for Unimatrix.
 *
 * Two distinct concerns:
 *   1. Injection detection  — hard-reject malicious prompts before storage
 *   2. Redaction for indexing — strip API keys + PII from the Librarian payload
 *      (verbatim content is still encrypted and stored; only the index copy is redacted)
 */

import { createHash } from 'node:crypto';

// ---------------------------------------------------------------------------
// Injection detection
// ---------------------------------------------------------------------------

export interface InjectionCheckResult {
  safe:           boolean;
  matchedPattern?: string;
}

const INJECTION_PATTERNS: Array<{ regex: RegExp; name: string }> = [
  { regex: /ignore\s+(all\s+)?previous\s+instructions?/i,  name: 'ignore-previous'     },
  { regex: /system\s+prompt/i,                             name: 'system-prompt'       },
  { regex: /<\|endoftext\|>/i,                             name: 'endoftext-token'     },
  { regex: /you\s+are\s+now\s+(a|an|the)\s+/i,            name: 'persona-override'    },
  { regex: /disregard\s+(all\s+)?previous/i,               name: 'disregard-previous'  },
  { regex: /\[INST\]|\[\/INST\]|<s>|<\/s>/i,              name: 'llama-tokens'        },
  { regex: /###\s*instruction/i,                           name: 'instruction-header'  },
  { regex: /act\s+as\s+(if\s+you\s+are|a|an)\s+/i,        name: 'act-as'             },
  { regex: /forget\s+(everything|all|your\s+previous)/i,  name: 'forget-previous'     },
  { regex: /<\/?system>/i,                                 name: 'system-tag'          },
  { regex: /\bDAN\b|\bjailbreak\b/i,                       name: 'jailbreak-keyword'   },
];

/**
 * Checks text for prompt injection patterns.
 * Returns { safe: true } if clean, { safe: false, matchedPattern } if suspicious.
 * Hard-reject callers should throw on !result.safe.
 */
export function checkForInjection(text: string): InjectionCheckResult {
  for (const { regex, name } of INJECTION_PATTERNS) {
    if (regex.test(text)) {
      return { safe: false, matchedPattern: name };
    }
  }
  return { safe: true };
}

// ---------------------------------------------------------------------------
// Redaction for indexing
// ---------------------------------------------------------------------------

export interface SanitizeResult {
  redacted:      string;
  hadApiKeys:    boolean;
  hadPii:        boolean;
  redactedRules: string[];
}

const API_KEY_RULES: Array<{ regex: RegExp; label: string }> = [
  { regex: /sk-ant-[a-zA-Z0-9\-_]{20,}/g,      label: 'anthropic-key'  },
  { regex: /sk-[a-zA-Z0-9]{20,}/g,             label: 'openai-key'     },
  { regex: /AKIA[0-9A-Z]{16}/g,                label: 'aws-access-key' },
  { regex: /ghp_[a-zA-Z0-9]{36}/g,             label: 'github-pat'     },
  { regex: /ghs_[a-zA-Z0-9]{36}/g,             label: 'github-app'     },
  { regex: /AIza[0-9A-Za-z\-_]{35}/g,          label: 'google-api-key' },
  { regex: /pa-[a-zA-Z0-9\-_]{20,}/g,          label: 'voyage-key'     },
  { regex: /Bearer\s+[a-zA-Z0-9\-_\.]{20,}/g,  label: 'bearer-token'   },
];

const PII_RULES: Array<{ regex: RegExp; label: string }> = [
  { regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, label: 'email'       },
  { regex: /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g,                  label: 'ssn'         },
  { regex: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, label: 'phone' },
  { regex: /\b4[0-9]{12}(?:[0-9]{3})?\b/g,                        label: 'visa-card'   },
  { regex: /\b5[1-5][0-9]{14}\b/g,                                 label: 'mc-card'     },
];

/**
 * Redacts API keys and PII from text before it flows into the vector index.
 * The verbatim original is encrypted separately — this only sanitizes the
 * copy that the Librarian, embeddings, and search index will see.
 */
export function sanitizeForIndexing(text: string): SanitizeResult {
  let redacted      = text;
  let hadApiKeys    = false;
  let hadPii        = false;
  const redactedRules: string[] = [];

  for (const { regex, label } of API_KEY_RULES) {
    regex.lastIndex = 0;
    if (regex.test(redacted)) {
      hadApiKeys = true;
      redactedRules.push(label);
      regex.lastIndex = 0;
      redacted = redacted.replace(regex, `[REDACTED:${label}]`);
    }
  }

  for (const { regex, label } of PII_RULES) {
    regex.lastIndex = 0;
    if (regex.test(redacted)) {
      hadPii = true;
      redactedRules.push(label);
      regex.lastIndex = 0;
      redacted = redacted.replace(regex, `[REDACTED:${label}]`);
    }
  }

  return { redacted, hadApiKeys, hadPii, redactedRules };
}

// ---------------------------------------------------------------------------
// Audit hashing
// ---------------------------------------------------------------------------

/**
 * One-way hash of a payload for audit log storage.
 * Never stored as plaintext — only the first 1000 chars are hashed,
 * and only the first 16 hex chars are kept (enough for correlation).
 */
export function hashPayload(content: string): string {
  return createHash('sha256')
    .update(content.slice(0, 1_000))
    .digest('hex')
    .slice(0, 16);
}
