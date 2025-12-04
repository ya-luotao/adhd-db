#!/usr/bin/env tsx
/**
 * CLI script to fetch and update drug interaction data
 * Generates interaction data for all ADHD drugs and saves to data files
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { stringify } from 'yaml';
import { processAllDrugs, ADHD_DRUG_MAPPINGS } from '../index.js';

const DATA_DIR = path.resolve(import.meta.dirname, '../../data');
const DRUGS_DIR = path.resolve(import.meta.dirname, '../../../../data/drugs');

async function main() {
  console.log('🔬 Generating drug interaction data for ADHD medications...\n');

  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Process all drugs
  const allInteractions = processAllDrugs();

  // Save combined JSON cache
  const cacheFile = path.join(DATA_DIR, 'interactions.json');
  fs.writeFileSync(cacheFile, JSON.stringify(allInteractions, null, 2));
  console.log(`✅ Saved combined interaction data to: ${cacheFile}`);

  // Generate summary
  console.log('\n📊 Interaction Summary:\n');
  console.log('Drug ID                  | Drug-Drug | Nutrient | Co-Rx Classes');
  console.log('-------------------------|-----------|----------|---------------');

  for (const drug of ADHD_DRUG_MAPPINGS) {
    const data = allInteractions[drug.drugId];
    const drugCount = data.drugInteractions?.length || 0;
    const nutrientCount = data.nutrientInteractions?.length || 0;
    const coRxCount = data.commonCoprescribed?.length || 0;

    console.log(
      `${drug.drugId.padEnd(24)} | ${String(drugCount).padStart(9)} | ${String(nutrientCount).padStart(8)} | ${coRxCount}`
    );
  }

  console.log('\n📁 Output files:');
  console.log(`   - ${cacheFile}`);
  console.log('\n✨ Done!');
}

main().catch(console.error);
