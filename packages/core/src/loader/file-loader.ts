import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { LoadError } from '../types/errors.js';

export function loadFile(source: string): { content: string; sourcePath: string } {
  try {
    const sourcePath = resolve(source);
    const content = readFileSync(sourcePath, 'utf8');
    return { content, sourcePath };
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      throw new LoadError(`file not found: ${source}`, err);
    }
    if (err.code === 'EACCES') {
      throw new LoadError(`permission denied: ${source}`, err);
    }
    throw new LoadError(`failed to read file: ${source}`, err);
  }
}
