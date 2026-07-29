import assert from 'node:assert/strict'
import { test } from 'node:test'

import { ESLint } from 'eslint'

import base, { baseIgnores } from './base.mjs'

test('exports a non-empty flat config array', async () => {
  assert.ok(Array.isArray(base), 'default export should be an array')
  assert.ok(base.length > 0, 'config should not be empty')
})

test('exports baseIgnores', async () => {
  assert.ok(Array.isArray(baseIgnores))
  assert.ok(baseIgnores.includes('node_modules/**'))
})

// The reason './base' exists: TypeScript sources must parse without the
// Next.js preset chain. A parse failure surfaces as a fatal message.
test('parses a TypeScript file', async () => {
  const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: base })
  const [result] = await eslint.lintText('const n: number = 1\nexport default n\n', {
    filePath: 'probe.ts',
  })
  assert.equal(result.messages.filter((m) => m.fatal).length, 0, 'no parse errors')
})

// Same severity contract as the Next.js entry point.
test('prettier/prettier and no-console resolve to error severity', async () => {
  const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: base })
  const resolved = await eslint.calculateConfigForFile('probe.ts')
  assert.equal(resolved.rules['prettier/prettier'][0], 2, 'prettier/prettier must be error')
  assert.equal(resolved.rules['no-console'][0], 2, 'no-console must be error')
})

test('a formatting violation actually fires prettier/prettier', async () => {
  const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: base })
  const [result] = await eslint.lintText('export const a = "double"\n', {
    filePath: 'probe.ts',
  })
  const ruleIds = result.messages.map((m) => m.ruleId)
  assert.ok(ruleIds.includes('prettier/prettier'), `expected prettier/prettier in ${ruleIds}`)
})

test('node globals are known (no-undef does not fire on process)', async () => {
  const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: base })
  const [result] = await eslint.lintText('export default process.env.NODE_ENV\n', {
    filePath: 'probe.mjs',
  })
  const ruleIds = result.messages.map((m) => m.ruleId)
  assert.ok(!ruleIds.includes('no-undef'), `unexpected no-undef in ${ruleIds}`)
})
