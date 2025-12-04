/**
 * DrugBank Integration Package
 * Provides drug interaction data for ADHD medications
 */

// Export types
export type {
  LocalizedField,
  InteractionSeverity,
  SubstanceType,
  NutrientType,
  EvidenceLevel,
  TimingRecommendation,
  DrugInteraction,
  NutrientInteraction,
  CoprescribedDrugClass,
  InteractionsData,
  ADHDDrugMapping,
} from './types.js';

// Export constants
export {
  ADHD_DRUG_MAPPINGS,
  COMMON_DRUG_CLASSES,
  NUTRIENT_INTERACTIONS,
} from './types.js';

// Export processor functions
export {
  getInteractionsForDrug,
  getNutrientInteractionsForDrug,
  buildInteractionsData,
  processAllDrugs,
} from './processor.js';
