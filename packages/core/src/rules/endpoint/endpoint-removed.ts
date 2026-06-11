import { BaseRule } from '../base.js';
import type { DiffSet, RuleContext, SemanticChange } from '../../types/index.js';

export class EndpointRemovedRule extends BaseRule {
  id = 'ENDPOINT_REMOVED';
  description = 'An existing endpoint was removed entirely';
  severity = 'breaking' as const;

  apply(diff: DiffSet, context: RuleContext): SemanticChange[] {
    const changes: SemanticChange[] = [];
    for (const ed of diff.endpointDiffs) {
      if (ed.type !== 'removed') continue;
      if (this.isIgnored(ed.path, context)) continue;
      
      changes.push(this.makeChange({
        severity: 'breaking',
        category: 'endpoint',
        message: `Endpoint ${ed.method} ${ed.path} was removed.`,
        consequence: 'Clients calling this endpoint will receive a 404 Not Found error.',
        migration: 'Migrate clients to use an alternative endpoint before removing this one.',
        location: { path: ed.path, method: ed.method }
      }, context));
    }
    return changes;
  }
}
