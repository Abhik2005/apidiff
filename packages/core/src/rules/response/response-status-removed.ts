import { BaseRule } from '../base.js';
import type { DiffSet, RuleContext, SemanticChange } from '../../types/index.js';

export class ResponseStatusRemovedRule extends BaseRule {
  id = 'RESPONSE_STATUS_REMOVED';
  description = 'A response status code was removed';
  severity = 'breaking' as const;

  apply(diff: DiffSet, context: RuleContext): SemanticChange[] {
    const changes: SemanticChange[] = [];
    for (const ed of diff.endpointDiffs) {
      if (ed.type !== 'changed') continue;
      if (this.isIgnored(ed.path, context)) continue;

      for (const fc of ed.fieldChanges) {
        if (fc.fieldPath[0] === 'responses' && fc.fieldPath.length === 2 && fc.changeType === 'removed') {
          const statusCode = fc.fieldPath[1];
          changes.push(this.makeChange({
            severity: 'breaking',
            category: 'response',
            message: `Response status code ${statusCode} was removed.`,
            consequence: `Clients explicitly expecting a ${statusCode} response might fail or behave unexpectedly.`,
            migration: `Update clients to no longer rely on the ${statusCode} response.`,
            location: { path: ed.path, method: ed.method, field: `responses['${statusCode}']` }
          }, context));
        }
      }
    }
    return changes;
  }
}
