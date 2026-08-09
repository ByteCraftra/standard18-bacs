import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  dts: false,
  external: [
    '@standard18/validator',
    '@standard18/parser',
    '@standard18/shared',
  ],
  clean: true,
});