<script setup lang="ts">
// Renders the Scalar API reference for the bundled OpenAPI document.
// The component is loaded on the client only: Scalar needs the DOM, and the
// VitePress build pre-renders every page on the server.
import { defineAsyncComponent } from 'vue';
import { withBase } from 'vitepress';
import '@scalar/api-reference/style.css';

const ApiReference = defineAsyncComponent(() =>
  import('@scalar/api-reference').then((module) => module.ApiReference),
);

// `openapi.json` is copied into portal/public by `pnpm portal:sync`.
const configuration = {
  url: withBase('/openapi.json'),
  // The hosts in the document are placeholders, so the built-in API client
  // and "test request" buttons would only produce failed requests.
  hideClientButton: true,
  hideTestRequestButton: true,
  // Keep the page to the reference itself: no Scalar hosted-service toolbar
  // and no chat assistant.
  showDeveloperTools: 'never',
  agent: { disabled: true },
};
</script>

<template>
  <ClientOnly>
    <ApiReference :configuration="configuration" />
  </ClientOnly>
</template>
