# Versioning

The ZippyGo API contract is versioned with
[semantic versioning](https://semver.org/). The version is `info.version`
in the OpenAPI document and the major part is the URL prefix (`/v1`).

## What changes where

| Change                                                                    | Version part | Allowed in   |
| ------------------------------------------------------------------------- | ------------ | ------------ |
| Fixing descriptions, examples or documentation                            | patch        | any release  |
| Adding an endpoint, an optional request field, a response field, an enum value or an event | minor | any release  |
| Removing or renaming anything, changing a type, making a request field required, tightening validation, changing authentication or the meaning of a status code | major | a new major version only |

Minor versions are **additive only**. Anything that could break a client
that was written against the previous minor is a breaking change and needs
a new major version. Clients are expected to ignore properties and enum
values they do not know; that is what makes additive changes safe.

## Breaking changes

A breaking change is released as a new major version with a new URL prefix
(`/v2`). The previous major keeps working during a **deprecation window of
at least 180 days** from the announcement in the changelog. During the
window the old version answers with a `Deprecation` header and a `Sunset`
header carrying the retirement date; after it, the old prefix returns
`410 Gone`.

Individual endpoints or fields can also be deprecated within a major
version by marking them `deprecated: true` in the contract and announcing
the replacement in the changelog; they are removed in the next major.

## How it is enforced

- Every pull request is checked with `oasdiff` against the bundled contract
  on `main`; findings of `ERR` severity fail the build, `WARN` and `INFO`
  findings are reported for review.
- Every change is recorded in the changelog under *Unreleased* and moved
  under the version number at release.
- Event payloads follow the same rule with their own `version` field; see
  the events documentation.
