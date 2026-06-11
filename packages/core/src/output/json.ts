import type { SemanticChange } from '../types/index.js';

export function formatJson(changes: SemanticChange[]): string {
  return JSON.stringify({ changes }, null, 2);
}
