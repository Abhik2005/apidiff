import type { DiffSet, RuleContext, SemanticChange, IRule, Severity, RuleCategory } from '../types/index.js';

export abstract class BaseRule implements IRule {
  abstract id: string;
  abstract description: string;
  abstract severity: Severity;

  abstract apply(diff: DiffSet, context: RuleContext): SemanticChange[];

  protected isIgnored(path: string, context: RuleContext): boolean {
    for (const glob of context.config.ignorePaths) {
      if (this.matchGlob(path, glob)) return true;
    }
    return false;
  }

  private matchGlob(path: string, glob: string): boolean {
    const regex = glob.replace(/\*/g, '.*').replace(/\//g, '\\/');
    return new RegExp(`^${regex}$`).test(path);
  }

  protected makeChange(details: { severity: Severity; category: RuleCategory; message: string; consequence: string; migration: string; location: SemanticChange['location']; ruleId?: string }, context: RuleContext): SemanticChange {
    const { ruleId, ...rest } = details;
    return {
      ruleId: ruleId || this.id,
      ...rest
    };
  }
}
