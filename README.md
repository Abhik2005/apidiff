# Semantic API Diff Tool (apidiff)

[![npm version](https://img.shields.io/npm/v/@apidiff/cli.svg)](https://www.npmjs.com/package/@apidiff/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

A powerful, semantic diffing tool for APIs. `apidiff` analyzes OpenAPI 3.x, Swagger 2.0, Protobuf, and GraphQL specifications to detect breaking changes, additions, and modifications.

### Output Example
```text
$ apidiff v1.yaml v2.yaml

⚠️  Parameter 'additionalMetadata' in query changed type from string to integer.
   Location: POST /pet/{petId}/uploadImage (param: additionalMetadata) (field: query)
   Consequence: Clients sending the old type will receive validation errors.
   Migration: Update clients to send the new type (integer) for 'additionalMetadata'.

Summary: 0 breaking, 1 warnings, 0 info
```

## Features
- **Semantic Diffing**: Understands API structure, not just text changes.
- **Multi-format Support**: OpenAPI 3.x, Swagger 2.0, Protobuf, GraphQL.
- **Multiple Sources**: Load from local files, HTTP URLs, or Git references (e.g. `git:main:openapi.yaml`).
- **Flexible Output**: Terminal, JSON, Markdown, and HTML reports.
- **GitHub Action**: Ready to be used in your CI/CD pipelines to block breaking changes.
- **Customizable Rules**: Ignore specific changes or enforce strict checks.

## Installation

```bash
# Install via npm
npm install -g @apidiff/cli

# Or use npx
npx @apidiff/cli --help
```

You can also download standalone binaries for Windows, macOS, and Linux from the [Releases page](https://github.com/semantic-api/apidiff/releases).

## Quick Start

```bash
# Compare two local files
apidiff v1.yaml v2.yaml

# Compare main branch with local file
apidiff git:main:openapi.yaml openapi.yaml

# Output to HTML report
apidiff v1.yaml v2.yaml --format html --out report.html
```

## CLI Usage

```
Usage: apidiff [options] <oldSpec> <newSpec>

Arguments:
  oldSpec               Base specification (file path, URL, or git:ref:path)
  newSpec               Head specification (file path, URL, or git:ref:path)

Options:
  -f, --format <type>   Output format (terminal, json, markdown, html) (default: "terminal")
  -o, --out <path>      Output file path (prints to stdout if omitted)
  --fail-on <level>     Fail exit code if changes of this level or higher are found (breaking, warning, info) (default: "breaking")
  -h, --help            display help for command
```

## Configuration

Place an `apidiff.config.json` in your project root to customize rules, adjust fail thresholds, and ignore specific paths:

```json
{
  "failOn": "breaking",
  "ignorePaths": [
    "/internal/**",
    "/experimental/v2/**"
  ],
  "disabledRules": [
    "PARAM_REMOVED"
  ],
  "ruleSeverityOverrides": {
    "PARAM_TYPE_CHANGED": "warning"
  }
}
```

See [RULES.md](./RULES.md) for a complete list of rules.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details on adding new rules, parsers, and running the project locally.

## License

MIT
