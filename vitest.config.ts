import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: import.meta.dirname,           // ⬅ always the monorepo root, regardless of CWD
  test: {
    globals: true,
    environment: 'node',
    include: [
      'packages/*/src/**/*.test.ts',
      'apps/*/src/**/*.test.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['packages/*/src/**/*.ts'],
      exclude: ['**/__tests__/**'],
    },
  },
});

// import { defineConfig } from 'vitest/config';

// export default defineConfig({
//   test: {
//     globals: true,
//     environment: 'node',
//     passWithNoTests: true, 
//     include: ['packages/*/src/**/*.test.ts', 'apps/*/src/**/*.test.ts'],
//     coverage: {
//       provider: 'v8',
//       reporter: ['text', 'lcov'],
//       include: ['packages/*/src/**/*.ts'],
//       exclude: ['**/__tests__/**']
//     }
//   }
// });