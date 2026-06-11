import type { SecurityRequirement } from '../../types/index.js';

export function normalizeSecurity(securityArray?: any[]): SecurityRequirement[] {
  if (!securityArray || !Array.isArray(securityArray)) {
    return [];
  }

  const result: SecurityRequirement[] = [];
  for (const req of securityArray) {
    for (const [schemeId, scopes] of Object.entries(req)) {
      result.push({
        schemeId,
        scopes: Array.isArray(scopes) ? scopes.map(String) : []
      });
    }
  }
  return result;
}
