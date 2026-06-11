import type { SemanticChange, ApidiffConfig } from '../types/index.js';
import { formatTerminal } from './terminal.js';
import { formatJson } from './json.js';
import { formatMarkdown } from './markdown.js';
import { formatHtml } from './html.js';

export function formatOutput(changes: SemanticChange[], format: ApidiffConfig['output']['format']): string {
  switch (format) {
    case 'json': return formatJson(changes);
    case 'markdown': return formatMarkdown(changes);
    case 'html': return formatHtml(changes);
    case 'terminal': 
    default:
      return formatTerminal(changes);
  }
}
