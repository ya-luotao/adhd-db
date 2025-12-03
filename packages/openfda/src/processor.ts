/**
 * OpenFDA Data Processor
 * Transforms raw OpenFDA API responses into structured data for ADHD-DB
 */

import type {
  DrugLabelResult,
  ProcessedDrugLabel,
  AdverseEventSummary,
  CountResult,
  DrugMapping,
} from './types.js';
import { OpenFDAClient } from './client.js';

/**
 * Clean and truncate text from FDA labels
 * FDA label text often contains HTML, extra whitespace, and is very long
 */
function cleanLabelText(text: string | string[] | undefined, maxLength = 5000): string | undefined {
  if (!text) return undefined;

  const textStr = Array.isArray(text) ? text.join('\n\n') : text;

  // Remove HTML tags
  let cleaned = textStr.replace(/<[^>]*>/g, '');

  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // Truncate if too long
  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength) + '...';
  }

  return cleaned || undefined;
}

/**
 * Extract first value from array or return undefined
 */
function firstOrUndefined<T>(arr: T[] | undefined): T | undefined {
  return arr?.[0];
}

/**
 * Process a single drug label result into our format
 */
export function processLabelResult(result: DrugLabelResult): ProcessedDrugLabel {
  const openfda = result.openfda || {};

  return {
    // FDA References
    applicationNumber: firstOrUndefined(openfda.application_number),
    splSetId: result.set_id,
    splId: result.id,
    rxcui: openfda.rxcui,

    // Names
    fdaBrandNames: openfda.brand_name || [],
    fdaGenericName: firstOrUndefined(openfda.generic_name),
    manufacturers: openfda.manufacturer_name || [],

    // Pharmacological Classification
    pharmacologicClass: {
      mechanismOfAction: openfda.pharm_class_moa,
      establishedClass: openfda.pharm_class_epc,
      physiologicEffect: openfda.pharm_class_pe,
    },

    // Clinical Information
    indicationsAndUsage: cleanLabelText(result.indications_and_usage),
    dosageAndAdministration: cleanLabelText(result.dosage_and_administration),
    contraindications: cleanLabelText(result.contraindications),

    // Safety Warnings
    boxedWarning: cleanLabelText(result.boxed_warning),
    warningsAndPrecautions: cleanLabelText(result.warnings_and_cautions || result.warnings),

    // Adverse Reactions
    adverseReactions: cleanLabelText(result.adverse_reactions),

    // Drug Interactions
    drugInteractions: cleanLabelText(result.drug_interactions),

    // Abuse/Dependence
    controlledSubstanceClass: firstOrUndefined(result.controlled_substance),
    abuseInfo: cleanLabelText(result.abuse),
    dependenceInfo: cleanLabelText(result.dependence),

    // Special Populations
    pediatricUse: cleanLabelText(result.pediatric_use),
    geriatricUse: cleanLabelText(result.geriatric_use),
    pregnancyInfo: cleanLabelText(result.pregnancy),

    // Pharmacology
    mechanismOfAction: cleanLabelText(result.mechanism_of_action),
    pharmacokinetics: cleanLabelText(result.pharmacokinetics),

    // Metadata
    effectiveDate: result.effective_time,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Map age values to age groups for visualization
 */
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

/**
 * Map sex code to label
 */
function mapSexCode(code: string): string {
  switch (code) {
    case '0':
      return 'Unknown';
    case '1':
      return 'Male';
    case '2':
      return 'Female';
    default:
      return 'Unknown';
  }
}

/**
 * Map outcome code to label
 */
function mapOutcomeCode(code: string): string {
  switch (code) {
    case '1':
      return 'recovered';
    case '2':
      return 'recovering';
    case '3':
      return 'notRecovered';
    case '4':
      return 'recoveredWithSequelae';
    case '5':
      return 'fatal';
    case '6':
    default:
      return 'unknown';
  }
}

/**
 * Process adverse event data into summary format
 */
export async function processAdverseEvents(
  client: OpenFDAClient,
  drugMapping: DrugMapping
): Promise<AdverseEventSummary> {
  const drugName = drugMapping.primaryGenericName;

  // Fetch all counts in parallel
  const [
    totalReports,
    seriousReports,
    reactionCounts,
    ageCounts,
    sexCounts,
    outcomeCounts,
  ] = await Promise.all([
    client.getTotalReportCount(drugName),
    client.getSeriousReportCount(drugName),
    client.getAdverseEventReactionCounts(drugName, 30),
    client.getAdverseEventAgeCounts(drugName),
    client.getAdverseEventSexCounts(drugName),
    client.getAdverseEventOutcomeCounts(drugName),
  ]);

  // Process reaction counts
  const topReactions = reactionCounts.results.map((r: CountResult) => ({
    reaction: r.term.toLowerCase().replace(/_/g, ' '),
    count: r.count,
    percentage: totalReports > 0 ? Math.round((r.count / totalReports) * 10000) / 100 : 0,
  }));

  // Process age counts - aggregate into groups
  const ageGroups: Record<string, number> = {};
  for (const r of ageCounts.results) {
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
  const bySex = sexCounts.results.map((r: CountResult) => ({
    sex: mapSexCode(r.term),
    count: r.count,
  }));

  // Process outcome counts
  const outcomes = {
    recovered: 0,
    recovering: 0,
    notRecovered: 0,
    fatal: 0,
    unknown: 0,
  };
  for (const r of outcomeCounts.results) {
    const outcomeKey = mapOutcomeCode(r.term) as keyof typeof outcomes;
    if (outcomeKey === 'recoveredWithSequelae') {
      outcomes.recovered += r.count;
    } else if (outcomeKey in outcomes) {
      outcomes[outcomeKey] = r.count;
    }
  }

  return {
    drugName: drugMapping.drugId,
    totalReports,
    seriousReports,
    topReactions,
    demographics: {
      byAge,
      bySex,
    },
    outcomes,
    dataRange: {
      from: '2004-01-01', // FAERS data starts from 2004
      to: new Date().toISOString().split('T')[0],
    },
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Fetch and process all data for a drug
 */
export async function fetchDrugData(
  client: OpenFDAClient,
  mapping: DrugMapping
): Promise<{
  labels: ProcessedDrugLabel[];
  adverseEvents: AdverseEventSummary;
}> {
  console.log(`Fetching data for ${mapping.drugId}...`);

  // Fetch drug labels
  const labelResponse = await client.searchDrugLabels(mapping.primaryGenericName, { limit: 50 });
  const labels = labelResponse.results.map(processLabelResult);

  console.log(`  Found ${labels.length} drug labels`);

  // Fetch adverse events summary
  const adverseEvents = await processAdverseEvents(client, mapping);

  console.log(`  Found ${adverseEvents.totalReports} adverse event reports`);
  console.log(`  Top reactions: ${adverseEvents.topReactions.slice(0, 5).map(r => r.reaction).join(', ')}`);

  return { labels, adverseEvents };
}

/**
 * Select the best label from multiple results
 * Prefers: most recent, has boxed warning (for stimulants), most complete
 */
export function selectBestLabel(labels: ProcessedDrugLabel[]): ProcessedDrugLabel | undefined {
  if (labels.length === 0) return undefined;

  // Sort by completeness score and recency
  const scored = labels.map(label => {
    let score = 0;

    // Prefer labels with more information
    if (label.boxedWarning) score += 10;
    if (label.indicationsAndUsage) score += 5;
    if (label.adverseReactions) score += 5;
    if (label.drugInteractions) score += 5;
    if (label.mechanismOfAction) score += 3;
    if (label.pediatricUse) score += 3;
    if (label.pharmacologicClass.mechanismOfAction?.length) score += 3;

    // Prefer more recent labels
    if (label.effectiveDate) {
      const year = parseInt(label.effectiveDate.substring(0, 4), 10);
      if (!isNaN(year)) {
        score += Math.min(year - 2000, 25); // Max 25 points for recency
      }
    }

    return { label, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored[0]?.label;
}

/**
 * Merge multiple labels into a comprehensive view
 * Uses the best available information from all labels
 */
export function mergeLabels(labels: ProcessedDrugLabel[]): ProcessedDrugLabel | undefined {
  const best = selectBestLabel(labels);
  if (!best || labels.length === 1) return best;

  // Collect all unique brand names and manufacturers
  const allBrandNames = new Set<string>();
  const allManufacturers = new Set<string>();
  const allRxcui = new Set<string>();
  const allMoa = new Set<string>();
  const allEpc = new Set<string>();

  for (const label of labels) {
    label.fdaBrandNames.forEach(b => allBrandNames.add(b));
    label.manufacturers.forEach(m => allManufacturers.add(m));
    label.rxcui?.forEach(r => allRxcui.add(r));
    label.pharmacologicClass.mechanismOfAction?.forEach(m => allMoa.add(m));
    label.pharmacologicClass.establishedClass?.forEach(e => allEpc.add(e));
  }

  return {
    ...best,
    fdaBrandNames: Array.from(allBrandNames),
    manufacturers: Array.from(allManufacturers),
    rxcui: allRxcui.size > 0 ? Array.from(allRxcui) : undefined,
    pharmacologicClass: {
      ...best.pharmacologicClass,
      mechanismOfAction: allMoa.size > 0 ? Array.from(allMoa) : undefined,
      establishedClass: allEpc.size > 0 ? Array.from(allEpc) : undefined,
    },
  };
}
