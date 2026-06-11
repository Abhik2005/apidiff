import { BaseRule } from '../base.js';
import type { DiffSet, RuleContext, SemanticChange } from '../../types/index.js';

export class ParamEnumValueAddedRule extends BaseRule {
  id = 'PARAM_ENUM_VALUE_ADDED';
  description = 'A new allowed enum value was added to a parameter';
  severity = 'info' as const;

  apply(diff: DiffSet, context: RuleContext): SemanticChange[] {
    const changes: SemanticChange[] = [];
    for (const ed of diff.endpointDiffs) {
      if (ed.type !== 'changed') continue;
      if (this.isIgnored(ed.path, context)) continue;

      for (const fc of ed.fieldChanges) {
        if (fc.fieldPath[0] === 'parameters' && fc.fieldPath[2] === 'schema' && fc.fieldPath.includes('enum') && fc.changeType === 'added') {
          const paramId = fc.fieldPath[1];
          const [paramName, inLoc] = paramId.split(':');
          changes.push(this.makeChange({
            severity: 'info',
            category: 'parameter',
            message: `Enum value '${fc.newValue}' was added to parameter '${paramName}' in ${inLoc}.`,
            consequence: `Clients can now optionally send '${fc.newValue}' for this parameter.`,
            migration: 'No immediate action required.',
            location: { path: ed.path, method: ed.method, paramName: paramName, field: inLoc }
          }, context));
        }
      }
    }
    return changes;
  }
}
