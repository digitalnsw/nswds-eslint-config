import { defineConfig, globalIgnores } from 'eslint/config'
import { fixupConfigRules } from '@eslint/compat'

import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

import { baseIgnores, prettierTail } from './shared.mjs'

// Re-exported for consumers that extend the ignore list (public API).
export { baseIgnores }

// The shared Next.js config: core-web-vitals + TypeScript, with Prettier
// enforced as an ESLint rule and console output restricted to warn/error.
// Non-Next repos use the './base' entry point instead.
//
// The eslint-config-next presets are wrapped in `fixupConfigRules` because
// ESLint 10 removed `context.getFilename()`, which eslint-plugin-react (pulled
// in transitively by eslint-config-next, incl. 16.2.11) still calls from its
// React-version *detection* path — every lint run then dies with
// `TypeError: contextOrFilename.getFilename is not a function` before checking
// a single file. The shim re-attaches the removed accessors, so the presets run
// unchanged on both ESLint 9 and 10. Drop the wrapper once eslint-config-next
// ships an ESLint-10-compatible eslint-plugin-react (vercel/next.js#89764).
const nswdsEslintConfig = defineConfig([
  ...fixupConfigRules(nextVitals),
  ...fixupConfigRules(nextTs),
  ...prettierTail,
  globalIgnores(baseIgnores),
])

export default nswdsEslintConfig
