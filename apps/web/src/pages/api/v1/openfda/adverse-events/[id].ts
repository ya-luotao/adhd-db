import type { APIRoute } from 'astro';

export const prerender = false;

// OpenFDA API base URL for adverse events
const OPENFDA_EVENT_URL = 'https://api.fda.gov/drug/event.json';

// Drug name mappings for OpenFDA queries
const DRUG_MAPPINGS: Record<string, string> = {
  'methylphenidate': 'methylphenidate',
  'amphetamine-mixed-salts': 'amphetamine',
  'lisdexamfetamine': 'lisdexamfetamine',
  'atomoxetine': 'atomoxetine',
  'guanfacine': 'guanfacine',
  'clonidine': 'clonidine',
  'viloxazine': 'viloxazine',
};

interface CountResult {
  term: string;
  count: number;
}

interface CountResponse {
  meta?: {
    disclaimer: string;
    results: { total: number };
  };
  results?: CountResult[];
  error?: { code: string; message: string };
}

interface EventResponse {
  meta?: {
    disclaimer: string;
    results: { total: number };
  };
  results?: Array<unknown>;
  error?: { code: string; message: string };
}

// Map age to age groups
function mapAgeToGroup(age: number): string {
  if (age < 6) return '0-5';
  if (age < 12) return '6-11';
  if (age < 18) return '12-17';
  if (age < 25) return '18-24';
  if (age < 35) return '25-34';
  if (age < 45) return '35-44';
  if (age < 55) return '45-54';
  if (age < 65) return '55-64';
  return '65+';
}

// Map sex code to label
function mapSexCode(code: string): string {
  switch (code) {
    case '0': return 'Unknown';
    case '1': return 'Male';
    case '2': return 'Female';
    default: return 'Unknown';
  }
}

// Map outcome code to label
function mapOutcomeCode(code: string): string {
  switch (code) {
    case '1': return 'Recovered';
    case '2': return 'Recovering';
    case '3': return 'Not Recovered';
    case '4': return 'Recovered with Sequelae';
    case '5': return 'Fatal';
    default: return 'Unknown';
  }
}

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  let lastError: Error | null = null;
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      return response;
    } catch (error) {
      lastError = error as Error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  throw lastError;
}

async function fetchCount(drugName: string, countField: string, limit = 20): Promise<CountResult[]> {
  const url = `${OPENFDA_EVENT_URL}?search=patient.drug.openfda.generic_name:"${drugName}"&count=${countField}&limit=${limit}`;

  try {
    const response = await fetchWithRetry(url);
    if (!response.ok) {
      if (response.status === 404) return [];
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json() as CountResponse;
    return data.results || [];
  } catch {
    return [];
  }
}

async function fetchTotal(drugName: string, serious?: boolean): Promise<number> {
  let searchQuery = `patient.drug.openfda.generic_name:"${drugName}"`;
  if (serious !== undefined) {
    searchQuery += ` AND serious:${serious ? '1' : '2'}`;
  }
  const url = `${OPENFDA_EVENT_URL}?search=${encodeURIComponent(searchQuery)}&limit=1`;

  try {
    const response = await fetchWithRetry(url);
    if (!response.ok) {
      if (response.status === 404) return 0;
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json() as EventResponse;
    return data.meta?.results?.total || 0;
  } catch {
    return 0;
  }
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

    const drugName = DRUG_MAPPINGS[id];
    if (!drugName) {
      return new Response(JSON.stringify({
        error: 'Not found',
        message: `Drug "${id}" is not supported. Available drugs: ${Object.keys(DRUG_MAPPINGS).join(', ')}`,
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch all counts in parallel
    const [
      totalReports,
      seriousReports,
      reactionCounts,
      ageCounts,
      sexCounts,
      outcomeCounts,
    ] = await Promise.all([
      fetchTotal(drugName),
      fetchTotal(drugName, true),
      fetchCount(drugName, 'patient.reaction.reactionmeddrapt.exact', 30),
      fetchCount(drugName, 'patient.patientonsetage', 100),
      fetchCount(drugName, 'patient.patientsex', 3),
      fetchCount(drugName, 'patient.reaction.reactionoutcome', 10),
    ]);

    // Process reaction counts
    const topReactions = reactionCounts.map(r => ({
      reaction: r.term.toLowerCase().replace(/_/g, ' '),
      count: r.count,
      percentage: totalReports > 0 ? Math.round((r.count / totalReports) * 10000) / 100 : 0,
    }));

    // Process age counts - aggregate into groups
    const ageGroups: Record<string, number> = {};
    for (const r of ageCounts) {
      const age = parseInt(r.term, 10);
      if (!isNaN(age) && age >= 0 && age <= 120) {
        const group = mapAgeToGroup(age);
        ageGroups[group] = (ageGroups[group] || 0) + r.count;
      }
    }
    const byAge = Object.entries(ageGroups)
      .map(([ageGroup, count]) => ({ ageGroup, count }))
      .sort((a, b) => {
        const order = ['0-5', '6-11', '12-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
        return order.indexOf(a.ageGroup) - order.indexOf(b.ageGroup);
      });

    // Process sex counts
    const bySex = sexCounts.map(r => ({
      sex: mapSexCode(r.term),
      count: r.count,
    }));

    // Process outcome counts
    const outcomes: Record<string, number> = {
      'Recovered': 0,
      'Recovering': 0,
      'Not Recovered': 0,
      'Fatal': 0,
      'Unknown': 0,
    };
    for (const r of outcomeCounts) {
      const label = mapOutcomeCode(r.term);
      if (label === 'Recovered with Sequelae') {
        outcomes['Recovered'] += r.count;
      } else if (label in outcomes) {
        outcomes[label] = r.count;
      }
    }

    const adverseEventsSummary = {
      drugId: id,
      drugName: drugName,
      summary: {
        totalReports,
        seriousReports,
        seriousPercentage: totalReports > 0 ? Math.round((seriousReports / totalReports) * 10000) / 100 : 0,
      },
      topReactions: topReactions.slice(0, 20),
      demographics: {
        byAge,
        bySex,
      },
      outcomes: Object.entries(outcomes).map(([outcome, count]) => ({
        outcome,
        count,
        percentage: totalReports > 0 ? Math.round((count / totalReports) * 10000) / 100 : 0,
      })),
      metadata: {
        dataSource: 'FDA Adverse Event Reporting System (FAERS)',
        dataRange: {
          from: '2004-01-01',
          to: new Date().toISOString().split('T')[0],
        },
        lastUpdated: new Date().toISOString(),
        disclaimer: 'FAERS data represents spontaneously reported adverse events. Report counts do not represent incidence rates and cannot be used to compare drug safety profiles. Many factors affect reporting, including length of time on market and publicity about an event.',
      },
    };

    return new Response(JSON.stringify({
      data: adverseEventsSummary,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error fetching adverse events:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: 'Failed to fetch adverse events data',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
