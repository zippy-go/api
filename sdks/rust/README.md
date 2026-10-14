# Rust SDK (planned)

This folder will hold the Rust crate for the ZippyGo API, generated from
`dist/openapi.json`.

Status: not generated yet. The generator is `progenitor`, which produces a
`reqwest`-based client. The crate is generated when it is first needed;
until then nothing in this folder is published.

Rules once it exists:

- The crate is generated, never edited by hand; regenerate with the
  repository's `gen:rust` script (to be added) after `pnpm bundle`.
- The generated output is committed so that every change to the contract
  shows up as a reviewable diff in the SDK.
