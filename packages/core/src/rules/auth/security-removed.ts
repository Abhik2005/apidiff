import { BaseRule } from '../base.js';
import type { DiffSet, RuleContext, SemanticChange } from '../../types/index.js';

export class SecurityRemovedRule extends BaseRule {
  id = 'SECURITY_REMOVED';
  description = 'A global security scheme was removed';
  severity = 'breaking' as const;

  apply(diff: DiffSet, context: RuleContext): SemanticChange[] {
    const changes: SemanticChange[] = [];
    
    // Check global security scheme definitions
    for (const sd of diff.securityDiffs) {
      if (sd.changeType === 'removed') {
        changes.push(this.makeChange({
          severity: 'breaking',
          category: 'authentication',
          message: `Security scheme '${sd.schemeId}' was removed.`,
          consequence: `Clients using '${sd.schemeId}' for authentication will fail to authenticate.`,
          migration: `Update clients to use a different, supported security scheme.`,
          location: { field: `securitySchemes['${sd.schemeId}']` }
        }, context));
      }
    }

    // Check endpoint-level security requirements removed
    for (const ed of diff.endpointDiffs) {
      if (ed.type !== 'changed') continue;
      if (this.isIgnored(ed.path, context)) continue;

      for (const fc of ed.fieldChanges) {
        if (fc.fieldPath[0] === 'security' && fc.fieldPath.length === 2 && fc.changeType === 'removed') {
          const schemeId = fc.oldValue as string;
          changes.push(this.makeChange({
            severity: 'breaking',
            category: 'authentication',
            message: `Security requirement '${schemeId}' was removed from the endpoint.`,
            consequence: `Clients trying to authenticate with '${schemeId}' might fail if the server no longer accepts it.`,
            migration: `Update clients to use one of the remaining security requirements.`,
            location: { path: ed.path, method: ed.method, field: `security['${schemeId}']` }
          }, context));
        }
      }
    }
    return changes;
  }
}
