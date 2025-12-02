import { translations, defaultLang, type Lang } from './translations';

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (lang in translations) {
    return lang as Lang;
  }
  return defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: keyof typeof translations[typeof defaultLang]): string {
    return translations[lang][key] || translations[defaultLang][key] || key;
  };
}

export function getLocalizedPath(path: string, lang: Lang): string {
  if (lang === defaultLang) {
    return path;
  }
  return `/${lang}${path}`;
}

export function getAlternateLinks(currentPath: string, currentLang: Lang) {
  // Remove current lang prefix if present
  let basePath = currentPath;
  if (currentLang !== defaultLang && currentPath.startsWith(`/${currentLang}`)) {
    basePath = currentPath.slice(currentLang.length + 1) || '/';
  }

  return Object.keys(translations).map((lang) => ({
    lang: lang as Lang,
    path: getLocalizedPath(basePath, lang as Lang),
  }));
}
