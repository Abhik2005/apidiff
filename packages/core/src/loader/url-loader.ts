import { LoadError } from '../types/errors.js';

export async function loadUrl(source: string): Promise<{ content: string; sourcePath: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(source, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new LoadError(`failed to fetch url: ${source} (status: ${response.status})`);
    }

    const content = await response.text();
    return { content, sourcePath: source };
  } catch (err: any) {
    if (err instanceof LoadError) {
      throw err;
    }
    if (err.name === 'AbortError') {
      throw new LoadError(`timeout fetching url: ${source}`, err);
    }
    throw new LoadError(`network error fetching url: ${source}`, err instanceof Error ? err : undefined);
  }
}
