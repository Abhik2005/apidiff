import { describe, it, expect } from 'vitest';
import { diffSecuritySchemes, diffSecurityRequirements } from '../../src/diff/auth-differ.js';
import type { SecurityScheme, SecurityRequirement, FieldChange } from '../../src/types/index.js';

describe('Auth Differ', () => {
  it('diffSecuritySchemes detects added schemes', () => {
    const oldSchemes: SecurityScheme[] = [];
    const newSchemes: SecurityScheme[] = [{ id: 'ApiKey', type: 'apiKey', in: 'header', name: 'X-API-Key' }];
    const diffs = diffSecuritySchemes(oldSchemes, newSchemes);
    expect(diffs).toHaveLength(1);
    expect(diffs[0].changeType).toBe('added');
    expect(diffs[0].schemeId).toBe('ApiKey');
  });

  it('diffSecuritySchemes detects removed schemes', () => {
    const oldSchemes: SecurityScheme[] = [{ id: 'ApiKey', type: 'apiKey', in: 'header', name: 'X-API-Key' }];
    const newSchemes: SecurityScheme[] = [];
    const diffs = diffSecuritySchemes(oldSchemes, newSchemes);
    expect(diffs).toHaveLength(1);
    expect(diffs[0].changeType).toBe('removed');
    expect(diffs[0].schemeId).toBe('ApiKey');
  });

  it('diffSecuritySchemes detects changed schemes', () => {
    const oldSchemes: SecurityScheme[] = [{ id: 'Auth', type: 'http', scheme: 'basic' }];
    const newSchemes: SecurityScheme[] = [{ id: 'Auth', type: 'http', scheme: 'bearer' }];
    const diffs = diffSecuritySchemes(oldSchemes, newSchemes);
    expect(diffs).toHaveLength(1);
    expect(diffs[0].changeType).toBe('changed');
    expect(diffs[0].fieldChanges).toHaveLength(1);
    expect(diffs[0].fieldChanges[0].fieldPath).toEqual(['scheme']);
    expect(diffs[0].fieldChanges[0].oldValue).toBe('basic');
    expect(diffs[0].fieldChanges[0].newValue).toBe('bearer');
  });

  it('diffSecurityRequirements detects added/removed/changed scopes', () => {
    const oldReqs: SecurityRequirement[] = [{ schemeId: 'OAuth', scopes: ['read'] }];
    const newReqs: SecurityRequirement[] = [{ schemeId: 'OAuth', scopes: ['read', 'write'] }, { schemeId: 'ApiKey', scopes: [] }];
    const changes: FieldChange[] = [];
    
    diffSecurityRequirements(oldReqs, newReqs, ['security'], changes);
    
    expect(changes).toContainEqual({ fieldPath: ['security', 'ApiKey'], changeType: 'added', newValue: 'ApiKey' });
    expect(changes).toContainEqual({ fieldPath: ['security', 'OAuth', 'scopes', 'write'], changeType: 'added', newValue: 'write' });
  });

  it('diffSecurityRequirements detects removed requirements', () => {
    const oldReqs: SecurityRequirement[] = [{ schemeId: 'ApiKey', scopes: [] }];
    const newReqs: SecurityRequirement[] = [];
    const changes: FieldChange[] = [];
    
    diffSecurityRequirements(oldReqs, newReqs, ['security'], changes);
    expect(changes).toContainEqual({ fieldPath: ['security', 'ApiKey'], changeType: 'removed', oldValue: 'ApiKey' });
  });
});
