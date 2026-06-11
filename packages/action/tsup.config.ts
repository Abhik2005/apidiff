import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node20',
  noExternal: [/(.*)/], // Bundle all dependencies
  splitting: false,
  clean: true,
});
