#!/usr/bin/env tsx
/**
 * CLI script to fetch clinical trial data for ADHD drugs
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  processAllDrugTrials,
  getNovelTreatments,
  formatTrialForDisplay,
  ADHD_DRUG_TRIAL_MAPPINGS,
} from '../index.js';

const DATA_DIR = path.resolve(import.meta.dirname, '../../data');

async function main() {
  console.log('🔬 Fetching clinical trial data from ClinicalTrials.gov...\n');

  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Process all drugs
  console.log('📊 Processing trials for ADHD drugs:\n');
  const allTrials = await processAllDrugTrials();

  // Save to cache file
  const cacheFile = path.join(DATA_DIR, 'trials.json');
  fs.writeFileSync(cacheFile, JSON.stringify(allTrials, null, 2));
  console.log(`\n✅ Saved trial data to: ${cacheFile}`);

  // Print summary
  console.log('\n📊 Trial Summary:\n');
  console.log('Drug ID                  | Total | Recruiting | Active | Completed');
  console.log('-------------------------|-------|------------|--------|----------');

  for (const drug of ADHD_DRUG_TRIAL_MAPPINGS) {
    const data = allTrials[drug.drugId];
    if (data) {
      console.log(
        `${drug.drugId.padEnd(24)} | ${String(data.summary.total).padStart(5)} | ${String(data.summary.recruiting).padStart(10)} | ${String(data.summary.active).padStart(6)} | ${data.summary.completed}`
      );
    }
  }

  // Fetch novel treatments
  console.log('\n🔬 Fetching novel ADHD treatments in development...');
  const novelTrials = await getNovelTreatments();

  if (novelTrials.length > 0) {
    console.log(`\n📋 Found ${novelTrials.length} novel treatment trials:\n`);
    for (const trial of novelTrials.slice(0, 10)) {
      const formatted = formatTrialForDisplay(trial);
      console.log(`  ${formatted.nctId}: ${formatted.title.slice(0, 60)}...`);
      console.log(`    Phase: ${formatted.phase} | Status: ${formatted.status} | Sponsor: ${formatted.sponsor}`);
      console.log('');
    }
  }

  // Save novel treatments
  const novelFile = path.join(DATA_DIR, 'novel-treatments.json');
  fs.writeFileSync(novelFile, JSON.stringify(novelTrials, null, 2));
  console.log(`✅ Saved novel treatments to: ${novelFile}`);

  console.log('\n✨ Done!');
}

main().catch(console.error);
