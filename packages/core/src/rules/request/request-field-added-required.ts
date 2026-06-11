import { BaseRule } from '../base.js';
import type { DiffSet, RuleContext, SemanticChange, Schema } from '../../types/index.js';

export class RequestFieldAddedRequiredRule extends BaseRule {
  id = 'REQUEST_FIELD_ADDED_REQUIRED';
  description = 'A required field was added to the request body';
  severity = 'breaking' as const;

  apply(diff: DiffSet, context: RuleContext): SemanticChange[] {
    const changes: SemanticChange[] = [];
    for (const ed of diff.endpointDiffs) {
      if (ed.type !== 'changed') continue;
      if (this.isIgnored(ed.path, context)) continue;

      for (const fc of ed.fieldChanges) {
        if (fc.fieldPath[0] === 'requestBody' && fc.changeType === 'added') {
          const requiredIdx = fc.fieldPath.lastIndexOf('required');
          if (requiredIdx !== -1 && fc.fieldPath.length === requiredIdx + 2) {
            const fieldName = fc.fieldPath[requiredIdx + 1];
            
            // Check if this property was ALSO added
            const propsPath = fc.fieldPath.slice(0, requiredIdx).concat(['properties', fieldName]).join('.');
            const propAdded = ed.fieldChanges.some(c => c.changeType === 'added' && c.fieldPath.join('.') === propsPath);
            
            if (propAdded) {
              changes.push(this.makeChange({
                severity: 'breaking',
                category: 'request-body',
                message: `Required request body field '${fieldName}' was added.`,
                consequence: `Clients not sending the new '${fieldName}' field will receive validation errors.`,
                migration: `Update clients to include the '${fieldName}' field in requests.`,
                location: { path: ed.path, method: ed.method, field: propsPath }
              }, context));
            }
          }
        }
      }
    }
    return changes;
  }
}
