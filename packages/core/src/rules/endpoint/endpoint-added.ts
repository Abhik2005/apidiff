import { BaseRule } from '../base.js';
import type { DiffSet, RuleContext, SemanticChange } from '../../types/index.js';

export class EndpointAddedRule extends BaseRule {
  id = 'ENDPOINT_ADDED';
  description = 'A new endpoint was added';
  severity = 'info' as const;

  apply(diff: DiffSet, context: RuleContext): SemanticChange[] {
    const changes: SemanticChange[] = [];
    for (const ed of diff.endpointDiffs) {
      if (ed.type !== 'added') continue;
      if (this.isIgnored(ed.path, context)) continue;
      
      changes.push(this.makeChange({
        severity: 'info',
        category: 'endpoint',
        message: `Endpoint ${ed.method} ${ed.path} was added.`,
        consequence: 'Clients can now use this new endpoint.',
        migration: 'No migration required.',
        location: { path: ed.path, method: ed.method }
      }, context));
    }
    return changes;
  }
}
