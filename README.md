# ADHD Database

A comprehensive database of ADHD medications with multi-region regulatory data and i18n support (English, Chinese, Japanese).

## Features

- Multi-region drug approval data (US, CN, EU, JP, UK, AU, CA)
- Localized content in English, Chinese, and Japanese
- Structured YAML schema for drug entries
- Static site built with Astro, deployed to Cloudflare Pages

## Project Structure

```
adhd-db/
├── packages/
│   ├── schema/     # YAML schema template for drug entries
│   ├── meta/       # Region definitions and drug categories
│   └── data/       # Drug data files (YAML)
└── apps/
    └── web/        # Astro static site
```

## Development

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm run dev

# Build all packages
pnpm build

# Deploy to Cloudflare Pages
pnpm run deploy
```

## Adding a New Drug

1. Copy the schema template from `packages/schema/drug-schema.yaml`
2. Create a new file in `packages/data/drugs/` (e.g., `new-drug.yaml`)
3. Fill in the drug information following the schema

## Contributing

Contributions are welcome! Please open an issue or submit a pull request at [GitHub](https://github.com/ya-luotao/adhd-db).

## Disclaimer

This database is for informational purposes only and is not medical advice. Always consult a healthcare professional for medical decisions.

## License

MIT
