import { BaseRule } from '../base.js';
import type { DiffSet, RuleContext, SemanticChange } from '../../types/index.js';

export class SecurityAddedRule extends BaseRule {
  id = 'SECURITY_ADDED';
  description = 'Authentication added to previously public endpoint';
  severity = 'breaking' as const;

  apply(diff: DiffSet, context: RuleContext): SemanticChange[] {
    const changes: SemanticChange[] = [];
    for (const ed of diff.endpointDiffs) {
      if (ed.type !== 'changed') continue;
      if (this.isIgnored(ed.path, context)) continue;
      
      const oldSec = ed.oldEndpoint?.security ?? [];
      const newSec = ed.newEndpoint?.security ?? [];
      
      if (oldSec.length === 0 && newSec.length > 0) {
        const schemes = newSec.map(s => s.schemeId).join(', ');
        changes.push(this.makeChange({
          severity: 'breaking',
          category: 'authentication',
          message: `${ed.method} ${ed.path} now requires authentication (${schemes}).`,
          consequence: 'Clients without credentials receive 401 Unauthorized.',
          migration: `Add Authorization header with required credentials to all ${ed.method} ${ed.path} requests.`,
          location: { path: ed.path, method: ed.method }
        }, context));
      }
    }
    return changes;
  }
}
