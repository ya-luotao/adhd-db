import type { APIRoute } from 'astro';
import { getDrug, getDrugs, getLocalizedValue } from '../../../../lib/data';
import type { Lang } from '../../../../i18n/translations';

export const prerender = false;

// ClinicalTrials.gov API v2 base URL
const CT_API_BASE = 'https://clinicaltrials.gov/api/v2';

// Drug name mappings for ClinicalTrials.gov searches
const DRUG_SEARCH_MAPPINGS: Record<string, { name: string; terms: string[] }> = {
  'methylphenidate': {
    name: 'methylphenidate',
    terms: ['methylphenidate', 'methylphenidate hydrochloride'],
  },
  'amphetamine-mixed-salts': {
    name: 'amphetamine',
    terms: ['amphetamine', 'mixed amphetamine salts', 'dextroamphetamine'],
  },
  'lisdexamfetamine': {
    name: 'lisdexamfetamine',
    terms: ['lisdexamfetamine', 'lisdexamfetamine dimesylate'],
  },
  'atomoxetine': {
    name: 'atomoxetine',
    terms: ['atomoxetine', 'atomoxetine hydrochloride'],
  },
  'guanfacine': {
    name: 'guanfacine',
    terms: ['guanfacine', 'guanfacine extended release'],
  },
  'clonidine': {
    name: 'clonidine',
    terms: ['clonidine', 'clonidine extended release'],
  },
  'viloxazine': {
    name: 'viloxazine',
    terms: ['viloxazine', 'viloxazine extended release'],
  },
};

interface CTStudy {
  nctId: string;
  briefTitle: string;
  officialTitle?: string;
  overallStatus: string;
  phases?: string[];
  conditions?: string[];
  interventions?: Array<{ type: string; name: string }>;
  startDate?: string;
  completionDate?: string;
  enrollmentCount?: number;
  leadSponsor?: string;
  hasResults?: boolean;
}

interface CTAPIResponse {
  studies?: Array<{
    protocolSection: {
      identificationModule: {
        nctId: string;
        briefTitle: string;
        officialTitle?: string;
      };
      statusModule: {
        overallStatus: string;
        startDateStruct?: { date: string };
        completionDateStruct?: { date: string };
      };
      designModule?: {
        phases?: string[];
        enrollmentInfo?: { count: number };
      };
      conditionsModule?: {
        conditions?: string[];
      };
      armsInterventionsModule?: {
        interventions?: Array<{ type: string; name: string }>;
      };
      sponsorCollaboratorsModule?: {
        leadSponsor?: { name: string };
      };
    };
    hasResults?: boolean;
  }>;
  totalCount?: number;
}

async function fetchClinicalTrials(drugName: string, status?: string[]): Promise<CTStudy[]> {
  try {
    const params = new URLSearchParams({
      'query.term': `AREA[Condition](ADHD OR "Attention Deficit Hyperactivity Disorder") AND AREA[InterventionName]${drugName}`,
      'pageSize': '20',
    });

    if (status && status.length > 0) {
      params.set('filter.overallStatus', status.join(','));
    }

    const url = `${CT_API_BASE}/studies?${params.toString()}`;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      console.warn(`ClinicalTrials.gov API error: ${response.status}`);
      return [];
    }

    const data = await response.json() as CTAPIResponse;

    return (data.studies || []).map(study => {
      const p = study.protocolSection;
      return {
        nctId: p.identificationModule.nctId,
        briefTitle: p.identificationModule.briefTitle,
        officialTitle: p.identificationModule.officialTitle,
        overallStatus: p.statusModule.overallStatus,
        phases: p.designModule?.phases,
        conditions: p.conditionsModule?.conditions,
        interventions: p.armsInterventionsModule?.interventions,
        startDate: p.statusModule.startDateStruct?.date,
        completionDate: p.statusModule.completionDateStruct?.date,
        enrollmentCount: p.designModule?.enrollmentInfo?.count,
        leadSponsor: p.sponsorCollaboratorsModule?.leadSponsor?.name,
        hasResults: study.hasResults,
      };
    });
  } catch (error) {
    console.error('Error fetching clinical trials:', error);
    return [];
  }
}

export const GET: APIRoute = async ({ params, url }) => {
  try {
    const { drugId } = params;
    const lang = (url.searchParams.get('lang') || 'en') as Lang;

    if (!drugId) {
      const allDrugs = getDrugs();
      return new Response(JSON.stringify({
        error: 'Missing parameter',
        message: 'Drug ID is required in the URL path',
        usage: '/api/v1/clinicaltrials/methylphenidate',
        availableDrugs: allDrugs.map(d => d.id),
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const mapping = DRUG_SEARCH_MAPPINGS[drugId];
    if (!mapping) {
      return new Response(JSON.stringify({
        error: 'Not found',
        message: `Drug "${drugId}" is not supported.`,
        availableDrugs: Object.keys(DRUG_SEARCH_MAPPINGS),
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const drug = getDrug(drugId);
    const drugName = drug ? getLocalizedValue(drug.genericName, lang) : mapping.name;

    // Fetch trials in parallel for different statuses
    const [recruitingTrials, activeTrials, completedTrials] = await Promise.all([
      fetchClinicalTrials(mapping.name, ['RECRUITING', 'ENROLLING_BY_INVITATION', 'NOT_YET_RECRUITING']),
      fetchClinicalTrials(mapping.name, ['ACTIVE_NOT_RECRUITING']),
      fetchClinicalTrials(mapping.name, ['COMPLETED']),
    ]);

    // Filter completed to recent (last 2 years)
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    const recentlyCompleted = completedTrials.filter(t => {
      if (!t.completionDate) return false;
      return new Date(t.completionDate) >= twoYearsAgo;
    });

    // Get notable trials (Phase 3, large enrollment, or with results)
    const allTrials = [...recruitingTrials, ...activeTrials];
    const notableTrials = allTrials
      .filter(t =>
        t.phases?.includes('PHASE3') ||
        (t.enrollmentCount && t.enrollmentCount > 200) ||
        t.hasResults
      )
      .slice(0, 5);

    const response = {
      drugId,
      drugName,
      summary: {
        total: recruitingTrials.length + activeTrials.length + recentlyCompleted.length,
        recruiting: recruitingTrials.length,
        active: activeTrials.length,
        recentlyCompleted: recentlyCompleted.length,
      },
      trials: {
        recruiting: recruitingTrials.slice(0, 10).map(formatTrial),
        active: activeTrials.slice(0, 5).map(formatTrial),
        recentlyCompleted: recentlyCompleted.slice(0, 5).map(formatTrial),
        notable: notableTrials.map(formatTrial),
      },
      searchUrl: `https://clinicaltrials.gov/search?cond=ADHD&intr=${encodeURIComponent(mapping.name)}`,
      metadata: {
        source: 'ClinicalTrials.gov API v2',
        lastUpdated: new Date().toISOString(),
        disclaimer: 'Clinical trial information is subject to change. Visit ClinicalTrials.gov for the most current information.',
      },
    };

    return new Response(JSON.stringify({ data: response }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400', // 24 hour cache
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error fetching clinical trials:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: 'Failed to fetch clinical trial data',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

function formatTrial(trial: CTStudy) {
  return {
    nctId: trial.nctId,
    title: trial.briefTitle,
    status: trial.overallStatus.replace(/_/g, ' '),
    phase: trial.phases?.join(', ') || 'N/A',
    sponsor: trial.leadSponsor || 'Unknown',
    enrollment: trial.enrollmentCount || null,
    dates: {
      start: trial.startDate || null,
      completion: trial.completionDate || null,
    },
    hasResults: trial.hasResults || false,
    url: `https://clinicaltrials.gov/study/${trial.nctId}`,
  };
}
