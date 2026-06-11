import { BaseRule } from '../base.js';
import type { DiffSet, RuleContext, SemanticChange, Parameter } from '../../types/index.js';

export class ParamRemovedRule extends BaseRule {
  id = 'PARAM_REMOVED';
  description = 'A parameter was removed';
  severity = 'breaking' as const;

  apply(diff: DiffSet, context: RuleContext): SemanticChange[] {
    const changes: SemanticChange[] = [];
    for (const ed of diff.endpointDiffs) {
      if (ed.type !== 'changed') continue;
      if (this.isIgnored(ed.path, context)) continue;

      for (const fc of ed.fieldChanges) {
        if (fc.fieldPath[0] === 'parameters' && fc.fieldPath.length === 2 && fc.changeType === 'removed') {
          const paramId = fc.fieldPath[1];
          const [paramName, inLoc] = paramId.split(':');
          
          // Check if it's a location change
          const isMoved = ed.fieldChanges.some(c => c.fieldPath[0] === 'parameters' && c.fieldPath.length === 2 && c.changeType === 'added' && c.fieldPath[1].startsWith(`${paramName}:`));
          if (isMoved) continue;

          const oldParam = fc.oldValue as Parameter;

          if (oldParam.required) {
            changes.push(this.makeChange({
              severity: 'breaking',
              ruleId: 'PARAM_REMOVED',
              category: 'parameter',
              message: `Required parameter '${paramName}' in ${inLoc} was removed.`,
              consequence: 'Clients sending this parameter may experience errors or unexpected behavior if the server rejects unknown parameters.',
              migration: `Update clients to stop sending the '${paramName}' parameter.`,
              location: { path: ed.path, method: ed.method, paramName: paramName, field: inLoc }
            }, context));
          } else {
            changes.push(this.makeChange({
              severity: 'warning',
              ruleId: 'PARAM_OPTIONAL_REMOVED',
              category: 'parameter',
              message: `Optional parameter '${paramName}' in ${inLoc} was removed.`,
              consequence: 'Clients sending this parameter will have it ignored, or may receive errors if the server strictly validates inputs.',
              migration: `Update clients to stop sending the '${paramName}' parameter.`,
              location: { path: ed.path, method: ed.method, paramName: paramName, field: inLoc }
            }, context));
          }
        }
      }
    }
    return changes;
  }
}
