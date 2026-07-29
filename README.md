# @nswds/eslint-config

Shared ESLint **flat** config for the NSW Design System fleet — the single
source of truth for what was previously a hand-maintained `eslint.config.mjs` in
every repo. Two entry points, both with Prettier enforced as an ESLint rule and
`no-console` restricted to `warn`/`error`:

- **`.`** — Next.js apps: `core-web-vitals` + `typescript`.
- **`./base`** — everything else (token pipelines, IaC programs, node scripts,
  plain sites): `@eslint/js` recommended + `typescript-eslint` recommended.
  Exists so non-Next repos get fleet lint policy without the Next.js peer
  chain, instead of maintaining bespoke configs.

## Install

Next.js repos:

```bash
npm i -D @nswds/eslint-config eslint eslint-config-next \
  eslint-config-prettier eslint-plugin-prettier @eslint/compat
```

Non-Next repos (`./base`):

```bash
npm i -D @nswds/eslint-config eslint @eslint/js typescript-eslint \
  eslint-config-prettier eslint-plugin-prettier @eslint/compat
```

`eslint-config-next`, `@eslint/js` and `typescript-eslint` are optional peers —
install the set that matches the entry point you use.

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

Non-Next repos import the base entry point the same way:

```js
// eslint.config.mjs
import nswds from '@nswds/eslint-config/base'

export default nswds
```

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

before checking a single file. On ESLint 9 the accessors the shim re-attaches
still exist, so the wrapper changes nothing there — but note the fleet develops
and tests against ESLint 10 only; ESLint 9 is accepted by the peer range and
not exercised in CI. `index.test.mjs` lints a JSX file on every CI run to keep
this regression from returning.

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

## Shared tooling

This repo is on the [nswds-devops](https://github.com/digitalnsw/nswds-devops)
file sync (**group 2c**), so these are owned centrally — edit them there, not
here, or the next sync will overwrite your change:

- `scripts/` (except `verify-release-published.mjs`, which is this repo's own)
- `commitlint.config.mjs`, `commit-types.mjs`, `git-conventional-commits.yaml`
- `.nvmrc`, `.npmrc`, `renovate.json`
- every workflow except `ci.yml` and `release.yml`

Group 2c exists because `release.yml` is bespoke: it carries `id-token: write`
for OIDC publishing and runs `scripts/verify-release-published.mjs` afterwards,
which fails the job if npm does not match the newest `v*` tag. The stock stub
would replace it and silently disable both — which is why this repo is not in
group 1 or 3.
