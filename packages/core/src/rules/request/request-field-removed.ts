import { BaseRule } from '../base.js';
import type { DiffSet, RuleContext, SemanticChange } from '../../types/index.js';

export class RequestFieldRemovedRule extends BaseRule {
  id = 'REQUEST_FIELD_REMOVED';
  description = 'A field was removed from the request body';
  severity = 'breaking' as const;

  apply(diff: DiffSet, context: RuleContext): SemanticChange[] {
    const changes: SemanticChange[] = [];
    for (const ed of diff.endpointDiffs) {
      if (ed.type !== 'changed') continue;
      if (this.isIgnored(ed.path, context)) continue;

      for (const fc of ed.fieldChanges) {
        if (fc.fieldPath[0] === 'requestBody' && fc.changeType === 'removed') {
          // Look for: ['requestBody', 'content', mimeType, 'schema', 'properties', fieldName, ...]
          const propsIdx = fc.fieldPath.lastIndexOf('properties');
          if (propsIdx !== -1 && fc.fieldPath.length === propsIdx + 2) {
            const fieldName = fc.fieldPath[propsIdx + 1];
            changes.push(this.makeChange({
              severity: 'breaking',
              category: 'request-body',
              message: `Request body field '${fieldName}' was removed.`,
              consequence: 'Clients sending this field may experience errors if the server strictly validates requests.',
              migration: `Update clients to stop sending the '${fieldName}' field.`,
              location: { path: ed.path, method: ed.method, field: fc.fieldPath.join('.') }
            }, context));
          }
        }
      }
    }
    return changes;
  }
}
