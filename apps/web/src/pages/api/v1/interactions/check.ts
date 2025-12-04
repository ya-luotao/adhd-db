import type { APIRoute } from 'astro';
import { getDrug, getDrugs, getLocalizedValue } from '../../../../lib/data';
import type { Lang } from '../../../../i18n/translations';

export const prerender = false;

// Import interaction data from drugbank package
// For now, we include a minimal version here for the API
// This will be enhanced when the drugbank package is installed

interface DrugInteraction {
  interactingSubstance: string;
  substanceType: 'drug' | 'drug_class' | 'food' | 'nutrient';
  severity: 'major' | 'moderate' | 'minor' | 'unknown';
  mechanism?: string;
  effect: string;
  recommendation?: string;
  evidenceLevel?: string;
}

interface NutrientInteraction {
  nutrient: string;
  nutrientType: 'vitamin' | 'mineral' | 'food' | 'supplement' | 'beverage';
  effect: string;
  severity: 'major' | 'moderate' | 'minor';
  timing?: string;
  recommendation?: string;
}

// Common drug class interactions for ADHD medications
const COMMON_DRUG_CLASS_INTERACTIONS: Record<string, {
  label: string;
  severity: 'major' | 'moderate' | 'minor';
  affectedDrugs: string[];
  note: string;
}> = {
  MAOI: {
    label: 'MAO Inhibitors',
    severity: 'major',
    affectedDrugs: ['methylphenidate', 'amphetamine-mixed-salts', 'lisdexamfetamine', 'atomoxetine', 'viloxazine'],
    note: 'Contraindicated. Risk of hypertensive crisis. Wait 14 days after stopping MAOI.',
  },
  SSRI: {
    label: 'SSRIs',
    severity: 'moderate',
    affectedDrugs: ['methylphenidate', 'amphetamine-mixed-salts', 'lisdexamfetamine', 'atomoxetine'],
    note: 'Increased risk of serotonin syndrome. Monitor for agitation, confusion, rapid heart rate.',
  },
  SNRI: {
    label: 'SNRIs',
    severity: 'moderate',
    affectedDrugs: ['methylphenidate', 'amphetamine-mixed-salts', 'lisdexamfetamine', 'atomoxetine'],
    note: 'Additive cardiovascular effects. Monitor blood pressure and heart rate.',
  },
  TCA: {
    label: 'Tricyclic Antidepressants',
    severity: 'moderate',
    affectedDrugs: ['methylphenidate', 'amphetamine-mixed-salts', 'lisdexamfetamine', 'clonidine'],
    note: 'Stimulants may increase TCA levels. Clonidine effectiveness may be reduced.',
  },
  'beta-blocker': {
    label: 'Beta-Blockers',
    severity: 'major',
    affectedDrugs: ['clonidine'],
    note: 'Risk of rebound hypertension if clonidine stopped abruptly. Taper carefully.',
  },
  CYP2D6: {
    label: 'CYP2D6 Inhibitors',
    severity: 'major',
    affectedDrugs: ['atomoxetine'],
    note: 'Up to 6-10 fold increase in atomoxetine levels. Start with lower dose.',
  },
  CYP3A4: {
    label: 'CYP3A4 Modulators',
    severity: 'major',
    affectedDrugs: ['guanfacine'],
    note: 'Inhibitors: reduce guanfacine by 50%. Inducers: may need to double dose.',
  },
  CYP1A2: {
    label: 'CYP1A2 Substrates',
    severity: 'major',
    affectedDrugs: ['viloxazine'],
    note: 'Viloxazine strongly inhibits CYP1A2. Avoid theophylline, reduce caffeine.',
  },
};

// Nutrient interactions relevant to ADHD drugs
const NUTRIENT_WARNINGS: NutrientInteraction[] = [
  {
    nutrient: 'Vitamin C',
    nutrientType: 'vitamin',
    effect: 'Acidifies urine, increases amphetamine excretion, reduces effectiveness',
    severity: 'moderate',
    timing: 'Take 2+ hours apart',
    recommendation: 'Avoid large doses of citrus or vitamin C supplements near medication time',
  },
  {
    nutrient: 'Caffeine',
    nutrientType: 'beverage',
    effect: 'Additive CNS stimulation, increased anxiety and cardiovascular effects',
    severity: 'moderate',
    recommendation: 'Limit caffeine intake while on stimulant medications',
  },
  {
    nutrient: 'Grapefruit',
    nutrientType: 'food',
    effect: 'Inhibits CYP3A4, increases guanfacine levels',
    severity: 'moderate',
    timing: 'Avoid completely',
    recommendation: 'Avoid grapefruit products while taking guanfacine',
  },
  {
    nutrient: 'Alcohol',
    nutrientType: 'beverage',
    effect: 'Masks stimulant intoxication, worsens ADHD symptoms, cardiovascular strain',
    severity: 'major',
    timing: 'Avoid',
    recommendation: 'Avoid alcohol while taking ADHD medications',
  },
];

function getNutrientWarningsForDrug(drugId: string): NutrientInteraction[] {
  const drug = getDrug(drugId);
  if (!drug) return [];

  const warnings: NutrientInteraction[] = [];

  // Vitamin C and Caffeine mainly affect stimulants
  if (drug.drugClass === 'stimulant') {
    warnings.push(
      NUTRIENT_WARNINGS.find(n => n.nutrient === 'Vitamin C')!,
      NUTRIENT_WARNINGS.find(n => n.nutrient === 'Caffeine')!
    );
  }

  // Grapefruit specifically affects guanfacine
  if (drugId === 'guanfacine') {
    warnings.push(NUTRIENT_WARNINGS.find(n => n.nutrient === 'Grapefruit')!);
  }

  // Alcohol affects all
  warnings.push(NUTRIENT_WARNINGS.find(n => n.nutrient === 'Alcohol')!);

  return warnings.filter(Boolean);
}

function checkDrugClassInteraction(
  drugId: string,
  drugClass: string
): { found: boolean; interaction?: typeof COMMON_DRUG_CLASS_INTERACTIONS[string] } {
  const classKey = drugClass.toUpperCase();
  const interaction = COMMON_DRUG_CLASS_INTERACTIONS[classKey] ||
    Object.entries(COMMON_DRUG_CLASS_INTERACTIONS).find(
      ([key, val]) => val.label.toLowerCase().includes(drugClass.toLowerCase()) ||
        key.toLowerCase() === drugClass.toLowerCase()
    )?.[1];

  if (interaction && interaction.affectedDrugs.includes(drugId)) {
    return { found: true, interaction };
  }

  return { found: false };
}

export const GET: APIRoute = async ({ url }) => {
  try {
    const drugsParam = url.searchParams.get('drugs');
    const checkClass = url.searchParams.get('class');
    const lang = (url.searchParams.get('lang') || 'en') as Lang;

    if (!drugsParam && !checkClass) {
      const allDrugs = getDrugs();
      return new Response(JSON.stringify({
        error: 'Missing parameter',
        message: 'Use ?drugs=drug1,drug2 to check interactions between drugs, or ?drugs=drug&class=SSRI to check drug class interactions',
        usage: {
          multiDrug: '/api/v1/interactions/check?drugs=methylphenidate,sertraline',
          drugClass: '/api/v1/interactions/check?drugs=methylphenidate&class=SSRI',
          nutrientInfo: '/api/v1/interactions/check?drugs=amphetamine-mixed-salts',
        },
        availableDrugs: allDrugs.map(d => ({
          id: d.id,
          name: getLocalizedValue(d.genericName, lang),
        })),
        availableClasses: Object.keys(COMMON_DRUG_CLASS_INTERACTIONS),
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const drugIds = drugsParam?.split(',').map(d => d.trim().toLowerCase()) || [];
    const results: {
      drugId: string;
      drugName: string;
      drugClass: string;
      interactionsWith: Array<{
        drug: string;
        severity: string;
        effect: string;
        recommendation?: string;
      }>;
      classInteractions: Array<{
        class: string;
        severity: string;
        note: string;
      }>;
      nutrientWarnings: NutrientInteraction[];
    }[] = [];

    // Process each drug
    for (const drugId of drugIds) {
      const drug = getDrug(drugId);
      if (!drug) continue;

      const drugName = getLocalizedValue(drug.genericName, lang);
      const interactionsWith: typeof results[0]['interactionsWith'] = [];
      const classInteractions: typeof results[0]['classInteractions'] = [];

      // Check class interactions if specified
      if (checkClass) {
        const classCheck = checkDrugClassInteraction(drugId, checkClass);
        if (classCheck.found && classCheck.interaction) {
          classInteractions.push({
            class: classCheck.interaction.label,
            severity: classCheck.interaction.severity,
            note: classCheck.interaction.note,
          });
        }
      }

      // Check for interactions between selected drugs
      for (const otherDrugId of drugIds) {
        if (otherDrugId === drugId) continue;

        const otherDrug = getDrug(otherDrugId);
        if (!otherDrug) continue;

        // Check if there are known interactions in the drug data
        const knownInteraction = drug.drugInteractions?.find(i => {
          const interactingName = typeof i.drug === 'string' ? i.drug : i.drug.en || '';
          return interactingName.toLowerCase().includes(otherDrugId.replace(/-/g, ' '));
        });

        if (knownInteraction) {
          interactionsWith.push({
            drug: getLocalizedValue(otherDrug.genericName, lang),
            severity: knownInteraction.severity,
            effect: getLocalizedValue(knownInteraction.effect as any, lang),
            recommendation: undefined,
          });
        }
      }

      // Get nutrient warnings
      const nutrientWarnings = getNutrientWarningsForDrug(drugId);

      results.push({
        drugId,
        drugName,
        drugClass: drug.drugClass,
        interactionsWith,
        classInteractions,
        nutrientWarnings,
      });
    }

    // Calculate summary
    const majorInteractions = results.flatMap(r => [
      ...r.interactionsWith.filter(i => i.severity === 'major'),
      ...r.classInteractions.filter(c => c.severity === 'major'),
      ...r.nutrientWarnings.filter(n => n.severity === 'major'),
    ]);

    const moderateInteractions = results.flatMap(r => [
      ...r.interactionsWith.filter(i => i.severity === 'moderate'),
      ...r.classInteractions.filter(c => c.severity === 'moderate'),
      ...r.nutrientWarnings.filter(n => n.severity === 'moderate'),
    ]);

    const response = {
      drugs: drugIds,
      checkClass: checkClass || null,
      results,
      summary: {
        majorInteractions: majorInteractions.length,
        moderateInteractions: moderateInteractions.length,
        totalWarnings: majorInteractions.length + moderateInteractions.length,
        overallRisk: majorInteractions.length > 0 ? 'high' : moderateInteractions.length > 0 ? 'moderate' : 'low',
      },
      metadata: {
        source: 'ADHD-DB Drug Interaction Database',
        lastUpdated: new Date().toISOString(),
        disclaimer: 'This information is for educational purposes only and should not replace professional medical advice. Always consult a healthcare provider before making medication changes.',
      },
    };

    return new Response(JSON.stringify({ data: response }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error checking interactions:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: 'Failed to check drug interactions',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
