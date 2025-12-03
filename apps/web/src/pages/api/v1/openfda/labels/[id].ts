import type { APIRoute } from 'astro';

export const prerender = false;

// OpenFDA API base URL
const OPENFDA_BASE_URL = 'https://api.fda.gov/drug/label.json';

// Drug name mappings for OpenFDA queries
const DRUG_MAPPINGS: Record<string, { genericName: string; searchTerms: string[] }> = {
  'methylphenidate': {
    genericName: 'methylphenidate hydrochloride',
    searchTerms: ['methylphenidate', 'methylphenidate hydrochloride'],
  },
  'amphetamine-mixed-salts': {
    genericName: 'amphetamine',
    searchTerms: ['amphetamine', 'mixed salts amphetamine'],
  },
  'lisdexamfetamine': {
    genericName: 'lisdexamfetamine dimesylate',
    searchTerms: ['lisdexamfetamine', 'lisdexamfetamine dimesylate'],
  },
  'atomoxetine': {
    genericName: 'atomoxetine hydrochloride',
    searchTerms: ['atomoxetine', 'atomoxetine hydrochloride'],
  },
  'guanfacine': {
    genericName: 'guanfacine hydrochloride',
    searchTerms: ['guanfacine', 'guanfacine hydrochloride'],
  },
  'clonidine': {
    genericName: 'clonidine hydrochloride',
    searchTerms: ['clonidine', 'clonidine hydrochloride'],
  },
  'viloxazine': {
    genericName: 'viloxazine hydrochloride',
    searchTerms: ['viloxazine', 'viloxazine hydrochloride'],
  },
};

interface OpenFDAResponse {
  meta?: {
    disclaimer: string;
    terms: string;
    license: string;
    last_updated: string;
    results: {
      skip: number;
      limit: number;
      total: number;
    };
  };
  results?: Array<{
    openfda?: {
      brand_name?: string[];
      generic_name?: string[];
      manufacturer_name?: string[];
      application_number?: string[];
      rxcui?: string[];
      pharm_class_moa?: string[];
      pharm_class_epc?: string[];
      pharm_class_pe?: string[];
    };
    set_id?: string;
    id?: string;
    effective_time?: string;
    indications_and_usage?: string[];
    dosage_and_administration?: string[];
    contraindications?: string[];
    warnings_and_cautions?: string[];
    boxed_warning?: string[];
    adverse_reactions?: string[];
    drug_interactions?: string[];
    mechanism_of_action?: string[];
    pharmacokinetics?: string[];
    pediatric_use?: string[];
    geriatric_use?: string[];
    pregnancy?: string[];
    controlled_substance?: string[];
    abuse?: string[];
    dependence?: string[];
  }>;
  error?: {
    code: string;
    message: string;
  };
}

function cleanText(text: string | string[] | undefined, maxLength = 5000): string | undefined {
  if (!text) return undefined;
  const textStr = Array.isArray(text) ? text.join('\n\n') : text;
  let cleaned = textStr.replace(/<[^>]*>/g, '');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength) + '...';
  }
  return cleaned || undefined;
}

export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({
        error: 'Missing parameter',
        message: 'Drug ID is required',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const mapping = DRUG_MAPPINGS[id];
    if (!mapping) {
      return new Response(JSON.stringify({
        error: 'Not found',
        message: `Drug "${id}" is not supported. Available drugs: ${Object.keys(DRUG_MAPPINGS).join(', ')}`,
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Search OpenFDA for the drug
    const searchQuery = `openfda.generic_name:"${mapping.genericName}"`;
    const url = `${OPENFDA_BASE_URL}?search=${encodeURIComponent(searchQuery)}&limit=10`;

    const response = await fetch(url);
    const data = await response.json() as OpenFDAResponse;

    if (data.error) {
      if (data.error.code === 'NOT_FOUND') {
        return new Response(JSON.stringify({
          error: 'Not found',
          message: `No FDA label found for "${id}"`,
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      throw new Error(data.error.message);
    }

    if (!data.results || data.results.length === 0) {
      return new Response(JSON.stringify({
        error: 'Not found',
        message: `No FDA label found for "${id}"`,
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Process and combine results
    const allBrandNames = new Set<string>();
    const allManufacturers = new Set<string>();
    const allRxcui = new Set<string>();
    let bestResult = data.results[0];
    let bestScore = 0;

    for (const result of data.results) {
      result.openfda?.brand_name?.forEach(b => allBrandNames.add(b));
      result.openfda?.manufacturer_name?.forEach(m => allManufacturers.add(m));
      result.openfda?.rxcui?.forEach(r => allRxcui.add(r));

      // Score results to find the most complete one
      let score = 0;
      if (result.boxed_warning) score += 10;
      if (result.indications_and_usage) score += 5;
      if (result.adverse_reactions) score += 5;
      if (result.drug_interactions) score += 5;
      if (result.mechanism_of_action) score += 3;

      if (score > bestScore) {
        bestScore = score;
        bestResult = result;
      }
    }

    // Build response
    const processedLabel = {
      drugId: id,
      fdaReferences: {
        applicationNumbers: bestResult.openfda?.application_number || [],
        splSetId: bestResult.set_id,
        splId: bestResult.id,
        rxcui: Array.from(allRxcui),
      },
      names: {
        brandNames: Array.from(allBrandNames),
        genericName: bestResult.openfda?.generic_name?.[0],
        manufacturers: Array.from(allManufacturers),
      },
      pharmacologicClass: {
        mechanismOfAction: bestResult.openfda?.pharm_class_moa,
        establishedClass: bestResult.openfda?.pharm_class_epc,
        physiologicEffect: bestResult.openfda?.pharm_class_pe,
      },
      clinicalInfo: {
        indicationsAndUsage: cleanText(bestResult.indications_and_usage),
        dosageAndAdministration: cleanText(bestResult.dosage_and_administration),
        contraindications: cleanText(bestResult.contraindications),
      },
      safetyInfo: {
        boxedWarning: cleanText(bestResult.boxed_warning),
        warningsAndPrecautions: cleanText(bestResult.warnings_and_cautions),
        adverseReactions: cleanText(bestResult.adverse_reactions),
        drugInteractions: cleanText(bestResult.drug_interactions),
      },
      abuseAndDependence: {
        controlledSubstanceClass: bestResult.controlled_substance?.[0],
        abuse: cleanText(bestResult.abuse),
        dependence: cleanText(bestResult.dependence),
      },
      specialPopulations: {
        pediatricUse: cleanText(bestResult.pediatric_use),
        geriatricUse: cleanText(bestResult.geriatric_use),
        pregnancy: cleanText(bestResult.pregnancy),
      },
      pharmacology: {
        mechanismOfAction: cleanText(bestResult.mechanism_of_action),
        pharmacokinetics: cleanText(bestResult.pharmacokinetics),
      },
      metadata: {
        effectiveDate: bestResult.effective_time,
        totalLabelsFound: data.results.length,
        lastUpdated: data.meta?.last_updated,
        source: 'OpenFDA Drug Label API',
        disclaimer: data.meta?.disclaimer,
      },
    };

    return new Response(JSON.stringify({
      data: processedLabel,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error fetching OpenFDA label:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: 'Failed to fetch FDA label data',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
