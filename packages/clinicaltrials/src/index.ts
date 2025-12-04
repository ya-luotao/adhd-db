/**
 * ClinicalTrials.gov Integration Package
 * Provides clinical trial data for ADHD medications
 */

// Export types
export type {
  TrialStatus,
  TrialPhase,
  StudyType,
  StudyLocation,
  StudySponsor,
  StudyIntervention,
  StudyOutcome,
  Study,
  StudySearchResponse,
  ADHDTrialSummary,
  ClinicalTrialsData,
  ADHDDrugTrialMapping,
} from './types.js';

// Export constants
export { ADHD_DRUG_TRIAL_MAPPINGS } from './types.js';

// Export client
export {
  ClinicalTrialsClient,
  getClinicalTrialsClient,
  type ClinicalTrialsClientOptions,
} from './client.js';

// Export processor functions
export {
  processTrialsForDrug,
  processAllDrugTrials,
  getTrialSummary,
  getNovelTreatments,
  formatTrialForDisplay,
} from './processor.js';
