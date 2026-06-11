import { BaseRule } from '../base.js';
import type { DiffSet, RuleContext, SemanticChange, RequestBody } from '../../types/index.js';

export class RequestBodyAddedRequiredRule extends BaseRule {
  id = 'REQUEST_BODY_ADDED_REQUIRED';
  description = 'A required request body was added';
  severity = 'breaking' as const;

  apply(diff: DiffSet, context: RuleContext): SemanticChange[] {
    const changes: SemanticChange[] = [];
    for (const ed of diff.endpointDiffs) {
      if (ed.type !== 'changed') continue;
      if (this.isIgnored(ed.path, context)) continue;

      for (const fc of ed.fieldChanges) {
        if (fc.fieldPath[0] === 'requestBody' && fc.fieldPath.length === 1 && fc.changeType === 'added') {
          const body = fc.newValue as RequestBody;
          if (body.required) {
            changes.push(this.makeChange({
              severity: 'breaking',
              category: 'request-body',
              message: 'A required request body was added.',
              consequence: 'Clients not sending a request body will now receive 400 Bad Request errors.',
              migration: 'Update clients to send the required request body.',
              location: { path: ed.path, method: ed.method, field: 'requestBody' }
            }, context));
          }
        }
      }
    }
    return changes;
  }
}
