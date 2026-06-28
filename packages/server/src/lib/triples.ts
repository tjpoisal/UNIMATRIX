/**
 * src/lib/triples.ts
 *
 * Lightweight heuristic triple extractor.
 * Covers the most common first-person fact patterns with zero LLM cost.
 * Full NLI-based extraction is Phase 2.
 *
 * Extracted from processJob.ts — this is its sole home.
 */

export interface Triple {
  subject:   string;
  predicate: string;
  object:    string;
}

const PATTERNS: Array<{ re: RegExp; pred: string }> = [
  { re: /\bi\s+prefer[s]?\s+(.+?)(?:[.,;]|$)/gi,           pred: 'prefers'    },
  { re: /\bi\s+like[s]?\s+(.+?)(?:[.,;]|$)/gi,              pred: 'likes'      },
  { re: /\bi\s+use[s]?\s+(.+?)(?:[.,;]|$)/gi,               pred: 'uses'       },
  { re: /\bi\s+am\s+(.+?)(?:[.,;]|$)/gi,                    pred: 'is'         },
  { re: /\bi'?m\s+(.+?)(?:[.,;]|$)/gi,                      pred: 'is'         },
  { re: /\bi\s+work\s+(?:on|at|for)\s+(.+?)(?:[.,;]|$)/gi,  pred: 'works_on'   },
  { re: /\bbuilding\s+(.+?)(?:[.,;]|$)/gi,                   pred: 'building'   },
  { re: /\bdeveloping\s+(.+?)(?:[.,;]|$)/gi,                 pred: 'developing' },
  { re: /\bmy\s+(?:name\s+is|name's)\s+(.+?)(?:[.,;]|$)/gi, pred: 'name_is'    },
  { re: /\bmy\s+goal\s+is\s+(.+?)(?:[.,;]|$)/gi,            pred: 'goal_is'    },
  { re: /\bi\s+know\s+(.+?)(?:[.,;]|$)/gi,                   pred: 'knows'      },
  { re: /\bi\s+need\s+(.+?)(?:[.,;]|$)/gi,                   pred: 'needs'      },
  { re: /\bi\s+want\s+(.+?)(?:[.,;]|$)/gi,                   pred: 'wants'      },
  { re: /\bi\s+hate\s+(.+?)(?:[.,;]|$)/gi,                   pred: 'dislikes'   },
  { re: /\bi\s+dislike[s]?\s+(.+?)(?:[.,;]|$)/gi,            pred: 'dislikes'   },
  { re: /\bmy\s+(?:project|app|tool)\s+is\s+(.+?)(?:[.,;]|$)/gi, pred: 'project_is' },
];

/**
 * Extract subject-predicate-object triples from free-form text.
 * userId becomes the subject for first-person statements.
 */
export function extractTriplesHeuristic(content: string, userId: string): Triple[] {
  const triples: Triple[] = [];
  const seen = new Set<string>();

  for (const { re, pred } of PATTERNS) {
    re.lastIndex = 0;
    let m: RegExpMatchArray | null;
    while ((m = re.exec(content)) !== null) {
      const obj = m[1]?.trim().slice(0, 140);
      if (!obj || obj.length < 3) continue;
      const key = `${userId}|${pred}|${obj}`;
      if (seen.has(key)) continue;
      seen.add(key);
      triples.push({ subject: userId, predicate: pred, object: obj });
    }
  }

  return triples;
}
