import { createHash } from 'node:crypto';

export function semanticHash(obj: any): string {
  const normalized = normalizeForHash(obj);
  const str = JSON.stringify(normalized);
  return createHash('sha256').update(str).digest('hex');
}

function normalizeForHash(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(normalizeForHash);
  }

  const keys = Object.keys(obj).sort();
  const result: Record<string, any> = {};
  for (const key of keys) {
    const val = obj[key];
    if (val !== undefined && val !== null) {
      result[key] = normalizeForHash(val);
    }
  }
  return result;
}
