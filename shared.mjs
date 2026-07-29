// Internal module shared by both entry points (not exported in package.json
// "exports"). Deliberately imports only peers that BOTH entry points require,
// so loading "." never pulls in "./base"-only peers and vice versa.
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import eslintPluginPrettier from 'eslint-plugin-prettier'

// The default ignore set. Consumers that need extra ignores should NOT edit
// this — they add their own `globalIgnores([...])` after spreading the config.
export const baseIgnores = [
  // Default ignores of eslint-config-next:
  '.next/**',
  'out/**',
  'build/**',
  'next-env.d.ts',
  'node_modules/**',
  '**/dist/**',
  // Fleet additions:
  '.github/workflows/**',
]

// Prettier-as-a-rule tail shared by both entry points: config-prettier turns
// conflicting stylistic rules off, then prettier/prettier reports formatting
// diffs as ESLint errors. no-console keeps app logging deliberate.
export const prettierTail = [
  eslintConfigPrettier,
  {
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      'prettier/prettier': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
]
