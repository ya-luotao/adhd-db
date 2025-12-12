import type { APIRoute } from 'astro';
import { getDrugs, getRegions, getCategoryList, getLocalizedValue } from '../lib/data';

export const prerender = true;

export const GET: APIRoute = async () => {
  const drugs = getDrugs();
  const regionsData = getRegions();
  const categories = getCategoryList();

  const regions = Object.keys(regionsData.regions);
  const stimulants = drugs.filter(d => d.drugClass === 'stimulant');
  const nonStimulants = drugs.filter(d => d.drugClass === 'non-stimulant');

  const content = `# ADHD-DB

> ADHD Medication Database with multi-region regulatory data

ADHD-DB is a comprehensive, open-source database of ADHD medications with regulatory information across multiple regions (${regions.join(', ')}). The database includes drug information, travel rules, interactions, and clinical data.

## Quick Links

- [Drug Registry](/data/drugs): Browse all medications
- [Categories](/data/categories): Drug categories and classes
- [Schema](/schema): YAML schema for drug data
- [API Documentation](/api-docs): REST API reference
- [Full Database Export](/llms-full.txt): Complete database in plain text

## Database Statistics

- Total Drugs: ${drugs.length}
- Stimulants: ${stimulants.length}
- Non-Stimulants: ${nonStimulants.length}
- Regions Covered: ${regions.length} (${regions.join(', ')})
- Categories: ${categories.length}

## Drug Classes

### Stimulants
${stimulants.map(d => `- ${getLocalizedValue(d.genericName, 'en')} (${d.id})`).join('\n')}

### Non-Stimulants
${nonStimulants.map(d => `- ${getLocalizedValue(d.genericName, 'en')} (${d.id})`).join('\n')}

## Available Data Per Drug

Each drug entry contains:
- Generic and brand names (by region)
- Drug class and category
- Controlled substance status and schedules
- Mechanism of action
- Available forms and dosages
- Side effects (common, uncommon, serious)
- Drug interactions
- Contraindications and warnings
- Regional approval status
- Travel rules and cross-border regulations
- FDA data and adverse event reports
- Clinical trials information

## API Access

REST API available at \`/api/v1/\`:
- \`GET /api/v1/drugs\` - List all drugs
- \`GET /api/v1/drugs/{id}\` - Get drug by ID
- \`GET /api/v1/categories\` - List categories
- \`GET /api/v1/interactions/check\` - Check drug interactions

Query parameters:
- \`?lang=en|zh|zh-TW|ja\` - Language (default: en)
- \`?class=stimulant|non-stimulant\` - Filter by drug class
- \`?category={category}\` - Filter by category
- \`?region={region}\` - Filter by region availability

## Internationalization

Available in 4 languages:
- English (default): /
- 简体中文 (Chinese Simplified): /zh/
- 繁體中文 (Chinese Traditional): /zh-TW/
- 日本語 (Japanese): /ja/

## Tools

- [Region Checker](/tools/region-checker): Check drug legality across regions
- [Interactions Checker](/tools/interactions): Check drug interactions
- [Concentration Simulator](/tools/concentration): Drug concentration timeline

## Data Sources

- FDA (U.S. Food and Drug Administration)
- OpenFDA Adverse Event Reports
- RxNorm (NLM drug naming standard)
- ClinicalTrials.gov
- Regional regulatory agencies

## License

Open source database. Data is provided for informational purposes only and should not be used for medical advice.

## Contact

- Website: https://adhd-db.com
- GitHub: https://github.com/ya-luotao/adhd-db
`;

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
