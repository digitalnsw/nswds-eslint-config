import assert from 'node:assert/strict'
import { test } from 'node:test'

import { ESLint } from 'eslint'

import config, { baseIgnores } from './index.mjs'

test('exports a non-empty flat config array', async () => {
  assert.ok(Array.isArray(config), 'default export should be an array')
  assert.ok(config.length > 0, 'config should not be empty')
})

test('exports baseIgnores', async () => {
  assert.ok(Array.isArray(baseIgnores))
  assert.ok(baseIgnores.includes('.next/**'))
})

// The regression this package exists to prevent: ESLint 10 removed
// `context.getFilename()`, which eslint-plugin-react (transitive via
// eslint-config-next) still calls during React-version detection. Without the
// `fixupConfigRules` wrapper this throws
// "contextOrFilename.getFilename is not a function" before linting anything.
test('lints a JSX file without crashing', async () => {
  const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: config })
  const results = await eslint.lintText('export const A = () => <div>hi</div>\n', {
    filePath: 'probe.tsx',
  })
  assert.equal(results.length, 1)
  // Any rule findings are fine — the point is that loading the rules did not throw.
  assert.ok(Array.isArray(results[0].messages))
})
