import { BaseRule } from '../base.js';
import type { DiffSet, RuleContext, SemanticChange } from '../../types/index.js';

export class EndpointDeprecatedRule extends BaseRule {
  id = 'ENDPOINT_DEPRECATED';
  description = 'An existing endpoint was marked as deprecated';
  severity = 'warning' as const;

  apply(diff: DiffSet, context: RuleContext): SemanticChange[] {
    const changes: SemanticChange[] = [];
    for (const ed of diff.endpointDiffs) {
      if (ed.type !== 'changed') continue;
      if (this.isIgnored(ed.path, context)) continue;
      
      const deprecatedChange = ed.fieldChanges.find(c => c.fieldPath[0] === 'deprecated' && c.newValue === true && c.oldValue === false);
      if (deprecatedChange) {
        changes.push(this.makeChange({
          severity: 'warning',
          category: 'endpoint',
          message: `Endpoint ${ed.method} ${ed.path} was deprecated.`,
          consequence: 'This endpoint is slated for future removal.',
          migration: 'Plan to migrate away from this endpoint to its recommended alternative.',
          location: { path: ed.path, method: ed.method }
        }, context));
      }
    }
    return changes;
  }
}
