import { BaseRule } from '../base.js';
import type { DiffSet, RuleContext, SemanticChange } from '../../types/index.js';

export class ResponseHeaderRemovedRule extends BaseRule {
  id = 'RESPONSE_HEADER_REMOVED';
  description = 'A response header was removed';
  severity = 'breaking' as const;

  apply(diff: DiffSet, context: RuleContext): SemanticChange[] {
    const changes: SemanticChange[] = [];
    for (const ed of diff.endpointDiffs) {
      if (ed.type !== 'changed') continue;
      if (this.isIgnored(ed.path, context)) continue;

      for (const fc of ed.fieldChanges) {
        if (fc.fieldPath[0] === 'responses' && fc.fieldPath[2] === 'headers' && fc.fieldPath.length === 4 && fc.changeType === 'removed') {
          const statusCode = fc.fieldPath[1];
          const headerName = fc.fieldPath[3];
          changes.push(this.makeChange({
            severity: 'breaking',
            category: 'response',
            message: `Response header '${headerName}' was removed from status code ${statusCode}.`,
            consequence: `Clients depending on the '${headerName}' header will no longer receive it.`,
            migration: `Update clients to not expect the '${headerName}' header.`,
            location: { path: ed.path, method: ed.method, field: fc.fieldPath.join('.') }
          }, context));
        }
      }
    }
    return changes;
  }
}
