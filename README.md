# ZippyGo API

The public home of the ZippyGo API contract: the OpenAPI document, the
event schemas, the error catalog, the generated SDKs and the developer
portal. Everything a client needs to integrate with ZippyGo is defined
here before it is implemented, and every change is linted, checked for
breaking changes and reflected in the SDKs automatically.

## Structure

```
openapi/        The OpenAPI 3.1 document: openapi.yaml plus paths/ and components/
events/         Event envelope schema, event catalog, payload schemas and examples
errors/         Catalog of stable error codes with HTTP status and message templates
sdks/           Generated SDKs: typescript/ (generated), dart/ and rust/ (planned)
portal/         Developer portal (VitePress): guides, concepts, API reference, events, changelog
scripts/        Small Node scripts used by the package scripts
dist/           Bundled openapi.json and openapi.yaml (generated, not committed)
.github/        CI workflow and Dependabot configuration
```

Policies: [VERSIONING.md](VERSIONING.md) (semantic versioning of the
contract) and [CHANGELOG.md](CHANGELOG.md) (every change, by version).

## Run

Requires Node 26.11.1 (see `.node-version`) and pnpm 12 (pinned by
`packageManager`; pnpm switches to it automatically).

```sh
pnpm install
pnpm lint          # Redocly lint of the sources, bundle, Spectral lint of the bundle
pnpm bundle        # dist/openapi.json and dist/openapi.yaml
pnpm gen:ts        # regenerate sdks/typescript/src from the bundle
pnpm typecheck     # type-check the generated SDK
pnpm events:check  # compile event schemas and validate the examples
pnpm portal:dev    # developer portal with live reload at http://localhost:5173
pnpm portal:build  # static portal in portal/.vitepress/dist
```

## Verify

```sh
pnpm check
```

runs lint, bundle, SDK generation, typecheck, event checks and the portal
build in that order; it is what CI runs. After `pnpm check`, `git status`
must show no changes under `sdks/typescript/src`, otherwise the committed
SDK is stale. Pull requests are additionally compared against `main` with
`oasdiff`, and breaking changes fail the build.

## Working on the contract

- Add a path item file under `openapi/paths/<domain>/` and reference it
  from `openapi/openapi.yaml`; add schemas as one file each under
  `openapi/components/schemas/<domain>/` and register them under
  `components.schemas`. See the README in each folder for the naming rules.
- Add new error codes to `errors/catalog.yaml` and new events to
  `events/catalog.yaml` with a payload schema and an example.
- Record every change in `CHANGELOG.md` under *Unreleased*.
- Vocabulary: *partner* (the supply-side tenant, an organisation or an
  individual) and *agent* (who executes tasks); never merchant, driver or
  organisation as the primary term.
- This repository is public: no credentials, no internal hostnames, no
  internal links. The hosts in the OpenAPI document are placeholders on the
  reserved `.example` domain until the sandbox opens.
