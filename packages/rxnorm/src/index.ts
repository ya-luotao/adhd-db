/**
 * RxNorm/RxNav API Integration Package
 *
 * Provides drug name normalization and relationship mapping using
 * the National Library of Medicine's RxNorm database.
 *
 * @see https://www.nlm.nih.gov/research/umls/rxnorm/overview.html
 * @see https://lhncbc.nlm.nih.gov/RxNav/APIs/
 */

// Client exports
export { RxNavClient, getRxNavClient, type RxNavClientOptions } from './client.js';

// Processor exports
export {
  processRxNormData,
  processAllDrugs,
  toYamlFormat,
  mergeWithDrugData,
} from './processor.js';

// Type exports
export type {
  RxNormTermType,
  RxNormConcept,
  RxNormDrugInfo,
  RxNormProperty,
  RxNormRelatedConcept,
  RxNormSpellingSuggestion,
  RxNormNDC,
  RxNormDrugData,
  RxNormRxcuiMapping,
  RxNormBrandMapping,
  RxNormSynonym,
  RxNormRelatedDrug,
  ADHDDrugRxNormMapping,
  // API Response types
  RxcuiResponse,
  RxNormPropertiesResponse,
  RelatedByTypeResponse,
  AllRelatedResponse,
  SpellingSuggestionsResponse,
  ApproximateMatchResponse,
  NDCPropertiesResponse,
  DrugInteractionResponse,
} from './types.js';

// Drug mappings
export { ADHD_DRUG_RXNORM_MAPPINGS } from './types.js';
