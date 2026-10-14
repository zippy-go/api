# Components

Reusable parts of the API contract. `openapi.yaml` registers every schema
under `components.schemas` by name and points at the file that defines it.

```
components/
  schemas/
    common/        Shared primitives: Problem, Money, HealthResponse
    <domain>/      One folder per domain, one file per schema (planned)
  parameters/      Shared query, path and header parameters (planned)
  responses/       Shared responses such as the standard error responses (planned)
```

Naming rules:

- Schema names are `PascalCase` and the file name equals the schema name
  (`Money.yaml` defines `Money`).
- Property names are `snake_case` (`minor_units`, `partner_id`).
- Every schema has a `description` and at least one entry under `examples`.
  Examples must validate against the schema; the linter checks this.
- Timestamps are RFC 3339 strings with `format: date-time`, identifiers are
  strings, money is always the `Money` schema (never a bare number).
- Enumerations use lowercase `snake_case` values. Clients must tolerate
  values they do not know, because new values are an additive change.
- Nothing is defined inline in a path file; add a schema file and reference
  it, so the generated SDKs get a stable, named type.
- The RFC 9457 error shape is named `Problem`, not `Error`, so that the
  generated SDKs do not shadow a language's built-in error type (TypeScript's
  global `Error`, for example).
