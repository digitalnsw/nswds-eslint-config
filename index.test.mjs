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

// Severity contract: this package IS the fleet's lint policy, so a regression
// that silently drops or downgrades a load-bearing rule (a preset bump
// reshuffling merge order, say) must fail here — not ship green and roll out
// to 20+ repos via Renovate.
test('prettier/prettier and no-console resolve to error severity', async () => {
  const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: config })
  const resolved = await eslint.calculateConfigForFile('probe.tsx')
  assert.equal(resolved.rules['prettier/prettier'][0], 2, 'prettier/prettier must be error')
  assert.equal(resolved.rules['no-console'][0], 2, 'no-console must be error')
})

test('a formatting violation actually fires prettier/prettier', async () => {
  const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: config })
  // Double quotes violate the fleet Prettier config (singleQuote: true).
  const [result] = await eslint.lintText('export const a = "double"\n', {
    filePath: 'probe.ts',
  })
  const ruleIds = result.messages.map((m) => m.ruleId)
  assert.ok(ruleIds.includes('prettier/prettier'), `expected prettier/prettier in ${ruleIds}`)
})

test('a console.log actually fires no-console', async () => {
  const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: config })
  const [result] = await eslint.lintText("console.log('hi')\n", { filePath: 'probe.ts' })
  const hit = result.messages.find((m) => m.ruleId === 'no-console')
  assert.ok(hit, 'expected a no-console message')
  assert.equal(hit.severity, 2)
})
