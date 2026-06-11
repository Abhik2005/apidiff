import { BaseRule } from '../base.js';
import type { DiffSet, RuleContext, SemanticChange } from '../../types/index.js';

export class SecuritySchemeTypeChangedRule extends BaseRule {
  id = 'SECURITY_SCHEME_TYPE_CHANGED';
  description = 'The type of a security scheme was changed';
  severity = 'breaking' as const;

  apply(diff: DiffSet, context: RuleContext): SemanticChange[] {
    const changes: SemanticChange[] = [];
    
    for (const sd of diff.securityDiffs) {
      if (sd.changeType === 'changed') {
        for (const fc of sd.fieldChanges) {
          if (fc.fieldPath[0] === 'type') {
            changes.push(this.makeChange({
              severity: 'breaking',
              category: 'authentication',
              message: `Security scheme '${sd.schemeId}' changed type from '${fc.oldValue}' to '${fc.newValue}'.`,
              consequence: `Clients using the old authentication type will fail to authenticate.`,
              migration: `Update clients to authenticate using the new type '${fc.newValue}'.`,
              location: { field: `securitySchemes['${sd.schemeId}'].type` }
            }, context));
          }
        }
      }
    }
    return changes;
  }
}
