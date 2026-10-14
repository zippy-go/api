import { defineConfig } from 'vitepress';

// VitePress configuration for the developer portal. The site root is the
// `portal` folder (`vitepress build portal`), so pages live next to this
// folder and the build lands in portal/.vitepress/dist.
export default defineConfig({
  title: 'ZippyGo API',
  description: 'Developer portal for the ZippyGo API: guides, reference, events and changelog.',
  lang: 'en',
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/getting-started' },
      { text: 'Reference', link: '/reference' },
      { text: 'Events', link: '/events' },
      { text: 'Changelog', link: '/changelog' },
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting started', link: '/getting-started' },
          { text: 'Concepts', link: '/concepts' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'API reference', link: '/reference' },
          { text: 'Events', link: '/events' },
        ],
      },
      {
        text: 'Policies',
        items: [
          { text: 'Versioning', link: '/versioning' },
          { text: 'Changelog', link: '/changelog' },
        ],
      },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/zippy-go/api' }],
    search: { provider: 'local' },
    outline: [2, 3],
  },
  vite: {
    build: {
      // The Scalar reference is one large chunk (about 3 MB minified) that is
      // loaded only on the reference page, so the default 500 kB warning is
      // noise here.
      chunkSizeWarningLimit: 4000,
    },
  },
});
