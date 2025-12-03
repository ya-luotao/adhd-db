import type { APIRoute } from 'astro';

export const prerender = false;

// OpenFDA API base URL
const OPENFDA_LABEL_URL = 'https://api.fda.gov/drug/label.json';

// Drug name mappings for OpenFDA queries
const DRUG_MAPPINGS: Record<string, { genericName: string; commonNames: string[] }> = {
  'methylphenidate': {
    genericName: 'methylphenidate hydrochloride',
    commonNames: ['methylphenidate', 'ritalin', 'concerta'],
  },
  'amphetamine-mixed-salts': {
    genericName: 'amphetamine',
    commonNames: ['amphetamine', 'adderall', 'dextroamphetamine'],
  },
  'lisdexamfetamine': {
    genericName: 'lisdexamfetamine dimesylate',
    commonNames: ['lisdexamfetamine', 'vyvanse'],
  },
  'atomoxetine': {
    genericName: 'atomoxetine hydrochloride',
    commonNames: ['atomoxetine', 'strattera'],
  },
  'guanfacine': {
    genericName: 'guanfacine hydrochloride',
    commonNames: ['guanfacine', 'intuniv', 'tenex'],
  },
  'clonidine': {
    genericName: 'clonidine hydrochloride',
    commonNames: ['clonidine', 'kapvay', 'catapres'],
  },
  'viloxazine': {
    genericName: 'viloxazine hydrochloride',
    commonNames: ['viloxazine', 'qelbree'],
  },
};

// Known significant drug interactions for ADHD medications
const KNOWN_INTERACTIONS: Record<string, Array<{
  drug: string;
  drugClass?: string;
  severity: 'major' | 'moderate' | 'minor';
  effect: string;
  recommendation: string;
}>> = {
  'methylphenidate': [
    {
      drug: 'MAO inhibitors',
      drugClass: 'MAOI',
      severity: 'major',
      effect: 'Risk of hypertensive crisis',
      recommendation: 'Do not use within 14 days of MAOI use',
    },
    {
      drug: 'Antihypertensives',
      severity: 'moderate',
      effect: 'May decrease effectiveness of blood pressure medications',
      recommendation: 'Monitor blood pressure closely',
    },
    {
      drug: 'Warfarin',
      severity: 'moderate',
      effect: 'May increase anticoagulant effect',
      recommendation: 'Monitor INR when starting or stopping methylphenidate',
    },
    {
      drug: 'Phenytoin',
      severity: 'moderate',
      effect: 'May increase phenytoin levels',
      recommendation: 'Monitor phenytoin levels',
    },
  ],
  'amphetamine-mixed-salts': [
    {
      drug: 'MAO inhibitors',
      drugClass: 'MAOI',
      severity: 'major',
      effect: 'Risk of hypertensive crisis, potentially fatal',
      recommendation: 'Contraindicated within 14 days of MAOI use',
    },
    {
      drug: 'Serotonergic drugs',
      drugClass: 'SSRI, SNRI, triptans',
      severity: 'major',
      effect: 'Risk of serotonin syndrome',
      recommendation: 'Use with caution, monitor for symptoms',
    },
    {
      drug: 'Acidifying agents',
      severity: 'moderate',
      effect: 'Decrease amphetamine absorption and effect',
      recommendation: 'Avoid vitamin C, fruit juices around dosing',
    },
    {
      drug: 'Alkalinizing agents',
      severity: 'moderate',
      effect: 'Increase amphetamine absorption and effect',
      recommendation: 'Monitor for increased effects',
    },
  ],
  'lisdexamfetamine': [
    {
      drug: 'MAO inhibitors',
      drugClass: 'MAOI',
      severity: 'major',
      effect: 'Risk of hypertensive crisis, potentially fatal',
      recommendation: 'Contraindicated within 14 days of MAOI use',
    },
    {
      drug: 'Serotonergic drugs',
      drugClass: 'SSRI, SNRI, triptans',
      severity: 'major',
      effect: 'Risk of serotonin syndrome',
      recommendation: 'Use with caution, monitor for symptoms',
    },
  ],
  'atomoxetine': [
    {
      drug: 'MAO inhibitors',
      drugClass: 'MAOI',
      severity: 'major',
      effect: 'Risk of serious, potentially fatal reactions',
      recommendation: 'Contraindicated within 14 days of MAOI use',
    },
    {
      drug: 'CYP2D6 inhibitors',
      drugClass: 'Paroxetine, fluoxetine, quinidine',
      severity: 'major',
      effect: 'Increased atomoxetine levels (up to 10-fold)',
      recommendation: 'Start with lower dose, titrate slowly',
    },
    {
      drug: 'Albuterol',
      severity: 'moderate',
      effect: 'May potentiate cardiovascular effects',
      recommendation: 'Use with caution',
    },
  ],
  'guanfacine': [
    {
      drug: 'CYP3A4 inhibitors',
      drugClass: 'Ketoconazole, ritonavir',
      severity: 'major',
      effect: 'Significantly increased guanfacine levels',
      recommendation: 'Reduce guanfacine dose by 50%',
    },
    {
      drug: 'CYP3A4 inducers',
      drugClass: 'Rifampin, carbamazepine',
      severity: 'major',
      effect: 'Significantly decreased guanfacine levels',
      recommendation: 'May need to double guanfacine dose',
    },
    {
      drug: 'CNS depressants',
      severity: 'moderate',
      effect: 'Additive sedation and hypotension',
      recommendation: 'Use with caution',
    },
  ],
  'clonidine': [
    {
      drug: 'Beta-blockers',
      severity: 'major',
      effect: 'Risk of rebound hypertension if clonidine stopped abruptly',
      recommendation: 'Taper clonidine gradually, stop beta-blocker first',
    },
    {
      drug: 'CNS depressants',
      severity: 'moderate',
      effect: 'Additive sedation',
      recommendation: 'Use with caution',
    },
    {
      drug: 'Tricyclic antidepressants',
      severity: 'moderate',
      effect: 'May reduce clonidine effectiveness',
      recommendation: 'Monitor blood pressure',
    },
  ],
  'viloxazine': [
    {
      drug: 'MAO inhibitors',
      drugClass: 'MAOI',
      severity: 'major',
      effect: 'Risk of serious reactions',
      recommendation: 'Contraindicated within 14 days of MAOI use',
    },
    {
      drug: 'CYP1A2 substrates',
      drugClass: 'Theophylline, caffeine',
      severity: 'moderate',
      effect: 'Increased levels of CYP1A2 substrates',
      recommendation: 'May need to reduce dose of substrates',
    },
    {
      drug: 'Sensitive CYP2D6 substrates',
      severity: 'moderate',
      effect: 'Increased levels of CYP2D6 substrates',
      recommendation: 'Monitor for increased effects',
    },
  ],
};

interface OpenFDAResponse {
  results?: Array<{
    drug_interactions?: string[];
  }>;
  error?: { code: string; message: string };
}

async function fetchFDAInteractions(genericName: string): Promise<string | undefined> {
  const url = `${OPENFDA_LABEL_URL}?search=openfda.generic_name:"${genericName}"&limit=1`;

  try {
    const response = await fetch(url);
    if (!response.ok) return undefined;

    const data = await response.json() as OpenFDAResponse;
    const interactions = data.results?.[0]?.drug_interactions;

    if (interactions && interactions.length > 0) {
      // Clean and truncate the text
      let text = interactions.join('\n\n');
      text = text.replace(/<[^>]*>/g, '');
      text = text.replace(/\s+/g, ' ').trim();
      if (text.length > 3000) {
        text = text.substring(0, 3000) + '...';
      }
      return text;
    }
  } catch {
    // Ignore errors
  }

  return undefined;
}

export const GET: APIRoute = async ({ url }) => {
  try {
    const drugId = url.searchParams.get('drug');
    const checkAgainst = url.searchParams.get('check');

    if (!drugId) {
      return new Response(JSON.stringify({
        error: 'Missing parameter',
        message: 'Drug ID is required. Use ?drug=methylphenidate',
        availableDrugs: Object.keys(DRUG_MAPPINGS),
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const mapping = DRUG_MAPPINGS[drugId];
    if (!mapping) {
      return new Response(JSON.stringify({
        error: 'Not found',
        message: `Drug "${drugId}" is not supported.`,
        availableDrugs: Object.keys(DRUG_MAPPINGS),
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get known interactions
    const knownInteractions = KNOWN_INTERACTIONS[drugId] || [];

    // If checking against a specific drug/class
    let matchingInteractions = knownInteractions;
    if (checkAgainst) {
      const checkLower = checkAgainst.toLowerCase();
      matchingInteractions = knownInteractions.filter(interaction =>
        interaction.drug.toLowerCase().includes(checkLower) ||
        interaction.drugClass?.toLowerCase().includes(checkLower)
      );
    }

    // Fetch FDA label interactions text
    const fdaInteractionsText = await fetchFDAInteractions(mapping.genericName);

    // Check if the queried drug is mentioned in FDA text
    let fdaMatchFound = false;
    if (checkAgainst && fdaInteractionsText) {
      fdaMatchFound = fdaInteractionsText.toLowerCase().includes(checkAgainst.toLowerCase());
    }

    const response = {
      drugId,
      drugName: mapping.genericName,
      query: checkAgainst || null,
      interactions: {
        known: matchingInteractions.map(i => ({
          ...i,
          source: 'curated',
        })),
        total: knownInteractions.length,
      },
      fdaLabelInfo: {
        hasInteractionData: !!fdaInteractionsText,
        matchFound: fdaMatchFound,
        text: fdaInteractionsText || 'No FDA interaction data available',
      },
      warnings: checkAgainst ? {
        majorInteractions: matchingInteractions.filter(i => i.severity === 'major').length,
        moderateInteractions: matchingInteractions.filter(i => i.severity === 'moderate').length,
        recommendation: matchingInteractions.length > 0
          ? matchingInteractions.find(i => i.severity === 'major')?.recommendation || matchingInteractions[0].recommendation
          : 'No known significant interactions found',
      } : undefined,
      metadata: {
        source: 'OpenFDA Drug Label API + Curated Database',
        lastUpdated: new Date().toISOString(),
        disclaimer: 'This information is for educational purposes only and should not replace professional medical advice. Always consult a healthcare provider before making medication changes.',
      },
    };

    return new Response(JSON.stringify({
      data: response,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error checking drug interactions:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: 'Failed to check drug interactions',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
