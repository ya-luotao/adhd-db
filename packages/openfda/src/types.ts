/**
 * OpenFDA API Types for ADHD Drug Database
 * Based on OpenFDA Drug API documentation
 * https://open.fda.gov/apis/drug/
 */

// ============================================
// Drug Label Types (/drug/label endpoint)
// ============================================

export interface OpenFDAMeta {
  disclaimer: string;
  terms: string;
  license: string;
  last_updated: string;
  results: {
    skip: number;
    limit: number;
    total: number;
  };
}

export interface OpenFDAIdentifiers {
  application_number?: string[];
  brand_name?: string[];
  generic_name?: string[];
  manufacturer_name?: string[];
  product_ndc?: string[];
  product_type?: string[];
  route?: string[];
  substance_name?: string[];
  rxcui?: string[];
  spl_id?: string[];
  spl_set_id?: string[];
  package_ndc?: string[];
  nui?: string[];
  pharm_class_epc?: string[];  // Established Pharmacologic Class
  pharm_class_moa?: string[];  // Mechanism of Action
  pharm_class_cs?: string[];   // Chemical Structure
  pharm_class_pe?: string[];   // Physiologic Effect
  unii?: string[];             // Unique Ingredient Identifier
}

export interface DrugLabelResult {
  // OpenFDA identifiers
  openfda?: OpenFDAIdentifiers;

  // Core identification
  id: string;
  set_id?: string;
  version?: string;
  effective_time?: string;

  // Indications and Usage
  indications_and_usage?: string[];

  // Dosage Information
  dosage_and_administration?: string[];
  dosage_forms_and_strengths?: string[];

  // Safety Information
  contraindications?: string[];
  warnings?: string[];
  warnings_and_cautions?: string[];
  boxed_warning?: string[];          // Black box warnings - critical for ADHD meds

  // Adverse Reactions
  adverse_reactions?: string[];
  adverse_reactions_table?: string[];

  // Drug Interactions
  drug_interactions?: string[];
  drug_interactions_table?: string[];

  // Clinical Pharmacology
  clinical_pharmacology?: string[];
  mechanism_of_action?: string[];
  pharmacodynamics?: string[];
  pharmacokinetics?: string[];

  // Special Populations
  pediatric_use?: string[];
  geriatric_use?: string[];
  pregnancy?: string[];
  nursing_mothers?: string[];

  // Abuse and Dependence
  drug_abuse_and_dependence?: string[];
  controlled_substance?: string[];
  abuse?: string[];
  dependence?: string[];

  // Overdosage
  overdosage?: string[];

  // Patient Information
  patient_medication_information?: string[];
  information_for_patients?: string[];

  // Other sections
  description?: string[];
  clinical_studies?: string[];
  how_supplied?: string[];
  storage_and_handling?: string[];

  // Package label info
  package_label_principal_display_panel?: string[];
  spl_product_data_elements?: string[];
}

export interface DrugLabelResponse {
  meta: OpenFDAMeta;
  results: DrugLabelResult[];
}

// ============================================
// Adverse Events Types (/drug/event endpoint)
// ============================================

export interface AdverseEventPatient {
  patientonsetage?: string;
  patientonsetageunit?: string;
  patientsex?: string;
  patientweight?: string;
}

export interface AdverseEventReaction {
  reactionmeddrapt: string;           // MedDRA Preferred Term
  reactionmeddraversionpt?: string;
  reactionoutcome?: string;           // 1=recovered, 2=recovering, 3=not recovered, 4=recovered with sequelae, 5=fatal, 6=unknown
}

export interface AdverseEventDrug {
  actiondrug?: string;
  activesubstance?: {
    activesubstancename?: string;
  };
  drugadministrationroute?: string;
  drugauthorizationnumb?: string;
  drugcharacterization?: string;      // 1=suspect, 2=concomitant, 3=interacting
  drugdosageform?: string;
  drugdosagetext?: string;
  drugindication?: string;
  medicinalproduct?: string;
  openfda?: OpenFDAIdentifiers;
}

export interface AdverseEventResult {
  safetyreportid: string;
  safetyreportversion?: string;
  receiptdate?: string;
  receivedate?: string;
  transmissiondate?: string;
  serious?: string;                   // 1=serious, 2=not serious
  seriousnesscongenitalanomali?: string;
  seriousnessdeath?: string;
  seriousnessdisabling?: string;
  seriousnesshospitalization?: string;
  seriousnesslifethreatening?: string;
  seriousnessother?: string;
  reporttype?: string;
  primarysource?: {
    qualification?: string;
    reportercountry?: string;
  };
  patient?: AdverseEventPatient;
  reaction?: AdverseEventReaction[];
  drug?: AdverseEventDrug[];
}

export interface AdverseEventResponse {
  meta: OpenFDAMeta;
  results: AdverseEventResult[];
}

// ============================================
// Aggregated Count Types (for visualizations)
// ============================================

export interface CountResult {
  term: string;
  count: number;
}

export interface CountResponse {
  meta: OpenFDAMeta;
  results: CountResult[];
}

// ============================================
// Processed Types for ADHD-DB Integration
// ============================================

export interface ProcessedDrugLabel {
  // FDA References
  applicationNumber?: string;
  splSetId?: string;
  splId?: string;
  rxcui?: string[];

  // Brand/Generic names from FDA
  fdaBrandNames: string[];
  fdaGenericName?: string;
  manufacturers: string[];

  // Pharmacological Classification
  pharmacologicClass: {
    mechanismOfAction?: string[];   // pharm_class_moa
    establishedClass?: string[];     // pharm_class_epc
    physiologicEffect?: string[];    // pharm_class_pe
  };

  // Clinical Information
  indicationsAndUsage?: string;
  dosageAndAdministration?: string;
  contraindications?: string;

  // Safety Warnings
  boxedWarning?: string;              // Critical for stimulants
  warningsAndPrecautions?: string;

  // Adverse Reactions
  adverseReactions?: string;

  // Drug Interactions
  drugInteractions?: string;

  // Abuse/Dependence Info (important for controlled substances)
  controlledSubstanceClass?: string;
  abuseInfo?: string;
  dependenceInfo?: string;

  // Special Populations
  pediatricUse?: string;
  geriatricUse?: string;
  pregnancyInfo?: string;

  // Pharmacology
  mechanismOfAction?: string;
  pharmacokinetics?: string;

  // Metadata
  effectiveDate?: string;
  lastUpdated: string;
}

export interface AdverseEventSummary {
  drugName: string;
  totalReports: number;
  seriousReports: number;

  // Top reactions with counts
  topReactions: Array<{
    reaction: string;
    count: number;
    percentage: number;
  }>;

  // Demographics breakdown
  demographics: {
    byAge: Array<{ ageGroup: string; count: number }>;
    bySex: Array<{ sex: string; count: number }>;
  };

  // Outcomes breakdown
  outcomes: {
    recovered: number;
    recovering: number;
    notRecovered: number;
    fatal: number;
    unknown: number;
  };

  // Metadata
  dataRange: {
    from: string;
    to: string;
  };
  lastUpdated: string;
}

// ============================================
// Drug Mapping for ADHD medications
// ============================================

export interface DrugMapping {
  drugId: string;                     // Our internal drug ID
  fdaSearchTerms: string[];           // Terms to search in OpenFDA
  primaryGenericName: string;         // Primary generic name for queries
  applicationNumbers?: string[];      // Known NDA/ANDA numbers
}

export const ADHD_DRUG_MAPPINGS: DrugMapping[] = [
  {
    drugId: 'methylphenidate',
    fdaSearchTerms: ['methylphenidate', 'methylphenidate hydrochloride'],
    primaryGenericName: 'methylphenidate hydrochloride',
    applicationNumbers: ['NDA021121', 'NDA010187']  // Concerta, Ritalin
  },
  {
    drugId: 'amphetamine-mixed-salts',
    fdaSearchTerms: ['amphetamine', 'mixed salts amphetamine', 'amphetamine aspartate'],
    primaryGenericName: 'amphetamine',
    applicationNumbers: ['NDA011522']  // Adderall
  },
  {
    drugId: 'lisdexamfetamine',
    fdaSearchTerms: ['lisdexamfetamine', 'lisdexamfetamine dimesylate'],
    primaryGenericName: 'lisdexamfetamine dimesylate',
    applicationNumbers: ['NDA021977']  // Vyvanse
  },
  {
    drugId: 'atomoxetine',
    fdaSearchTerms: ['atomoxetine', 'atomoxetine hydrochloride'],
    primaryGenericName: 'atomoxetine hydrochloride',
    applicationNumbers: ['NDA021411']  // Strattera
  },
  {
    drugId: 'guanfacine',
    fdaSearchTerms: ['guanfacine', 'guanfacine hydrochloride'],
    primaryGenericName: 'guanfacine hydrochloride',
    applicationNumbers: ['NDA022037']  // Intuniv
  },
  {
    drugId: 'clonidine',
    fdaSearchTerms: ['clonidine', 'clonidine hydrochloride'],
    primaryGenericName: 'clonidine hydrochloride',
    applicationNumbers: ['NDA022331']  // Kapvay
  },
  {
    drugId: 'viloxazine',
    fdaSearchTerms: ['viloxazine', 'viloxazine hydrochloride'],
    primaryGenericName: 'viloxazine hydrochloride',
    applicationNumbers: ['NDA211964']  // Qelbree
  }
];
