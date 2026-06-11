import { BaseRule } from '../base.js';
import type { DiffSet, RuleContext, SemanticChange } from '../../types/index.js';

export class RequestFieldTypeChangedRule extends BaseRule {
  id = 'REQUEST_FIELD_TYPE_CHANGED';
  description = 'The data type of a request body field changed';
  severity = 'breaking' as const;

  apply(diff: DiffSet, context: RuleContext): SemanticChange[] {
    const changes: SemanticChange[] = [];
    for (const ed of diff.endpointDiffs) {
      if (ed.type !== 'changed') continue;
      if (this.isIgnored(ed.path, context)) continue;

      for (const fc of ed.fieldChanges) {
        if (fc.fieldPath[0] === 'requestBody' && fc.changeType === 'changed') {
          const typeIdx = fc.fieldPath.lastIndexOf('type');
          if (typeIdx !== -1 && typeIdx === fc.fieldPath.length - 1) {
            const propsIdx = fc.fieldPath.lastIndexOf('properties');
            if (propsIdx !== -1 && typeIdx > propsIdx + 1) {
              const fieldName = fc.fieldPath[propsIdx + 1];
              changes.push(this.makeChange({
                severity: 'breaking',
                category: 'request-body',
                message: `Request body field '${fieldName}' changed type from ${fc.oldValue} to ${fc.newValue}.`,
                consequence: 'Clients sending the old type will receive validation errors.',
                migration: `Update clients to send the new type (${fc.newValue}) for '${fieldName}'.`,
                location: { path: ed.path, method: ed.method, field: fc.fieldPath.slice(0, -1).join('.') }
              }, context));
            }
          }
        }
      }
    }
    return changes;
  }
}
