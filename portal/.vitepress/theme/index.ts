import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import ScalarReference from './ScalarReference.vue';

// Default VitePress theme plus the Scalar API reference component used on
// the reference page.
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('ScalarReference', ScalarReference);
  },
} satisfies Theme;
