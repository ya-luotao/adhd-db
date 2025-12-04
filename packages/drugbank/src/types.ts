/**
 * DrugBank Interaction Type Definitions
 * For ADHD drug interaction checking
 */

// ============================================
// Localized Field Type
// ============================================

export interface LocalizedField {
  en: string;
  zh?: string;
  ja?: string;
  'zh-TW'?: string;
}

// ============================================
// Interaction Types
// ============================================

export type InteractionSeverity = 'major' | 'moderate' | 'minor' | 'unknown';

export type SubstanceType = 'drug' | 'drug_class' | 'food' | 'nutrient' | 'supplement' | 'beverage';

export type NutrientType = 'vitamin' | 'mineral' | 'food' | 'supplement' | 'beverage';

export type EvidenceLevel = 'established' | 'probable' | 'possible' | 'theoretical';

export type TimingRecommendation = 'avoid_together' | 'separate_2hr' | 'separate_4hr' | 'monitor' | 'caution';

// ============================================
// Drug-Drug Interaction
// ============================================

export interface DrugInteraction {
  /** Interacting substance name */
  interactingSubstance: LocalizedField;

  /** Type of substance */
  substanceType: SubstanceType;

  /** RxNorm identifier if available */
  rxcui?: string;

  /** DrugBank identifier */
  drugBankId?: string;

  /** Severity level */
  severity: InteractionSeverity;

  /** Mechanism of interaction */
  mechanism?: LocalizedField;

  /** Effect of the interaction */
  effect: LocalizedField;

  /** Clinical significance */
  clinicalSignificance?: LocalizedField;

  /** Management recommendation */
  recommendation?: LocalizedField;

  /** Evidence level */
  evidenceLevel?: EvidenceLevel;

  /** Source references */
  sources?: Array<{
    url: string;
    name: string;
  }>;
}

// ============================================
// Nutrient/Food Interaction
// ============================================

export interface NutrientInteraction {
  /** Nutrient name */
  nutrient: LocalizedField;

  /** Type of nutrient */
  nutrientType: NutrientType;

  /** Effect description */
  effect: LocalizedField;

  /** Severity level */
  severity: InteractionSeverity;

  /** Mechanism of interaction */
  mechanism?: LocalizedField;

  /** Timing recommendation */
  timing?: TimingRecommendation;

  /** Clinical recommendation */
  recommendation?: LocalizedField;
}

// ============================================
// Common Co-prescribed Drug Classes
// ============================================

export interface CoprescribedDrugClass {
  /** Drug class name */
  drugClass: string;

  /** Common drug class label */
  drugClassLabel: LocalizedField;

  /** Example drugs in this class */
  examples: string[];

  /** General interaction severity with ADHD drugs */
  interactionSeverity: InteractionSeverity;

  /** Quick note about interaction */
  quickNote: LocalizedField;
}

// ============================================
// Complete Interactions Data Structure
// ============================================

export interface InteractionsData {
  /** Drug-drug interactions */
  drugInteractions?: DrugInteraction[];

  /** Nutrient/food interactions */
  nutrientInteractions?: NutrientInteraction[];

  /** Common co-prescribed drug class info */
  commonCoprescribed?: CoprescribedDrugClass[];

  /** Last update timestamp */
  lastUpdated?: string;

  /** Data sources */
  sources?: string[];
}

// ============================================
// ADHD Drug Mappings
// ============================================

export interface ADHDDrugMapping {
  /** Internal drug ID */
  drugId: string;

  /** DrugBank IDs (may have multiple) */
  drugBankIds?: string[];

  /** Generic name for searching */
  genericName: string;

  /** Alternative search terms */
  searchTerms?: string[];

  /** Drug class */
  drugClass: 'stimulant' | 'non-stimulant';

  /** Known major interactions (pre-curated) */
  knownMajorInteractions?: string[];
}

/**
 * ADHD Drug to DrugBank mapping configuration
 */
export const ADHD_DRUG_MAPPINGS: ADHDDrugMapping[] = [
  {
    drugId: 'methylphenidate',
    drugBankIds: ['DB00422'],
    genericName: 'methylphenidate',
    drugClass: 'stimulant',
    knownMajorInteractions: ['MAO inhibitors', 'selegiline', 'rasagiline', 'phenelzine', 'tranylcypromine']
  },
  {
    drugId: 'amphetamine-mixed-salts',
    drugBankIds: ['DB00182', 'DB01576'],
    genericName: 'amphetamine',
    drugClass: 'stimulant',
    knownMajorInteractions: ['MAO inhibitors', 'selegiline', 'rasagiline', 'phenelzine', 'tranylcypromine', 'linezolid']
  },
  {
    drugId: 'lisdexamfetamine',
    drugBankIds: ['DB01255'],
    genericName: 'lisdexamfetamine',
    drugClass: 'stimulant',
    knownMajorInteractions: ['MAO inhibitors', 'selegiline', 'rasagiline', 'phenelzine', 'tranylcypromine']
  },
  {
    drugId: 'atomoxetine',
    drugBankIds: ['DB00289'],
    genericName: 'atomoxetine',
    drugClass: 'non-stimulant',
    knownMajorInteractions: ['MAO inhibitors', 'fluoxetine', 'paroxetine', 'quinidine']
  },
  {
    drugId: 'guanfacine',
    drugBankIds: ['DB01018'],
    genericName: 'guanfacine',
    drugClass: 'non-stimulant',
    knownMajorInteractions: ['CYP3A4 inhibitors', 'CYP3A4 inducers']
  },
  {
    drugId: 'clonidine',
    drugBankIds: ['DB00575'],
    genericName: 'clonidine',
    drugClass: 'non-stimulant',
    knownMajorInteractions: ['beta-blockers', 'tricyclic antidepressants', 'CNS depressants']
  },
  {
    drugId: 'viloxazine',
    drugBankIds: ['DB09185'],
    genericName: 'viloxazine',
    drugClass: 'non-stimulant',
    knownMajorInteractions: ['MAO inhibitors', 'CYP1A2 substrates']
  }
];

// ============================================
// Known Drug Classes for Quick Check
// ============================================

export const COMMON_DRUG_CLASSES: CoprescribedDrugClass[] = [
  {
    drugClass: 'SSRI',
    drugClassLabel: {
      en: 'SSRIs (Selective Serotonin Reuptake Inhibitors)',
      zh: 'SSRIs (选择性血清素再摄取抑制剂)',
      ja: 'SSRIs（選択的セロトニン再取り込み阻害薬）',
      'zh-TW': 'SSRIs（選擇性血清素再攝取抑制劑）'
    },
    examples: ['sertraline', 'fluoxetine', 'escitalopram', 'paroxetine', 'citalopram'],
    interactionSeverity: 'moderate',
    quickNote: {
      en: 'Increased risk of serotonin syndrome with stimulants. Monitor for agitation, confusion, rapid heart rate.',
      zh: '与兴奋剂合用时血清素综合征风险增加。注意观察躁动、意识混乱、心跳加速。',
      ja: '刺激薬との併用でセロトニン症候群のリスクが増加。興奮、混乱、頻脈に注意。',
      'zh-TW': '與興奮劑合用時血清素症候群風險增加。注意觀察躁動、意識混亂、心跳加速。'
    }
  },
  {
    drugClass: 'SNRI',
    drugClassLabel: {
      en: 'SNRIs (Serotonin-Norepinephrine Reuptake Inhibitors)',
      zh: 'SNRIs (血清素-去甲肾上腺素再摄取抑制剂)',
      ja: 'SNRIs（セロトニン・ノルエピネフリン再取り込み阻害薬）',
      'zh-TW': 'SNRIs（血清素-正腎上腺素再攝取抑制劑）'
    },
    examples: ['venlafaxine', 'duloxetine', 'desvenlafaxine'],
    interactionSeverity: 'moderate',
    quickNote: {
      en: 'Additive cardiovascular effects with stimulants. Monitor blood pressure and heart rate.',
      zh: '与兴奋剂有叠加的心血管作用。监测血压和心率。',
      ja: '刺激薬との併用で心血管への作用が増強。血圧と心拍数を監視。',
      'zh-TW': '與興奮劑有疊加的心血管作用。監測血壓和心率。'
    }
  },
  {
    drugClass: 'MAOI',
    drugClassLabel: {
      en: 'MAOIs (Monoamine Oxidase Inhibitors)',
      zh: 'MAOIs (单胺氧化酶抑制剂)',
      ja: 'MAOIs（モノアミン酸化酵素阻害薬）',
      'zh-TW': 'MAOIs（單胺氧化酶抑制劑）'
    },
    examples: ['phenelzine', 'tranylcypromine', 'selegiline', 'rasagiline', 'isocarboxazid'],
    interactionSeverity: 'major',
    quickNote: {
      en: 'CONTRAINDICATED with all stimulants. Risk of hypertensive crisis. Wait 14 days after stopping MAOI.',
      zh: '禁止与所有兴奋剂合用。有高血压危象风险。停用MAOI后需等待14天。',
      ja: 'すべての刺激薬との併用禁忌。高血圧クリーゼのリスク。MAOI中止後14日間は待機。',
      'zh-TW': '禁止與所有興奮劑合用。有高血壓危象風險。停用MAOI後需等待14天。'
    }
  },
  {
    drugClass: 'TCA',
    drugClassLabel: {
      en: 'TCAs (Tricyclic Antidepressants)',
      zh: 'TCAs (三环类抗抑郁药)',
      ja: 'TCAs（三環系抗うつ薬）',
      'zh-TW': 'TCAs（三環類抗憂鬱藥）'
    },
    examples: ['amitriptyline', 'nortriptyline', 'imipramine', 'desipramine'],
    interactionSeverity: 'moderate',
    quickNote: {
      en: 'Stimulants may increase TCA blood levels. Additive cardiovascular effects. Monitor ECG.',
      zh: '兴奋剂可能增加TCA血药浓度。有叠加心血管作用。监测心电图。',
      ja: '刺激薬がTCAの血中濃度を上昇させる可能性。心血管への作用が増強。心電図を監視。',
      'zh-TW': '興奮劑可能增加TCA血藥濃度。有疊加心血管作用。監測心電圖。'
    }
  },
  {
    drugClass: 'benzodiazepine',
    drugClassLabel: {
      en: 'Benzodiazepines',
      zh: '苯二氮卓类',
      ja: 'ベンゾジアゼピン系',
      'zh-TW': '苯二氮卓類'
    },
    examples: ['alprazolam', 'lorazepam', 'clonazepam', 'diazepam'],
    interactionSeverity: 'moderate',
    quickNote: {
      en: 'May counteract ADHD medication effects. Additive CNS depression with non-stimulants.',
      zh: '可能抵消ADHD药物效果。与非兴奋剂有叠加的中枢抑制作用。',
      ja: 'ADHD薬の効果を相殺する可能性。非刺激薬との併用で中枢抑制作用が増強。',
      'zh-TW': '可能抵消ADHD藥物效果。與非興奮劑有疊加的中樞抑制作用。'
    }
  },
  {
    drugClass: 'antipsychotic',
    drugClassLabel: {
      en: 'Antipsychotics',
      zh: '抗精神病药',
      ja: '抗精神病薬',
      'zh-TW': '抗精神病藥'
    },
    examples: ['risperidone', 'aripiprazole', 'quetiapine', 'olanzapine'],
    interactionSeverity: 'moderate',
    quickNote: {
      en: 'May reduce stimulant efficacy. Monitor for movement disorders. Aripiprazole often used adjunctively.',
      zh: '可能降低兴奋剂效果。注意运动障碍。阿立哌唑常作为辅助用药。',
      ja: '刺激薬の効果を減弱させる可能性。運動障害に注意。アリピプラゾールは補助的に使用されることが多い。',
      'zh-TW': '可能降低興奮劑效果。注意運動障礙。阿立哌唑常作為輔助用藥。'
    }
  }
];

// ============================================
// Nutrient Interactions Data
// ============================================

export const NUTRIENT_INTERACTIONS: NutrientInteraction[] = [
  {
    nutrient: {
      en: 'Vitamin C (Ascorbic Acid)',
      zh: '维生素C（抗坏血酸）',
      ja: 'ビタミンC（アスコルビン酸）',
      'zh-TW': '維生素C（抗壞血酸）'
    },
    nutrientType: 'vitamin',
    effect: {
      en: 'Acidifies urine, increasing excretion of amphetamines and reducing their effectiveness',
      zh: '酸化尿液，增加安非他命排泄，降低药效',
      ja: '尿を酸性化し、アンフェタミンの排泄を増加させ、効果を低下させる',
      'zh-TW': '酸化尿液，增加安非他命排泄，降低藥效'
    },
    severity: 'moderate',
    mechanism: {
      en: 'Amphetamines are weak bases. Acidic urine increases ionization, reducing tubular reabsorption.',
      zh: '安非他命是弱碱。酸性尿液增加离子化，减少肾小管重吸收。',
      ja: 'アンフェタミンは弱塩基。酸性尿がイオン化を増加させ、尿細管再吸収を減少させる。',
      'zh-TW': '安非他命是弱鹼。酸性尿液增加離子化，減少腎小管重吸收。'
    },
    timing: 'separate_2hr',
    recommendation: {
      en: 'Take vitamin C supplements at least 2 hours apart from amphetamine medications. Avoid large doses of citrus fruits or juices near medication time.',
      zh: '维生素C补充剂与安非他命类药物至少间隔2小时服用。避免在用药时间附近大量食用柑橘类水果或果汁。',
      ja: 'ビタミンCサプリメントはアンフェタミン系薬剤と少なくとも2時間あけて摂取。服薬時間近くでの柑橘類の大量摂取を避ける。',
      'zh-TW': '維生素C補充劑與安非他命類藥物至少間隔2小時服用。避免在用藥時間附近大量食用柑橘類水果或果汁。'
    }
  },
  {
    nutrient: {
      en: 'Magnesium',
      zh: '镁',
      ja: 'マグネシウム',
      'zh-TW': '鎂'
    },
    nutrientType: 'mineral',
    effect: {
      en: 'May enhance stimulant effects and reduce tolerance development. Low magnesium linked to ADHD symptoms.',
      zh: '可能增强兴奋剂效果并减少耐受性发展。低镁与ADHD症状相关。',
      ja: '刺激薬の効果を増強し、耐性発現を抑制する可能性。低マグネシウムはADHD症状と関連。',
      'zh-TW': '可能增強興奮劑效果並減少耐受性發展。低鎂與ADHD症狀相關。'
    },
    severity: 'minor',
    mechanism: {
      en: 'Magnesium is involved in dopamine regulation and NMDA receptor function.',
      zh: '镁参与多巴胺调节和NMDA受体功能。',
      ja: 'マグネシウムはドパミン調節とNMDA受容体機能に関与。',
      'zh-TW': '鎂參與多巴胺調節和NMDA受體功能。'
    },
    timing: 'monitor',
    recommendation: {
      en: 'Adequate magnesium intake may support ADHD treatment. Consider supplementation if deficient.',
      zh: '充足的镁摄入可能支持ADHD治疗。如有缺乏可考虑补充。',
      ja: '適切なマグネシウム摂取はADHD治療をサポートする可能性。欠乏している場合は補充を検討。',
      'zh-TW': '充足的鎂攝入可能支持ADHD治療。如有缺乏可考慮補充。'
    }
  },
  {
    nutrient: {
      en: 'Zinc',
      zh: '锌',
      ja: '亜鉛',
      'zh-TW': '鋅'
    },
    nutrientType: 'mineral',
    effect: {
      en: 'Zinc deficiency may reduce amphetamine efficacy. Supplementation may allow lower doses.',
      zh: '锌缺乏可能降低安非他命效果。补充可能允许使用更低剂量。',
      ja: '亜鉛欠乏はアンフェタミンの効果を低下させる可能性。補充により低用量で効果が得られる可能性。',
      'zh-TW': '鋅缺乏可能降低安非他命效果。補充可能允許使用更低劑量。'
    },
    severity: 'minor',
    mechanism: {
      en: 'Zinc modulates dopamine transporter function and melatonin metabolism.',
      zh: '锌调节多巴胺转运体功能和褪黑素代谢。',
      ja: '亜鉛はドパミントランスポーター機能とメラトニン代謝を調節。',
      'zh-TW': '鋅調節多巴胺轉運體功能和褪黑素代謝。'
    },
    timing: 'monitor',
    recommendation: {
      en: 'Consider zinc status assessment. Supplementation may be beneficial in zinc-deficient patients.',
      zh: '考虑评估锌状态。锌缺乏患者补充可能有益。',
      ja: '亜鉛状態の評価を検討。亜鉛欠乏患者には補充が有益な可能性。',
      'zh-TW': '考慮評估鋅狀態。鋅缺乏患者補充可能有益。'
    }
  },
  {
    nutrient: {
      en: 'Iron',
      zh: '铁',
      ja: '鉄',
      'zh-TW': '鐵'
    },
    nutrientType: 'mineral',
    effect: {
      en: 'Iron deficiency associated with ADHD severity. May affect dopamine synthesis.',
      zh: '铁缺乏与ADHD严重程度相关。可能影响多巴胺合成。',
      ja: '鉄欠乏はADHDの重症度と関連。ドパミン合成に影響する可能性。',
      'zh-TW': '鐵缺乏與ADHD嚴重程度相關。可能影響多巴胺合成。'
    },
    severity: 'minor',
    mechanism: {
      en: 'Iron is a cofactor for tyrosine hydroxylase, required for dopamine synthesis.',
      zh: '铁是酪氨酸羟化酶的辅因子，多巴胺合成所必需。',
      ja: '鉄はチロシン水酸化酵素の補因子で、ドパミン合成に必要。',
      'zh-TW': '鐵是酪氨酸羥化酶的輔因子，多巴胺合成所必需。'
    },
    timing: 'monitor',
    recommendation: {
      en: 'Check ferritin levels. Iron supplementation may improve ADHD symptoms in deficient patients.',
      zh: '检查铁蛋白水平。铁缺乏患者补铁可能改善ADHD症状。',
      ja: 'フェリチン値を確認。鉄欠乏患者では鉄補充がADHD症状を改善する可能性。',
      'zh-TW': '檢查鐵蛋白水平。鐵缺乏患者補鐵可能改善ADHD症狀。'
    }
  },
  {
    nutrient: {
      en: 'Caffeine',
      zh: '咖啡因',
      ja: 'カフェイン',
      'zh-TW': '咖啡因'
    },
    nutrientType: 'beverage',
    effect: {
      en: 'Additive CNS stimulation with ADHD medications. May increase anxiety, insomnia, and cardiovascular effects.',
      zh: '与ADHD药物有叠加的中枢神经刺激作用。可能增加焦虑、失眠和心血管影响。',
      ja: 'ADHD薬との併用で中枢神経刺激作用が増強。不安、不眠、心血管への影響が増加する可能性。',
      'zh-TW': '與ADHD藥物有疊加的中樞神經刺激作用。可能增加焦慮、失眠和心血管影響。'
    },
    severity: 'moderate',
    mechanism: {
      en: 'Both caffeine and stimulants increase catecholamine activity.',
      zh: '咖啡因和兴奋剂都增加儿茶酚胺活性。',
      ja: 'カフェインと刺激薬はどちらもカテコールアミン活性を増加させる。',
      'zh-TW': '咖啡因和興奮劑都增加兒茶酚胺活性。'
    },
    timing: 'caution',
    recommendation: {
      en: 'Limit caffeine intake while on stimulant medications. Monitor for increased anxiety or sleep problems.',
      zh: '服用兴奋剂期间限制咖啡因摄入。注意焦虑或睡眠问题加重。',
      ja: '刺激薬服用中はカフェイン摂取を制限。不安や睡眠障害の増加に注意。',
      'zh-TW': '服用興奮劑期間限制咖啡因攝入。注意焦慮或睡眠問題加重。'
    }
  },
  {
    nutrient: {
      en: 'Grapefruit / Grapefruit Juice',
      zh: '葡萄柚/葡萄柚汁',
      ja: 'グレープフルーツ/グレープフルーツジュース',
      'zh-TW': '葡萄柚/葡萄柚汁'
    },
    nutrientType: 'food',
    effect: {
      en: 'Inhibits CYP3A4, increasing guanfacine blood levels and effects.',
      zh: '抑制CYP3A4，增加胍法辛血药浓度和作用。',
      ja: 'CYP3A4を阻害し、グアンファシンの血中濃度と作用を増加させる。',
      'zh-TW': '抑制CYP3A4，增加胍法辛血藥濃度和作用。'
    },
    severity: 'moderate',
    mechanism: {
      en: 'Grapefruit furanocoumarins irreversibly inhibit intestinal CYP3A4.',
      zh: '葡萄柚呋喃香豆素不可逆地抑制肠道CYP3A4。',
      ja: 'グレープフルーツのフラノクマリンが腸管CYP3A4を不可逆的に阻害。',
      'zh-TW': '葡萄柚呋喃香豆素不可逆地抑制腸道CYP3A4。'
    },
    timing: 'avoid_together',
    recommendation: {
      en: 'Avoid grapefruit products while taking guanfacine. Effect can last up to 72 hours.',
      zh: '服用胍法辛期间避免葡萄柚产品。影响可持续72小时。',
      ja: 'グアンファシン服用中はグレープフルーツ製品を避ける。影響は72時間持続する可能性。',
      'zh-TW': '服用胍法辛期間避免葡萄柚產品。影響可持續72小時。'
    }
  },
  {
    nutrient: {
      en: 'Alcohol',
      zh: '酒精',
      ja: 'アルコール',
      'zh-TW': '酒精'
    },
    nutrientType: 'beverage',
    effect: {
      en: 'May mask stimulant intoxication signs. Increased cardiovascular strain. Worsens ADHD symptoms.',
      zh: '可能掩盖兴奋剂中毒症状。增加心血管负担。恶化ADHD症状。',
      ja: '刺激薬中毒の徴候を隠蔽する可能性。心血管への負担増加。ADHD症状を悪化させる。',
      'zh-TW': '可能掩蓋興奮劑中毒症狀。增加心血管負擔。惡化ADHD症狀。'
    },
    severity: 'major',
    mechanism: {
      en: 'Opposing CNS effects may lead to overconsumption. Both affect dopamine systems.',
      zh: '相反的中枢神经作用可能导致过量摄入。两者都影响多巴胺系统。',
      ja: '相反する中枢作用により過剰摂取につながる可能性。どちらもドパミン系に影響。',
      'zh-TW': '相反的中樞神經作用可能導致過量攝入。兩者都影響多巴胺系統。'
    },
    timing: 'avoid_together',
    recommendation: {
      en: 'Avoid alcohol while taking ADHD medications. Risk of dangerous heart rhythm changes.',
      zh: '服用ADHD药物期间避免饮酒。有危险心律变化风险。',
      ja: 'ADHD薬服用中はアルコールを避ける。危険な不整脈のリスク。',
      'zh-TW': '服用ADHD藥物期間避免飲酒。有危險心律變化風險。'
    }
  },
  {
    nutrient: {
      en: 'High-Fat Meals',
      zh: '高脂肪饮食',
      ja: '高脂肪食',
      'zh-TW': '高脂肪飲食'
    },
    nutrientType: 'food',
    effect: {
      en: 'May delay absorption of some ADHD medications, affecting onset time.',
      zh: '可能延迟某些ADHD药物吸收，影响起效时间。',
      ja: '一部のADHD薬の吸収を遅延させ、効果発現時間に影響する可能性。',
      'zh-TW': '可能延遲某些ADHD藥物吸收，影響起效時間。'
    },
    severity: 'minor',
    mechanism: {
      en: 'Fat delays gastric emptying, slowing drug absorption.',
      zh: '脂肪延迟胃排空，减慢药物吸收。',
      ja: '脂肪が胃排出を遅延させ、薬物吸収を遅くする。',
      'zh-TW': '脂肪延遲胃排空，減慢藥物吸收。'
    },
    timing: 'monitor',
    recommendation: {
      en: 'Take medication consistently with or without food for predictable effects. Vyvanse not affected.',
      zh: '保持服药时与食物的一致性以获得可预测的效果。Vyvanse不受影响。',
      ja: '効果を安定させるため、食事との関係を一定に保つ。Vyvanseは影響を受けない。',
      'zh-TW': '保持服藥時與食物的一致性以獲得可預測的效果。Vyvanse不受影響。'
    }
  }
];
