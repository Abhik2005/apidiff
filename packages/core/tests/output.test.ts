import { describe, it, expect } from 'vitest';
import { formatHtml } from '../src/output/html.js';
import { formatMarkdown } from '../src/output/markdown.js';
import { formatTerminal } from '../src/output/terminal.js';
import { formatJson } from '../src/output/json.js';
import type { SemanticChange } from '../src/types/index.js';

describe('Output Formatters', () => {
  const dummyChanges: SemanticChange[] = [
    {
      severity: 'breaking',
      category: 'endpoint',
      ruleId: 'ENDPOINT_REMOVED',
      message: 'Endpoint removed',
      location: { method: 'GET', path: '/test', paramName: 'id', field: 'data' },
      consequence: 'Breaks things',
      migration: 'Update URL'
    },
    {
      severity: 'info',
      category: 'meta',
      ruleId: 'SERVER_ADDED',
      message: 'Server added',
      location: { method: 'ALL', path: 'GLOBAL' }
    }
  ];

  it('formats HTML', () => {
    const output = formatHtml(dummyChanges);
    expect(output).toContain('Endpoint removed');
    expect(output).toContain('Server added');
    expect(output).toContain('Breaks things');
    expect(output).toContain('Update URL');
    expect(output).toContain('API Diff Report');
  });

  it('formats Markdown', () => {
    const output = formatMarkdown(dummyChanges);
    expect(output).toContain('Endpoint removed');
    expect(output).toContain('Server added');
    expect(output).toContain('Breaks things');
    expect(output).toContain('Update URL');
    expect(output).toContain('## API Changes');
  });

  it('formats Terminal', () => {
    const output = formatTerminal(dummyChanges);
    expect(output).toContain('Endpoint removed');
    expect(output).toContain('Server added');
  });

  it('formats JSON', () => {
    const output = formatJson(dummyChanges);
    const parsed = JSON.parse(output);
    expect(parsed.changes).toHaveLength(2);
    expect(parsed.changes[0].ruleId).toBe('ENDPOINT_REMOVED');
  });
});
