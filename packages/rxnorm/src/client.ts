/**
 * RxNav API Client
 * Handles HTTP requests to NLM RxNav REST API for RxNorm data
 * @see https://lhncbc.nlm.nih.gov/RxNav/APIs/
 */

import type {
  RxcuiResponse,
  RxNormPropertiesResponse,
  RelatedByTypeResponse,
  AllRelatedResponse,
  SpellingSuggestionsResponse,
  ApproximateMatchResponse,
  NDCPropertiesResponse,
  DrugInteractionResponse,
  RxNormConcept,
  RxNormTermType,
  RxNormProperty,
} from './types.js';

// RxNav API base URL
const RXNAV_BASE_URL = 'https://rxnav.nlm.nih.gov/REST';

// Rate limiting: RxNav is free but we should be respectful
const REQUEST_DELAY_MS = 200;

export interface RxNavClientOptions {
  baseUrl?: string;
}

export class RxNavClient {
  private baseUrl: string;
  private lastRequestTime = 0;

  constructor(options: RxNavClientOptions = {}) {
    this.baseUrl = options.baseUrl || RXNAV_BASE_URL;
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

    // Fetch with retry
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(url);

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
          throw new Error(`RxNav API error: ${response.status} ${response.statusText}`);
        }

        return response;
      } catch (error) {
        lastError = error as Error;
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError || new Error('Failed to fetch from RxNav API');
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params: Record<string, string | number | undefined> = {}): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
    return url.toString();
  }

  // ============================================
  // RxCUI Lookup APIs
  // ============================================

  /**
   * Find RxCUI by drug name string
   * @param name - Drug name to search for
   * @param exact - If true, only return exact matches
   */
  async findRxcuiByString(name: string, exact = false): Promise<string[]> {
    const endpoint = exact ? '/rxcui.json' : '/rxcui.json';
    const params = exact
      ? { name, search: 0 }
      : { name, search: 2 }; // search=2 for approximate match

    const url = this.buildUrl(endpoint, params);
    const response = await this.fetchWithRateLimit(url);

    if (response.status === 404) {
      return [];
    }

    const data = await response.json() as RxcuiResponse;
    return data.idGroup?.rxnormId || [];
  }

  /**
   * Get approximate matches for a drug name (useful for spell-checking)
   */
  async getApproximateMatch(term: string, maxResults = 5): Promise<Array<{ rxcui: string; score: string; rank: string }>> {
    const url = this.buildUrl('/approximateTerm.json', {
      term,
      maxEntries: maxResults,
    });

    const response = await this.fetchWithRateLimit(url);

    if (response.status === 404) {
      return [];
    }

    const data = await response.json() as ApproximateMatchResponse;
    return data.approximateGroup?.candidate?.map(c => ({
      rxcui: c.rxcui,
      score: c.score,
      rank: c.rank,
    })) || [];
  }

  /**
   * Get spelling suggestions for a drug name
   */
  async getSpellingSuggestions(name: string): Promise<string[]> {
    const url = this.buildUrl('/spellingsuggestions.json', { name });
    const response = await this.fetchWithRateLimit(url);

    if (response.status === 404) {
      return [];
    }

    const data = await response.json() as SpellingSuggestionsResponse;
    return data.suggestionGroup?.suggestionList?.suggestion || [];
  }

  // ============================================
  // Drug Properties APIs
  // ============================================

  /**
   * Get all properties for an RxCUI
   */
  async getAllProperties(rxcui: string): Promise<RxNormProperty[]> {
    const url = this.buildUrl(`/rxcui/${rxcui}/allProperties.json`, {
      prop: 'all',
    });

    const response = await this.fetchWithRateLimit(url);

    if (response.status === 404) {
      return [];
    }

    const data = await response.json() as RxNormPropertiesResponse;
    return data.propConceptGroup?.propConcept || [];
  }

  /**
   * Get RxNorm name for an RxCUI
   */
  async getRxNormName(rxcui: string): Promise<string | null> {
    const properties = await this.getAllProperties(rxcui);
    const nameProp = properties.find(p => p.propName === 'RxNorm Name');
    return nameProp?.propValue || null;
  }

  /**
   * Get term type for an RxCUI
   */
  async getTermType(rxcui: string): Promise<RxNormTermType | null> {
    const properties = await this.getAllProperties(rxcui);
    const ttyProp = properties.find(p => p.propName === 'TTY');
    return (ttyProp?.propValue as RxNormTermType) || null;
  }

  // ============================================
  // Related Concepts APIs
  // ============================================

  /**
   * Get related concepts by term type
   * @param rxcui - The RxCUI to find related concepts for
   * @param tty - Term types to filter by (e.g., ['IN', 'BN', 'SBD'])
   */
  async getRelatedByType(rxcui: string, tty: RxNormTermType[]): Promise<RxNormConcept[]> {
    const url = this.buildUrl(`/rxcui/${rxcui}/related.json`, {
      tty: tty.join(' '),
    });

    const response = await this.fetchWithRateLimit(url);

    if (response.status === 404) {
      return [];
    }

    const data = await response.json() as RelatedByTypeResponse;
    const concepts: RxNormConcept[] = [];

    for (const group of data.relatedGroup?.conceptGroup || []) {
      if (group.conceptProperties) {
        concepts.push(...group.conceptProperties);
      }
    }

    return concepts;
  }

  /**
   * Get ALL related concepts for an RxCUI
   */
  async getAllRelated(rxcui: string): Promise<Map<RxNormTermType, RxNormConcept[]>> {
    const url = this.buildUrl(`/rxcui/${rxcui}/allrelated.json`);
    const response = await this.fetchWithRateLimit(url);

    if (response.status === 404) {
      return new Map();
    }

    const data = await response.json() as AllRelatedResponse;
    const result = new Map<RxNormTermType, RxNormConcept[]>();

    for (const group of data.allRelatedGroup?.conceptGroup || []) {
      if (group.conceptProperties && group.conceptProperties.length > 0) {
        result.set(group.tty, group.conceptProperties);
      }
    }

    return result;
  }

  /**
   * Get ingredient-level RxCUI for a drug
   * Works backwards from any RxCUI to find the base ingredient
   */
  async getIngredientRxcui(rxcui: string): Promise<RxNormConcept | null> {
    const ingredients = await this.getRelatedByType(rxcui, ['IN']);
    return ingredients[0] || null;
  }

  /**
   * Get all brand names for an ingredient
   */
  async getBrandNamesForIngredient(ingredientRxcui: string): Promise<RxNormConcept[]> {
    return this.getRelatedByType(ingredientRxcui, ['BN']);
  }

  /**
   * Get all clinical drugs (specific formulations) for an ingredient
   */
  async getClinicalDrugsForIngredient(ingredientRxcui: string): Promise<RxNormConcept[]> {
    return this.getRelatedByType(ingredientRxcui, ['SCD', 'SBD']);
  }

  /**
   * Get all drug forms for an ingredient
   */
  async getDrugFormsForIngredient(ingredientRxcui: string): Promise<RxNormConcept[]> {
    return this.getRelatedByType(ingredientRxcui, ['SCDF', 'SBDF']);
  }

  // ============================================
  // NDC APIs
  // ============================================

  /**
   * Get NDCs for an RxCUI
   */
  async getNDCs(rxcui: string): Promise<string[]> {
    const url = this.buildUrl(`/rxcui/${rxcui}/ndcs.json`);
    const response = await this.fetchWithRateLimit(url);

    if (response.status === 404) {
      return [];
    }

    const data = await response.json() as { ndcGroup?: { ndcList?: { ndc?: string[] } } };
    return data.ndcGroup?.ndcList?.ndc || [];
  }

  /**
   * Get RxCUI from NDC
   */
  async getRxcuiFromNDC(ndc: string): Promise<string | null> {
    const url = this.buildUrl('/ndcstatus.json', { ndc });
    const response = await this.fetchWithRateLimit(url);

    if (response.status === 404) {
      return null;
    }

    const data = await response.json() as { ndcStatus?: { rxcui?: string } };
    return data.ndcStatus?.rxcui || null;
  }

  // ============================================
  // Drug Interaction APIs
  // ============================================

  /**
   * Get drug interactions for an RxCUI
   */
  async getDrugInteractions(rxcui: string): Promise<DrugInteractionResponse> {
    const url = this.buildUrl(`/interaction/interaction.json`, { rxcui });
    const response = await this.fetchWithRateLimit(url);

    if (response.status === 404) {
      return {};
    }

    return await response.json() as DrugInteractionResponse;
  }

  /**
   * Get interactions between multiple drugs
   */
  async getDrugInteractionsList(rxcuis: string[]): Promise<DrugInteractionResponse> {
    const url = this.buildUrl(`/interaction/list.json`, {
      rxcuis: rxcuis.join(' '),
    });
    const response = await this.fetchWithRateLimit(url);

    if (response.status === 404) {
      return {};
    }

    return await response.json() as DrugInteractionResponse;
  }

  // ============================================
  // Convenience Methods
  // ============================================

  /**
   * Get comprehensive drug information by name
   * Returns ingredient RxCUI, brand names, and all related concepts
   */
  async getDrugInfo(drugName: string): Promise<{
    rxcuis: string[];
    ingredient: RxNormConcept | null;
    brandNames: RxNormConcept[];
    clinicalDrugs: RxNormConcept[];
    drugForms: RxNormConcept[];
  }> {
    // First, find RxCUIs for the drug name
    const rxcuis = await this.findRxcuiByString(drugName);

    if (rxcuis.length === 0) {
      return {
        rxcuis: [],
        ingredient: null,
        brandNames: [],
        clinicalDrugs: [],
        drugForms: [],
      };
    }

    // Get the ingredient-level concept
    let ingredient = await this.getIngredientRxcui(rxcuis[0]);

    // If no ingredient found, the rxcui might already be an ingredient
    if (!ingredient && rxcuis.length > 0) {
      const tty = await this.getTermType(rxcuis[0]);
      if (tty === 'IN' || tty === 'PIN') {
        const name = await this.getRxNormName(rxcuis[0]);
        ingredient = {
          rxcui: rxcuis[0],
          name: name || drugName,
          tty: tty,
        };
      }
    }

    // Get brand names and formulations if we have an ingredient
    let brandNames: RxNormConcept[] = [];
    let clinicalDrugs: RxNormConcept[] = [];
    let drugForms: RxNormConcept[] = [];

    if (ingredient) {
      brandNames = await this.getBrandNamesForIngredient(ingredient.rxcui);
      clinicalDrugs = await this.getClinicalDrugsForIngredient(ingredient.rxcui);
      drugForms = await this.getDrugFormsForIngredient(ingredient.rxcui);
    }

    return {
      rxcuis,
      ingredient,
      brandNames,
      clinicalDrugs,
      drugForms,
    };
  }

  /**
   * Search for drugs with fuzzy matching and suggestions
   * Good for user input normalization
   */
  async searchDrug(query: string): Promise<{
    exactMatches: string[];
    approximateMatches: Array<{ rxcui: string; score: string }>;
    suggestions: string[];
  }> {
    const [exactMatches, approximateMatches, suggestions] = await Promise.all([
      this.findRxcuiByString(query, true),
      this.getApproximateMatch(query),
      this.getSpellingSuggestions(query),
    ]);

    return {
      exactMatches,
      approximateMatches: approximateMatches.map(m => ({
        rxcui: m.rxcui,
        score: m.score,
      })),
      suggestions,
    };
  }
}

// Singleton instance for convenience
let defaultClient: RxNavClient | null = null;

export function getRxNavClient(options?: RxNavClientOptions): RxNavClient {
  if (!defaultClient || options) {
    defaultClient = new RxNavClient(options);
  }
  return defaultClient;
}
