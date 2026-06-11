import { BaseRule } from '../base.js';
import type { DiffSet, RuleContext, SemanticChange } from '../../types/index.js';

export class ResponseHeaderAddedRequiredRule extends BaseRule {
  id = 'RESPONSE_HEADER_ADDED_REQUIRED';
  description = 'A required response header was added';
  severity = 'breaking' as const;

  apply(diff: DiffSet, context: RuleContext): SemanticChange[] {
    const changes: SemanticChange[] = [];
    for (const ed of diff.endpointDiffs) {
      if (ed.type !== 'changed') continue;
      if (this.isIgnored(ed.path, context)) continue;

      for (const fc of ed.fieldChanges) {
        if (fc.fieldPath[0] === 'responses' && fc.fieldPath[2] === 'headers' && fc.changeType === 'added' && fc.fieldPath.length === 4) {
          const statusCode = fc.fieldPath[1];
          const headerName = fc.fieldPath[3];
          const headerDef = fc.newValue as { required?: boolean };
          
          if (headerDef.required) {
            changes.push(this.makeChange({
              severity: 'breaking',
              category: 'response',
              message: `Required response header '${headerName}' was added to status code ${statusCode}.`,
              consequence: `Clients not designed to handle the new required header may fail or reject the response.`,
              migration: `Update clients to accept and process the new '${headerName}' header.`,
              location: { path: ed.path, method: ed.method, field: fc.fieldPath.join('.') }
            }, context));
          }
        } else if (fc.fieldPath[0] === 'responses' && fc.fieldPath[2] === 'headers' && fc.fieldPath[4] === 'required' && fc.changeType === 'changed' && fc.oldValue === false && fc.newValue === true) {
          const statusCode = fc.fieldPath[1];
          const headerName = fc.fieldPath[3];
          changes.push(this.makeChange({
            severity: 'breaking',
            category: 'response',
            message: `Optional response header '${headerName}' was made required for status code ${statusCode}.`,
            consequence: `Clients not designed to handle the required header may fail or reject the response.`,
            migration: `Update clients to accept and process the '${headerName}' header.`,
            location: { path: ed.path, method: ed.method, field: fc.fieldPath.join('.') }
          }, context));
        }
      }
    }
    return changes;
  }
}
