import type { SecurityScheme, SecurityRequirement, SecurityDiff, FieldChange } from '../types/index.js';

export function diffSecuritySchemes(oldSchemes: SecurityScheme[], newSchemes: SecurityScheme[]): SecurityDiff[] {
  const diffs: SecurityDiff[] = [];
  const oldMap = new Map(oldSchemes.map(s => [s.id, s]));
  const newMap = new Map(newSchemes.map(s => [s.id, s]));

  const allIds = new Set([...oldMap.keys(), ...newMap.keys()]);

  for (const id of allIds) {
    const oldScheme = oldMap.get(id);
    const newScheme = newMap.get(id);

    if (oldScheme && !newScheme) {
      diffs.push({ schemeId: id, changeType: 'removed', fieldChanges: [] });
    } else if (!oldScheme && newScheme) {
      diffs.push({ schemeId: id, changeType: 'added', fieldChanges: [] });
    } else if (oldScheme && newScheme) {
      const fieldChanges: FieldChange[] = [];
      if (oldScheme.type !== newScheme.type) {
        fieldChanges.push({ fieldPath: ['type'], changeType: 'changed', oldValue: oldScheme.type, newValue: newScheme.type });
      }
      if (oldScheme.scheme !== newScheme.scheme) {
        fieldChanges.push({ fieldPath: ['scheme'], changeType: 'changed', oldValue: oldScheme.scheme, newValue: newScheme.scheme });
      }
      if (oldScheme.in !== newScheme.in) {
        fieldChanges.push({ fieldPath: ['in'], changeType: 'changed', oldValue: oldScheme.in, newValue: newScheme.in });
      }
      if (fieldChanges.length > 0) {
        diffs.push({ schemeId: id, changeType: 'changed', fieldChanges });
      }
    }
  }

  return diffs;
}

export function diffSecurityRequirements(oldReqs: SecurityRequirement[], newReqs: SecurityRequirement[], path: string[], changes: FieldChange[]): void {
  const oldSet = new Set(oldReqs.map(r => r.schemeId));
  const newSet = new Set(newReqs.map(r => r.schemeId));

  for (const schemeId of newSet) {
    if (!oldSet.has(schemeId)) {
      changes.push({ fieldPath: [...path, schemeId], changeType: 'added', newValue: schemeId });
    }
  }

  for (const schemeId of oldSet) {
    if (!newSet.has(schemeId)) {
      changes.push({ fieldPath: [...path, schemeId], changeType: 'removed', oldValue: schemeId });
    }
  }

  const oldMap = new Map(oldReqs.map(r => [r.schemeId, new Set(r.scopes)]));
  const newMap = new Map(newReqs.map(r => [r.schemeId, new Set(r.scopes)]));

  for (const [schemeId, oldScopes] of oldMap.entries()) {
    const newScopes = newMap.get(schemeId);
    if (newScopes) {
      for (const scope of newScopes) {
        if (!oldScopes.has(scope)) {
          changes.push({ fieldPath: [...path, schemeId, 'scopes', scope], changeType: 'added', newValue: scope });
        }
      }
      for (const scope of oldScopes) {
        if (!newScopes.has(scope)) {
          changes.push({ fieldPath: [...path, schemeId, 'scopes', scope], changeType: 'removed', oldValue: scope });
        }
      }
    }
  }
}
