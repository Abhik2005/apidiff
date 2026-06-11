import * as core from '@actions/core';
import { run as runApidiff, formatOutput } from '@apidiff/core';

async function run(): Promise<void> {
  try {
    let baseSpecInput = core.getInput('base-spec', { required: true });
    let headSpecInput = core.getInput('head-spec', { required: true });
    const failOnBreaking = core.getInput('fail-on-breaking') !== 'false';
    const format = core.getInput('format') as 'markdown' | 'json' | 'terminal' | 'html' || 'markdown';

    // Handle inputs like `main:openapi.yaml`
    if (!baseSpecInput.startsWith('git:') && !baseSpecInput.startsWith('http') && baseSpecInput.includes(':') && !baseSpecInput.match(/^[a-zA-Z]:[/\\]/)) {
      baseSpecInput = 'git:' + baseSpecInput;
    }
    if (!headSpecInput.startsWith('git:') && !headSpecInput.startsWith('http') && headSpecInput.includes(':') && !headSpecInput.match(/^[a-zA-Z]:[/\\]/)) {
      headSpecInput = 'git:' + headSpecInput;
    }

    core.info(`Comparing base: ${baseSpecInput} vs head: ${headSpecInput}`);

    const config = {
      output: { format }
    };

    core.info('Computing semantic diff...');
    const result = await runApidiff(baseSpecInput, headSpecInput, config);

    const outputStr = formatOutput(result.changes, format);

    if (format === 'markdown') {
      core.summary.addRaw(outputStr);
      await core.summary.write();
    } else {
      core.info(outputStr);
    }

    const breaking = result.changes.filter(c => c.severity === 'breaking');
    if (breaking.length > 0) {
      const msg = `Found ${breaking.length} breaking changes.`;
      if (failOnBreaking) {
        core.setFailed(msg);
      } else {
        core.warning(msg);
      }
    } else {
      core.info('No breaking changes found.');
    }
  } catch (error: any) {
    core.setFailed(error.message || String(error));
  }
}

run();
