# Contributing to apidiff

We welcome contributions! Please follow these guidelines to ensure a smooth process.

## Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/semantic-api/apidiff.git
   cd apidiff
   ```

2. **Install dependencies:**
   This is a monorepo managed with `pnpm`.
   ```bash
   pnpm install
   ```

3. **Build the project:**
   ```bash
   pnpm run build
   ```

## Adding a New Rule

1. Open `packages/core/src/rules/index.ts` and add a new Rule class that implements the `IRule` interface.
2. Register the rule in `packages/core/src/rules/index.ts` in the `BUILT_IN_RULES` array.
3. Add the rule to the table in `RULES.md`.
4. Write tests for your rule.

## Adding a New Parser

1. Create a new file in `packages/core/src/parsers/`.
2. Implement the `ISpecParser` interface.
3. Register the parser in `packages/core/src/parsers/index.ts`.
4. Add tests parsing valid and invalid specs in your format.

## Pull Requests

1. Create a new branch from `main`.
2. Ensure `pnpm test` and `pnpm run build` pass.
3. Submit a PR with a clear description of the problem and your solution.
