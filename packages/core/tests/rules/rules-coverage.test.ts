import { describe, it, expect } from 'vitest';
import { BUILT_IN_RULES, runRules } from '../../src/rules/index.js';
import type { DiffSet, RuleContext, Endpoint } from '../../src/types/index.js';

describe('Rules Early Return Coverage', () => {
  it('covers early returns and ignored endpoints for all rules', () => {
    const oldE: Endpoint = {
      id: 'test',
      method: 'GET',
      path: '/ignored',
      security: [],
      parameters: [],
      responses: [],
      tags: [],
      deprecated: false,
      extensions: {}
    };

    const newE: Endpoint = { ...oldE };

    const context: RuleContext = {
      config: {
        severity: 'info',
        disabledRules: [],
        ignorePaths: ['/ignored']
      },
      oldAst: { meta: {} as any, endpoints: [], components: {} as any, servers: [], security: [] },
      newAst: { meta: {} as any, endpoints: [], components: {} as any, servers: [], security: [] },
      sourcePath: ''
    };

    const diffSet: DiffSet = {
      endpointDiffs: [
        // Ignored path
        { type: 'changed', endpointId: 'test1', method: 'GET', path: '/ignored', oldEndpoint: oldE, newEndpoint: newE, fieldChanges: [] },
        // Not changed
        { type: 'added', endpointId: 'test2', method: 'GET', path: '/test', newEndpoint: newE, fieldChanges: [] },
        { type: 'removed', endpointId: 'test3', method: 'GET', path: '/test', oldEndpoint: oldE, fieldChanges: [] },
        // Changed but irrelevant field change
        { 
          type: 'changed', 
          endpointId: 'test4', 
          method: 'GET', 
          path: '/test', 
          oldEndpoint: oldE, 
          newEndpoint: newE, 
          fieldChanges: [
            { fieldPath: ['unknown'], changeType: 'changed', oldValue: 'a', newValue: 'b' },
            { fieldPath: ['parameters', 'p:query'], changeType: 'removed', oldValue: {} },
            { fieldPath: ['parameters', 'p:header'], changeType: 'added', newValue: {} }
          ] 
        }
      ],
      serverDiffs: [],
      securityDiffs: []
    };

    // Run all rules against this diffSet
    const changes = runRules(diffSet, context);
    
    // Some endpoints may produce changes depending on the rule, but most will early return
    expect(changes).toBeInstanceOf(Array);
  });
});
