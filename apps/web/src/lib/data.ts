import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

// Resolve paths relative to the monorepo root
const rootDir = path.resolve(import.meta.dirname, '../../../../');

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

// Data - Drugs
export interface Drug {
  id: string;
  genericName: string;
  brandNames: Record<string, string[]>;
  drugClass: string;
  category: string;
  approvals: Array<{
    region: string;
    available: boolean;
    year?: number;
    approvedAges?: string;
  }>;
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

  return types;
}
