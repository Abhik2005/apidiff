import { BaseRule } from '../base.js';
import type { DiffSet, RuleContext, SemanticChange, Parameter } from '../../types/index.js';

export class ParamAddedRule extends BaseRule {
  id = 'PARAM_ADDED';
  description = 'A new parameter was added';
  severity = 'info' as const;

  apply(diff: DiffSet, context: RuleContext): SemanticChange[] {
    const changes: SemanticChange[] = [];
    for (const ed of diff.endpointDiffs) {
      if (ed.type !== 'changed') continue;
      if (this.isIgnored(ed.path, context)) continue;

      for (const fc of ed.fieldChanges) {
        if (fc.fieldPath[0] === 'parameters' && fc.fieldPath.length === 2 && fc.changeType === 'added') {
          const paramId = fc.fieldPath[1];
          const [paramName, inLoc] = paramId.split(':');
          
          // Check if it's a location change
          const isMoved = ed.fieldChanges.some(c => c.fieldPath[0] === 'parameters' && c.fieldPath.length === 2 && c.changeType === 'removed' && c.fieldPath[1].startsWith(`${paramName}:`));
          if (isMoved) continue;

          const newParam = fc.newValue as Parameter;

          if (newParam.required) {
            changes.push(this.makeChange({
              severity: 'breaking',
              ruleId: 'PARAM_ADDED_REQUIRED',
              category: 'parameter',
              message: `Required parameter '${paramName}' in ${inLoc} was added.`,
              consequence: 'Existing clients failing to send this new required parameter will receive 400 Bad Request errors.',
              migration: `Update clients to include the '${paramName}' parameter.`,
              location: { path: ed.path, method: ed.method, paramName: paramName, field: inLoc }
            }, context));
          } else {
            changes.push(this.makeChange({
              severity: 'info',
              ruleId: 'PARAM_ADDED',
              category: 'parameter',
              message: `Optional parameter '${paramName}' in ${inLoc} was added.`,
              consequence: 'Clients can optionally provide this new parameter for extended functionality.',
              migration: 'No immediate action required.',
              location: { path: ed.path, method: ed.method, paramName: paramName, field: inLoc }
            }, context));
          }
        }
      }
    }
    return changes;
  }
}
