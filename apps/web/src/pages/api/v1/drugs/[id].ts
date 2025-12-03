import type { APIRoute } from 'astro';
import { getDrug, getLocalizedValue, getLocalizedArray, type Drug, type Lang } from '../../../../lib/data';

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
    sideEffects: drug.sideEffects ? {
      common: drug.sideEffects.common?.map(se => ({
        name: getLocalizedValue(se.name, lang),
        frequency: se.frequency,
        notes: se.notes ? getLocalizedValue(se.notes, lang) : undefined,
      })),
      uncommon: drug.sideEffects.uncommon?.map(se => ({
        name: getLocalizedValue(se.name, lang),
        frequency: se.frequency,
        notes: se.notes ? getLocalizedValue(se.notes, lang) : undefined,
      })),
      serious: drug.sideEffects.serious?.map(se => ({
        name: getLocalizedValue(se.name, lang),
        frequency: se.frequency,
        notes: se.notes ? getLocalizedValue(se.notes, lang) : undefined,
      })),
    } : undefined,
    contraindications: drug.contraindications ? getLocalizedArray(drug.contraindications, lang) : undefined,
    drugInteractions: drug.drugInteractions?.map(di => ({
      drug: getLocalizedValue(di.drug, lang),
      severity: di.severity,
      effect: getLocalizedValue(di.effect, lang),
    })),
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
    costEstimate: drug.costEstimate,
    storageRequirements: drug.storageRequirements ? getLocalizedValue(drug.storageRequirements, lang) : undefined,
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
    chemicalStructure: drug.chemicalStructure,
    // OpenFDA Data
    fdaData: drug.fdaData ? {
      applicationNumbers: drug.fdaData.applicationNumbers,
      splSetId: drug.fdaData.splSetId,
      splId: drug.fdaData.splId,
      rxcui: drug.fdaData.rxcui,
      pharmacologicClass: drug.fdaData.pharmacologicClass,
      boxedWarning: drug.fdaData.boxedWarning ? getLocalizedValue(drug.fdaData.boxedWarning, lang) : undefined,
      fdaIndications: drug.fdaData.fdaIndications ? getLocalizedValue(drug.fdaData.fdaIndications, lang) : undefined,
      abuseAndDependence: drug.fdaData.abuseAndDependence ? {
        controlledSubstanceClass: drug.fdaData.abuseAndDependence.controlledSubstanceClass,
        abuse: drug.fdaData.abuseAndDependence.abuse ? getLocalizedValue(drug.fdaData.abuseAndDependence.abuse, lang) : undefined,
        dependence: drug.fdaData.abuseAndDependence.dependence ? getLocalizedValue(drug.fdaData.abuseAndDependence.dependence, lang) : undefined,
      } : undefined,
      labelEffectiveDate: drug.fdaData.labelEffectiveDate,
      fdaLabelUrl: drug.fdaData.fdaLabelUrl,
    } : undefined,
    // FAERS Data
    faersData: drug.faersData ? {
      totalReports: drug.faersData.totalReports,
      seriousReports: drug.faersData.seriousReports,
      topReactions: drug.faersData.topReactions?.map(r => ({
        reaction: getLocalizedValue(r.reaction, lang),
        reportCount: r.reportCount,
        percentage: r.percentage,
      })),
      demographics: drug.faersData.demographics,
      outcomes: drug.faersData.outcomes,
      dataRange: drug.faersData.dataRange,
      lastUpdated: drug.faersData.lastUpdated,
    } : undefined,
    lastUpdated: drug.lastUpdated,
    sources: drug.sources,
    notes: drug.notes ? getLocalizedValue(drug.notes, lang) : undefined,
  };
}

export const GET: APIRoute = async ({ params, url }) => {
  try {
    const { id } = params;
    const lang = url.searchParams.get('lang') || 'en';

    if (!id) {
      return new Response(JSON.stringify({
        error: 'Missing parameter',
        message: 'Drug ID is required',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!isValidLang(lang)) {
      return new Response(JSON.stringify({
        error: 'Invalid language',
        message: `Language must be one of: ${VALID_LANGS.join(', ')}`,
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const drug = getDrug(id);

    if (!drug) {
      return new Response(JSON.stringify({
        error: 'Not found',
        message: `Drug with ID "${id}" not found`,
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const localizedDrug = localizeDrug(drug, lang);

    return new Response(JSON.stringify({
      data: localizedDrug,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error fetching drug:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: 'Failed to fetch drug data',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
