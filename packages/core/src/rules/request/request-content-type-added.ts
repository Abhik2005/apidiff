import { BaseRule } from '../base.js';
import type { DiffSet, RuleContext, SemanticChange } from '../../types/index.js';

export class RequestContentTypeAddedRule extends BaseRule {
  id = 'REQUEST_CONTENT_TYPE_ADDED';
  description = 'A new content type was added to the request body';
  severity = 'info' as const;

  apply(diff: DiffSet, context: RuleContext): SemanticChange[] {
    const changes: SemanticChange[] = [];
    for (const ed of diff.endpointDiffs) {
      if (ed.type !== 'changed') continue;
      if (this.isIgnored(ed.path, context)) continue;

      for (const fc of ed.fieldChanges) {
        if (fc.fieldPath[0] === 'requestBody' && fc.fieldPath[1] === 'content' && fc.fieldPath.length === 3 && fc.changeType === 'added') {
          const mimeType = fc.fieldPath[2];
          changes.push(this.makeChange({
            severity: 'info',
            category: 'request-body',
            message: `Request content type '${mimeType}' was added.`,
            consequence: 'Clients can now use this new content type when sending requests.',
            migration: 'No immediate action required.',
            location: { path: ed.path, method: ed.method, field: `requestBody.content['${mimeType}']` }
          }, context));
        }
      }
    }
    return changes;
  }
}
