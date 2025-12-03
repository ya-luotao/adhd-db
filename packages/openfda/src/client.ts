/**
 * OpenFDA API Client
 * Handles HTTP requests to OpenFDA endpoints with rate limiting and error handling
 */

import type {
  DrugLabelResponse,
  AdverseEventResponse,
  CountResponse,
  DrugLabelResult,
} from './types.js';

// OpenFDA API base URL
const OPENFDA_BASE_URL = 'https://api.fda.gov';

// Rate limiting: OpenFDA allows 240 requests per minute without API key
// With API key: 120 requests per minute
const REQUEST_DELAY_MS = 300; // ~200 requests per minute to be safe

export interface OpenFDAClientOptions {
  apiKey?: string;
  baseUrl?: string;
}

export class OpenFDAClient {
  private baseUrl: string;
  private apiKey?: string;
  private lastRequestTime = 0;

  constructor(options: OpenFDAClientOptions = {}) {
    this.baseUrl = options.baseUrl || OPENFDA_BASE_URL;
    this.apiKey = options.apiKey;
  }

  /**
   * Rate-limited fetch with automatic retry on transient errors
   */
  private async fetchWithRateLimit(url: string): Promise<Response> {
    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < REQUEST_DELAY_MS) {
      await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY_MS - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();

    // Add API key if available
    const urlWithKey = this.apiKey
      ? `${url}${url.includes('?') ? '&' : '?'}api_key=${this.apiKey}`
      : url;

    // Fetch with retry
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(urlWithKey);

        if (response.status === 404) {
          // No results found - return empty response
          return response;
        }

        if (response.status === 429) {
          // Rate limited - wait and retry
          const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10);
          console.warn(`Rate limited. Waiting ${retryAfter} seconds...`);
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          continue;
        }

        if (!response.ok) {
          throw new Error(`OpenFDA API error: ${response.status} ${response.statusText}`);
        }

        return response;
      } catch (error) {
        lastError = error as Error;
        if (attempt < 2) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError || new Error('Failed to fetch from OpenFDA API');
  }

  /**
   * Build query URL with proper encoding
   */
  private buildUrl(endpoint: string, params: Record<string, string | number>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }
    return url.toString();
  }

  // ============================================
  // Drug Label API (/drug/label)
  // ============================================

  /**
   * Search drug labels by generic name
   */
  async searchDrugLabels(
    genericName: string,
    options: { limit?: number; skip?: number } = {}
  ): Promise<DrugLabelResponse> {
    const { limit = 10, skip = 0 } = options;

    // Search in both generic_name and substance_name fields
    const searchQuery = `openfda.generic_name:"${genericName}" OR openfda.substance_name:"${genericName}"`;

    const url = this.buildUrl('/drug/label.json', {
      search: searchQuery,
      limit,
      skip,
    });

    const response = await this.fetchWithRateLimit(url);

    if (response.status === 404) {
      return {
        meta: {
          disclaimer: '',
          terms: '',
          license: '',
          last_updated: new Date().toISOString(),
          results: { skip: 0, limit, total: 0 },
        },
        results: [],
      };
    }

    return await response.json() as DrugLabelResponse;
  }

  /**
   * Search drug labels by application number (NDA/ANDA)
   */
  async getDrugLabelByApplicationNumber(applicationNumber: string): Promise<DrugLabelResult | null> {
    const url = this.buildUrl('/drug/label.json', {
      search: `openfda.application_number:"${applicationNumber}"`,
      limit: 1,
    });

    const response = await this.fetchWithRateLimit(url);

    if (response.status === 404) {
      return null;
    }

    const data = await response.json() as DrugLabelResponse;
    return data.results[0] || null;
  }

  /**
   * Search drug labels by brand name
   */
  async searchDrugLabelsByBrand(brandName: string, limit = 10): Promise<DrugLabelResponse> {
    const url = this.buildUrl('/drug/label.json', {
      search: `openfda.brand_name:"${brandName}"`,
      limit,
    });

    const response = await this.fetchWithRateLimit(url);

    if (response.status === 404) {
      return {
        meta: {
          disclaimer: '',
          terms: '',
          license: '',
          last_updated: new Date().toISOString(),
          results: { skip: 0, limit, total: 0 },
        },
        results: [],
      };
    }

    return await response.json() as DrugLabelResponse;
  }

  // ============================================
  // Adverse Event API (/drug/event)
  // ============================================

  /**
   * Search adverse events by drug name
   */
  async searchAdverseEvents(
    drugName: string,
    options: { limit?: number; skip?: number; serious?: boolean } = {}
  ): Promise<AdverseEventResponse> {
    const { limit = 100, skip = 0, serious } = options;

    let searchQuery = `patient.drug.openfda.generic_name:"${drugName}"`;
    if (serious !== undefined) {
      searchQuery += ` AND serious:${serious ? '1' : '2'}`;
    }

    const url = this.buildUrl('/drug/event.json', {
      search: searchQuery,
      limit,
      skip,
    });

    const response = await this.fetchWithRateLimit(url);

    if (response.status === 404) {
      return {
        meta: {
          disclaimer: '',
          terms: '',
          license: '',
          last_updated: new Date().toISOString(),
          results: { skip: 0, limit, total: 0 },
        },
        results: [],
      };
    }

    return await response.json() as AdverseEventResponse;
  }

  /**
   * Get adverse event counts by reaction (for visualization)
   */
  async getAdverseEventReactionCounts(
    drugName: string,
    limit = 20
  ): Promise<CountResponse> {
    const url = this.buildUrl('/drug/event.json', {
      search: `patient.drug.openfda.generic_name:"${drugName}"`,
      count: 'patient.reaction.reactionmeddrapt.exact',
      limit,
    });

    const response = await this.fetchWithRateLimit(url);

    if (response.status === 404) {
      return {
        meta: {
          disclaimer: '',
          terms: '',
          license: '',
          last_updated: new Date().toISOString(),
          results: { skip: 0, limit, total: 0 },
        },
        results: [],
      };
    }

    return await response.json() as CountResponse;
  }

  /**
   * Get adverse event counts by outcome
   */
  async getAdverseEventOutcomeCounts(drugName: string): Promise<CountResponse> {
    const url = this.buildUrl('/drug/event.json', {
      search: `patient.drug.openfda.generic_name:"${drugName}"`,
      count: 'patient.reaction.reactionoutcome',
      limit: 10,
    });

    const response = await this.fetchWithRateLimit(url);

    if (response.status === 404) {
      return {
        meta: {
          disclaimer: '',
          terms: '',
          license: '',
          last_updated: new Date().toISOString(),
          results: { skip: 0, limit: 10, total: 0 },
        },
        results: [],
      };
    }

    return await response.json() as CountResponse;
  }

  /**
   * Get adverse event counts by patient age
   */
  async getAdverseEventAgeCounts(drugName: string): Promise<CountResponse> {
    const url = this.buildUrl('/drug/event.json', {
      search: `patient.drug.openfda.generic_name:"${drugName}"`,
      count: 'patient.patientonsetage',
      limit: 100,
    });

    const response = await this.fetchWithRateLimit(url);

    if (response.status === 404) {
      return {
        meta: {
          disclaimer: '',
          terms: '',
          license: '',
          last_updated: new Date().toISOString(),
          results: { skip: 0, limit: 100, total: 0 },
        },
        results: [],
      };
    }

    return await response.json() as CountResponse;
  }

  /**
   * Get adverse event counts by patient sex
   */
  async getAdverseEventSexCounts(drugName: string): Promise<CountResponse> {
    const url = this.buildUrl('/drug/event.json', {
      search: `patient.drug.openfda.generic_name:"${drugName}"`,
      count: 'patient.patientsex',
      limit: 3,
    });

    const response = await this.fetchWithRateLimit(url);

    if (response.status === 404) {
      return {
        meta: {
          disclaimer: '',
          terms: '',
          license: '',
          last_updated: new Date().toISOString(),
          results: { skip: 0, limit: 3, total: 0 },
        },
        results: [],
      };
    }

    return await response.json() as CountResponse;
  }

  /**
   * Get total report count for a drug
   */
  async getTotalReportCount(drugName: string): Promise<number> {
    const url = this.buildUrl('/drug/event.json', {
      search: `patient.drug.openfda.generic_name:"${drugName}"`,
      limit: 1,
    });

    const response = await this.fetchWithRateLimit(url);

    if (response.status === 404) {
      return 0;
    }

    const data = await response.json() as AdverseEventResponse;
    return data.meta.results.total;
  }

  /**
   * Get serious report count for a drug
   */
  async getSeriousReportCount(drugName: string): Promise<number> {
    const url = this.buildUrl('/drug/event.json', {
      search: `patient.drug.openfda.generic_name:"${drugName}" AND serious:1`,
      limit: 1,
    });

    const response = await this.fetchWithRateLimit(url);

    if (response.status === 404) {
      return 0;
    }

    const data = await response.json() as AdverseEventResponse;
    return data.meta.results.total;
  }
}

// Singleton instance for convenience
let defaultClient: OpenFDAClient | null = null;

export function getOpenFDAClient(options?: OpenFDAClientOptions): OpenFDAClient {
  if (!defaultClient || options) {
    defaultClient = new OpenFDAClient(options);
  }
  return defaultClient;
}
