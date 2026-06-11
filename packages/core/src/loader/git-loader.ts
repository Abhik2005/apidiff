import { execSync } from 'node:child_process';
import { LoadError } from '../types/errors.js';

export function loadGit(source: string): { content: string; sourcePath: string } {
  // source format: "git:HEAD~1:path/to/api.yaml"
  const match = source.match(/^git:([^:]+):(.+)$/);
  if (!match) {
    throw new LoadError(`invalid git source format: ${source}`);
  }
  const [, ref, filePath] = match;

  try {
    const content = execSync(`git show ${ref}:${filePath}`, { encoding: 'utf-8', stdio: 'pipe' });
    return { content, sourcePath: filePath };
  } catch (err: any) {
    const stderr = err.stderr?.toString() || '';
    if (stderr.includes('Not a valid object name') || stderr.includes('does not exist')) {
      throw new LoadError(`git ref or path not found: ${ref}:${filePath}`, err);
    }
    throw new LoadError(`git command failed: ${source}`, err);
  }
}
