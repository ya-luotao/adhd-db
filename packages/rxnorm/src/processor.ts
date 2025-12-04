/**
 * RxNorm Data Processor
 * Transforms RxNav API data into ADHD-DB format
 */

import { getRxNavClient, RxNavClient } from './client.js';
import type {
  RxNormDrugData,
  RxNormRxcuiMapping,
  RxNormBrandMapping,
  RxNormSynonym,
  RxNormRelatedDrug,
  ADHDDrugRxNormMapping,
  RxNormConcept,
  RxNormTermType,
} from './types.js';

/**
 * Human-readable descriptions for term types
 */
const TTY_DESCRIPTIONS: Record<RxNormTermType, string> = {
  'IN': 'Base ingredient',
  'PIN': 'Precise ingredient (includes salt form)',
  'MIN': 'Multiple ingredients',
  'SCDC': 'Ingredient + strength',
  'SCDF': 'Ingredient + dose form',
  'SCDG': 'Dose form group',
  'SCD': 'Clinical drug (ingredient + strength + form)',
  'SBDC': 'Branded ingredient + strength',
  'SBDF': 'Branded ingredient + dose form',
  'SBDG': 'Branded dose form group',
  'SBD': 'Branded drug (brand + strength + form)',
  'BN': 'Brand name',
  'GPCK': 'Generic pack',
  'BPCK': 'Brand pack',
};

/**
 * Process RxNorm data for a drug mapping
 */
export async function processRxNormData(
  mapping: ADHDDrugRxNormMapping,
  client?: RxNavClient
): Promise<RxNormDrugData | null> {
  const rxnav = client || getRxNavClient();

  console.log(`\nProcessing RxNorm data for: ${mapping.drugId}`);

  // Step 1: Find the ingredient RxCUI
  let ingredientConcept: RxNormConcept | null = null;

  for (const searchTerm of mapping.searchTerms) {
    console.log(`  Searching for: ${searchTerm}`);
    const info = await rxnav.getDrugInfo(searchTerm);

    if (info.ingredient) {
      ingredientConcept = info.ingredient;
      console.log(`  Found ingredient: ${ingredientConcept.name} (RxCUI: ${ingredientConcept.rxcui})`);
      break;
    }
  }

  if (!ingredientConcept) {
    console.warn(`  No ingredient found for ${mapping.drugId}`);
    return null;
  }

  // Step 2: Get all related concepts
  const allRelated = await rxnav.getAllRelated(ingredientConcept.rxcui);

  // Step 3: Build RxCUI mappings
  const rxcuiMappings: RxNormRxcuiMapping[] = [];

  // Add the ingredient itself
  rxcuiMappings.push({
    rxcui: ingredientConcept.rxcui,
    name: ingredientConcept.name,
    tty: ingredientConcept.tty,
    description: TTY_DESCRIPTIONS[ingredientConcept.tty],
  });

  // Add related concepts
  for (const [tty, concepts] of allRelated) {
    for (const concept of concepts) {
      // Avoid duplicates and limit to important types
      const importantTypes: RxNormTermType[] = ['PIN', 'SCD', 'SBD', 'SCDF', 'SBDF', 'BN'];
      if (importantTypes.includes(tty) && !rxcuiMappings.some(m => m.rxcui === concept.rxcui)) {
        rxcuiMappings.push({
          rxcui: concept.rxcui,
          name: concept.name,
          tty: concept.tty,
          description: TTY_DESCRIPTIONS[concept.tty],
        });
      }
    }
  }

  // Step 4: Build brand mappings
  const brandMappings: RxNormBrandMapping[] = [];
  const brandConcepts = allRelated.get('BN') || [];

  for (const brand of brandConcepts) {
    brandMappings.push({
      brandName: brand.name,
      rxcui: brand.rxcui,
      region: 'US',  // RxNorm is primarily US-focused
    });
  }

  // Add known brand names that might not be in RxNorm
  if (mapping.brandNames) {
    for (const brandName of mapping.brandNames) {
      if (!brandMappings.some(b => b.brandName.toLowerCase() === brandName.toLowerCase())) {
        // Try to find RxCUI for this brand
        const rxcuis = await rxnav.findRxcuiByString(brandName);
        brandMappings.push({
          brandName,
          rxcui: rxcuis[0] || '',
          region: 'US',
        });
      }
    }
  }

  // Step 5: Build synonyms
  const synonyms: RxNormSynonym[] = [];

  // Add ingredient name variants
  const pinConcepts = allRelated.get('PIN') || [];
  for (const pin of pinConcepts) {
    if (pin.name !== ingredientConcept.name) {
      synonyms.push({
        name: pin.name,
        type: 'chemical',
        source: 'RxNorm',
      });
    }
  }

  // Add brand names as synonyms
  for (const brand of brandConcepts) {
    synonyms.push({
      name: brand.name,
      type: 'brand',
      source: 'RxNorm',
    });
  }

  // Add the generic name
  synonyms.push({
    name: ingredientConcept.name,
    type: 'generic',
    source: 'RxNorm',
  });

  // Step 6: Build related drugs list
  const relatedDrugs: RxNormRelatedDrug[] = [];

  // Clinical drugs (specific formulations)
  const scdConcepts = allRelated.get('SCD') || [];
  for (const scd of scdConcepts.slice(0, 20)) {  // Limit to prevent too many entries
    relatedDrugs.push({
      rxcui: scd.rxcui,
      name: scd.name,
      tty: scd.tty,
      relationship: 'clinical_drug',
    });
  }

  // Branded drugs
  const sbdConcepts = allRelated.get('SBD') || [];
  for (const sbd of sbdConcepts.slice(0, 20)) {
    relatedDrugs.push({
      rxcui: sbd.rxcui,
      name: sbd.name,
      tty: sbd.tty,
      relationship: 'branded_drug',
    });
  }

  // Drug forms
  const scdfConcepts = allRelated.get('SCDF') || [];
  for (const scdf of scdfConcepts) {
    relatedDrugs.push({
      rxcui: scdf.rxcui,
      name: scdf.name,
      tty: scdf.tty,
      relationship: 'drug_form',
    });
  }

  console.log(`  Found ${rxcuiMappings.length} RxCUI mappings`);
  console.log(`  Found ${brandMappings.length} brand mappings`);
  console.log(`  Found ${synonyms.length} synonyms`);
  console.log(`  Found ${relatedDrugs.length} related drugs`);

  return {
    ingredientRxcui: ingredientConcept.rxcui,
    ingredientName: ingredientConcept.name,
    rxcuiMappings,
    brandMappings,
    synonyms,
    relatedDrugs,
    lastUpdated: new Date().toISOString().split('T')[0],
  };
}

/**
 * Process all ADHD drug mappings
 */
export async function processAllDrugs(
  mappings: ADHDDrugRxNormMapping[],
  client?: RxNavClient
): Promise<Map<string, RxNormDrugData>> {
  const results = new Map<string, RxNormDrugData>();
  const rxnav = client || getRxNavClient();

  for (const mapping of mappings) {
    try {
      const data = await processRxNormData(mapping, rxnav);
      if (data) {
        results.set(mapping.drugId, data);
      }
    } catch (error) {
      console.error(`Error processing ${mapping.drugId}:`, error);
    }
  }

  return results;
}

/**
 * Convert RxNorm data to YAML-friendly format for drug files
 */
export function toYamlFormat(data: RxNormDrugData): Record<string, unknown> {
  return {
    rxnormData: {
      ingredientRxcui: data.ingredientRxcui,
      ingredientName: data.ingredientName,

      rxcuiMappings: data.rxcuiMappings.map(m => ({
        rxcui: m.rxcui,
        name: m.name,
        tty: m.tty,
        description: m.description,
      })),

      brandMappings: data.brandMappings.map(b => ({
        brandName: b.brandName,
        rxcui: b.rxcui,
        ...(b.manufacturer ? { manufacturer: b.manufacturer } : {}),
        ...(b.region ? { region: b.region } : {}),
      })),

      synonyms: data.synonyms.map(s => ({
        name: s.name,
        type: s.type,
        ...(s.source ? { source: s.source } : {}),
      })),

      relatedDrugs: data.relatedDrugs.slice(0, 30).map(r => ({  // Limit for YAML readability
        rxcui: r.rxcui,
        name: r.name,
        tty: r.tty,
        relationship: r.relationship,
      })),

      lastUpdated: data.lastUpdated,
    },
  };
}

/**
 * Merge RxNorm data into existing drug data
 */
export function mergeWithDrugData(
  existingData: Record<string, unknown>,
  rxnormData: RxNormDrugData
): Record<string, unknown> {
  const yamlFormat = toYamlFormat(rxnormData);

  // Merge the rxnormData section
  return {
    ...existingData,
    ...yamlFormat,
  };
}
