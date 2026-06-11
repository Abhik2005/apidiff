import { BaseRule } from '../base.js';
import type { DiffSet, RuleContext, SemanticChange } from '../../types/index.js';

export class ParamLocationChangedRule extends BaseRule {
  id = 'PARAM_LOCATION_CHANGED';
  description = 'A parameter was moved to a different location (e.g. query to header)';
  severity = 'breaking' as const;

  apply(diff: DiffSet, context: RuleContext): SemanticChange[] {
    const changes: SemanticChange[] = [];
    for (const ed of diff.endpointDiffs) {
      if (ed.type !== 'changed') continue;
      if (this.isIgnored(ed.path, context)) continue;

      const removedParams = new Map<string, string>(); // name -> in
      const addedParams = new Map<string, string>(); // name -> in

      for (const fc of ed.fieldChanges) {
        if (fc.fieldPath[0] === 'parameters' && fc.fieldPath.length === 2) {
          const paramId = fc.fieldPath[1];
          const [paramName, inLoc] = paramId.split(':');
          if (fc.changeType === 'removed') removedParams.set(paramName, inLoc);
          if (fc.changeType === 'added') addedParams.set(paramName, inLoc);
        }
      }

      for (const [name, oldLoc] of removedParams.entries()) {
        const newLoc = addedParams.get(name);
        if (newLoc) {
          changes.push(this.makeChange({
            severity: 'breaking',
            category: 'parameter',
            message: `Parameter '${name}' moved from ${oldLoc} to ${newLoc}.`,
            consequence: `Clients sending '${name}' in the ${oldLoc} will fail.`,
            migration: `Update clients to send '${name}' in the ${newLoc} instead.`,
            location: { path: ed.path, method: ed.method, paramName: name, field: oldLoc }
          }, context));
        }
      }
    }
    return changes;
  }
}
