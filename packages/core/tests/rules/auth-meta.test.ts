import { describe, it, expect } from 'vitest';
import { SecurityRemovedRule } from '../../src/rules/auth/security-removed.js';
import { SecuritySchemeTypeChangedRule } from '../../src/rules/auth/security-scheme-type-changed.js';
import { OauthScopeRemovedRule } from '../../src/rules/auth/oauth-scope-removed.js';
import { ServerRemovedRule } from '../../src/rules/meta/server-removed.js';
import type { DiffSet, RuleContext } from '../../src/types/index.js';

describe('Auth & Meta Rules', () => {
  const context: RuleContext = {
    config: { failOn: 'breaking', disabledRules: [], ignorePaths: [], output: { format: 'terminal' } },
    oldSpec: { meta: { title: 'v1', version: '1.0.0', format: 'openapi3', rawVersion: '3.0.0' }, servers: [], endpoints: [], components: { schemas: {}, securitySchemes: {}, parameters: {}, responses: {}, headers: {}, requestBodies: {} }, security: [] },
    newSpec: { meta: { title: 'v2', version: '2.0.0', format: 'openapi3', rawVersion: '3.0.0' }, servers: [], endpoints: [], components: { schemas: {}, securitySchemes: {}, parameters: {}, responses: {}, headers: {}, requestBodies: {} }, security: [] },
  };

  const dummyEndpoint = { id: 'GET:/test', path: '/test', method: 'GET' as const, summary: '', description: '', tags: [], deprecated: false, security: [], parameters: [], responses: [] };

  it('SECURITY_REMOVED triggers when a global security scheme is removed', () => {
    const diff: DiffSet = {
      endpointDiffs: [], componentDiffs: [], serverDiffs: [],
      securityDiffs: [
        { schemeId: 'ApiKeyAuth', changeType: 'removed', fieldChanges: [] }
      ]
    };
    const rule = new SecurityRemovedRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('SECURITY_REMOVED');
  });

  it('SECURITY_REMOVED triggers when an endpoint security requirement is removed', () => {
    const diff: DiffSet = {
      securityDiffs: [], componentDiffs: [], serverDiffs: [],
      endpointDiffs: [
        { type: 'changed', endpointId: 'GET:/test', path: '/test', method: 'GET', oldEndpoint: dummyEndpoint, newEndpoint: dummyEndpoint, fieldChanges: [
          { fieldPath: ['security', 'ApiKeyAuth'], changeType: 'removed', oldValue: 'ApiKeyAuth' }
        ]}
      ]
    };
    const rule = new SecurityRemovedRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('SECURITY_REMOVED');
  });

  it('SECURITY_SCHEME_TYPE_CHANGED triggers when scheme type changes', () => {
    const diff: DiffSet = {
      endpointDiffs: [], componentDiffs: [], serverDiffs: [],
      securityDiffs: [
        { schemeId: 'MyAuth', changeType: 'changed', fieldChanges: [
          { fieldPath: ['type'], changeType: 'changed', oldValue: 'http', newValue: 'oauth2' }
        ] }
      ]
    };
    const rule = new SecuritySchemeTypeChangedRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('SECURITY_SCHEME_TYPE_CHANGED');
  });

  it('OAUTH_SCOPE_REMOVED triggers when a scope is removed', () => {
    const diff: DiffSet = {
      securityDiffs: [], componentDiffs: [], serverDiffs: [],
      endpointDiffs: [
        { type: 'changed', endpointId: 'GET:/test', path: '/test', method: 'GET', oldEndpoint: dummyEndpoint, newEndpoint: dummyEndpoint, fieldChanges: [
          { fieldPath: ['security', 'OAuth2', 'scopes', 'read:users'], changeType: 'removed', oldValue: 'read:users' }
        ]}
      ]
    };
    const rule = new OauthScopeRemovedRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('OAUTH_SCOPE_REMOVED');
  });

  it('SERVER_REMOVED triggers when a server is removed', () => {
    const diff: DiffSet = {
      endpointDiffs: [], componentDiffs: [], securityDiffs: [],
      serverDiffs: [
        { changeType: 'removed', oldServer: { url: 'https://api.example.com/v1', description: '' } }
      ]
    };
    const rule = new ServerRemovedRule();
    const changes = rule.apply(diff, context);
    expect(changes).toHaveLength(1);
    expect(changes[0].ruleId).toBe('SERVER_REMOVED');
  });
});
