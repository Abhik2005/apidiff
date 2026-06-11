import type { Schema, FieldChange } from '../types/index.js';

export function diffSchema(oldSchema: Schema | undefined, newSchema: Schema | undefined, path: string[], changes: FieldChange[]): void {
  if (!oldSchema && !newSchema) return;
  
  if (!oldSchema && newSchema) {
    changes.push({ fieldPath: path, changeType: 'added', newValue: newSchema });
    return;
  }
  
  if (oldSchema && !newSchema) {
    changes.push({ fieldPath: path, changeType: 'removed', oldValue: oldSchema });
    return;
  }
  
  if (oldSchema && newSchema) {
    if (oldSchema.type !== newSchema.type) {
      const oldTypes = Array.isArray(oldSchema.type) ? oldSchema.type : [oldSchema.type].filter(Boolean);
      const newTypes = Array.isArray(newSchema.type) ? newSchema.type : [newSchema.type].filter(Boolean);
      
      const oldTypeStr = oldTypes.sort().join(',');
      const newTypeStr = newTypes.sort().join(',');
      
      if (oldTypeStr !== newTypeStr) {
        changes.push({ fieldPath: [...path, 'type'], changeType: 'changed', oldValue: oldSchema.type, newValue: newSchema.type });
      }
    }

    if (oldSchema.nullable !== newSchema.nullable) {
      changes.push({ fieldPath: [...path, 'nullable'], changeType: 'changed', oldValue: oldSchema.nullable, newValue: newSchema.nullable });
    }

    const oldReq = new Set(oldSchema.required || []);
    const newReq = new Set(newSchema.required || []);
    for (const req of newReq) {
      if (!oldReq.has(req)) {
        changes.push({ fieldPath: [...path, 'required', req], changeType: 'added', newValue: req });
      }
    }
    for (const req of oldReq) {
      if (!newReq.has(req)) {
        changes.push({ fieldPath: [...path, 'required', req], changeType: 'removed', oldValue: req });
      }
    }

    const oldEnum = new Set(oldSchema.enum || []);
    const newEnum = new Set(newSchema.enum || []);
    for (const val of newEnum) {
      if (!oldEnum.has(val)) {
        changes.push({ fieldPath: [...path, 'enum', String(val)], changeType: 'added', newValue: val });
      }
    }
    for (const val of oldEnum) {
      if (!newEnum.has(val)) {
        changes.push({ fieldPath: [...path, 'enum', String(val)], changeType: 'removed', oldValue: val });
      }
    }

    const oldProps = oldSchema.properties || {};
    const newProps = newSchema.properties || {};
    const allProps = new Set([...Object.keys(oldProps), ...Object.keys(newProps)]);
    for (const prop of allProps) {
      diffSchema(oldProps[prop], newProps[prop], [...path, 'properties', prop], changes);
    }

    if (oldSchema.items || newSchema.items) {
      diffSchema(oldSchema.items, newSchema.items, [...path, 'items'], changes);
    }
  }
}
