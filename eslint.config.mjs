// Dogfood: lint this repo with the config it publishes, so a change that breaks
// the exported flat config fails here at PR time instead of in consumers.
import nswds from './index.mjs'

const config = [
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      // Synced from digitalnsw/nswds-devops — DO NOT EDIT here, so do not lint
      // here either: any fix would be reverted by the next sync, and the source
      // repo lints them under its own rules.
      'scripts/**',
      'commit-types.mjs',
      'commitlint.config.mjs',
    ],
  },
  ...nswds,
  {
    // This package ships config; it is not a Next.js app, so there is no pages/
    // or app/ directory for the rule to resolve against.
    rules: { '@next/next/no-html-link-for-pages': 'off' },
  },
]

export default config
