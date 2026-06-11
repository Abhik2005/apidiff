import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import yaml from 'js-yaml';
import { RefError } from '../../types/errors.js';

const fileCache = new Map<string, any>();

export function resolveRefs(obj: any, root: any, sourcePath?: string): any {
  if (!obj || typeof obj !== 'object') return obj;

  const stack: Array<{ node: any; parent: any | null; key: string | null }> = [
    { node: obj, parent: null, key: null }
  ];
  const visitedRefs = new Set<string>();
  const visitedNodes = new WeakSet<any>();

  while (stack.length > 0) {
    const current = stack.pop()!;
    const { node, parent, key } = current;

    if (!node || typeof node !== 'object') continue;

    if (visitedNodes.has(node)) continue;
    visitedNodes.add(node);

    if (Array.isArray(node)) {
      for (let i = node.length - 1; i >= 0; i--) {
        stack.push({ node: node[i], parent: node, key: i.toString() });
      }
      continue;
    }

    if ('$ref' in node && typeof node.$ref === 'string') {
      const ref = node.$ref;
      
      if (visitedRefs.has(ref)) {
        if (parent && key !== null) {
          parent[key] = { ...node, $circular: true };
        }
        continue;
      }
      visitedRefs.add(ref);

      let resolved: any;
      if (ref.startsWith('#')) {
        resolved = resolveLocalRef(ref, root);
      } else if (ref.startsWith('./') || ref.startsWith('../')) {
        if (!sourcePath) {
          throw new RefError(`Cannot resolve relative ref without sourcePath`, ref);
        }
        const refPath = resolve(dirname(sourcePath), ref.split('#')[0]);
        try {
          let parsed = fileCache.get(refPath);
          if (!parsed) {
            const content = readFileSync(refPath, 'utf8');
            parsed = refPath.endsWith('.json') ? JSON.parse(content) : yaml.load(content);
            fileCache.set(refPath, parsed);
          }
          resolved = ref.includes('#') ? resolveLocalRef('#' + ref.split('#')[1], parsed) : parsed;
        } catch (err: any) {
          throw new RefError(`Failed to load external ref`, ref, err);
        }
      } else if (ref.startsWith('http://') || ref.startsWith('https://')) {
         throw new RefError(`URL refs not implemented synchronously`, ref);
      } else {
        throw new RefError(`Unsupported ref format`, ref);
      }

      if (parent && key !== null) {
        parent[key] = resolved;
        stack.push({ node: resolved, parent, key }); 
      }
      continue;
    }

    const keys = Object.keys(node);
    for (let i = keys.length - 1; i >= 0; i--) {
      const k = keys[i];
      if (k !== '$ref' && typeof node[k] === 'object' && node[k] !== null) {
        stack.push({ node: node[k], parent: node, key: k });
      }
    }
  }

  return obj;
}

function resolveLocalRef(ref: string, root: any): any {
  const parts = ref.replace(/^#\/?/, '').split('/');
  let current = root;
  for (const part of parts) {
    if (!part) continue;
    const key = part.replace(/~1/g, '/').replace(/~0/g, '~');
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      throw new RefError(`Local ref not found`, ref);
    }
  }
  return current;
}
