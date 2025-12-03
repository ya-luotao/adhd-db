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
