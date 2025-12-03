import type { APIRoute } from 'astro';
import { getDrugs, getLocalizedValue, getLocalizedArray, type Drug, type Lang } from '../../../../lib/data';

export const prerender = false;

const VALID_LANGS = ['en', 'zh', 'zh-TW', 'ja'] as const;

function isValidLang(lang: string): lang is Lang {
  return VALID_LANGS.includes(lang as Lang);
}

// Helper to localize a drug object based on language
function localizeDrug(drug: Drug, lang: Lang) {
  return {
    id: drug.id,
    genericName: getLocalizedValue(drug.genericName, lang),
    brandNames: drug.brandNames,
    drugClass: drug.drugClass,
    category: drug.category,
    controlledSubstance: drug.controlledSubstance,
    schedule: drug.schedule,
    activeIngredient: drug.activeIngredient ? getLocalizedValue(drug.activeIngredient, lang) : undefined,
    mechanismOfAction: drug.mechanismOfAction ? getLocalizedValue(drug.mechanismOfAction, lang) : undefined,
    neurotransmittersAffected: drug.neurotransmittersAffected,
    forms: drug.forms?.map(form => ({
      type: form.type,
      typeLabel: form.typeLabel ? getLocalizedValue(form.typeLabel, lang) : undefined,
      releaseType: form.releaseType,
      releaseTypeLabel: form.releaseTypeLabel ? getLocalizedValue(form.releaseTypeLabel, lang) : undefined,
      brandName: form.brandName,
      strengths: form.strengths,
      durationHours: form.durationHours,
      notes: form.notes ? getLocalizedValue(form.notes, lang) : undefined,
    })),
    onsetMinutes: drug.onsetMinutes,
    peakEffectHours: drug.peakEffectHours,
    durationHours: drug.durationHours,
    contraindications: drug.contraindications ? getLocalizedArray(drug.contraindications, lang) : undefined,
    blackBoxWarnings: drug.blackBoxWarnings ? getLocalizedArray(drug.blackBoxWarnings, lang) : undefined,
    pregnancyCategory: drug.pregnancyCategory,
    foodInteractions: drug.foodInteractions ? getLocalizedValue(drug.foodInteractions, lang) : undefined,
    typicalDosing: drug.typicalDosing ? {
      children: drug.typicalDosing.children ? {
        startingDose: drug.typicalDosing.children.startingDose,
        maxDose: drug.typicalDosing.children.maxDose,
        notes: drug.typicalDosing.children.notes ? getLocalizedValue(drug.typicalDosing.children.notes, lang) : undefined,
      } : undefined,
      adults: drug.typicalDosing.adults ? {
        startingDose: drug.typicalDosing.adults.startingDose,
        maxDose: drug.typicalDosing.adults.maxDose,
        notes: drug.typicalDosing.adults.notes ? getLocalizedValue(drug.typicalDosing.adults.notes, lang) : undefined,
      } : undefined,
    } : undefined,
    approvals: drug.approvals?.map(approval => ({
      region: approval.region,
      agency: approval.agency,
      year: approval.year,
      approvedAges: approval.approvedAges ? getLocalizedValue(approval.approvedAges, lang) : undefined,
      indications: approval.indications ? getLocalizedArray(approval.indications, lang) : undefined,
      available: approval.available,
      notes: approval.notes ? getLocalizedValue(approval.notes, lang) : undefined,
    })),
    travelRules: drug.travelRules ? {
      generalAdvice: drug.travelRules.generalAdvice ? getLocalizedValue(drug.travelRules.generalAdvice, lang) : undefined,
      requiredDocumentation: drug.travelRules.requiredDocumentation?.map(doc => ({
        type: doc.type,
        typeLabel: doc.typeLabel ? getLocalizedValue(doc.typeLabel, lang) : undefined,
        notes: doc.notes ? getLocalizedValue(doc.notes, lang) : undefined,
      })),
      maxPersonalSupply: drug.travelRules.maxPersonalSupply,
      crossBorderRules: drug.travelRules.crossBorderRules?.map(rule => ({
        fromRegion: rule.fromRegion,
        toRegion: rule.toRegion,
        status: rule.status,
        statusLabel: rule.statusLabel ? getLocalizedValue(rule.statusLabel, lang) : undefined,
        requirements: rule.requirements ? getLocalizedArray(rule.requirements, lang) : undefined,
        maxSupply: rule.maxSupply,
        notes: rule.notes ? getLocalizedValue(rule.notes, lang) : undefined,
        sources: rule.sources,
      })),
    } : undefined,
    specialConsiderations: drug.specialConsiderations ? {
      cardiacRisk: drug.specialConsiderations.cardiacRisk ? getLocalizedValue(drug.specialConsiderations.cardiacRisk, lang) : undefined,
      abuseRisk: drug.specialConsiderations.abuseRisk ? getLocalizedValue(drug.specialConsiderations.abuseRisk, lang) : undefined,
      withdrawalNotes: drug.specialConsiderations.withdrawalNotes ? getLocalizedValue(drug.specialConsiderations.withdrawalNotes, lang) : undefined,
      monitoringRequired: drug.specialConsiderations.monitoringRequired ? getLocalizedValue(drug.specialConsiderations.monitoringRequired, lang) : undefined,
    } : undefined,
    lastUpdated: drug.lastUpdated,
    sources: drug.sources,
    notes: drug.notes ? getLocalizedValue(drug.notes, lang) : undefined,
  };
}

export const GET: APIRoute = async ({ url }) => {
  try {
    const lang = url.searchParams.get('lang') || 'en';
    const drugClass = url.searchParams.get('class');
    const category = url.searchParams.get('category');
    const region = url.searchParams.get('region');

    if (!isValidLang(lang)) {
      return new Response(JSON.stringify({
        error: 'Invalid language',
        message: `Language must be one of: ${VALID_LANGS.join(', ')}`,
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let drugs = getDrugs();

    // Apply filters
    if (drugClass) {
      drugs = drugs.filter(d => d.drugClass === drugClass);
    }
    if (category) {
      drugs = drugs.filter(d => d.category === category);
    }
    if (region) {
      drugs = drugs.filter(d => d.approvals?.some(a => a.region === region && a.available));
    }

    const localizedDrugs = drugs.map(drug => localizeDrug(drug, lang));

    return new Response(JSON.stringify({
      count: localizedDrugs.length,
      data: localizedDrugs,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error fetching drugs:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: 'Failed to fetch drugs data',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
