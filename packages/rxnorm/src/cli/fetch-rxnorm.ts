#!/usr/bin/env tsx
/**
 * CLI tool to fetch RxNorm data for ADHD drugs
 * Usage: pnpm --filter @adhd-db/rxnorm fetch
 */

import * as fs from 'fs';
import * as path from 'path';
import { parse, stringify } from 'yaml';
import { getRxNavClient } from '../client.js';
import { processRxNormData, toYamlFormat } from '../processor.js';
import { ADHD_DRUG_RXNORM_MAPPINGS } from '../types.js';

const DRUGS_DIR = path.resolve(process.cwd(), '../../packages/data/drugs');
const CACHE_DIR = path.resolve(process.cwd(), 'cache');

async function main() {
  console.log('===========================================');
  console.log('  RxNorm Data Fetcher for ADHD-DB');
  console.log('===========================================\n');

  // Ensure cache directory exists
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }

  const client = getRxNavClient();
  const results: Record<string, unknown> = {};

  for (const mapping of ADHD_DRUG_RXNORM_MAPPINGS) {
    try {
      const rxnormData = await processRxNormData(mapping, client);

      if (rxnormData) {
        results[mapping.drugId] = rxnormData;

        // Update the drug YAML file
        const drugFilePath = path.join(DRUGS_DIR, `${mapping.drugId}.yaml`);

        if (fs.existsSync(drugFilePath)) {
          console.log(`\nUpdating ${drugFilePath}...`);

          // Read existing drug data
          const existingContent = fs.readFileSync(drugFilePath, 'utf-8');
          const existingData = parse(existingContent) as Record<string, unknown>;

          // Convert RxNorm data to YAML format and merge
          const rxnormYaml = toYamlFormat(rxnormData);
          const updatedData = { ...existingData, ...rxnormYaml };

          // Write back
          const yamlContent = stringify(updatedData, {
            lineWidth: 0,  // Don't wrap lines
            nullStr: '',
          });

          fs.writeFileSync(drugFilePath, yamlContent);
          console.log(`  Updated successfully!`);
        } else {
          console.warn(`  Drug file not found: ${drugFilePath}`);
        }
      }
    } catch (error) {
      console.error(`\nError processing ${mapping.drugId}:`, error);
    }
  }

  // Save raw results to cache
  const cacheFilePath = path.join(CACHE_DIR, 'rxnorm-data.json');
  fs.writeFileSync(cacheFilePath, JSON.stringify(results, null, 2));
  console.log(`\n\nCached raw data to: ${cacheFilePath}`);

  console.log('\n===========================================');
  console.log('  RxNorm data fetch complete!');
  console.log('===========================================');
}

main().catch(console.error);
