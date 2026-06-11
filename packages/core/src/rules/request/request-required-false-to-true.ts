import { BaseRule } from '../base.js';
import type { DiffSet, RuleContext, SemanticChange } from '../../types/index.js';

export class RequestRequiredFalseToTrueRule extends BaseRule {
  id = 'REQUEST_REQUIRED_FALSE_TO_TRUE';
  description = 'An optional request body field was made required';
  severity = 'breaking' as const;

  apply(diff: DiffSet, context: RuleContext): SemanticChange[] {
    const changes: SemanticChange[] = [];
    for (const ed of diff.endpointDiffs) {
      if (ed.type !== 'changed') continue;
      if (this.isIgnored(ed.path, context)) continue;

      for (const fc of ed.fieldChanges) {
        if (fc.fieldPath[0] === 'requestBody') {
          // Check for requestBody.required changing from false to true
          if (fc.fieldPath.length === 2 && fc.fieldPath[1] === 'required' && fc.changeType === 'changed' && fc.oldValue === false && fc.newValue === true) {
            changes.push(this.makeChange({
              severity: 'breaking',
              category: 'request-body',
              message: 'The request body was made required.',
              consequence: 'Clients not sending a request body will now receive validation errors.',
              migration: 'Update clients to always send a request body.',
              location: { path: ed.path, method: ed.method, field: 'requestBody.required' }
            }, context));
          }
          
          // Check for schema field required changing from false to true
          if (fc.changeType === 'added') {
            const requiredIdx = fc.fieldPath.lastIndexOf('required');
            if (requiredIdx !== -1 && fc.fieldPath.length === requiredIdx + 2) {
              const fieldName = fc.fieldPath[requiredIdx + 1];
              
              // Check if this property was ALSO added (if it was, it's covered by REQUEST_FIELD_ADDED_REQUIRED)
              const propsPath = fc.fieldPath.slice(0, requiredIdx).concat(['properties', fieldName]).join('.');
              const propAdded = ed.fieldChanges.some(c => c.changeType === 'added' && c.fieldPath.join('.') === propsPath);
              
              if (!propAdded) {
                changes.push(this.makeChange({
                  severity: 'breaking',
                  category: 'request-body',
                  message: `Optional request body field '${fieldName}' is now required.`,
                  consequence: `Requests missing '${fieldName}' will now be rejected.`,
                  migration: `Update clients to always include the '${fieldName}' field.`,
                  location: { path: ed.path, method: ed.method, field: propsPath }
                }, context));
              }
            }
          }
        }
      }
    }
    return changes;
  }
}
