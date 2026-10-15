# Components

Reusable parts of the API contract. `openapi.yaml` registers every schema
under `components.schemas` by name and points at the file that defines it.

```
components/
  schemas/
    common/        Shared primitives: Problem, ProblemType, ProblemTypeDetail, Money, HealthResponse, Address;
                   the collection grammar: FilterSchema, FilterField, Facet, FacetCount, CollectionSummary
    platform/      Detailed health: HealthDetails, HealthChecks, DependencyCheck, OutboxCheck, CheckStatus;
                   token signing keys: JsonWebKeySet, JsonWebKey
    auth/          Signing in and sessions: OtpChannel, OtpRequest, OtpChallenge, OtpVerifyRequest,
                   PasswordSignInRequest, PasswordChangeRequest, RefreshRequest, TokenResponse, User, Me
    partners/      The tenant record: Partner, PartnerKind, PartnerStatus, PartnerCreate, PartnerUpdate, PartnerList
    locations/     A partner's places: Location, LocationStatus, LocationCreate, LocationUpdate, LocationList
    memberships/   A user's place in a partner: Membership, MembershipRole, MembershipList
    invitations/   Joining a partner: Invitation, InvitationStatus, InvitationCreate, InvitationList,
                   InvitationAcceptRequest, InvitationAccepted
    services/      What a partner runs: ServiceKind, ServiceStatus, Service, ServiceUpsert, ServiceList
    audit/         The audit log: AuditEntry, AuditActor, AuditTarget, AuditEntryList
    fleet/         Agents and positions: Agent, AgentPosition, AgentStatus, AgentList,
                   LocationPing, LocationPingBatch, LocationPingsAccepted
    events/        The event envelope as the API returns it: Event, EventList
    live/          Server-sent event streams: ServerSentEventStream and the frame data
                   AgentSnapshot, AgentPositionUpdate, AgentStatusUpdate (the agent stream); LiveConfig and
                   the frames of the live stream: Signal, SignalSubject, AgentsSnapshot, Resync,
                   AgentPositionFrame, AgentStatusFrame, Close, CloseReason
    reference/     Reference data: Country, Currency, Lifecycle, ServiceArea, Fence, ResolvedPin, DivisionPlan,
                   Vertical, VerticalOffer, ReachNode, CampaignSlot, DisplayGrid, ServicePolicy, PolicyLayer,
                   EffectivePolicy, Schedule, ScheduleLayer, EffectiveSchedule, Trading, StoreType, ServiceType,
                   FieldDefinition, Setting and their request bodies (`*Create`, `*Update`, StatusChange, ...)
    assets/        Digital assets: Asset, AssetState, AssetPurposeCode, AssetPurpose, AssetPurposeList, AssetGrantor,
                   AssetDestination, AssetGrantRequest, PartnerAssetGrantRequest, AssetGrant, UploadGrant, AssetConfirm,
                   AssetCrop, CropRect, SignedLink
    <domain>/      One folder per further domain, one file per schema
  parameters/      Shared query, path and header parameters: PartnerIdQuery, PartnerIdPath, ClientTypeHeader,
                   IdempotencyKeyHeader, IfMatchHeader, IfNoneMatchHeader, CorrelationIdHeader
  headers/         Shared response headers: ETag
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
  values they do not know, because new values are an additive change. A
  property that can only ever hold one value (such as `token_type`) uses
  `const` rather than a one-value enumeration.
- Request bodies get their own schema (`OtpRequest`, `PasswordChangeRequest`)
  rather than reusing the resource schema, so that required, optional and
  nullable fields can differ between what is sent and what is returned.
- Nothing is defined inline in a path file; add a schema file and reference
  it, so the generated SDKs get a stable, named type.
- A value that may be `null` is written the OpenAPI 3.1 way: a type list
  (`type: [string, 'null']`) for primitives, `oneOf` with `type: 'null'` for
  a reference. There is no `nullable` keyword in 3.1.
- The RFC 9457 error shape is named `Problem`, not `Error`, so that the
  generated SDKs do not shadow a language's built-in error type (TypeScript's
  global `Error`, for example).
