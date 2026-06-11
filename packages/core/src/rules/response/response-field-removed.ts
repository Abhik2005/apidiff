import { BaseRule } from '../base.js';
import type { DiffSet, RuleContext, SemanticChange } from '../../types/index.js';

export class ResponseFieldRemovedRule extends BaseRule {
  id = 'RESPONSE_FIELD_REMOVED';
  description = 'A field was removed from a response payload';
  severity = 'breaking' as const;

  apply(diff: DiffSet, context: RuleContext): SemanticChange[] {
    const changes: SemanticChange[] = [];
    for (const ed of diff.endpointDiffs) {
      if (ed.type !== 'changed') continue;
      if (this.isIgnored(ed.path, context)) continue;

      for (const fc of ed.fieldChanges) {
        if (fc.fieldPath[0] === 'responses' && fc.changeType === 'removed') {
          if (fc.fieldPath.includes('properties')) {
            const fieldName = fc.fieldPath[fc.fieldPath.length - 1];
            const statusCode = fc.fieldPath[1] || 'unknown';
            changes.push(this.makeChange({
              severity: 'breaking',
              category: 'response',
              message: `Field '${fieldName}' was removed from the response.`,
              consequence: `Clients depending on '${fieldName}' will encounter missing data errors.`,
              migration: `Ensure clients no longer require '${fieldName}' before removing it.`,
              location: { path: ed.path, method: ed.method, field: fieldName, statusCode }
            }, context));
          }
        }
      }
    }
    return changes;
  }
}
