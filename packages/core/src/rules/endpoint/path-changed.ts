import { BaseRule } from '../base.js';
import type { DiffSet, RuleContext, SemanticChange } from '../../types/index.js';

export class PathChangedRule extends BaseRule {
  id = 'PATH_CHANGED';
  description = 'The path string for an endpoint changed (e.g. parameter renamed)';
  severity = 'info' as const;

  apply(diff: DiffSet, context: RuleContext): SemanticChange[] {
    const changes: SemanticChange[] = [];
    for (const ed of diff.endpointDiffs) {
      if (ed.type !== 'changed') continue;
      if (this.isIgnored(ed.path, context)) continue;
      
      const pathChange = ed.fieldChanges.find(c => c.fieldPath[0] === 'path');
      if (pathChange) {
        changes.push(this.makeChange({
          severity: 'info',
          category: 'endpoint',
          message: `Endpoint path changed from ${pathChange.oldValue} to ${pathChange.newValue}.`,
          consequence: 'Clients may need to update routing or parameter names.',
          migration: 'Review the path syntax changes.',
          location: { path: ed.path, method: ed.method }
        }, context));
      }
    }
    return changes;
  }
}
