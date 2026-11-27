// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// blog.felpra.ai — static, AI-discoverable content site.
// site URL is REQUIRED for correct sitemap + canonical URLs.
export default defineConfig({
  site: 'https://blog.felpra.ai',
  trailingSlash: 'always',
  integrations: [
    sitemap(),
  ],
});
