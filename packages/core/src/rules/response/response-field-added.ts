import { BaseRule } from '../base.js';
import type { DiffSet, RuleContext, SemanticChange } from '../../types/index.js';

export class ResponseFieldAddedRule extends BaseRule {
  id = 'RESPONSE_FIELD_ADDED';
  description = 'A field was added to the response body';
  severity = 'info' as const;

  apply(diff: DiffSet, context: RuleContext): SemanticChange[] {
    const changes: SemanticChange[] = [];
    for (const ed of diff.endpointDiffs) {
      if (ed.type !== 'changed') continue;
      if (this.isIgnored(ed.path, context)) continue;

      for (const fc of ed.fieldChanges) {
        if (fc.fieldPath[0] === 'responses' && fc.changeType === 'added') {
          const propsIdx = fc.fieldPath.lastIndexOf('properties');
          if (propsIdx !== -1 && fc.fieldPath.length === propsIdx + 2) {
            const fieldName = fc.fieldPath[propsIdx + 1];
            changes.push(this.makeChange({
              severity: 'info',
              category: 'response',
              message: `Response field '${fieldName}' was added to status code ${fc.fieldPath[1]}.`,
              consequence: 'Clients parsing responses strictly might fail if they do not ignore unknown fields.',
              migration: 'Clients should ensure their JSON parsers ignore unknown fields.',
              location: { path: ed.path, method: ed.method, field: fc.fieldPath.join('.') }
            }, context));
          }
        }
      }
    }
    return changes;
  }
}
