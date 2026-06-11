import { BaseRule } from '../base.js';
import type { DiffSet, RuleContext, SemanticChange } from '../../types/index.js';

export class ResponseMediaTypeRemovedRule extends BaseRule {
  id = 'RESPONSE_MEDIA_TYPE_REMOVED';
  description = 'A response media type was removed';
  severity = 'breaking' as const;

  apply(diff: DiffSet, context: RuleContext): SemanticChange[] {
    const changes: SemanticChange[] = [];
    for (const ed of diff.endpointDiffs) {
      if (ed.type !== 'changed') continue;
      if (this.isIgnored(ed.path, context)) continue;

      for (const fc of ed.fieldChanges) {
        if (fc.fieldPath[0] === 'responses' && fc.fieldPath[2] === 'content' && fc.fieldPath.length === 4 && fc.changeType === 'removed') {
          const statusCode = fc.fieldPath[1];
          const mediaType = fc.fieldPath[3];
          changes.push(this.makeChange({
            severity: 'breaking',
            category: 'response',
            message: `Response media type '${mediaType}' was removed for status code ${statusCode}.`,
            consequence: `Clients requesting '${mediaType}' will no longer receive it and may fail to process the response.`,
            migration: `Update clients to accept one of the remaining supported media types.`,
            location: { path: ed.path, method: ed.method, field: fc.fieldPath.join('.') }
          }, context));
        }
      }
    }
    return changes;
  }
}
