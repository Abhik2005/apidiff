import { describe, it, expect } from 'vitest';
import { BaseRule } from '../../src/rules/base.js';
import type { DiffSet, RuleContext, SemanticChange } from '../../src/types/index.js';

class MockRule extends BaseRule {
  id = 'MOCK_RULE';
  description = 'Mock';
  severity = 'info' as const;
  
  apply(diff: DiffSet, ctx: RuleContext): SemanticChange[] {
    return [];
  }

  testIsIgnored(path: string, ctx: RuleContext) {
    return this.isIgnored(path, ctx);
  }

  testMakeChange(ctx: RuleContext) {
    return this.makeChange({
      severity: 'warning',
      category: 'endpoint',
      message: 'test',
      consequence: 'test',
      migration: 'test',
      location: { type: 'endpoint', method: 'GET', path: '/' }
    }, ctx);
  }
}

describe('BaseRule', () => {
  it('makes changes', () => {
    const rule = new MockRule();
    const ctx: RuleContext = { changes: [], config: { failOn: 'breaking', ignorePaths: [], ruleSeverityOverrides: {}, disabledRules: [], customRules: [], output: { format: 'terminal', color: true, summary: false, quiet: false } }, source: { old: null as any, new: null as any } };
    const change = rule.testMakeChange(ctx);
    expect(change.ruleId).toBe('MOCK_RULE');
  });

  it('checks ignored paths', () => {
    const rule = new MockRule();
    const ctx: RuleContext = { changes: [], config: { failOn: 'breaking', ignorePaths: ['/test/*'], ruleSeverityOverrides: {}, disabledRules: [], customRules: [], output: { format: 'terminal', color: true, summary: false, quiet: false } }, source: { old: null as any, new: null as any } };
    expect(rule.testIsIgnored('/test/foo', ctx)).toBe(true);
    expect(rule.testIsIgnored('/foo', ctx)).toBe(false);
  });
});
