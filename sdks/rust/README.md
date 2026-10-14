# Rust SDK (planned)

This folder will hold the Rust crate for the ZippyGo API, generated from
`dist/openapi.json`.

Status: not generated yet. Candidate generators are `progenitor` and the
OpenAPI Generator `rust` template (both `reqwest`-based); the deciding
factor is OpenAPI 3.1 support, which is checked when the first resource
endpoints land in the contract. Until then nothing in this folder is
published.

Rules once it exists:

- The crate is generated, never edited by hand; regenerate with the
  repository's `gen:rust` script (to be added) after `pnpm bundle`.
- The generated output is committed so that every change to the contract
  shows up as a reviewable diff in the SDK.
