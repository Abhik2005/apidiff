import chalk from 'chalk';
import type { SemanticChange } from '../types/index.js';

const SEVERITY_ICONS = {
  breaking: chalk.red('❌'),
  warning: chalk.yellow('⚠️ '),
  info: chalk.blue('ℹ '),
};

const SEVERITY_COLORS = {
  breaking: chalk.red,
  warning: chalk.yellow,
  info: chalk.blue,
};

export function formatTerminal(changes: SemanticChange[]): string {
  if (changes.length === 0) {
    return chalk.green('No changes detected.\n');
  }

  let output = '';
  for (const c of changes) {
    const icon = SEVERITY_ICONS[c.severity] || SEVERITY_ICONS.info;
    const color = SEVERITY_COLORS[c.severity] || SEVERITY_COLORS.info;
    
    let locStr = `${c.location.method} ${c.location.path}`;
    if (c.location.paramName) locStr += ` (param: ${c.location.paramName})`;
    if (c.location.field) locStr += ` (field: ${c.location.field})`;

    output += `${icon} ${color(c.message)}\n`;
    output += `   Location: ${locStr}\n`;
    output += `   Consequence: ${c.consequence}\n`;
    output += `   Migration: ${c.migration}\n\n`;
  }

  return output;
}
