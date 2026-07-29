import { defineConfig, globalIgnores } from 'eslint/config'
import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

import { baseIgnores, prettierTail } from './shared.mjs'

// Framework-free entry point for repos that aren't Next.js apps — token
// pipelines, IaC programs, node scripts, plain sites. @eslint/js recommended
// + typescript-eslint recommended, with the same Prettier-as-a-rule tail and
// ignore set as the Next.js config, so fleet lint policy stays centralised
// for non-Next repos instead of forcing them into bespoke configs.
//
// Peers required only by this entry point (optional in package.json, so "."
// consumers never install them): @eslint/js, typescript-eslint.
//
// Usage — eslint.config.mjs:
//   import nswds from '@nswds/eslint-config/base'
//   export default nswds
const nswdsEslintConfigBase = defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...prettierTail,
  globalIgnores(baseIgnores),
])

export default nswdsEslintConfigBase
export { baseIgnores }
