import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/app.ts', 'src/index.ts'],
  format: ['cjs'],
  dts: false,
  clean: true,
  noExternal: [
    '@standard18/shared',
    '@standard18/parser',
    '@standard18/validator',
    '@standard18/analyzer',
  ],
});