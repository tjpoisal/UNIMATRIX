export interface Memory {
  id:           string;
  hint:         string | null;
  summary:      string | null;
  source:       string;
  status:       'active' | 'superseded' | 'archived';
  importance:   'low' | 'medium' | 'high' | null;
  semanticCat:  string | null;
  spaceId:      string | null;
  tags:         string[];
  createdAt:    string;
  indexedAt:    string | null;
}

export interface RecallResult {
  memories: Memory[];
  query:    string;
  spaceId:  string | null;
}

export interface StoreMemoryInput {
  content:    string;
  hint?:      string;
  tags?:      string[];
  password:   string;   // client-side encryption key
}
