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
// The try-it calls the sandbox with the developer's own sandbox key (`ApiKey`), which Scalar
// keeps in this browser's storage and sends to the sandbox only: there is no proxy, so the key
// never reaches this site. `VITE_SANDBOX_URL` names the sandbox; a developer's machine runs it on
// the local stack.
const sandbox = import.meta.env.VITE_SANDBOX_URL ?? 'http://localhost:8080';
const configuration = {
  url: withBase('/openapi.json'),
  servers: [{ url: sandbox, description: 'Sandbox: a sandbox key (zg_test_) only' }],
  authentication: { preferredSecurityScheme: 'ApiKey' },
  persistAuth: true,
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
