import { BaseRule } from '../base.js';
import type { DiffSet, RuleContext, SemanticChange } from '../../types/index.js';

export class ParamRequiredAddedRule extends BaseRule {
  id = 'PARAM_REQUIRED_FALSE_TO_TRUE';
  description = 'An optional parameter was made required';
  severity = 'breaking' as const;

  apply(diff: DiffSet, context: RuleContext): SemanticChange[] {
    const changes: SemanticChange[] = [];
    for (const ed of diff.endpointDiffs) {
      if (ed.type !== 'changed') continue;
      if (this.isIgnored(ed.path, context)) continue;

      for (const fc of ed.fieldChanges) {
        if (fc.fieldPath[0] === 'parameters' && fc.fieldPath[2] === 'required' && fc.changeType === 'changed') {
          if (fc.oldValue === false && fc.newValue === true) {
            const paramId = fc.fieldPath[1];
            const [paramName, inLoc] = paramId.split(':');
            changes.push(this.makeChange({
              severity: 'breaking',
              category: 'parameter',
              message: `Optional parameter '${paramName}' in ${inLoc} is now required.`,
              consequence: `Requests missing '${paramName}' will be rejected with a 400 Bad Request error.`,
              migration: `Update all clients to include '${paramName}' in their requests.`,
              location: { path: ed.path, method: ed.method, paramName: paramName, field: inLoc }
            }, context));
          }
        }
      }
    }
    return changes;
  }
}
