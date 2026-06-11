import { BaseRule } from '../base.js';
import type { DiffSet, RuleContext, SemanticChange } from '../../types/index.js';

export class ServerRemovedRule extends BaseRule {
  id = 'SERVER_REMOVED';
  description = 'A server was removed from the API';
  severity = 'breaking' as const;

  apply(diff: DiffSet, context: RuleContext): SemanticChange[] {
    const changes: SemanticChange[] = [];
    
    for (const sd of diff.serverDiffs) {
      if (sd.changeType === 'removed' && sd.oldServer) {
        changes.push(this.makeChange({
          severity: 'breaking',
          category: 'server',
          message: `Server URL '${sd.oldServer.url}' was removed.`,
          consequence: `Clients routing traffic to '${sd.oldServer.url}' will eventually fail if the server is decommissioned.`,
          migration: `Update clients to use one of the remaining server URLs.`,
          location: { field: `servers` }
        }, context));
      }
    }
    return changes;
  }
}
