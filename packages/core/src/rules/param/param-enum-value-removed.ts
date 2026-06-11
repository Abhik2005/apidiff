import { BaseRule } from '../base.js';
import type { DiffSet, RuleContext, SemanticChange } from '../../types/index.js';

export class ParamEnumValueRemovedRule extends BaseRule {
  id = 'PARAM_ENUM_VALUE_REMOVED';
  description = 'An allowed enum value was removed from a parameter';
  severity = 'breaking' as const;

  apply(diff: DiffSet, context: RuleContext): SemanticChange[] {
    const changes: SemanticChange[] = [];
    for (const ed of diff.endpointDiffs) {
      if (ed.type !== 'changed') continue;
      if (this.isIgnored(ed.path, context)) continue;

      for (const fc of ed.fieldChanges) {
        if (fc.fieldPath[0] === 'parameters' && fc.fieldPath[2] === 'schema' && fc.fieldPath.includes('enum') && fc.changeType === 'removed') {
          const paramId = fc.fieldPath[1];
          const [paramName, inLoc] = paramId.split(':');
          changes.push(this.makeChange({
            severity: 'breaking',
            category: 'parameter',
            message: `Enum value '${fc.oldValue}' was removed from parameter '${paramName}' in ${inLoc}.`,
            consequence: `Clients sending '${fc.oldValue}' will now receive validation errors.`,
            migration: `Update clients to use one of the remaining allowed enum values for '${paramName}'.`,
            location: { path: ed.path, method: ed.method, paramName: paramName, field: inLoc }
          }, context));
        }
      }
    }
    return changes;
  }
}
