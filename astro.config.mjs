import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://ygas.de5.net',
  integrations: [mdx()],
  markdown: {
    shikiConfig: {
      theme: 'dracula',
    },
  },
});

