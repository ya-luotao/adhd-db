/**
 * @adhd-db/openfda
 * OpenFDA API integration for ADHD drug database
 */

// Types
export * from './types.js';

// Client
export { OpenFDAClient, getOpenFDAClient } from './client.js';
export type { OpenFDAClientOptions } from './client.js';

// Processor
export {
  processLabelResult,
  processAdverseEvents,
  fetchDrugData,
  selectBestLabel,
  mergeLabels,
} from './processor.js';
