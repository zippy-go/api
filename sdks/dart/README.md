# Dart SDK (planned)

This folder will hold the Dart package for the ZippyGo API, generated from
`dist/openapi.json` for the Flutter apps.

Status: not generated yet. The candidate generator is the OpenAPI Generator
`dart-dio` template, which produces a `dio`-based client that fits the
mobile apps' HTTP stack. The choice is confirmed when the first resource
endpoints land in the contract; until then nothing in this folder is
published.

Rules once it exists:

- The package is generated, never edited by hand; regenerate with the
  repository's `gen:dart` script (to be added) after `pnpm bundle`.
- The generated output is committed so that every change to the contract
  shows up as a reviewable diff in the SDK.
