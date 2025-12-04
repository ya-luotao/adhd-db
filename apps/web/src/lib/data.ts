import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import type { Lang } from '../i18n/translations';
import { defaultLang } from '../i18n/translations';

// Resolve paths relative to the monorepo root
// Use process.cwd() for build-time resolution (works with Cloudflare adapter prerendering)
const rootDir = process.cwd().includes('/apps/web')
  ? path.resolve(process.cwd(), '../..')
  : process.cwd();

export function getSchemaPath() {
  return path.join(rootDir, 'packages/schema');
}

export function getMetaPath() {
  return path.join(rootDir, 'packages/meta');
}

export function getDataPath() {
  return path.join(rootDir, 'packages/data');
}

export function readYamlFile<T = unknown>(filePath: string): T {
  const content = fs.readFileSync(filePath, 'utf-8');
  return parse(content) as T;
}

export function readYamlFileRaw(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

export function listYamlFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
}

// Localization helper - gets localized value from field
// Supports both old format (string) and new format ({ en, zh, 'zh-TW', ja })
export type LocalizedString = string | { en?: string; zh?: string; 'zh-TW'?: string; ja?: string };
export type LocalizedArray = string[] | { en?: string[]; zh?: string[]; 'zh-TW'?: string[]; ja?: string[] };

export function getLocalizedValue(value: LocalizedString | undefined, lang: Lang): string {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value;
  // For zh-TW, fall back to zh (Simplified Chinese) if Traditional Chinese is not available
  if (lang === 'zh-TW' && !value['zh-TW'] && value.zh) {
    return value.zh;
  }
  return value[lang] || value[defaultLang] || value.en || '';
}

export function getLocalizedArray(value: LocalizedArray | undefined, lang: Lang): string[] {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value;
  // For zh-TW, fall back to zh (Simplified Chinese) if Traditional Chinese is not available
  if (lang === 'zh-TW' && !value['zh-TW'] && value.zh) {
    return value.zh;
  }
  return value[lang] || value[defaultLang] || value.en || [];
}

// Schema
export function getSchema() {
  const schemaPath = path.join(getSchemaPath(), 'drug-schema.yaml');
  return {
    raw: readYamlFileRaw(schemaPath),
    parsed: readYamlFile(schemaPath),
  };
}

// Meta
export function getRegions() {
  const regionsPath = path.join(getMetaPath(), 'regions.yaml');
  return readYamlFile<{ regions: Record<string, unknown>; drugCategories: Record<string, string[]> }>(regionsPath);
}

// Categories
export interface Category {
  id: string;
  drugClass: string;
  name: LocalizedField;
  description: LocalizedField;
  mechanism: LocalizedField;
  wikipediaUrl: { en?: string; zh?: string; ja?: string };
  commonBrands: string[];
  notes?: LocalizedField;
  drugs?: string[];
}

export interface DrugClass {
  name: LocalizedField;
  description: LocalizedField;
  wikipediaUrl: { en?: string; zh?: string; ja?: string };
  categories: string[];
}

export interface CategoriesData {
  categories: Record<string, Category>;
  drugClasses: Record<string, DrugClass>;
}

export function getCategories(): CategoriesData {
  const categoriesPath = path.join(getMetaPath(), 'categories.yaml');
  return readYamlFile<CategoriesData>(categoriesPath);
}

export function getCategoryList(): Category[] {
  const data = getCategories();
  return Object.values(data.categories);
}

export function getCategory(id: string): Category | undefined {
  const data = getCategories();
  return data.categories[id];
}

export function getDrugClasses(): Record<string, DrugClass> {
  const data = getCategories();
  return data.drugClasses;
}

// Data - Drugs
export interface LocalizedField {
  en?: string;
  zh?: string;
  'zh-TW'?: string;
  ja?: string;
}

export interface LocalizedArrayField {
  en?: string[];
  zh?: string[];
  'zh-TW'?: string[];
  ja?: string[];
}

export interface DrugForm {
  type: string;
  typeLabel?: LocalizedField;
  releaseType: string;
  releaseTypeLabel?: LocalizedField;
  brandName?: string;
  strengths?: string[];
  durationHours?: number;
  notes?: string | LocalizedField;
}

export interface SideEffect {
  name: string | LocalizedField;
  frequency?: string;
  notes?: string | LocalizedField;
}

export interface DrugInteraction {
  drug: string | LocalizedField;
  severity: string;
  effect: string | LocalizedField;
}

export interface DrugApproval {
  region: string;
  agency: string;
  year?: number;
  approvedAges?: string | LocalizedField;
  indications?: string[] | LocalizedArrayField;
  available: boolean;
  notes?: string | LocalizedField;
}

// Travel rules types
export type TravelStatus = 'allowed' | 'restricted' | 'prohibited' | 'requires_permit';

export interface TravelDocumentation {
  type: string;
  typeLabel?: LocalizedField;
  notes?: LocalizedField;
}

export interface CrossBorderRule {
  fromRegion: string;
  toRegion: string;
  status: TravelStatus;
  statusLabel?: LocalizedField;
  requirements?: LocalizedArrayField;
  maxSupply?: string | null;
  notes?: LocalizedField;
  sources?: string[];
}

export interface TravelRules {
  generalAdvice?: LocalizedField;
  requiredDocumentation?: TravelDocumentation[];
  maxPersonalSupply?: {
    default: string;
    byRegion?: Record<string, string>;
  };
  crossBorderRules?: CrossBorderRule[];
}

// FDA Data Types
export interface FDAPharmacologicClass {
  mechanismOfAction?: string[];
  establishedClass?: string[];
  physiologicEffect?: string[];
}

export interface FDAAbuseAndDependence {
  controlledSubstanceClass?: string;
  abuse?: LocalizedField;
  dependence?: LocalizedField;
}

export interface FDAData {
  applicationNumbers?: string[];
  splSetId?: string;
  splId?: string;
  rxcui?: string[];
  pharmacologicClass?: FDAPharmacologicClass;
  boxedWarning?: LocalizedField;
  fdaIndications?: LocalizedField;
  abuseAndDependence?: FDAAbuseAndDependence;
  labelEffectiveDate?: string;
  fdaLabelUrl?: string;
}

export interface FAERSReaction {
  reaction: LocalizedField;
  reportCount: number;
  percentage: number;
}

export interface FAERSDemographics {
  byAge?: Array<{ ageGroup: string; count: number }>;
  bySex?: Array<{ sex: string; count: number }>;
}

export interface FAERSOutcomes {
  recovered?: number;
  recovering?: number;
  notRecovered?: number;
  fatal?: number;
  unknown?: number;
}

export interface FAERSData {
  totalReports?: number;
  seriousReports?: number;
  topReactions?: FAERSReaction[];
  demographics?: FAERSDemographics;
  outcomes?: FAERSOutcomes;
  dataRange?: { from?: string; to?: string };
  lastUpdated?: string;
}

// RxNorm Data Types
// RxNorm Term Types
export type RxNormTermType =
  | 'IN'      // Ingredient
  | 'PIN'     // Precise Ingredient
  | 'MIN'     // Multiple Ingredients
  | 'SCDC'    // Semantic Clinical Drug Component
  | 'SCDF'    // Semantic Clinical Drug Form
  | 'SCDG'    // Semantic Clinical Drug Group
  | 'SCD'     // Semantic Clinical Drug
  | 'SBDC'    // Semantic Branded Drug Component
  | 'SBDF'    // Semantic Branded Drug Form
  | 'SBDG'    // Semantic Branded Drug Group
  | 'SBD'     // Semantic Branded Drug
  | 'BN'      // Brand Name
  | 'GPCK'    // Generic Pack
  | 'BPCK';   // Brand Pack

export interface RxNormRxcuiMapping {
  rxcui: string;
  name: string;
  tty: RxNormTermType;
  description?: string;
}

export interface RxNormBrandMapping {
  brandName: string;
  rxcui: string;
  manufacturer?: string;
  region?: string;
}

export interface RxNormSynonym {
  name: string;
  type: 'generic' | 'brand' | 'abbreviation' | 'chemical' | 'common';
  source?: string;
}

export interface RxNormRelatedDrug {
  rxcui: string;
  name: string;
  tty: RxNormTermType;
  relationship: string;
}

export interface RxNormData {
  ingredientRxcui: string;
  ingredientName: string;
  rxcuiMappings?: RxNormRxcuiMapping[];
  brandMappings?: RxNormBrandMapping[];
  synonyms?: RxNormSynonym[];
  relatedDrugs?: RxNormRelatedDrug[];
  lastUpdated?: string;
}

// Extended Interactions Data Types
export type InteractionSeverity = 'major' | 'moderate' | 'minor' | 'unknown';
export type SubstanceType = 'drug' | 'drug_class' | 'food' | 'nutrient' | 'supplement' | 'beverage';
export type NutrientType = 'vitamin' | 'mineral' | 'food' | 'supplement' | 'beverage';
export type EvidenceLevel = 'established' | 'probable' | 'possible' | 'theoretical';
export type TimingRecommendation = 'avoid_together' | 'separate_2hr' | 'separate_4hr' | 'monitor' | 'caution';

export interface ExtendedDrugInteraction {
  interactingSubstance: LocalizedField;
  substanceType?: SubstanceType;
  rxcui?: string;
  drugBankId?: string;
  severity: InteractionSeverity;
  mechanism?: LocalizedField;
  effect: LocalizedField;
  clinicalSignificance?: LocalizedField;
  recommendation?: LocalizedField;
  evidenceLevel?: EvidenceLevel;
  sources?: Array<{ url: string; name: string }>;
}

export interface NutrientInteraction {
  nutrient: LocalizedField;
  nutrientType?: NutrientType;
  effect: LocalizedField;
  severity?: InteractionSeverity;
  mechanism?: LocalizedField;
  timing?: TimingRecommendation;
  recommendation?: LocalizedField;
}

export interface CoprescribedDrugClass {
  drugClass: string;
  drugClassLabel?: LocalizedField;
  examples?: string[];
  interactionSeverity?: InteractionSeverity;
  quickNote?: LocalizedField;
}

export interface InteractionsData {
  drugInteractions?: ExtendedDrugInteraction[];
  nutrientInteractions?: NutrientInteraction[];
  commonCoprescribed?: CoprescribedDrugClass[];
  lastUpdated?: string;
  sources?: string[];
}

// Clinical Trials Data Types
export type TrialStatus =
  | 'RECRUITING'
  | 'ACTIVE_NOT_RECRUITING'
  | 'COMPLETED'
  | 'ENROLLING_BY_INVITATION'
  | 'NOT_YET_RECRUITING'
  | 'SUSPENDED'
  | 'TERMINATED'
  | 'WITHDRAWN';

export type TrialPhase = 'EARLY_PHASE1' | 'PHASE1' | 'PHASE2' | 'PHASE3' | 'PHASE4' | 'NA';

export interface NotableTrial {
  nctId: string;
  title: string;
  status: TrialStatus;
  phase?: TrialPhase;
  sponsor?: string;
  enrollment?: number;
  completionDate?: string;
}

export interface ClinicalTrialsData {
  summary?: {
    total?: number;
    recruiting?: number;
    active?: number;
    completed?: number;
  };
  notableTrials?: NotableTrial[];
  searchUrl?: string;
  lastUpdated?: string;
}

export interface Drug {
  id: string;
  genericName: string | LocalizedField;
  brandNames: Record<string, string[]>;
  drugClass: string;
  drugClassLabel?: LocalizedField;
  category: string;
  categoryLabel?: LocalizedField;
  controlledSubstance?: boolean;
  schedule?: Record<string, string>;
  activeIngredient?: string | LocalizedField;
  mechanismOfAction?: string | LocalizedField;
  neurotransmittersAffected?: string[];
  forms?: DrugForm[];
  onsetMinutes?: number;
  peakEffectHours?: number;
  durationHours?: number;
  sideEffects?: {
    common?: SideEffect[];
    uncommon?: SideEffect[];
    serious?: SideEffect[];
  };
  contraindications?: string[] | LocalizedArrayField;
  drugInteractions?: DrugInteraction[];
  blackBoxWarnings?: string[] | LocalizedArrayField;
  pregnancyCategory?: string;
  foodInteractions?: string | LocalizedField;
  typicalDosing?: {
    children?: { startingDose?: string; maxDose?: string; notes?: string | LocalizedField };
    adults?: { startingDose?: string; maxDose?: string; notes?: string | LocalizedField };
  };
  costEstimate?: Record<string, { brand?: string; generic?: string }>;
  storageRequirements?: string | LocalizedField;
  approvals?: DrugApproval[];
  specialConsiderations?: {
    cardiacRisk?: string | LocalizedField;
    abuseRisk?: string | LocalizedField;
    withdrawalNotes?: string | LocalizedField;
    monitoringRequired?: string | LocalizedField;
  };
  travelRules?: TravelRules;
  // OpenFDA Data
  fdaData?: FDAData;
  faersData?: FAERSData;
  // RxNorm Data
  rxnormData?: RxNormData;
  // Extended Interactions Data
  interactionsData?: InteractionsData;
  // Clinical Trials Data
  clinicalTrialsData?: ClinicalTrialsData;
  lastUpdated?: string;
  sources?: string[];
  notes?: string | LocalizedField;
  [key: string]: unknown;
}

export function getDrugs(): Drug[] {
  const drugsDir = path.join(getDataPath(), 'drugs');
  const files = listYamlFiles(drugsDir);
  return files.map(file => readYamlFile<Drug>(path.join(drugsDir, file)));
}

export function getDrug(id: string): Drug | undefined {
  const drugs = getDrugs();
  return drugs.find(d => d.id === id);
}

export function getDrugRaw(id: string): string | undefined {
  const drugsDir = path.join(getDataPath(), 'drugs');
  const files = listYamlFiles(drugsDir);
  for (const file of files) {
    const filePath = path.join(drugsDir, file);
    const drug = readYamlFile<Drug>(filePath);
    if (drug.id === id) {
      return readYamlFileRaw(filePath);
    }
  }
  return undefined;
}

// List available data types
export function getDataTypes(): { name: string; count: number; path: string }[] {
  const dataPath = getDataPath();
  const types: { name: string; count: number; path: string }[] = [];

  if (fs.existsSync(path.join(dataPath, 'drugs'))) {
    types.push({
      name: 'Drugs',
      count: listYamlFiles(path.join(dataPath, 'drugs')).length,
      path: '/data/drugs',
    });
  }

  // Add categories from meta
  const categoriesData = getCategories();
  types.push({
    name: 'Categories',
    count: Object.keys(categoriesData.categories).length,
    path: '/data/categories',
  });

  return types;
}

// Travel rules helpers
export function getCrossBorderRule(
  drug: Drug,
  fromRegion: string,
  toRegion: string
): CrossBorderRule | undefined {
  return drug.travelRules?.crossBorderRules?.find(
    rule => rule.fromRegion === fromRegion && rule.toRegion === toRegion
  );
}

export interface InferredTravelStatus {
  status: TravelStatus;
  inferred: boolean;
  reason?: string;
}

export function inferTravelStatus(
  drug: Drug,
  fromRegion: string,
  toRegion: string
): InferredTravelStatus {
  // Check for explicit rule first
  const explicitRule = getCrossBorderRule(drug, fromRegion, toRegion);
  if (explicitRule) {
    return { status: explicitRule.status, inferred: false };
  }

  // Check destination approval
  const destApproval = drug.approvals?.find(a => a.region === toRegion);
  const destAvailable = destApproval?.available ?? false;
  const isControlled = drug.controlledSubstance;

  // Apply category-based rules for amphetamines
  if (drug.category === 'amphetamine') {
    if (toRegion === 'CN') {
      return { status: 'prohibited', inferred: true, reason: 'amphetamine_prohibited_cn' };
    }
    if (toRegion === 'JP') {
      return { status: 'requires_permit', inferred: true, reason: 'amphetamine_requires_permit_jp' };
    }
  }

  // Controlled substance rules
  if (isControlled) {
    if (!destAvailable) {
      return { status: 'restricted', inferred: true, reason: 'controlled_not_approved' };
    }
    return { status: 'restricted', inferred: true, reason: 'controlled_substance' };
  }

  // Default for non-controlled
  return { status: 'allowed', inferred: true, reason: 'non_controlled' };
}

export function getAvailableRegions(drug: Drug): string[] {
  return drug.approvals?.filter(a => a.available).map(a => a.region) || [];
}

// Glossary Terms
export interface Term {
  id: string;
  name: LocalizedField;
  description: LocalizedField;
  wikiUrl: string;
}

export interface TermsData {
  terms: Record<string, Omit<Term, 'id'>>;
}

let termsCache: Term[] | null = null;

export function getTerms(): Term[] {
  if (termsCache) return termsCache;

  const termsPath = path.join(getMetaPath(), 'terms.yaml');
  if (!fs.existsSync(termsPath)) return [];

  const data = readYamlFile<TermsData>(termsPath);
  termsCache = Object.entries(data.terms).map(([id, term]) => ({
    id,
    ...term,
  }));
  return termsCache;
}

export function getTerm(id: string): Term | undefined {
  const terms = getTerms();
  return terms.find(t => t.id === id);
}

export function getTermsMap(): Map<string, Term> {
  const terms = getTerms();
  return new Map(terms.map(t => [t.id, t]));
}

// RxNorm Helpers

/**
 * Search drugs by RxNorm synonym (brand name, generic name, or abbreviation)
 */
export function searchDrugBySynonym(query: string): Drug[] {
  const drugs = getDrugs();
  const normalizedQuery = query.toLowerCase().trim();

  return drugs.filter(drug => {
    // Check synonyms
    const synonyms = drug.rxnormData?.synonyms || [];
    const synonymMatch = synonyms.some(
      syn => syn.name.toLowerCase().includes(normalizedQuery)
    );
    if (synonymMatch) return true;

    // Check brand mappings
    const brandMappings = drug.rxnormData?.brandMappings || [];
    const brandMatch = brandMappings.some(
      b => b.brandName.toLowerCase().includes(normalizedQuery)
    );
    if (brandMatch) return true;

    // Check generic name
    const genericName = typeof drug.genericName === 'string'
      ? drug.genericName
      : drug.genericName.en || '';
    if (genericName.toLowerCase().includes(normalizedQuery)) return true;

    // Check ingredient name
    const ingredientName = drug.rxnormData?.ingredientName || '';
    if (ingredientName.toLowerCase().includes(normalizedQuery)) return true;

    return false;
  });
}

/**
 * Get related drugs for an ingredient (drugs with same ingredient RxCUI)
 */
export function getRelatedDrugsByIngredient(ingredientRxcui: string): Drug[] {
  const drugs = getDrugs();
  return drugs.filter(
    drug => drug.rxnormData?.ingredientRxcui === ingredientRxcui
  );
}

/**
 * Get brand names mapped to RxCUI for a drug
 */
export function getBrandMappingsForDrug(drug: Drug): RxNormBrandMapping[] {
  return drug.rxnormData?.brandMappings || [];
}

/**
 * Get all drug synonyms grouped by type
 */
export function getSynonymsByType(drug: Drug): Record<string, string[]> {
  const synonyms = drug.rxnormData?.synonyms || [];
  const grouped: Record<string, string[]> = {};

  for (const syn of synonyms) {
    if (!grouped[syn.type]) {
      grouped[syn.type] = [];
    }
    grouped[syn.type].push(syn.name);
  }

  return grouped;
}

/**
 * Get human-readable description for RxNorm term type
 */
export function getRxNormTermTypeDescription(tty: RxNormTermType): string {
  const descriptions: Record<RxNormTermType, string> = {
    'IN': 'Base ingredient',
    'PIN': 'Precise ingredient (with salt form)',
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
  return descriptions[tty] || tty;
}
