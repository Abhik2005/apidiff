import { BaseRule } from '../base.js';
import type { DiffSet, RuleContext, SemanticChange } from '../../types/index.js';

export class ParamRequiredTrueToFalseRule extends BaseRule {
  id = 'PARAM_REQUIRED_TRUE_TO_FALSE';
  description = 'A required parameter was made optional';
  severity = 'info' as const;

  apply(diff: DiffSet, context: RuleContext): SemanticChange[] {
    const changes: SemanticChange[] = [];
    for (const ed of diff.endpointDiffs) {
      if (ed.type !== 'changed') continue;
      if (this.isIgnored(ed.path, context)) continue;

      for (const fc of ed.fieldChanges) {
        if (fc.fieldPath[0] === 'parameters' && fc.fieldPath[2] === 'required' && fc.changeType === 'changed') {
          if (fc.oldValue === true && fc.newValue === false) {
            const paramId = fc.fieldPath[1];
            const [paramName, inLoc] = paramId.split(':');
            changes.push(this.makeChange({
              severity: 'info',
              category: 'parameter',
              message: `Required parameter '${paramName}' in ${inLoc} is now optional.`,
              consequence: 'Clients can omit this parameter in requests.',
              migration: 'Clients may stop sending this parameter if desired.',
              location: { path: ed.path, method: ed.method, paramName: paramName, field: inLoc }
            }, context));
          }
        }
      }
    }
    return changes;
  }
}
