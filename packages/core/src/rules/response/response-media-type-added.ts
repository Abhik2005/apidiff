import { BaseRule } from '../base.js';
import type { DiffSet, RuleContext, SemanticChange } from '../../types/index.js';

export class ResponseMediaTypeAddedRule extends BaseRule {
  id = 'RESPONSE_MEDIA_TYPE_ADDED';
  description = 'A response media type was added';
  severity = 'info' as const;

  apply(diff: DiffSet, context: RuleContext): SemanticChange[] {
    const changes: SemanticChange[] = [];
    for (const ed of diff.endpointDiffs) {
      if (ed.type !== 'changed') continue;
      if (this.isIgnored(ed.path, context)) continue;

      for (const fc of ed.fieldChanges) {
        if (fc.fieldPath[0] === 'responses' && fc.fieldPath[2] === 'content' && fc.fieldPath.length === 4 && fc.changeType === 'added') {
          const statusCode = fc.fieldPath[1];
          const mediaType = fc.fieldPath[3];
          changes.push(this.makeChange({
            severity: 'info',
            category: 'response',
            message: `Response media type '${mediaType}' was added to status code ${statusCode}.`,
            consequence: 'Clients can now request the new media type.',
            migration: `Update clients to request '${mediaType}' if desired.`,
            location: { path: ed.path, method: ed.method, field: fc.fieldPath.join('.') }
          }, context));
        }
      }
    }
    return changes;
  }
}
