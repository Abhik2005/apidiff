import { BaseRule } from '../base.js';
import type { DiffSet, RuleContext, SemanticChange } from '../../types/index.js';

export class ResponseStatusAddedRule extends BaseRule {
  id = 'RESPONSE_STATUS_ADDED';
  description = 'A response status code was added';
  severity = 'info' as const;

  apply(diff: DiffSet, context: RuleContext): SemanticChange[] {
    const changes: SemanticChange[] = [];
    for (const ed of diff.endpointDiffs) {
      if (ed.type !== 'changed') continue;
      if (this.isIgnored(ed.path, context)) continue;

      for (const fc of ed.fieldChanges) {
        if (fc.fieldPath[0] === 'responses' && fc.fieldPath.length === 2 && fc.changeType === 'added') {
          const statusCode = fc.fieldPath[1];
          changes.push(this.makeChange({
            severity: 'info',
            category: 'response',
            message: `Response status code ${statusCode} was added.`,
            consequence: `Clients may receive a ${statusCode} response they weren't previously expecting.`,
            migration: `Update clients to gracefully handle the ${statusCode} response.`,
            location: { path: ed.path, method: ed.method, field: `responses['${statusCode}']` }
          }, context));
        }
      }
    }
    return changes;
  }
}
