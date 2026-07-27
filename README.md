# @nswds/eslint-config

Shared ESLint **flat** config for the NSW Design System fleet — the single
source of truth for what was previously a hand-maintained `eslint.config.mjs` in
every repo. Next.js `core-web-vitals` + `typescript`, with Prettier enforced as
an ESLint rule and `no-console` restricted to `warn`/`error`.

## Install

```bash
npm i -D @nswds/eslint-config eslint eslint-config-next \
  eslint-config-prettier eslint-plugin-prettier @eslint/compat
```

## Use

Reduce the repo's `eslint.config.mjs` to the shared config plus any
repo-specific ignores or overrides:

```js
// eslint.config.mjs
import { defineConfig, globalIgnores } from 'eslint/config'
import nswds from '@nswds/eslint-config'

export default defineConfig([
  ...nswds,
  // repo-specific ignores (build artefacts this repo generates):
  globalIgnores(['src/lib/blocks/generated.ts']),
])
```

A repo with nothing extra just does `export default [...nswds]`.

### Per-repo rule overrides

Append a config object after `...nswds`. Example — a repo whose build scripts
are CLIs that legitimately print to stdout:

```js
export default defineConfig([
  ...nswds,
  { files: ['scripts/**/*.mjs'], rules: { 'no-console': 'off' } },
])
```

## ESLint 10 compatibility

This config wraps the `eslint-config-next` presets in `@eslint/compat`'s
`fixupConfigRules`. ESLint 10 removed `context.getFilename()`, and
`eslint-plugin-react` — pulled in transitively by `eslint-config-next`, including
16.2.11 — still calls it during React-version detection. Without the shim every
lint run dies with:

```
TypeError: contextOrFilename.getFilename is not a function
```

before checking a single file. The wrapper is a **no-op on ESLint 9**, so the
same version works across the fleet mid-upgrade. `index.test.mjs` lints a JSX
file on every CI run to keep this regression from returning.

Remove the wrapper once `eslint-config-next` ships an ESLint-10-compatible
`eslint-plugin-react` — watch [vercel/next.js#89764](https://github.com/vercel/next.js/issues/89764).

## Notes

- `baseIgnores` is exported if a repo needs to reference or extend the ignore
  list directly.
- Adopting repos should delete their local `fixupConfigRules` wrapper — the shim
  lives here now.

## Releases

Released by [semantic-release](https://semantic-release.gitbook.io/) on merge to
`main`, driven by Conventional Commit messages. Publishing to npm uses **OIDC
trusted publishing**, so there is no `NPM_TOKEN` secret in this repo.
