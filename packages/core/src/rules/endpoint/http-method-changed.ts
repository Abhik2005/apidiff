import { BaseRule } from '../base.js';
import type { DiffSet, RuleContext, SemanticChange } from '../../types/index.js';

export class HttpMethodChangedRule extends BaseRule {
  id = 'HTTP_METHOD_CHANGED';
  description = 'The HTTP method for an endpoint changed';
  severity = 'breaking' as const;

  apply(diff: DiffSet, context: RuleContext): SemanticChange[] {
    const changes: SemanticChange[] = [];
    for (const ed of diff.endpointDiffs) {
      if (ed.type !== 'changed') continue;
      if (this.isIgnored(ed.path, context)) continue;
      
      const methodChange = ed.fieldChanges.find(c => c.fieldPath[0] === 'method');
      if (methodChange) {
        changes.push(this.makeChange({
          severity: 'breaking',
          category: 'endpoint',
          message: `Endpoint HTTP method changed from ${methodChange.oldValue} to ${methodChange.newValue}.`,
          consequence: 'Clients using the old HTTP method will fail.',
          migration: `Update client requests to use the ${methodChange.newValue} method.`,
          location: { path: ed.path, method: ed.method }
        }, context));
      }
    }
    return changes;
  }
}
