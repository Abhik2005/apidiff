import type { Endpoint, EndpointDiff, FieldChange, Parameter, ResponseDef, RequestBody } from '../types/index.js';
import { diffSchema } from './schema-differ.js';
import { diffSecurityRequirements } from './auth-differ.js';

export function diffEndpoints(oldEndpoints: Endpoint[], newEndpoints: Endpoint[]): EndpointDiff[] {
  const diffs: EndpointDiff[] = [];
  const oldMap = new Map(oldEndpoints.map(e => [e.id, e]));
  const newMap = new Map(newEndpoints.map(e => [e.id, e]));

  const allIds = new Set([...oldMap.keys(), ...newMap.keys()]);

  for (const id of allIds) {
    const oldE = oldMap.get(id);
    const newE = newMap.get(id);

    if (oldE && !newE) {
      diffs.push({ type: 'removed', endpointId: id, path: oldE.path, method: oldE.method, oldEndpoint: oldE, fieldChanges: [] });
    } else if (!oldE && newE) {
      diffs.push({ type: 'added', endpointId: id, path: newE.path, method: newE.method, newEndpoint: newE, fieldChanges: [] });
    } else if (oldE && newE) {
      const fieldChanges: FieldChange[] = [];
      
      if (oldE.method !== newE.method) {
        fieldChanges.push({ fieldPath: ['method'], changeType: 'changed', oldValue: oldE.method, newValue: newE.method });
      }

      if (oldE.path !== newE.path) {
        fieldChanges.push({ fieldPath: ['path'], changeType: 'changed', oldValue: oldE.path, newValue: newE.path });
      }

      if (!!oldE.deprecated !== !!newE.deprecated) {
        fieldChanges.push({ fieldPath: ['deprecated'], changeType: 'changed', oldValue: !!oldE.deprecated, newValue: !!newE.deprecated });
      }

      diffSecurityRequirements(oldE.security, newE.security, ['security'], fieldChanges);
      diffParameters(oldE.parameters, newE.parameters, ['parameters'], fieldChanges);
      diffRequestBody(oldE.requestBody, newE.requestBody, ['requestBody'], fieldChanges);
      diffResponses(oldE.responses, newE.responses, ['responses'], fieldChanges);

      if (fieldChanges.length > 0) {
        diffs.push({ type: 'changed', endpointId: id, path: newE.path, method: newE.method, oldEndpoint: oldE, newEndpoint: newE, fieldChanges });
      }
    }
  }

  return diffs;
}

function diffParameters(oldParams: Parameter[], newParams: Parameter[], path: string[], changes: FieldChange[]) {
  const oldMap = new Map(oldParams.map(p => [`${p.name}:${p.in}`, p]));
  const newMap = new Map(newParams.map(p => [`${p.name}:${p.in}`, p]));
  const allIds = new Set([...oldMap.keys(), ...newMap.keys()]);

  for (const id of allIds) {
    const o = oldMap.get(id);
    const n = newMap.get(id);
    if (o && !n) {
      changes.push({ fieldPath: [...path, id], changeType: 'removed', oldValue: o });
    } else if (!o && n) {
      changes.push({ fieldPath: [...path, id], changeType: 'added', newValue: n });
    } else if (o && n) {
      if (!!o.required !== !!n.required) {
        changes.push({ fieldPath: [...path, id, 'required'], changeType: 'changed', oldValue: !!o.required, newValue: !!n.required });
      }
      if (!!o.deprecated !== !!n.deprecated) {
        changes.push({ fieldPath: [...path, id, 'deprecated'], changeType: 'changed', oldValue: !!o.deprecated, newValue: !!n.deprecated });
      }
      diffSchema(o.schema, n.schema, [...path, id, 'schema'], changes);
    }
  }
}

function diffRequestBody(oldReq: RequestBody | undefined, newReq: RequestBody | undefined, path: string[], changes: FieldChange[]) {
  if (!oldReq && !newReq) return;
  if (oldReq && !newReq) {
    changes.push({ fieldPath: path, changeType: 'removed', oldValue: oldReq });
    return;
  }
  if (!oldReq && newReq) {
    changes.push({ fieldPath: path, changeType: 'added', newValue: newReq });
    return;
  }
  if (oldReq && newReq) {
    if (!!oldReq.required !== !!newReq.required) {
      changes.push({ fieldPath: [...path, 'required'], changeType: 'changed', oldValue: !!oldReq.required, newValue: !!newReq.required });
    }
    const oldMedia = new Set(Object.keys(oldReq.content));
    const newMedia = new Set(Object.keys(newReq.content));
    for (const m of newMedia) {
      if (!oldMedia.has(m)) changes.push({ fieldPath: [...path, 'content', m], changeType: 'added', newValue: newReq.content[m] });
    }
    for (const m of oldMedia) {
      if (!newMedia.has(m)) {
        changes.push({ fieldPath: [...path, 'content', m], changeType: 'removed', oldValue: oldReq.content[m] });
      } else {
        diffSchema(oldReq.content[m].schema, newReq.content[m].schema, [...path, 'content', m, 'schema'], changes);
      }
    }
  }
}

function diffResponses(oldRes: ResponseDef[], newRes: ResponseDef[], path: string[], changes: FieldChange[]) {
  const oldMap = new Map(oldRes.map(r => [r.statusCode, r]));
  const newMap = new Map(newRes.map(r => [r.statusCode, r]));
  const allCodes = new Set([...oldMap.keys(), ...newMap.keys()]);

  for (const code of allCodes) {
    const o = oldMap.get(code);
    const n = newMap.get(code);
    if (o && !n) {
      changes.push({ fieldPath: [...path, code], changeType: 'removed', oldValue: o });
    } else if (!o && n) {
      changes.push({ fieldPath: [...path, code], changeType: 'added', newValue: n });
    } else if (o && n) {
      const oldMedia = new Set(Object.keys(o.content || {}));
      const newMedia = new Set(Object.keys(n.content || {}));
      for (const m of newMedia) {
        if (!oldMedia.has(m)) changes.push({ fieldPath: [...path, code, 'content', m], changeType: 'added', newValue: n.content[m] });
      }
      for (const m of oldMedia) {
        if (!newMedia.has(m)) {
          changes.push({ fieldPath: [...path, code, 'content', m], changeType: 'removed', oldValue: o.content[m] });
        } else {
          diffSchema(o.content[m].schema, n.content[m].schema, [...path, code, 'content', m, 'schema'], changes);
        }
      }
      const oldHeaders = new Set(Object.keys(o.headers || {}));
      const newHeaders = new Set(Object.keys(n.headers || {}));
      for (const h of newHeaders) {
        if (!oldHeaders.has(h)) changes.push({ fieldPath: [...path, code, 'headers', h], changeType: 'added', newValue: n.headers![h] });
      }
      for (const h of oldHeaders) {
        if (!newHeaders.has(h)) {
          changes.push({ fieldPath: [...path, code, 'headers', h], changeType: 'removed', oldValue: o.headers![h] });
        } else {
          if (!!o.headers![h].required !== !!n.headers![h].required) {
            changes.push({ fieldPath: [...path, code, 'headers', h, 'required'], changeType: 'changed', oldValue: !!o.headers![h].required, newValue: !!n.headers![h].required });
          }
          diffSchema(o.headers![h].schema, n.headers![h].schema, [...path, code, 'headers', h, 'schema'], changes);
        }
      }
    }
  }
}
