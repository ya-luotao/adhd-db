/**
 * DrugBank Interaction Data Processor
 * Transforms curated interaction data into drug YAML format
 */

import {
  type DrugInteraction,
  type InteractionsData,
  ADHD_DRUG_MAPPINGS,
  COMMON_DRUG_CLASSES,
  NUTRIENT_INTERACTIONS,
} from './types.js';

// ============================================
// Major Drug-Drug Interactions Database
// ============================================

/**
 * Curated major drug interactions for ADHD medications
 * Based on FDA labels, clinical guidelines, and DrugBank data
 */
const CURATED_DRUG_INTERACTIONS: Record<string, DrugInteraction[]> = {
  // Stimulant interactions (shared by methylphenidate, amphetamines, lisdexamfetamine)
  stimulant: [
    {
      interactingSubstance: {
        en: 'MAO Inhibitors',
        zh: '单胺氧化酶抑制剂',
        ja: 'MAO阻害薬',
        'zh-TW': '單胺氧化酶抑制劑'
      },
      substanceType: 'drug_class',
      severity: 'major',
      mechanism: {
        en: 'MAOIs prevent breakdown of monoamines. Combined with stimulants, can cause dangerous accumulation of norepinephrine and dopamine.',
        zh: 'MAOIs阻止单胺分解。与兴奋剂合用可导致去甲肾上腺素和多巴胺危险性蓄积。',
        ja: 'MAOIはモノアミンの分解を阻害。刺激薬との併用でノルエピネフリンとドパミンの危険な蓄積を引き起こす可能性。',
        'zh-TW': 'MAOIs阻止單胺分解。與興奮劑合用可導致去甲腎上腺素和多巴胺危險性蓄積。'
      },
      effect: {
        en: 'Risk of hypertensive crisis, hyperthermia, seizures, and death',
        zh: '高血压危象、高热、癫痫发作甚至死亡风险',
        ja: '高血圧クリーゼ、高体温、けいれん、死亡のリスク',
        'zh-TW': '高血壓危象、高熱、癲癇發作甚至死亡風險'
      },
      clinicalSignificance: {
        en: 'Absolutely contraindicated. Do not use within 14 days of MAOI.',
        zh: '绝对禁忌。停用MAOI后14天内禁用。',
        ja: '絶対禁忌。MAOI中止後14日以内は使用禁止。',
        'zh-TW': '絕對禁忌。停用MAOI後14天內禁用。'
      },
      recommendation: {
        en: 'Never combine. Wait at least 14 days after stopping MAOI before starting stimulant.',
        zh: '禁止合用。停用MAOI后至少等待14天再开始使用兴奋剂。',
        ja: '併用禁止。MAOI中止後、少なくとも14日間待ってから刺激薬を開始。',
        'zh-TW': '禁止合用。停用MAOI後至少等待14天再開始使用興奮劑。'
      },
      evidenceLevel: 'established',
      sources: [
        { url: 'https://dailymed.nlm.nih.gov/', name: 'DailyMed FDA Labels' }
      ]
    },
    {
      interactingSubstance: {
        en: 'Serotonergic Drugs',
        zh: '血清素能药物',
        ja: 'セロトニン作動薬',
        'zh-TW': '血清素能藥物'
      },
      substanceType: 'drug_class',
      severity: 'moderate',
      mechanism: {
        en: 'Stimulants may increase serotonin release. Combined with SSRIs/SNRIs increases serotonin syndrome risk.',
        zh: '兴奋剂可能增加血清素释放。与SSRIs/SNRIs合用增加血清素综合征风险。',
        ja: '刺激薬がセロトニン放出を増加させる可能性。SSRI/SNRIとの併用でセロトニン症候群リスクが増加。',
        'zh-TW': '興奮劑可能增加血清素釋放。與SSRIs/SNRIs合用增加血清素症候群風險。'
      },
      effect: {
        en: 'Serotonin syndrome: agitation, hyperthermia, tachycardia, hypertension',
        zh: '血清素综合征：躁动、高热、心动过速、高血压',
        ja: 'セロトニン症候群：興奮、高体温、頻脈、高血圧',
        'zh-TW': '血清素症候群：躁動、高熱、心動過速、高血壓'
      },
      recommendation: {
        en: 'Use with caution. Monitor for serotonin syndrome symptoms. Consider lower doses.',
        zh: '谨慎使用。监测血清素综合征症状。考虑降低剂量。',
        ja: '慎重に使用。セロトニン症候群の症状を監視。低用量を検討。',
        'zh-TW': '謹慎使用。監測血清素症候群症狀。考慮降低劑量。'
      },
      evidenceLevel: 'established'
    },
    {
      interactingSubstance: {
        en: 'Antihypertensive Agents',
        zh: '降压药',
        ja: '降圧薬',
        'zh-TW': '降壓藥'
      },
      substanceType: 'drug_class',
      severity: 'moderate',
      mechanism: {
        en: 'Stimulants may counteract antihypertensive effects through sympathomimetic activity.',
        zh: '兴奋剂可能通过拟交感神经活性抵消降压作用。',
        ja: '刺激薬が交感神経様作用により降圧効果を打ち消す可能性。',
        'zh-TW': '興奮劑可能通過擬交感神經活性抵消降壓作用。'
      },
      effect: {
        en: 'Reduced antihypertensive efficacy, blood pressure elevation',
        zh: '降压效果降低，血压升高',
        ja: '降圧効果の減弱、血圧上昇',
        'zh-TW': '降壓效果降低，血壓升高'
      },
      recommendation: {
        en: 'Monitor blood pressure regularly. May need to adjust antihypertensive doses.',
        zh: '定期监测血压。可能需要调整降压药剂量。',
        ja: '血圧を定期的に監視。降圧薬の用量調整が必要な場合がある。',
        'zh-TW': '定期監測血壓。可能需要調整降壓藥劑量。'
      },
      evidenceLevel: 'established'
    },
    {
      interactingSubstance: {
        en: 'Proton Pump Inhibitors (PPIs)',
        zh: '质子泵抑制剂',
        ja: 'プロトンポンプ阻害薬',
        'zh-TW': '質子泵抑制劑'
      },
      substanceType: 'drug_class',
      severity: 'moderate',
      mechanism: {
        en: 'PPIs increase gastric pH, which may increase amphetamine absorption.',
        zh: 'PPIs升高胃pH值，可能增加安非他命吸收。',
        ja: 'PPIが胃内pHを上昇させ、アンフェタミンの吸収を増加させる可能性。',
        'zh-TW': 'PPIs升高胃pH值，可能增加安非他命吸收。'
      },
      effect: {
        en: 'Potentially increased amphetamine effects and side effects',
        zh: '可能增加安非他命作用和副作用',
        ja: 'アンフェタミンの効果と副作用が増加する可能性',
        'zh-TW': '可能增加安非他命作用和副作用'
      },
      recommendation: {
        en: 'Monitor for enhanced stimulant effects. Consider dose adjustment if needed.',
        zh: '监测兴奋剂效果增强。必要时考虑调整剂量。',
        ja: '刺激薬効果の増強を監視。必要に応じて用量調整を検討。',
        'zh-TW': '監測興奮劑效果增強。必要時考慮調整劑量。'
      },
      evidenceLevel: 'probable'
    }
  ],

  // Atomoxetine-specific interactions
  atomoxetine: [
    {
      interactingSubstance: {
        en: 'CYP2D6 Inhibitors',
        zh: 'CYP2D6抑制剂',
        ja: 'CYP2D6阻害薬',
        'zh-TW': 'CYP2D6抑制劑'
      },
      substanceType: 'drug_class',
      severity: 'major',
      mechanism: {
        en: 'Atomoxetine is metabolized by CYP2D6. Strong inhibitors significantly increase atomoxetine levels.',
        zh: '阿托莫西汀由CYP2D6代谢。强效抑制剂显著增加阿托莫西汀水平。',
        ja: 'アトモキセチンはCYP2D6で代謝される。強力な阻害薬がアトモキセチン濃度を著しく上昇させる。',
        'zh-TW': '阿托莫西汀由CYP2D6代謝。強效抑制劑顯著增加阿托莫西汀水平。'
      },
      effect: {
        en: 'Up to 6-10 fold increase in atomoxetine exposure. Increased cardiovascular effects.',
        zh: '阿托莫西汀暴露量增加6-10倍。心血管作用增强。',
        ja: 'アトモキセチン曝露量が6〜10倍に増加。心血管への影響が増強。',
        'zh-TW': '阿托莫西汀暴露量增加6-10倍。心血管作用增強。'
      },
      recommendation: {
        en: 'Start with lower atomoxetine dose. Examples: fluoxetine, paroxetine, quinidine, bupropion.',
        zh: '从较低剂量开始。例如：氟西汀、帕罗西汀、奎尼丁、安非他酮。',
        ja: '低用量から開始。例：フルオキセチン、パロキセチン、キニジン、ブプロピオン。',
        'zh-TW': '從較低劑量開始。例如：氟西汀、帕羅西汀、奎尼丁、安非他酮。'
      },
      evidenceLevel: 'established',
      sources: [
        { url: 'https://dailymed.nlm.nih.gov/', name: 'Strattera FDA Label' }
      ]
    },
    {
      interactingSubstance: {
        en: 'MAO Inhibitors',
        zh: '单胺氧化酶抑制剂',
        ja: 'MAO阻害薬',
        'zh-TW': '單胺氧化酶抑制劑'
      },
      substanceType: 'drug_class',
      severity: 'major',
      mechanism: {
        en: 'Atomoxetine is a norepinephrine reuptake inhibitor. Combined with MAOIs risks hypertensive crisis.',
        zh: '阿托莫西汀是去甲肾上腺素再摄取抑制剂。与MAOIs合用有高血压危象风险。',
        ja: 'アトモキセチンはノルエピネフリン再取り込み阻害薬。MAOIとの併用で高血圧クリーゼのリスク。',
        'zh-TW': '阿托莫西汀是去甲腎上腺素再攝取抑制劑。與MAOIs合用有高血壓危象風險。'
      },
      effect: {
        en: 'Risk of hypertensive crisis',
        zh: '高血压危象风险',
        ja: '高血圧クリーゼのリスク',
        'zh-TW': '高血壓危象風險'
      },
      recommendation: {
        en: 'Contraindicated. Wait at least 14 days after stopping MAOI.',
        zh: '禁忌。停用MAOI后至少等待14天。',
        ja: '禁忌。MAOI中止後、少なくとも14日間待つ。',
        'zh-TW': '禁忌。停用MAOI後至少等待14天。'
      },
      evidenceLevel: 'established'
    }
  ],

  // Guanfacine-specific interactions
  guanfacine: [
    {
      interactingSubstance: {
        en: 'CYP3A4 Inhibitors',
        zh: 'CYP3A4抑制剂',
        ja: 'CYP3A4阻害薬',
        'zh-TW': 'CYP3A4抑制劑'
      },
      substanceType: 'drug_class',
      severity: 'major',
      mechanism: {
        en: 'Guanfacine is metabolized by CYP3A4. Inhibitors increase guanfacine plasma levels.',
        zh: '胍法辛由CYP3A4代谢。抑制剂增加胍法辛血浆浓度。',
        ja: 'グアンファシンはCYP3A4で代謝される。阻害薬がグアンファシン血漿濃度を上昇させる。',
        'zh-TW': '胍法辛由CYP3A4代謝。抑制劑增加胍法辛血漿濃度。'
      },
      effect: {
        en: 'Increased sedation, hypotension, and bradycardia',
        zh: '镇静、低血压和心动过缓加重',
        ja: '鎮静、低血圧、徐脈の増強',
        'zh-TW': '鎮靜、低血壓和心動過緩加重'
      },
      recommendation: {
        en: 'Reduce guanfacine dose by 50% when using strong CYP3A4 inhibitors. Examples: ketoconazole, ritonavir.',
        zh: '使用强效CYP3A4抑制剂时将胍法辛剂量减半。例如：酮康唑、利托那韦。',
        ja: '強力なCYP3A4阻害薬使用時はグアンファシン用量を50%減量。例：ケトコナゾール、リトナビル。',
        'zh-TW': '使用強效CYP3A4抑制劑時將胍法辛劑量減半。例如：酮康唑、利托那韋。'
      },
      evidenceLevel: 'established',
      sources: [
        { url: 'https://dailymed.nlm.nih.gov/', name: 'Intuniv FDA Label' }
      ]
    },
    {
      interactingSubstance: {
        en: 'CYP3A4 Inducers',
        zh: 'CYP3A4诱导剂',
        ja: 'CYP3A4誘導薬',
        'zh-TW': 'CYP3A4誘導劑'
      },
      substanceType: 'drug_class',
      severity: 'moderate',
      mechanism: {
        en: 'CYP3A4 inducers increase guanfacine metabolism, reducing efficacy.',
        zh: 'CYP3A4诱导剂加速胍法辛代谢，降低疗效。',
        ja: 'CYP3A4誘導薬がグアンファシン代謝を促進し、効果を減弱させる。',
        'zh-TW': 'CYP3A4誘導劑加速胍法辛代謝，降低療效。'
      },
      effect: {
        en: 'Reduced guanfacine efficacy',
        zh: '胍法辛疗效降低',
        ja: 'グアンファシンの効果減弱',
        'zh-TW': '胍法辛療效降低'
      },
      recommendation: {
        en: 'Consider increasing guanfacine dose up to double. Examples: rifampin, carbamazepine, phenytoin.',
        zh: '考虑将胍法辛剂量增加至双倍。例如：利福平、卡马西平、苯妥英。',
        ja: 'グアンファシン用量を最大2倍に増量を検討。例：リファンピン、カルバマゼピン、フェニトイン。',
        'zh-TW': '考慮將胍法辛劑量增加至雙倍。例如：利福平、卡馬西平、苯妥英。'
      },
      evidenceLevel: 'established'
    },
    {
      interactingSubstance: {
        en: 'CNS Depressants',
        zh: '中枢神经抑制剂',
        ja: '中枢神経抑制薬',
        'zh-TW': '中樞神經抑制劑'
      },
      substanceType: 'drug_class',
      severity: 'moderate',
      mechanism: {
        en: 'Additive sedative effects with guanfacine.',
        zh: '与胍法辛有叠加的镇静作用。',
        ja: 'グアンファシンとの鎮静作用の相加。',
        'zh-TW': '與胍法辛有疊加的鎮靜作用。'
      },
      effect: {
        en: 'Increased sedation and CNS depression',
        zh: '镇静和中枢抑制加重',
        ja: '鎮静と中枢抑制の増強',
        'zh-TW': '鎮靜和中樞抑制加重'
      },
      recommendation: {
        en: 'Use caution when combining with alcohol, benzodiazepines, or other sedatives.',
        zh: '与酒精、苯二氮卓类或其他镇静剂合用时需谨慎。',
        ja: 'アルコール、ベンゾジアゼピン系、その他の鎮静薬との併用は慎重に。',
        'zh-TW': '與酒精、苯二氮卓類或其他鎮靜劑合用時需謹慎。'
      },
      evidenceLevel: 'established'
    }
  ],

  // Clonidine-specific interactions
  clonidine: [
    {
      interactingSubstance: {
        en: 'Beta-Blockers',
        zh: 'β受体阻滞剂',
        ja: 'β遮断薬',
        'zh-TW': 'β受體阻滯劑'
      },
      substanceType: 'drug_class',
      severity: 'major',
      mechanism: {
        en: 'Stopping clonidine while on beta-blockers can cause severe rebound hypertension.',
        zh: '服用β受体阻滞剂期间停用可乐定可导致严重反跳性高血压。',
        ja: 'β遮断薬使用中にクロニジンを中止すると、重度のリバウンド高血圧を引き起こす可能性。',
        'zh-TW': '服用β受體阻滯劑期間停用可樂定可導致嚴重反跳性高血壓。'
      },
      effect: {
        en: 'Rebound hypertensive crisis upon clonidine discontinuation',
        zh: '停用可乐定时反跳性高血压危象',
        ja: 'クロニジン中止時のリバウンド高血圧クリーゼ',
        'zh-TW': '停用可樂定時反跳性高血壓危象'
      },
      recommendation: {
        en: 'If stopping clonidine, discontinue beta-blocker first, then taper clonidine slowly over several days.',
        zh: '如需停用可乐定，先停β受体阻滞剂，然后数天内缓慢减停可乐定。',
        ja: 'クロニジンを中止する場合、まずβ遮断薬を中止し、その後数日かけてクロニジンを漸減。',
        'zh-TW': '如需停用可樂定，先停β受體阻滯劑，然後數天內緩慢減停可樂定。'
      },
      evidenceLevel: 'established',
      sources: [
        { url: 'https://dailymed.nlm.nih.gov/', name: 'Kapvay FDA Label' }
      ]
    },
    {
      interactingSubstance: {
        en: 'Tricyclic Antidepressants',
        zh: '三环类抗抑郁药',
        ja: '三環系抗うつ薬',
        'zh-TW': '三環類抗憂鬱藥'
      },
      substanceType: 'drug_class',
      severity: 'major',
      mechanism: {
        en: 'TCAs block the antihypertensive effect of clonidine and may worsen rebound hypertension.',
        zh: 'TCAs阻断可乐定的降压作用，可能加重反跳性高血压。',
        ja: 'TCAがクロニジンの降圧効果を阻害し、リバウンド高血圧を悪化させる可能性。',
        'zh-TW': 'TCAs阻斷可樂定的降壓作用，可能加重反跳性高血壓。'
      },
      effect: {
        en: 'Loss of blood pressure control, potential hypertensive crisis',
        zh: '血压控制丧失，可能出现高血压危象',
        ja: '血圧コントロールの喪失、高血圧クリーゼの可能性',
        'zh-TW': '血壓控制喪失，可能出現高血壓危象'
      },
      recommendation: {
        en: 'Avoid combination. If used together, monitor blood pressure closely.',
        zh: '避免合用。如必须合用，密切监测血压。',
        ja: '併用を避ける。やむを得ず併用する場合は血圧を注意深く監視。',
        'zh-TW': '避免合用。如必須合用，密切監測血壓。'
      },
      evidenceLevel: 'established'
    }
  ],

  // Viloxazine-specific interactions
  viloxazine: [
    {
      interactingSubstance: {
        en: 'CYP1A2 Substrates',
        zh: 'CYP1A2底物',
        ja: 'CYP1A2基質',
        'zh-TW': 'CYP1A2底物'
      },
      substanceType: 'drug_class',
      severity: 'major',
      mechanism: {
        en: 'Viloxazine is a strong CYP1A2 inhibitor. It increases levels of CYP1A2 substrates.',
        zh: 'Viloxazine是强效CYP1A2抑制剂。可增加CYP1A2底物水平。',
        ja: 'ビロキサジンは強力なCYP1A2阻害薬。CYP1A2基質の濃度を上昇させる。',
        'zh-TW': 'Viloxazine是強效CYP1A2抑制劑。可增加CYP1A2底物水平。'
      },
      effect: {
        en: 'Significantly increased exposure to theophylline, clozapine, and other CYP1A2 substrates',
        zh: '显著增加茶碱、氯氮平等CYP1A2底物的暴露量',
        ja: 'テオフィリン、クロザピン等のCYP1A2基質への曝露量が著しく増加',
        'zh-TW': '顯著增加茶鹼、氯氮平等CYP1A2底物的暴露量'
      },
      recommendation: {
        en: 'Avoid theophylline. Reduce clozapine dose. Monitor other CYP1A2 substrates closely.',
        zh: '避免茶碱。减少氯氮平剂量。密切监测其他CYP1A2底物。',
        ja: 'テオフィリンを避ける。クロザピンを減量。他のCYP1A2基質を注意深く監視。',
        'zh-TW': '避免茶鹼。減少氯氮平劑量。密切監測其他CYP1A2底物。'
      },
      evidenceLevel: 'established',
      sources: [
        { url: 'https://dailymed.nlm.nih.gov/', name: 'Qelbree FDA Label' }
      ]
    },
    {
      interactingSubstance: {
        en: 'MAO Inhibitors',
        zh: '单胺氧化酶抑制剂',
        ja: 'MAO阻害薬',
        'zh-TW': '單胺氧化酶抑制劑'
      },
      substanceType: 'drug_class',
      severity: 'major',
      mechanism: {
        en: 'Viloxazine affects norepinephrine reuptake. Combined with MAOIs may cause hypertensive crisis.',
        zh: 'Viloxazine影响去甲肾上腺素再摄取。与MAOIs合用可能导致高血压危象。',
        ja: 'ビロキサジンはノルエピネフリン再取り込みに影響。MAOIとの併用で高血圧クリーゼを引き起こす可能性。',
        'zh-TW': 'Viloxazine影響去甲腎上腺素再攝取。與MAOIs合用可能導致高血壓危象。'
      },
      effect: {
        en: 'Risk of serotonin syndrome and hypertensive crisis',
        zh: '血清素综合征和高血压危象风险',
        ja: 'セロトニン症候群と高血圧クリーゼのリスク',
        'zh-TW': '血清素症候群和高血壓危象風險'
      },
      recommendation: {
        en: 'Contraindicated within 14 days of MAOI use.',
        zh: '禁止在MAOI使用后14天内使用。',
        ja: 'MAOI使用後14日以内は禁忌。',
        'zh-TW': '禁止在MAOI使用後14天內使用。'
      },
      evidenceLevel: 'established'
    }
  ]
};

// ============================================
// Processor Functions
// ============================================

/**
 * Get interactions for a specific drug
 */
export function getInteractionsForDrug(drugId: string): DrugInteraction[] {
  const drugMapping = ADHD_DRUG_MAPPINGS.find(d => d.drugId === drugId);
  if (!drugMapping) {
    return [];
  }

  const interactions: DrugInteraction[] = [];

  // Add stimulant-class interactions for stimulants
  if (drugMapping.drugClass === 'stimulant') {
    interactions.push(...CURATED_DRUG_INTERACTIONS.stimulant);
  }

  // Add drug-specific interactions
  const specificInteractions = CURATED_DRUG_INTERACTIONS[drugId];
  if (specificInteractions) {
    interactions.push(...specificInteractions);
  }

  return interactions;
}

/**
 * Get relevant nutrient interactions for a drug
 */
export function getNutrientInteractionsForDrug(drugId: string): typeof NUTRIENT_INTERACTIONS {
  const drugMapping = ADHD_DRUG_MAPPINGS.find(d => d.drugId === drugId);
  if (!drugMapping) {
    return [];
  }

  // Filter nutrient interactions relevant to this drug
  return NUTRIENT_INTERACTIONS.filter(nutrient => {
    // Vitamin C and caffeine mainly affect stimulants
    if (nutrient.nutrient.en.includes('Vitamin C') || nutrient.nutrient.en.includes('Caffeine')) {
      return drugMapping.drugClass === 'stimulant';
    }
    // Grapefruit specifically affects guanfacine
    if (nutrient.nutrient.en.includes('Grapefruit')) {
      return drugId === 'guanfacine';
    }
    // Alcohol affects all ADHD drugs
    if (nutrient.nutrient.en.includes('Alcohol')) {
      return true;
    }
    // Minerals (Mg, Zn, Fe) are generally relevant to all
    if (['mineral'].includes(nutrient.nutrientType)) {
      return true;
    }
    // High-fat meals affect absorption of most drugs
    if (nutrient.nutrient.en.includes('High-Fat')) {
      // Lisdexamfetamine (Vyvanse) is not affected
      return drugId !== 'lisdexamfetamine';
    }
    return true;
  });
}

/**
 * Build complete interactions data for a drug
 */
export function buildInteractionsData(drugId: string): InteractionsData {
  return {
    drugInteractions: getInteractionsForDrug(drugId),
    nutrientInteractions: getNutrientInteractionsForDrug(drugId),
    commonCoprescribed: COMMON_DRUG_CLASSES,
    lastUpdated: new Date().toISOString().split('T')[0],
    sources: [
      'DrugBank Open Data',
      'FDA DailyMed Drug Labels',
      'Clinical Pharmacology Guidelines'
    ]
  };
}

/**
 * Process all ADHD drugs and return interaction data
 */
export function processAllDrugs(): Record<string, InteractionsData> {
  const result: Record<string, InteractionsData> = {};

  for (const drug of ADHD_DRUG_MAPPINGS) {
    result[drug.drugId] = buildInteractionsData(drug.drugId);
  }

  return result;
}
