#!/usr/bin/env node
/**
 * CLI script to fetch OpenFDA data for all ADHD drugs
 * Usage: pnpm --filter @adhd-db/openfda fetch
 */

import fs from 'node:fs';
import path from 'node:path';
import { stringify } from 'yaml';
import { OpenFDAClient } from '../client.js';
import { fetchDrugData, mergeLabels } from '../processor.js';
import { ADHD_DRUG_MAPPINGS } from '../types.js';

const CACHE_DIR = path.resolve(import.meta.dirname, '../../cache');

async function main() {
  console.log('OpenFDA Data Fetcher for ADHD-DB');
  console.log('='.repeat(50));
  console.log();

  // Ensure cache directory exists
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }

  const client = new OpenFDAClient();

  for (const mapping of ADHD_DRUG_MAPPINGS) {
    console.log(`\n[${mapping.drugId}]`);
    console.log('-'.repeat(40));

    try {
      const { labels, adverseEvents } = await fetchDrugData(client, mapping);

      // Get the best/merged label
      const mergedLabel = mergeLabels(labels);

      // Save label data
      if (mergedLabel) {
        const labelPath = path.join(CACHE_DIR, `${mapping.drugId}-label.yaml`);
        fs.writeFileSync(labelPath, stringify(mergedLabel));
        console.log(`  Saved label to: ${labelPath}`);
      }

      // Save adverse events data
      const eventsPath = path.join(CACHE_DIR, `${mapping.drugId}-events.yaml`);
      fs.writeFileSync(eventsPath, stringify(adverseEvents));
      console.log(`  Saved events to: ${eventsPath}`);

      // Save raw labels for reference
      if (labels.length > 0) {
        const rawPath = path.join(CACHE_DIR, `${mapping.drugId}-labels-raw.yaml`);
        fs.writeFileSync(rawPath, stringify(labels));
        console.log(`  Saved ${labels.length} raw labels to: ${rawPath}`);
      }
    } catch (error) {
      console.error(`  Error fetching data: ${error}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('Done! Cached data saved to:', CACHE_DIR);
}

main().catch(console.error);
