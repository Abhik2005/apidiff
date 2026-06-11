import type { SemanticChange } from '../types/index.js';

const SEVERITY_EMOJI = {
  breaking: '❌',
  warning: '⚠️',
  info: 'ℹ️'
};

export function formatMarkdown(changes: SemanticChange[]): string {
  if (changes.length === 0) {
    return 'No changes detected.\n';
  }

  let md = '## API Changes\n\n';

  for (const c of changes) {
    const emoji = SEVERITY_EMOJI[c.severity] || SEVERITY_EMOJI.info;
    let locStr = `**${c.location.method}** \`${c.location.path}\``;
    if (c.location.paramName) locStr += ` (param: \`${c.location.paramName}\`)`;
    if (c.location.field) locStr += ` (field: \`${c.location.field}\`)`;

    md += `### ${emoji} ${c.message}\n`;
    md += `- **Location:** ${locStr}\n`;
    md += `- **Consequence:** ${c.consequence}\n`;
    md += `- **Migration:** ${c.migration}\n\n`;
  }

  return md;
}
