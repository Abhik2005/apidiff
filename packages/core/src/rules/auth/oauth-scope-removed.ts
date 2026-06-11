import { BaseRule } from '../base.js';
import type { DiffSet, RuleContext, SemanticChange } from '../../types/index.js';

export class OauthScopeRemovedRule extends BaseRule {
  id = 'OAUTH_SCOPE_REMOVED';
  description = 'An OAuth scope was removed from a security requirement';
  severity = 'breaking' as const;

  apply(diff: DiffSet, context: RuleContext): SemanticChange[] {
    const changes: SemanticChange[] = [];
    
    for (const ed of diff.endpointDiffs) {
      if (ed.type !== 'changed') continue;
      if (this.isIgnored(ed.path, context)) continue;

      for (const fc of ed.fieldChanges) {
        if (fc.fieldPath[0] === 'security' && fc.fieldPath[2] === 'scopes' && fc.changeType === 'removed') {
          const schemeId = fc.fieldPath[1];
          const scope = fc.oldValue as string;
          
          changes.push(this.makeChange({
            severity: 'breaking',
            category: 'authentication',
            message: `OAuth scope '${scope}' was removed from security requirement '${schemeId}'.`,
            consequence: `Tokens granted with only the '${scope}' scope may no longer be accepted.`,
            migration: `Ensure clients request one of the remaining supported scopes.`,
            location: { path: ed.path, method: ed.method, field: fc.fieldPath.join('.') }
          }, context));
        }
      }
    }
    return changes;
  }
}
