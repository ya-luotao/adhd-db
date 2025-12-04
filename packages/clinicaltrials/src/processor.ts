/**
 * ClinicalTrials.gov Data Processor
 * Transforms trial data for ADHD drugs
 */

import { getClinicalTrialsClient } from './client.js';
import type { Study, ClinicalTrialsData, ADHDTrialSummary } from './types.js';
import { ADHD_DRUG_TRIAL_MAPPINGS } from './types.js';

/**
 * Process trials for a single drug
 */
export async function processTrialsForDrug(drugId: string): Promise<ClinicalTrialsData | null> {
  const mapping = ADHD_DRUG_TRIAL_MAPPINGS.find(d => d.drugId === drugId);
  if (!mapping) {
    console.warn(`No mapping found for drug: ${drugId}`);
    return null;
  }

  const client = getClinicalTrialsClient();
  const allTrials: Study[] = [];

  console.log(`  Fetching trials for ${mapping.drugName}...`);

  // Search by primary drug name
  const mainTrials = await client.getADHDTrialsForDrug(mapping.drugName, { limit: 100 });
  allTrials.push(...mainTrials);

  // Search by alternative terms
  for (const term of mapping.searchTerms.slice(1)) {
    const additionalTrials = await client.getADHDTrialsForDrug(term, { limit: 50 });
    // Add only unique trials
    for (const trial of additionalTrials) {
      if (!allTrials.some(t => t.nctId === trial.nctId)) {
        allTrials.push(trial);
      }
    }
  }

  // Calculate summary statistics
  const summary = {
    total: allTrials.length,
    recruiting: allTrials.filter(t =>
      ['RECRUITING', 'ENROLLING_BY_INVITATION', 'NOT_YET_RECRUITING'].includes(t.overallStatus)
    ).length,
    active: allTrials.filter(t => t.overallStatus === 'ACTIVE_NOT_RECRUITING').length,
    completed: allTrials.filter(t => t.overallStatus === 'COMPLETED').length,
    byPhase: {} as Record<string, number>,
  };

  // Count by phase
  for (const trial of allTrials) {
    for (const phase of trial.phases || ['NA']) {
      summary.byPhase[phase] = (summary.byPhase[phase] || 0) + 1;
    }
  }

  return {
    trials: allTrials,
    summary,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Process trials for all ADHD drugs
 */
export async function processAllDrugTrials(): Promise<Record<string, ClinicalTrialsData>> {
  const results: Record<string, ClinicalTrialsData> = {};

  for (const mapping of ADHD_DRUG_TRIAL_MAPPINGS) {
    const data = await processTrialsForDrug(mapping.drugId);
    if (data) {
      results[mapping.drugId] = data;
    }
  }

  return results;
}

/**
 * Get trial summary for a drug (lighter weight than full data)
 */
export async function getTrialSummary(drugId: string): Promise<ADHDTrialSummary | null> {
  const mapping = ADHD_DRUG_TRIAL_MAPPINGS.find(d => d.drugId === drugId);
  if (!mapping) {
    return null;
  }

  const client = getClinicalTrialsClient();

  // Get recruiting trials
  const recruiting = await client.getRecruitingTrials(mapping.drugName);

  // Get active trials
  const active = await client.getActiveTrials(mapping.drugName);

  // Get recently completed
  const completed = await client.getCompletedTrials(mapping.drugName);

  // Select notable trials (Phase 3 or with industry sponsor)
  const notableTrials = [...recruiting, ...active]
    .filter(t =>
      t.phases?.includes('PHASE3') ||
      t.leadSponsor?.class === 'INDUSTRY' ||
      t.enrollmentCount && t.enrollmentCount > 500
    )
    .slice(0, 5);

  return {
    drugId,
    drugName: mapping.drugName,
    totalTrials: recruiting.length + active.length + completed.length,
    recruitingTrials: recruiting.length,
    activeTrials: active.length,
    recentlyCompleted: completed.length,
    notableTrials,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Get novel ADHD treatments in development
 */
export async function getNovelTreatments(): Promise<Study[]> {
  const client = getClinicalTrialsClient();
  return client.getNovelADHDTrials();
}

/**
 * Format trial for display
 */
export function formatTrialForDisplay(trial: Study): {
  nctId: string;
  title: string;
  status: string;
  phase: string;
  sponsor: string;
  enrollment: string;
  dates: string;
  url: string;
} {
  return {
    nctId: trial.nctId,
    title: trial.briefTitle,
    status: trial.overallStatus.replace(/_/g, ' '),
    phase: trial.phases?.join(', ') || 'N/A',
    sponsor: trial.leadSponsor?.name || 'Unknown',
    enrollment: trial.enrollmentCount
      ? `${trial.enrollmentCount} (${trial.enrollmentType?.toLowerCase() || 'unknown'})`
      : 'Not specified',
    dates: trial.startDate
      ? `${trial.startDate} - ${trial.completionDate || 'ongoing'}`
      : 'Not specified',
    url: `https://clinicaltrials.gov/study/${trial.nctId}`,
  };
}
