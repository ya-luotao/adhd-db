// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh', 'zh-TW', 'ja'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    ssr: {
      external: ['node:fs', 'node:path'],
    },
  },
});
