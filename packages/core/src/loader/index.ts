import { readFileSync } from 'node:fs';
import { loadFile } from './file-loader.js';
import { loadUrl } from './url-loader.js';
import { loadGit } from './git-loader.js';
import { LoadError } from '../types/errors.js';

export interface RawSpec {
  content: string;
  sourcePath?: string;
  format?: 'openapi3' | 'openapi2' | 'protobuf' | 'graphql';
}

export async function loadSpec(source: string): Promise<RawSpec> {
  if (source === '-') {
    try {
      const content = readFileSync(0, 'utf-8');
      return { content, sourcePath: undefined };
    } catch (err: any) {
      throw new LoadError('failed to read from stdin', err);
    }
  }

  if (source.startsWith('http://') || source.startsWith('https://')) {
    return await loadUrl(source);
  }

  if (source.startsWith('git:')) {
    return loadGit(source);
  }

  return loadFile(source);
}
