# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Install dependencies (run from repo root)
pnpm install

# Build all packages
pnpm build

# Run web app in dev mode
pnpm --filter @adhd-db/web dev

# Build web app only
pnpm --filter @adhd-db/web build

# Preview built web app
pnpm --filter @adhd-db/web preview
```

## Architecture

This is a **pnpm monorepo** for an ADHD medication database with multi-region regulatory data.

### Package Structure

- **`packages/schema`** - YAML schema template (`drug-schema.yaml`) defining the structure for drug entries
- **`packages/meta`** - Metadata definitions including region codes (US, CN, EU, JP, UK, AU, CA) and drug categories
- **`packages/data`** - YAML drug entries in `drugs/` directory (methylphenidate, lisdexamfetamine, etc.)
- **`apps/web`** - Astro static site that renders the database with i18n support (en, zh, ja)

### Data Flow

1. Drug data is stored as individual YAML files in `packages/data/drugs/`
2. Schema template in `packages/schema/drug-schema.yaml` defines all possible fields
3. Region/category metadata in `packages/meta/regions.yaml`
4. Web app reads YAML files at build time via `apps/web/src/lib/data.ts`
5. Static pages generated for each locale: `/`, `/zh/`, `/ja/`

### Key Conventions

- **Localization**: Fields support `{ en, zh, ja }` object format for multi-language content
- **Region codes**: US, CN, EU, JP, UK, AU, CA (defined in `packages/meta/regions.yaml`)
- **Drug classes**: `stimulant` or `non-stimulant`
- **Drug IDs**: lowercase hyphenated (e.g., `methylphenidate`, `amphetamine-mixed-salts`)

### Web App (Astro)

- i18n routing: default locale `en` has no prefix, others use `/zh/`, `/ja/`
- Translation strings in `apps/web/src/i18n/translations.ts`
- Localization helpers `getLocalizedValue()` and `getLocalizedArray()` in `apps/web/src/lib/data.ts`
- Deployed to Cloudflare Pages (see `wrangler.toml`)
