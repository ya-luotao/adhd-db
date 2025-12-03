import type { APIRoute } from 'astro';
import { getCategoryList, getDrugClasses, getLocalizedValue, type Lang } from '../../../lib/data';

export const prerender = false;

const VALID_LANGS = ['en', 'zh', 'zh-TW', 'ja'] as const;

function isValidLang(lang: string): lang is Lang {
  return VALID_LANGS.includes(lang as Lang);
}

export const GET: APIRoute = async ({ url }) => {
  try {
    const lang = url.searchParams.get('lang') || 'en';

    if (!isValidLang(lang)) {
      return new Response(JSON.stringify({
        error: 'Invalid language',
        message: `Language must be one of: ${VALID_LANGS.join(', ')}`,
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const categories = getCategoryList();
    const drugClasses = getDrugClasses();

    const localizedCategories = categories.map(cat => ({
      id: cat.id,
      drugClass: cat.drugClass,
      name: getLocalizedValue(cat.name, lang),
      description: getLocalizedValue(cat.description, lang),
      mechanism: getLocalizedValue(cat.mechanism, lang),
      wikipediaUrl: cat.wikipediaUrl?.[lang] || cat.wikipediaUrl?.en,
      commonBrands: cat.commonBrands,
      notes: cat.notes ? getLocalizedValue(cat.notes, lang) : undefined,
      drugs: cat.drugs,
    }));

    const localizedDrugClasses = Object.entries(drugClasses).map(([id, dc]) => ({
      id,
      name: getLocalizedValue(dc.name, lang),
      description: getLocalizedValue(dc.description, lang),
      wikipediaUrl: dc.wikipediaUrl?.[lang] || dc.wikipediaUrl?.en,
      categories: dc.categories,
    }));

    return new Response(JSON.stringify({
      categories: {
        count: localizedCategories.length,
        data: localizedCategories,
      },
      drugClasses: {
        count: localizedDrugClasses.length,
        data: localizedDrugClasses,
      },
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: 'Failed to fetch categories data',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
