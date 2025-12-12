import type { APIRoute } from 'astro';
import { getDrugs, getRegions, getCategoryList, getDrugClasses, getLocalizedValue, getLocalizedArray, type Drug, type Lang } from '../lib/data';

export const prerender = true;

function formatDrug(drug: Drug, lang: Lang = 'en'): string {
  const lines: string[] = [];

  // Header
  lines.push(`## ${getLocalizedValue(drug.genericName, lang)}`);
  lines.push('');
  lines.push(`ID: ${drug.id}`);
  lines.push(`Drug Class: ${drug.drugClass}`);
  lines.push(`Category: ${drug.category}`);
  lines.push(`Controlled Substance: ${drug.controlledSubstance ? 'Yes' : 'No'}`);

  // Brand names
  if (drug.brandNames && Object.keys(drug.brandNames).length > 0) {
    lines.push('');
    lines.push('### Brand Names by Region');
    for (const [region, brands] of Object.entries(drug.brandNames)) {
      if (brands && brands.length > 0) {
        lines.push(`- ${region}: ${brands.join(', ')}`);
      }
    }
  }

  // Schedule
  if (drug.schedule && Object.keys(drug.schedule).length > 0) {
    lines.push('');
    lines.push('### Controlled Substance Schedule');
    for (const [region, schedule] of Object.entries(drug.schedule)) {
      lines.push(`- ${region}: ${schedule}`);
    }
  }

  // Mechanism
  if (drug.mechanismOfAction) {
    lines.push('');
    lines.push('### Mechanism of Action');
    lines.push(getLocalizedValue(drug.mechanismOfAction, lang));
  }

  if (drug.neurotransmittersAffected && drug.neurotransmittersAffected.length > 0) {
    lines.push('');
    lines.push('### Neurotransmitters Affected');
    lines.push(drug.neurotransmittersAffected.join(', '));
  }

  // Forms
  if (drug.forms && drug.forms.length > 0) {
    lines.push('');
    lines.push('### Available Forms');
    for (const form of drug.forms) {
      const formName = form.typeLabel ? getLocalizedValue(form.typeLabel, lang) : form.type;
      const release = form.releaseTypeLabel ? getLocalizedValue(form.releaseTypeLabel, lang) : form.releaseType;
      let formLine = `- ${formName} (${release})`;
      if (form.brandName) formLine += ` - ${form.brandName}`;
      if (form.durationHours) formLine += ` - Duration: ${form.durationHours}h`;
      lines.push(formLine);
      if (form.strengths && form.strengths.length > 0) {
        lines.push(`  Strengths: ${form.strengths.join(', ')}`);
      }
    }
  }

  // Timing
  if (drug.onsetMinutes || drug.peakEffectHours || drug.durationHours) {
    lines.push('');
    lines.push('### Timing');
    if (drug.onsetMinutes) lines.push(`- Onset: ${drug.onsetMinutes} minutes`);
    if (drug.peakEffectHours) lines.push(`- Peak Effect: ${drug.peakEffectHours} hours`);
    if (drug.durationHours) lines.push(`- Duration: ${drug.durationHours} hours`);
  }

  // Side Effects
  if (drug.sideEffects) {
    lines.push('');
    lines.push('### Side Effects');
    if (drug.sideEffects.common && drug.sideEffects.common.length > 0) {
      lines.push('Common:');
      for (const se of drug.sideEffects.common) {
        const name = typeof se.name === 'string' ? se.name : getLocalizedValue(se.name, lang);
        lines.push(`- ${name}${se.frequency ? ` (${se.frequency})` : ''}`);
      }
    }
    if (drug.sideEffects.uncommon && drug.sideEffects.uncommon.length > 0) {
      lines.push('Uncommon:');
      for (const se of drug.sideEffects.uncommon) {
        const name = typeof se.name === 'string' ? se.name : getLocalizedValue(se.name, lang);
        lines.push(`- ${name}${se.frequency ? ` (${se.frequency})` : ''}`);
      }
    }
    if (drug.sideEffects.serious && drug.sideEffects.serious.length > 0) {
      lines.push('Serious:');
      for (const se of drug.sideEffects.serious) {
        const name = typeof se.name === 'string' ? se.name : getLocalizedValue(se.name, lang);
        lines.push(`- ${name}${se.frequency ? ` (${se.frequency})` : ''}`);
      }
    }
  }

  // Contraindications
  if (drug.contraindications) {
    const contras = getLocalizedArray(drug.contraindications, lang);
    if (contras.length > 0) {
      lines.push('');
      lines.push('### Contraindications');
      for (const c of contras) {
        lines.push(`- ${c}`);
      }
    }
  }

  // Warnings
  if (drug.blackBoxWarnings) {
    const warnings = getLocalizedArray(drug.blackBoxWarnings, lang);
    if (warnings.length > 0) {
      lines.push('');
      lines.push('### Black Box Warnings');
      for (const w of warnings) {
        lines.push(`- ${w}`);
      }
    }
  }

  // Drug Interactions
  if (drug.drugInteractions && drug.drugInteractions.length > 0) {
    lines.push('');
    lines.push('### Drug Interactions');
    for (const interaction of drug.drugInteractions) {
      const drugName = typeof interaction.drug === 'string' ? interaction.drug : getLocalizedValue(interaction.drug, lang);
      const effect = typeof interaction.effect === 'string' ? interaction.effect : getLocalizedValue(interaction.effect, lang);
      lines.push(`- ${drugName} (${interaction.severity}): ${effect}`);
    }
  }

  // Extended Interactions
  if (drug.interactionsData?.drugInteractions && drug.interactionsData.drugInteractions.length > 0) {
    lines.push('');
    lines.push('### Extended Drug Interactions');
    for (const interaction of drug.interactionsData.drugInteractions) {
      const substance = getLocalizedValue(interaction.interactingSubstance, lang);
      const effect = getLocalizedValue(interaction.effect, lang);
      const mechanism = interaction.mechanism ? getLocalizedValue(interaction.mechanism, lang) : '';
      lines.push(`- ${substance} (${interaction.severity}): ${effect}`);
      if (mechanism) lines.push(`  Mechanism: ${mechanism}`);
    }
  }

  // Nutrient Interactions
  if (drug.interactionsData?.nutrientInteractions && drug.interactionsData.nutrientInteractions.length > 0) {
    lines.push('');
    lines.push('### Nutrient/Food Interactions');
    for (const interaction of drug.interactionsData.nutrientInteractions) {
      const nutrient = getLocalizedValue(interaction.nutrient, lang);
      const effect = getLocalizedValue(interaction.effect, lang);
      lines.push(`- ${nutrient}: ${effect}`);
    }
  }

  // Dosing
  if (drug.typicalDosing) {
    lines.push('');
    lines.push('### Typical Dosing');
    if (drug.typicalDosing.children) {
      lines.push('Children:');
      if (drug.typicalDosing.children.startingDose) lines.push(`- Starting: ${drug.typicalDosing.children.startingDose}`);
      if (drug.typicalDosing.children.maxDose) lines.push(`- Maximum: ${drug.typicalDosing.children.maxDose}`);
    }
    if (drug.typicalDosing.adults) {
      lines.push('Adults:');
      if (drug.typicalDosing.adults.startingDose) lines.push(`- Starting: ${drug.typicalDosing.adults.startingDose}`);
      if (drug.typicalDosing.adults.maxDose) lines.push(`- Maximum: ${drug.typicalDosing.adults.maxDose}`);
    }
  }

  // Approvals
  if (drug.approvals && drug.approvals.length > 0) {
    lines.push('');
    lines.push('### Regional Approvals');
    for (const approval of drug.approvals) {
      const status = approval.available ? 'Available' : 'Not Available';
      lines.push(`- ${approval.region} (${approval.agency}): ${status}${approval.year ? ` since ${approval.year}` : ''}`);
      if (approval.indications) {
        const indications = getLocalizedArray(approval.indications, lang);
        if (indications.length > 0) {
          lines.push(`  Indications: ${indications.join('; ')}`);
        }
      }
    }
  }

  // Travel Rules
  if (drug.travelRules) {
    lines.push('');
    lines.push('### Travel Rules');
    if (drug.travelRules.generalAdvice) {
      lines.push(getLocalizedValue(drug.travelRules.generalAdvice, lang));
    }
    if (drug.travelRules.maxPersonalSupply?.default) {
      lines.push(`Maximum Personal Supply: ${drug.travelRules.maxPersonalSupply.default}`);
    }
    if (drug.travelRules.crossBorderRules && drug.travelRules.crossBorderRules.length > 0) {
      lines.push('');
      lines.push('Cross-Border Rules:');
      for (const rule of drug.travelRules.crossBorderRules) {
        lines.push(`- ${rule.fromRegion} → ${rule.toRegion}: ${rule.status}`);
        if (rule.requirements) {
          const reqs = getLocalizedArray(rule.requirements, lang);
          if (reqs.length > 0) {
            lines.push(`  Requirements: ${reqs.join('; ')}`);
          }
        }
        if (rule.maxSupply) {
          lines.push(`  Max Supply: ${rule.maxSupply}`);
        }
      }
    }
  }

  // FDA Data
  if (drug.fdaData) {
    lines.push('');
    lines.push('### FDA Data');
    if (drug.fdaData.applicationNumbers && drug.fdaData.applicationNumbers.length > 0) {
      lines.push(`Application Numbers: ${drug.fdaData.applicationNumbers.join(', ')}`);
    }
    if (drug.fdaData.boxedWarning) {
      lines.push(`Boxed Warning: ${getLocalizedValue(drug.fdaData.boxedWarning, lang)}`);
    }
    if (drug.fdaData.fdaLabelUrl) {
      lines.push(`FDA Label: ${drug.fdaData.fdaLabelUrl}`);
    }
  }

  // Clinical Trials
  if (drug.clinicalTrialsData?.summary) {
    lines.push('');
    lines.push('### Clinical Trials');
    const summary = drug.clinicalTrialsData.summary;
    lines.push(`Total: ${summary.total || 0} | Recruiting: ${summary.recruiting || 0} | Completed: ${summary.completed || 0}`);
    if (drug.clinicalTrialsData.searchUrl) {
      lines.push(`Search: ${drug.clinicalTrialsData.searchUrl}`);
    }
  }

  // RxNorm
  if (drug.rxnormData) {
    lines.push('');
    lines.push('### RxNorm Data');
    lines.push(`Ingredient RxCUI: ${drug.rxnormData.ingredientRxcui}`);
    lines.push(`Ingredient Name: ${drug.rxnormData.ingredientName}`);
    if (drug.rxnormData.synonyms && drug.rxnormData.synonyms.length > 0) {
      const genericSynonyms = drug.rxnormData.synonyms.filter(s => s.type === 'generic').map(s => s.name);
      if (genericSynonyms.length > 0) {
        lines.push(`Synonyms: ${genericSynonyms.join(', ')}`);
      }
    }
  }

  // Sources
  if (drug.sources && drug.sources.length > 0) {
    lines.push('');
    lines.push('### Sources');
    for (const source of drug.sources) {
      lines.push(`- ${source}`);
    }
  }

  lines.push('');
  lines.push('---');
  lines.push('');

  return lines.join('\n');
}

export const GET: APIRoute = async () => {
  const drugs = getDrugs();
  const regionsData = getRegions();
  const categories = getCategoryList();
  const drugClasses = getDrugClasses();

  const regions = Object.keys(regionsData.regions);
  const lang: Lang = 'en';

  const sections: string[] = [];

  // Header
  sections.push('# ADHD-DB Full Database Export');
  sections.push('');
  sections.push('> Complete ADHD medication database with regulatory data');
  sections.push('');
  sections.push(`Generated: ${new Date().toISOString()}`);
  sections.push(`Total Drugs: ${drugs.length}`);
  sections.push(`Regions: ${regions.join(', ')}`);
  sections.push('');
  sections.push('---');
  sections.push('');

  // Drug Classes Overview
  sections.push('# Drug Classes');
  sections.push('');
  for (const [id, dc] of Object.entries(drugClasses)) {
    sections.push(`## ${getLocalizedValue(dc.name, lang)}`);
    sections.push(getLocalizedValue(dc.description, lang));
    sections.push(`Categories: ${dc.categories.join(', ')}`);
    sections.push('');
  }
  sections.push('---');
  sections.push('');

  // Categories Overview
  sections.push('# Categories');
  sections.push('');
  for (const cat of categories) {
    sections.push(`## ${getLocalizedValue(cat.name, lang)}`);
    sections.push(`ID: ${cat.id}`);
    sections.push(`Drug Class: ${cat.drugClass}`);
    sections.push(getLocalizedValue(cat.description, lang));
    if (cat.mechanism) {
      sections.push(`Mechanism: ${getLocalizedValue(cat.mechanism, lang)}`);
    }
    if (cat.commonBrands && cat.commonBrands.length > 0) {
      sections.push(`Common Brands: ${cat.commonBrands.join(', ')}`);
    }
    sections.push('');
  }
  sections.push('---');
  sections.push('');

  // Drugs
  sections.push('# Drugs');
  sections.push('');

  for (const drug of drugs) {
    sections.push(formatDrug(drug, lang));
  }

  const content = sections.join('\n');

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
