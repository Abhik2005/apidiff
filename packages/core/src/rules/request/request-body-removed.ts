import { BaseRule } from '../base.js';
import type { DiffSet, RuleContext, SemanticChange } from '../../types/index.js';

export class RequestBodyRemovedRule extends BaseRule {
  id = 'REQUEST_BODY_REMOVED';
  description = 'A request body was removed';
  severity = 'breaking' as const;

  apply(diff: DiffSet, context: RuleContext): SemanticChange[] {
    const changes: SemanticChange[] = [];
    for (const ed of diff.endpointDiffs) {
      if (ed.type !== 'changed') continue;
      if (this.isIgnored(ed.path, context)) continue;

      for (const fc of ed.fieldChanges) {
        if (fc.fieldPath[0] === 'requestBody' && fc.fieldPath.length === 1 && fc.changeType === 'removed') {
          changes.push(this.makeChange({
            severity: 'breaking',
            category: 'request-body',
            message: 'The request body was removed.',
            consequence: 'Clients sending a request body may experience errors if the server strictly validates requests.',
            migration: 'Update clients to stop sending a request body.',
            location: { path: ed.path, method: ed.method, field: 'requestBody' }
          }, context));
        }
      }
    }
    return changes;
  }
}
