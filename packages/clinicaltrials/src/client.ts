/**
 * ClinicalTrials.gov API v2 Client
 * @see https://clinicaltrials.gov/data-api/api
 */

import type {
  Study,
  StudySearchResponse,
  TrialStatus,
  TrialPhase,
} from './types.js';

const CT_API_BASE = 'https://clinicaltrials.gov/api/v2';

// Rate limiting: ~3 requests per second recommended
const REQUEST_DELAY_MS = 350;

export interface ClinicalTrialsClientOptions {
  baseUrl?: string;
}

export class ClinicalTrialsClient {
  private baseUrl: string;
  private lastRequestTime = 0;

  constructor(options: ClinicalTrialsClientOptions = {}) {
    this.baseUrl = options.baseUrl || CT_API_BASE;
  }

  /**
   * Rate-limited fetch with automatic retry
   */
  private async fetchWithRateLimit(url: string): Promise<Response> {
    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < REQUEST_DELAY_MS) {
      await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY_MS - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();

    // Fetch with retry
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
          }
        });

        if (response.status === 404) {
          return response;
        }

        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10);
          console.warn(`Rate limited. Waiting ${retryAfter} seconds...`);
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          continue;
        }

        if (!response.ok) {
          throw new Error(`ClinicalTrials API error: ${response.status} ${response.statusText}`);
        }

        return response;
      } catch (error) {
        lastError = error as Error;
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError || new Error('Failed to fetch from ClinicalTrials.gov API');
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params: Record<string, string | number | boolean | undefined> = {}): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
    return url.toString();
  }

  /**
   * Transform API response to our Study type
   */
  private transformStudy(apiStudy: StudySearchResponse['studies'][0]): Study {
    const p = apiStudy.protocolSection;
    const id = p.identificationModule;
    const status = p.statusModule;
    const design = p.designModule;
    const desc = p.descriptionModule;
    const cond = p.conditionsModule;
    const arms = p.armsInterventionsModule;
    const outcomes = p.outcomesModule;
    const sponsor = p.sponsorCollaboratorsModule;
    const elig = p.eligibilityModule;
    const locs = p.contactsLocationsModule;

    return {
      nctId: id.nctId,
      briefTitle: id.briefTitle,
      officialTitle: id.officialTitle,
      overallStatus: status.overallStatus,
      phases: design?.phases,
      studyType: design?.studyType,
      briefSummary: desc?.briefSummary,
      detailedDescription: desc?.detailedDescription,
      conditions: cond?.conditions,
      interventions: arms?.interventions?.map(i => ({
        type: i.type as Study['interventions'][0]['type'],
        name: i.name,
        description: i.description,
      })),
      primaryOutcomes: outcomes?.primaryOutcomes,
      leadSponsor: sponsor?.leadSponsor ? {
        name: sponsor.leadSponsor.name,
        class: sponsor.leadSponsor.class as Study['leadSponsor']['class'],
      } : undefined,
      collaborators: sponsor?.collaborators?.map(c => ({
        name: c.name,
        class: c.class as Study['leadSponsor']['class'],
      })),
      startDate: status.startDateStruct?.date,
      primaryCompletionDate: status.primaryCompletionDateStruct?.date,
      completionDate: status.completionDateStruct?.date,
      lastUpdateSubmitDate: status.lastUpdateSubmitDate,
      studyFirstSubmitDate: status.studyFirstSubmitDate,
      hasResults: apiStudy.hasResults,
      eligibilityCriteria: elig?.eligibilityCriteria,
      minimumAge: elig?.minimumAge,
      maximumAge: elig?.maximumAge,
      sex: elig?.sex as Study['sex'],
      locations: locs?.locations?.map(l => ({
        facility: l.facility,
        city: l.city,
        state: l.state,
        country: l.country,
        status: l.status,
      })),
    };
  }

  // ============================================
  // Search APIs
  // ============================================

  /**
   * Search for studies by query
   */
  async searchStudies(params: {
    query?: string;
    condition?: string;
    intervention?: string;
    status?: TrialStatus[];
    phase?: TrialPhase[];
    pageSize?: number;
    pageToken?: string;
  }): Promise<{ studies: Study[]; nextPageToken?: string; totalCount?: number }> {
    const queryParts: string[] = [];

    if (params.query) {
      queryParts.push(params.query);
    }
    if (params.condition) {
      queryParts.push(`AREA[Condition]${params.condition}`);
    }
    if (params.intervention) {
      queryParts.push(`AREA[InterventionName]${params.intervention}`);
    }

    const url = this.buildUrl('/studies', {
      'query.term': queryParts.join(' AND ') || undefined,
      'filter.overallStatus': params.status?.join(','),
      'filter.phase': params.phase?.join(','),
      pageSize: params.pageSize || 20,
      pageToken: params.pageToken,
    });

    const response = await this.fetchWithRateLimit(url);

    if (response.status === 404) {
      return { studies: [], totalCount: 0 };
    }

    const data = await response.json() as StudySearchResponse;

    return {
      studies: data.studies?.map(s => this.transformStudy(s)) || [],
      nextPageToken: data.nextPageToken,
      totalCount: data.totalCount,
    };
  }

  /**
   * Get a specific study by NCT ID
   */
  async getStudy(nctId: string): Promise<Study | null> {
    const url = this.buildUrl(`/studies/${nctId}`);
    const response = await this.fetchWithRateLimit(url);

    if (response.status === 404) {
      return null;
    }

    const data = await response.json();
    return this.transformStudy(data);
  }

  // ============================================
  // ADHD-Specific Methods
  // ============================================

  /**
   * Search for ADHD trials for a specific drug
   */
  async getADHDTrialsForDrug(drugName: string, options: {
    status?: TrialStatus[];
    limit?: number;
  } = {}): Promise<Study[]> {
    const allStudies: Study[] = [];
    let pageToken: string | undefined;
    const limit = options.limit || 50;

    do {
      const result = await this.searchStudies({
        condition: 'ADHD OR "Attention Deficit Hyperactivity Disorder"',
        intervention: drugName,
        status: options.status,
        pageSize: Math.min(limit - allStudies.length, 20),
        pageToken,
      });

      allStudies.push(...result.studies);
      pageToken = result.nextPageToken;
    } while (pageToken && allStudies.length < limit);

    return allStudies.slice(0, limit);
  }

  /**
   * Get recruiting ADHD trials for a drug
   */
  async getRecruitingTrials(drugName: string): Promise<Study[]> {
    return this.getADHDTrialsForDrug(drugName, {
      status: ['RECRUITING', 'ENROLLING_BY_INVITATION', 'NOT_YET_RECRUITING'],
      limit: 20,
    });
  }

  /**
   * Get active (non-recruiting) trials
   */
  async getActiveTrials(drugName: string): Promise<Study[]> {
    return this.getADHDTrialsForDrug(drugName, {
      status: ['ACTIVE_NOT_RECRUITING'],
      limit: 20,
    });
  }

  /**
   * Get recently completed trials (for results)
   */
  async getCompletedTrials(drugName: string): Promise<Study[]> {
    const trials = await this.getADHDTrialsForDrug(drugName, {
      status: ['COMPLETED'],
      limit: 30,
    });

    // Filter to trials completed in the last 2 years
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    return trials.filter(t => {
      if (!t.completionDate) return false;
      const completionDate = new Date(t.completionDate);
      return completionDate >= twoYearsAgo;
    });
  }

  /**
   * Search for new ADHD treatments (non-stimulants, novel mechanisms)
   */
  async getNovelADHDTrials(): Promise<Study[]> {
    const result = await this.searchStudies({
      condition: 'ADHD OR "Attention Deficit Hyperactivity Disorder"',
      status: ['RECRUITING', 'ACTIVE_NOT_RECRUITING', 'NOT_YET_RECRUITING'],
      phase: ['PHASE2', 'PHASE3'],
      pageSize: 50,
    });

    // Filter to novel/investigational drugs (not our known 7 drugs)
    const knownDrugs = [
      'methylphenidate', 'amphetamine', 'lisdexamfetamine',
      'atomoxetine', 'guanfacine', 'clonidine', 'viloxazine',
      'ritalin', 'concerta', 'adderall', 'vyvanse', 'strattera', 'intuniv', 'kapvay', 'qelbree'
    ];

    return result.studies.filter(study => {
      const interventionNames = study.interventions?.map(i => i.name.toLowerCase()) || [];
      // Keep if no known drug is in the interventions
      return !interventionNames.some(name =>
        knownDrugs.some(known => name.includes(known))
      );
    });
  }
}

// Singleton instance
let defaultClient: ClinicalTrialsClient | null = null;

export function getClinicalTrialsClient(options?: ClinicalTrialsClientOptions): ClinicalTrialsClient {
  if (!defaultClient || options) {
    defaultClient = new ClinicalTrialsClient(options);
  }
  return defaultClient;
}
