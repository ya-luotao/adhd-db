/**
 * RxNorm/RxNav API Type Definitions
 * Based on NLM RxNav REST API: https://lhncbc.nlm.nih.gov/RxNav/APIs/
 */

// ============================================
// RxNorm Term Types (TTY)
// ============================================

/**
 * RxNorm Term Types - defines the level of specificity
 * @see https://www.nlm.nih.gov/research/umls/rxnorm/docs/appendix5.html
 */
export type RxNormTermType =
  | 'IN'      // Ingredient
  | 'PIN'     // Precise Ingredient
  | 'MIN'     // Multiple Ingredients
  | 'SCDC'    // Semantic Clinical Drug Component
  | 'SCDF'    // Semantic Clinical Drug Form
  | 'SCDG'    // Semantic Clinical Drug Group
  | 'SCD'     // Semantic Clinical Drug
  | 'SBDC'    // Semantic Branded Drug Component
  | 'SBDF'    // Semantic Branded Drug Form
  | 'SBDG'    // Semantic Branded Drug Group
  | 'SBD'     // Semantic Branded Drug
  | 'BN'      // Brand Name
  | 'GPCK'    // Generic Pack
  | 'BPCK';   // Brand Pack

// ============================================
// API Response Types
// ============================================

/**
 * RxNorm Concept - basic unit returned by RxNav
 */
export interface RxNormConcept {
  rxcui: string;
  name: string;
  synonym?: string;
  tty: RxNormTermType;
  language?: string;
  suppress?: string;
  umlscui?: string;
}

/**
 * Drug information from RxNav findRxcuiByString
 */
export interface RxNormDrugInfo {
  rxcui: string;
  name: string;
  tty: RxNormTermType;
}

/**
 * Property information
 */
export interface RxNormProperty {
  propCategory: string;
  propName: string;
  propValue: string;
}

/**
 * Related concept with relationship type
 */
export interface RxNormRelatedConcept {
  rxcui: string;
  name: string;
  tty: RxNormTermType;
  rela?: string;  // Relationship attribute (e.g., "has_ingredient", "tradename_of")
}

/**
 * Spelling suggestion
 */
export interface RxNormSpellingSuggestion {
  suggestion: string;
}

/**
 * NDC (National Drug Code) information
 */
export interface RxNormNDC {
  ndc11: string;
  ndcPackageCode?: string;
  status?: string;
}

// ============================================
// API Response Wrappers
// ============================================

export interface RxcuiResponse {
  idGroup?: {
    name?: string;
    rxnormId?: string[];
  };
}

export interface RxNormPropertiesResponse {
  propConceptGroup?: {
    propConcept?: RxNormProperty[];
  };
}

export interface RelatedByTypeResponse {
  relatedGroup?: {
    rxcui?: string;
    termType?: string[];
    conceptGroup?: Array<{
      tty: RxNormTermType;
      conceptProperties?: RxNormConcept[];
    }>;
  };
}

export interface AllRelatedResponse {
  allRelatedGroup?: {
    rxcui?: string;
    conceptGroup?: Array<{
      tty: RxNormTermType;
      conceptProperties?: RxNormConcept[];
    }>;
  };
}

export interface SpellingSuggestionsResponse {
  suggestionGroup?: {
    name?: string;
    suggestionList?: {
      suggestion?: string[];
    };
  };
}

export interface ApproximateMatchResponse {
  approximateGroup?: {
    inputTerm?: string;
    candidate?: Array<{
      rxcui: string;
      rxaui?: string;
      score: string;
      rank: string;
    }>;
  };
}

export interface NDCPropertiesResponse {
  ndcPropertyList?: {
    ndcProperty?: Array<{
      ndcItem: string;
      ndc9?: string;
      ndc10?: string;
      rxcui: string;
      splSetIdItem?: string;
      packagingList?: {
        packaging?: string[];
      };
    }>;
  };
}

export interface DrugInteractionResponse {
  interactionTypeGroup?: Array<{
    sourceDisclaimer?: string;
    sourceName?: string;
    interactionType?: Array<{
      comment?: string;
      minConceptItem?: {
        rxcui: string;
        name: string;
        tty: string;
      };
      interactionPair?: Array<{
        interactionConcept?: Array<{
          minConceptItem?: {
            rxcui: string;
            name: string;
            tty: string;
          };
          sourceConceptItem?: {
            id: string;
            name: string;
            url: string;
          };
        }>;
        severity?: string;
        description?: string;
      }>;
    }>;
  }>;
}

// ============================================
// ADHD-DB Specific Types
// ============================================

/**
 * RxNorm data structure for drug entries
 */
export interface RxNormDrugData {
  // Primary ingredient-level identifier
  ingredientRxcui: string;
  ingredientName: string;

  // All associated RxCUIs at different levels
  rxcuiMappings: RxNormRxcuiMapping[];

  // Brand name mappings
  brandMappings: RxNormBrandMapping[];

  // Synonyms and alternative names
  synonyms: RxNormSynonym[];

  // Related drugs (same ingredient, different forms)
  relatedDrugs: RxNormRelatedDrug[];

  // Data freshness
  lastUpdated: string;
}

/**
 * RxCUI mapping at different term type levels
 */
export interface RxNormRxcuiMapping {
  rxcui: string;
  name: string;
  tty: RxNormTermType;
  description?: string;  // Human-readable description of what this represents
}

/**
 * Brand name to RxCUI mapping
 */
export interface RxNormBrandMapping {
  brandName: string;
  rxcui: string;
  manufacturer?: string;
  region?: string;  // US, EU, etc.
}

/**
 * Drug synonym/alternative name
 */
export interface RxNormSynonym {
  name: string;
  type: 'generic' | 'brand' | 'abbreviation' | 'chemical' | 'common';
  source?: string;  // Where this synonym comes from
}

/**
 * Related drug (same ingredient family)
 */
export interface RxNormRelatedDrug {
  rxcui: string;
  name: string;
  tty: RxNormTermType;
  relationship: string;  // e.g., "has_dose_form", "has_ingredient"
}

/**
 * Drug mapping configuration for ADHD drugs
 */
export interface ADHDDrugRxNormMapping {
  drugId: string;                    // Our internal drug ID
  searchTerms: string[];             // Terms to search in RxNav
  primaryIngredientName: string;     // Primary ingredient for lookup
  knownRxcuis?: string[];            // Known RxCUIs if available
  brandNames?: string[];             // Known brand names
}

// ============================================
// Drug Mapping Configurations
// ============================================

/**
 * ADHD Drug to RxNorm mapping configuration
 */
export const ADHD_DRUG_RXNORM_MAPPINGS: ADHDDrugRxNormMapping[] = [
  {
    drugId: 'methylphenidate',
    searchTerms: ['methylphenidate', 'methylphenidate hydrochloride'],
    primaryIngredientName: 'methylphenidate',
    brandNames: ['Concerta', 'Ritalin', 'Ritalin LA', 'Metadate CD', 'Metadate ER',
                 'Methylin', 'Quillivant XR', 'Quillichew ER', 'Jornay PM',
                 'Aptensio XR', 'Cotempla XR-ODT', 'Daytrana']
  },
  {
    drugId: 'amphetamine-mixed-salts',
    searchTerms: ['amphetamine', 'amphetamine aspartate', 'dextroamphetamine'],
    primaryIngredientName: 'amphetamine',
    brandNames: ['Adderall', 'Adderall XR', 'Mydayis']
  },
  {
    drugId: 'lisdexamfetamine',
    searchTerms: ['lisdexamfetamine', 'lisdexamfetamine dimesylate'],
    primaryIngredientName: 'lisdexamfetamine',
    brandNames: ['Vyvanse']
  },
  {
    drugId: 'atomoxetine',
    searchTerms: ['atomoxetine', 'atomoxetine hydrochloride'],
    primaryIngredientName: 'atomoxetine',
    brandNames: ['Strattera', 'Qelbree']
  },
  {
    drugId: 'guanfacine',
    searchTerms: ['guanfacine', 'guanfacine hydrochloride'],
    primaryIngredientName: 'guanfacine',
    brandNames: ['Intuniv', 'Tenex']
  },
  {
    drugId: 'clonidine',
    searchTerms: ['clonidine', 'clonidine hydrochloride'],
    primaryIngredientName: 'clonidine',
    brandNames: ['Kapvay', 'Catapres']
  },
  {
    drugId: 'viloxazine',
    searchTerms: ['viloxazine', 'viloxazine hydrochloride'],
    primaryIngredientName: 'viloxazine',
    brandNames: ['Qelbree']
  }
];
