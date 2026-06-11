import { BaseRule } from '../base.js';
import type { DiffSet, RuleContext, SemanticChange } from '../../types/index.js';

export class ParamTypeChangedRule extends BaseRule {
  id = 'PARAM_TYPE_CHANGED';
  description = 'The data type of a parameter changed';
  severity = 'breaking' as const;

  apply(diff: DiffSet, context: RuleContext): SemanticChange[] {
    const changes: SemanticChange[] = [];
    for (const ed of diff.endpointDiffs) {
      if (ed.type !== 'changed') continue;
      if (this.isIgnored(ed.path, context)) continue;

      for (const fc of ed.fieldChanges) {
        if (fc.fieldPath[0] === 'parameters' && fc.fieldPath[2] === 'schema' && fc.fieldPath[3] === 'type' && fc.changeType === 'changed') {
          const paramId = fc.fieldPath[1];
          const [paramName, inLoc] = paramId.split(':');
          changes.push(this.makeChange({
            severity: 'breaking',
            category: 'parameter',
            message: `Parameter '${paramName}' in ${inLoc} changed type from ${fc.oldValue} to ${fc.newValue}.`,
            consequence: 'Clients sending the old type will receive validation errors.',
            migration: `Update clients to send the new type (${fc.newValue}) for '${paramName}'.`,
            location: { path: ed.path, method: ed.method, paramName: paramName, field: inLoc }
          }, context));
        }
      }
    }
    return changes;
  }
}
