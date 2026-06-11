import { describe, it, expect } from 'vitest';
import { ParamRemovedRule } from '../../src/rules/param/param-removed.js';
import { ParamAddedRule } from '../../src/rules/param/param-added.js';
import { ParamDeprecatedRule } from '../../src/rules/param/param-deprecated.js';
import { ParamTypeChangedRule } from '../../src/rules/param/param-type-changed.js';
import { ParamRequiredAddedRule } from '../../src/rules/param/param-required-added.js';
import { ParamLocationChangedRule } from '../../src/rules/param/param-location-changed.js';
import { ParamEnumValueRemovedRule } from '../../src/rules/param/param-enum-value-removed.js';
import { ParamEnumValueAddedRule } from '../../src/rules/param/param-enum-value-added.js';
import { ParamRequiredTrueToFalseRule } from '../../src/rules/param/param-required-true-to-false.js';
import type { DiffSet, RuleContext } from '../../src/types/index.js';

describe('Parameter Rules', () => {
  const context: RuleContext = {
    config: { failOn: 'breaking', disabledRules: [], ignorePaths: [], output: { format: 'terminal' } },
    oldSpec: { meta: { title: 'v1', version: '1.0.0', format: 'openapi3', rawVersion: '3.0.0' }, servers: [], endpoints: [], components: { schemas: {}, securitySchemes: {}, parameters: {}, responses: {}, headers: {}, requestBodies: {} }, security: [] },
    newSpec: { meta: { title: 'v2', version: '2.0.0', format: 'openapi3', rawVersion: '3.0.0' }, servers: [], endpoints: [], components: { schemas: {}, securitySchemes: {}, parameters: {}, responses: {}, headers: {}, requestBodies: {} }, security: [] },
  };

  const dummyEndpoint = { id: 'GET:/test', path: '/test', method: 'GET' as const, summary: '', description: '', tags: [], deprecated: false, security: [], parameters: [], responses: [] };

  it('PARAM_REMOVED triggers on required param removal', () => {
    const diff: DiffSet = {
      endpointDiffs: [
        { 
          type: 'changed', endpointId: 'GET:/test', path: '/test', method: 'GET', oldEndpoint: dummyEndpoint, newEndpoint: dummyEndpoint, 
          fieldChanges: [
            { fieldPath: ['parameters', 'testParam:query'], changeType: 'removed', oldValue: { name: 'testParam', in: 'query', required: true, schema: { type: 'string' } } }
          ] 
        }
      ],
      componentDiffs: []
    };
    
    const rule = new ParamRemovedRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('PARAM_REMOVED');
    expect(changes[0].severity).toBe('breaking');
  });

  it('PARAM_OPTIONAL_REMOVED triggers on optional param removal', () => {
    const diff: DiffSet = {
      endpointDiffs: [
        { 
          type: 'changed', endpointId: 'GET:/test', path: '/test', method: 'GET', oldEndpoint: dummyEndpoint, newEndpoint: dummyEndpoint, 
          fieldChanges: [
            { fieldPath: ['parameters', 'testParam:query'], changeType: 'removed', oldValue: { name: 'testParam', in: 'query', required: false, schema: { type: 'string' } } }
          ] 
        }
      ],
      componentDiffs: []
    };
    
    const rule = new ParamRemovedRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('PARAM_OPTIONAL_REMOVED');
    expect(changes[0].severity).toBe('warning');
  });

  it('PARAM_ADDED_REQUIRED triggers on required param added', () => {
    const diff: DiffSet = {
      endpointDiffs: [
        { 
          type: 'changed', endpointId: 'GET:/test', path: '/test', method: 'GET', oldEndpoint: dummyEndpoint, newEndpoint: dummyEndpoint, 
          fieldChanges: [
            { fieldPath: ['parameters', 'testParam:query'], changeType: 'added', newValue: { name: 'testParam', in: 'query', required: true, schema: { type: 'string' } } }
          ] 
        }
      ],
      componentDiffs: []
    };
    
    const rule = new ParamAddedRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('PARAM_ADDED_REQUIRED');
    expect(changes[0].severity).toBe('breaking');
  });

  it('PARAM_ADDED triggers on optional param added', () => {
    const diff: DiffSet = {
      endpointDiffs: [
        { 
          type: 'changed', endpointId: 'GET:/test', path: '/test', method: 'GET', oldEndpoint: dummyEndpoint, newEndpoint: dummyEndpoint, 
          fieldChanges: [
            { fieldPath: ['parameters', 'testParam:query'], changeType: 'added', newValue: { name: 'testParam', in: 'query', required: false, schema: { type: 'string' } } }
          ] 
        }
      ],
      componentDiffs: []
    };
    
    const rule = new ParamAddedRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('PARAM_ADDED');
    expect(changes[0].severity).toBe('info');
  });

  it('PARAM_DEPRECATED triggers on deprecated change', () => {
    const diff: DiffSet = {
      endpointDiffs: [
        { 
          type: 'changed', endpointId: 'GET:/test', path: '/test', method: 'GET', oldEndpoint: dummyEndpoint, newEndpoint: dummyEndpoint, 
          fieldChanges: [
            { fieldPath: ['parameters', 'testParam:query', 'deprecated'], changeType: 'changed', oldValue: false, newValue: true }
          ] 
        }
      ],
      componentDiffs: []
    };
    
    const rule = new ParamDeprecatedRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('PARAM_DEPRECATED');
    expect(changes[0].severity).toBe('warning');
  });

  it('PARAM_TYPE_CHANGED triggers on schema type change', () => {
    const diff: DiffSet = {
      endpointDiffs: [
        { 
          type: 'changed', endpointId: 'GET:/test', path: '/test', method: 'GET', oldEndpoint: dummyEndpoint, newEndpoint: dummyEndpoint, 
          fieldChanges: [
            { fieldPath: ['parameters', 'testParam:query', 'schema', 'type'], changeType: 'changed', oldValue: 'string', newValue: 'number' }
          ] 
        }
      ],
      componentDiffs: []
    };
    
    const rule = new ParamTypeChangedRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('PARAM_TYPE_CHANGED');
    expect(changes[0].severity).toBe('breaking');
  });

  it('PARAM_REQUIRED_FALSE_TO_TRUE triggers when optional becomes required', () => {
    const diff: DiffSet = {
      endpointDiffs: [
        { 
          type: 'changed', endpointId: 'GET:/test', path: '/test', method: 'GET', oldEndpoint: dummyEndpoint, newEndpoint: dummyEndpoint, 
          fieldChanges: [
            { fieldPath: ['parameters', 'testParam:query', 'required'], changeType: 'changed', oldValue: false, newValue: true }
          ] 
        }
      ],
      componentDiffs: []
    };
    
    const rule = new ParamRequiredAddedRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('PARAM_REQUIRED_FALSE_TO_TRUE');
    expect(changes[0].severity).toBe('breaking');
  });

  it('PARAM_LOCATION_CHANGED triggers when parameter moves', () => {
    const diff: DiffSet = {
      endpointDiffs: [
        { 
          type: 'changed', endpointId: 'GET:/test', path: '/test', method: 'GET', oldEndpoint: dummyEndpoint, newEndpoint: dummyEndpoint, 
          fieldChanges: [
            { fieldPath: ['parameters', 'testParam:query'], changeType: 'removed', oldValue: { name: 'testParam', in: 'query' } },
            { fieldPath: ['parameters', 'testParam:header'], changeType: 'added', newValue: { name: 'testParam', in: 'header' } }
          ] 
        }
      ],
      componentDiffs: []
    };
    
    const rule = new ParamLocationChangedRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('PARAM_LOCATION_CHANGED');
    expect(changes[0].severity).toBe('breaking');
  });

  it('PARAM_ENUM_VALUE_REMOVED triggers when enum is removed', () => {
    const diff: DiffSet = {
      endpointDiffs: [
        { 
          type: 'changed', endpointId: 'GET:/test', path: '/test', method: 'GET', oldEndpoint: dummyEndpoint, newEndpoint: dummyEndpoint, 
          fieldChanges: [
            { fieldPath: ['parameters', 'testParam:query', 'schema', 'enum', 'oldVal'], changeType: 'removed', oldValue: 'oldVal' }
          ] 
        }
      ],
      componentDiffs: []
    };
    
    const rule = new ParamEnumValueRemovedRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('PARAM_ENUM_VALUE_REMOVED');
    expect(changes[0].severity).toBe('breaking');
  });

  it('PARAM_ENUM_VALUE_ADDED triggers when enum is added', () => {
    const diff: DiffSet = {
      endpointDiffs: [
        { 
          type: 'changed', endpointId: 'GET:/test', path: '/test', method: 'GET', oldEndpoint: dummyEndpoint, newEndpoint: dummyEndpoint, 
          fieldChanges: [
            { fieldPath: ['parameters', 'testParam:query', 'schema', 'enum', 'newVal'], changeType: 'added', newValue: 'newVal' }
          ] 
        }
      ],
      componentDiffs: []
    };
    
    const rule = new ParamEnumValueAddedRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('PARAM_ENUM_VALUE_ADDED');
    expect(changes[0].severity).toBe('info');
  });

  it('PARAM_REQUIRED_TRUE_TO_FALSE triggers when required becomes optional', () => {
    const diff: DiffSet = {
      endpointDiffs: [
        { 
          type: 'changed', endpointId: 'GET:/test', path: '/test', method: 'GET', oldEndpoint: dummyEndpoint, newEndpoint: dummyEndpoint, 
          fieldChanges: [
            { fieldPath: ['parameters', 'testParam:query', 'required'], changeType: 'changed', oldValue: true, newValue: false }
          ] 
        }
      ],
      componentDiffs: []
    };
    
    const rule = new ParamRequiredTrueToFalseRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('PARAM_REQUIRED_TRUE_TO_FALSE');
    expect(changes[0].severity).toBe('info');
  });
});
