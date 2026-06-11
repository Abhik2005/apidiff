import type { IRule, DiffSet, RuleContext, SemanticChange } from '../types/index.js';
import { SecurityAddedRule } from './auth/security-added.js';
import { EndpointRemovedRule } from './endpoint/endpoint-removed.js';
import { EndpointAddedRule } from './endpoint/endpoint-added.js';
import { EndpointDeprecatedRule } from './endpoint/endpoint-deprecated.js';
import { HttpMethodChangedRule } from './endpoint/http-method-changed.js';
import { PathChangedRule } from './endpoint/path-changed.js';
import { ResponseFieldRemovedRule } from './response/response-field-removed.js';
import { ParamRequiredAddedRule } from './param/param-required-added.js';
import { ParamRemovedRule } from './param/param-removed.js';
import { ParamAddedRule } from './param/param-added.js';
import { ParamDeprecatedRule } from './param/param-deprecated.js';
import { ParamTypeChangedRule } from './param/param-type-changed.js';
import { ParamLocationChangedRule } from './param/param-location-changed.js';
import { ParamEnumValueRemovedRule } from './param/param-enum-value-removed.js';
import { ParamEnumValueAddedRule } from './param/param-enum-value-added.js';
import { ParamRequiredTrueToFalseRule } from './param/param-required-true-to-false.js';
import { RequestBodyAddedRequiredRule } from './request/request-body-added-required.js';
import { RequestBodyRemovedRule } from './request/request-body-removed.js';
import { RequestContentTypeAddedRule } from './request/request-content-type-added.js';
import { RequestContentTypeRemovedRule } from './request/request-content-type-removed.js';
import { RequestFieldRemovedRule } from './request/request-field-removed.js';
import { RequestFieldAddedRequiredRule } from './request/request-field-added-required.js';
import { RequestFieldTypeChangedRule } from './request/request-field-type-changed.js';
import { RequestRequiredFalseToTrueRule } from './request/request-required-false-to-true.js';
import { ResponseFieldAddedRule } from './response/response-field-added.js';
import { ResponseFieldTypeChangedRule } from './response/response-field-type-changed.js';
import { ResponseStatusRemovedRule } from './response/response-status-removed.js';
import { ResponseStatusAddedRule } from './response/response-status-added.js';
import { ResponseMediaTypeRemovedRule } from './response/response-media-type-removed.js';
import { ResponseMediaTypeAddedRule } from './response/response-media-type-added.js';
import { ResponseHeaderRemovedRule } from './response/response-header-removed.js';
import { ResponseHeaderAddedRequiredRule } from './response/response-header-added-required.js';
import { SecurityRemovedRule } from './auth/security-removed.js';
import { SecuritySchemeTypeChangedRule } from './auth/security-scheme-type-changed.js';
import { OauthScopeRemovedRule } from './auth/oauth-scope-removed.js';
import { ServerRemovedRule } from './meta/server-removed.js';

export const BUILT_IN_RULES: IRule[] = [
  new SecurityAddedRule(),
  new EndpointRemovedRule(),
  new EndpointAddedRule(),
  new EndpointDeprecatedRule(),
  new HttpMethodChangedRule(),
  new PathChangedRule(),
  new ResponseFieldRemovedRule(),
  new ParamRequiredAddedRule(),
  new ParamRemovedRule(),
  new ParamAddedRule(),
  new ParamDeprecatedRule(),
  new ParamTypeChangedRule(),
  new ParamLocationChangedRule(),
  new ParamEnumValueRemovedRule(),
  new ParamEnumValueAddedRule(),
  new ParamRequiredTrueToFalseRule(),
  new RequestBodyAddedRequiredRule(),
  new RequestBodyRemovedRule(),
  new RequestContentTypeAddedRule(),
  new RequestContentTypeRemovedRule(),
  new RequestFieldRemovedRule(),
  new RequestFieldAddedRequiredRule(),
  new RequestFieldTypeChangedRule(),
  new RequestRequiredFalseToTrueRule(),
  new ResponseFieldAddedRule(),
  new ResponseFieldTypeChangedRule(),
  new ResponseStatusRemovedRule(),
  new ResponseStatusAddedRule(),
  new ResponseMediaTypeRemovedRule(),
  new ResponseMediaTypeAddedRule(),
  new ResponseHeaderRemovedRule(),
  new ResponseHeaderAddedRequiredRule(),
  new SecurityRemovedRule(),
  new SecuritySchemeTypeChangedRule(),
  new OauthScopeRemovedRule(),
  new ServerRemovedRule()
];

export function runRules(diff: DiffSet, context: RuleContext): SemanticChange[] {
  const enabledRules = BUILT_IN_RULES.filter(
    r => !context.config.disabledRules.includes(r.id)
  );
  return enabledRules.flatMap(r => r.apply(diff, context));
}
