import { BaseRule } from '../base.js';
import type { DiffSet, RuleContext, SemanticChange } from '../../types/index.js';

export class ParamDeprecatedRule extends BaseRule {
  id = 'PARAM_DEPRECATED';
  description = 'A parameter was marked as deprecated';
  severity = 'warning' as const;

  apply(diff: DiffSet, context: RuleContext): SemanticChange[] {
    const changes: SemanticChange[] = [];
    for (const ed of diff.endpointDiffs) {
      if (ed.type !== 'changed') continue;
      if (this.isIgnored(ed.path, context)) continue;

      for (const fc of ed.fieldChanges) {
        if (fc.fieldPath[0] === 'parameters' && fc.fieldPath[2] === 'deprecated' && fc.changeType === 'changed') {
          if (fc.oldValue === false && fc.newValue === true) {
            const paramId = fc.fieldPath[1];
            const [paramName, inLoc] = paramId.split(':');
            changes.push(this.makeChange({
              severity: 'warning',
              category: 'parameter',
              message: `Parameter '${paramName}' in ${inLoc} was deprecated.`,
              consequence: 'This parameter is slated for future removal.',
              migration: `Plan to migrate away from using '${paramName}'.`,
              location: { path: ed.path, method: ed.method, paramName: paramName, field: inLoc }
            }, context));
          }
        }
      }
    }
    return changes;
  }
}
