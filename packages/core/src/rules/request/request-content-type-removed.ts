import { BaseRule } from '../base.js';
import type { DiffSet, RuleContext, SemanticChange } from '../../types/index.js';

export class RequestContentTypeRemovedRule extends BaseRule {
  id = 'REQUEST_CONTENT_TYPE_REMOVED';
  description = 'A content type was removed from the request body';
  severity = 'breaking' as const;

  apply(diff: DiffSet, context: RuleContext): SemanticChange[] {
    const changes: SemanticChange[] = [];
    for (const ed of diff.endpointDiffs) {
      if (ed.type !== 'changed') continue;
      if (this.isIgnored(ed.path, context)) continue;

      for (const fc of ed.fieldChanges) {
        if (fc.fieldPath[0] === 'requestBody' && fc.fieldPath[1] === 'content' && fc.fieldPath.length === 3 && fc.changeType === 'removed') {
          const mimeType = fc.fieldPath[2];
          changes.push(this.makeChange({
            severity: 'breaking',
            category: 'request-body',
            message: `Request content type '${mimeType}' was removed.`,
            consequence: `Clients sending requests with Content-Type '${mimeType}' will receive 415 Unsupported Media Type errors.`,
            migration: `Update clients to use a supported content type instead of '${mimeType}'.`,
            location: { path: ed.path, method: ed.method, field: `requestBody.content['${mimeType}']` }
          }, context));
        }
      }
    }
    return changes;
  }
}
