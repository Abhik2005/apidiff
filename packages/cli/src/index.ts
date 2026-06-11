#!/usr/bin/env node
import { Command } from 'commander';
import { run, formatOutput, loadConfig } from '@apidiff/core';

const program = new Command();

program
  .name('apidiff')
  .description('Semantic API change detector')
  .version('0.1.0')
  .argument('<old-spec>', 'Old spec (path, URL, or git ref)')
  .argument('<new-spec>', 'New spec (path, URL, or git ref)')
  .option('-f, --format <format>', 'Output format', 'terminal')
  .option('-c, --config <path>', 'Config file path')
  .option('--fail-on <level>', 'Fail on: breaking | warning', 'breaking')
  .option('--ignore-path <glob>', 'Ignore path glob (repeatable)', (val, memo: string[]) => { memo.push(val); return memo; }, [])
  .option('--summary', 'Print summary only')
  .option('--quiet', 'No output')
  .option('--no-color', 'Disable colors')
  .action(async (oldSpec, newSpec, opts) => {
    try {
      const config = await loadConfig(opts);
      const result = await run(oldSpec, newSpec, config);
      
      if (!opts.quiet) {
        const output = formatOutput(result.changes, config.output.format);
        process.stdout.write(output + '\n');
        
        if (opts.summary || opts.format === 'terminal') {
          process.stdout.write(`\nSummary: ${result.stats.breaking} breaking, ${result.stats.warning} warnings, ${result.stats.info} info\n`);
        }
      }
      
      const hasBreaking = result.stats.breaking > 0;
      const hasWarning = result.stats.warning > 0;
      
      if (hasBreaking) process.exit(1);
      if (hasWarning && config.failOn === 'warning') process.exit(2);
      process.exit(0);
    } catch (err: any) {
      console.error(opts.noColor ? err.message : `\x1b[31mError:\x1b[0m ${err.message}`);
      process.exit(1);
    }
  });

program.parse();
