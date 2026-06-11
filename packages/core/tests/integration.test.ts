import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { run } from '../src/index.js';

describe('Integration Tests: Real World Scenarios', () => {
  it('Stripe API Versioning (v1 to v2)', async () => {
    const oldPath = resolve(__dirname, '../test/integration/stripe-v1.yaml');
    const newPath = resolve(__dirname, '../test/integration/stripe-v2.yaml');

    const result = await run(oldPath, newPath);

    expect(result.stats.total).toBeGreaterThan(0);
    expect(result.stats.breaking).toBeGreaterThan(0);

    const changes = result.changes;
    // We expect RESPONSE_FIELD_REMOVED for currency
    const fieldRemoved = changes.find(c => c.ruleId === 'RESPONSE_FIELD_REMOVED' && c.message.includes('currency'));
    expect(fieldRemoved).toBeDefined();
    expect(fieldRemoved?.severity).toBe('breaking');
  });
});
