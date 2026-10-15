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
    auth/          Signing in and sessions: Audience, Delivery, OtpChannel, OtpRequest, OtpChallenge, OtpVerifyRequest,
                   PasswordSignInRequest, PasswordChangeRequest, RefreshRequest, SignOutRequest, TokenResponse, User,
                   Me, MeAccount, MeMembership, MePlatform, MeAgentMembership, MeImpersonation; two-step sign-in: TwoStepChallenge,
                   TwoStepVerifyRequest, TwoStepSetup, CodeConfirmRequest, RecoveryCodes, PasswordProof; password
                   links: PasswordResetLinkRequest, PasswordReset; step-up: StepUpRequest, StepUpCodeRequest;
                   address changes: IdentifierChangeRequest, IdentifierChange; jobs: ServiceTokenRequest, ServiceToken;
                   customers: CustomerCodeRequest, CustomerCodeChannel, DeviceIdentity, CustomerCodeChallenge, CodeVia,
                   CustomerCodeVerifyRequest, RegistrationEntry, CustomerVerification, CustomerVerificationOutcome,
                   CustomerRegistration, RegistrationStep, CustomerRegisterRequest, CustomerSession
    customers/     The customer account: CustomerProfile, CustomerProfileUpdate, CustomerLanguage, MarketingConsent,
                   MarketingConsentUpdate, CustomerAddress, CustomerAddressInput, CustomerAddressUpdate,
                   CustomerAddressList, AddressLabel, BuildingType, CustomerSessionSummary, CustomerSessionList,
                   SessionClient, CustomerLocation, AccountSection, AccountSectionKey, AccountSectionList, AccountSummary
    storefront/    Before choosing anything: GeoPoint, PlaceResolution, StorefrontZone, StorefrontPlace, Serviceability,
                   StorefrontZoneList, StorefrontHome, HomeRow, HomeRowKind, HomeCell, HomeCellKind, CampaignBanner,
                   StorefrontVertical, StorefrontCategory, StoreCardList, StoreCard, StoreState, FulfilmentMethod,
                   StorefrontVerticalRef, StoreCatalogueSummary; geocoding: AddressSuggestion, ReverseGeocode,
                   AddressSuggestionList
    partners/      The tenant record: Partner, PartnerKind, PartnerStatus, PartnerCreate, PartnerUpdate, PartnerList,
                   PartnerOwner, Contact, ContactConsent, ContactPurpose, Blocker, PartnerActivation, PartnerStanding,
                   PartnerStandingSummary, PayoutStanding, PictureUpdate
    documents/     Compliance documents: PartnerDocument, DocumentKind, ReviewState, DocumentRequirement,
                   RequirementState, TradingEffect, RequirementCoverage, PartnerDocumentCreate, PartnerDocumentReview,
                   PartnerDocumentList, PartnerDocumentPage
    payouts/       The payout account: PayoutAccount, PayoutAccountUpdate, PayoutAccountState, PayoutAccountType
    plans/         A partner's plan: Plan, PlanOffer, PartnerPlan, PlanTrial, ScheduledPlanChange, PlanImpact,
                   PlanImpactService, PartnerPlanUpdate
    locations/     A partner's places: Location, LocationStatus, LocationCreate, LocationUpdate, LocationList,
                   ReadsAs, LocationLive, LocationLiveState, LocationActivation, LocationService, Fulfilment,
                   DeliveryMethod, PickupMethod, DineInMethod, Carrier, OrderSettings, OrderSettingsUpdate, Preparation,
                   PreparationMode, ScheduledOrders, ScheduledOrdersUpdate, Cutlery, Listing, Highlight, Pause,
                   LocationPause, PauseReason, HolidayOffer, HolidayOfferList
    memberships/   A user's place in a partner: Membership, MembershipRole, MembershipList
    invitations/   Joining a partner: Invitation, InvitationStatus, InvitationCreate, InvitationList,
                   InvitationAcceptRequest, InvitationAccepted, InvitationSecondStep
    access/        Who may do what: Permission, PermissionPool, PermissionList, AccessRole, RoleKind, AccessRoleCreate,
                   AccessRoleUpdate, AccessRoleList, AccessScope, ScopeKind, AccessGrant, AccessGrantCreate,
                   AccessGrantList, AccessSet, Entitlements, EntitlementsUpdate, TeamMember, TeamMemberList,
                   TeamMemberUpdate, MembershipStatus, PlatformStaffInvite, AccessHistoryEntry, AccessHistoryList,
                   HistoryAction
    notifications/ Telling people: PushPlatform, PushRegistration, PushRegistrationInput, PushOpened,
                   CustomerNotificationPreferences, CustomerNotificationPreferencesUpdate; the delivery log:
                   NotificationChannel, MessageStatus, RecipientKind, MessageRecipient, MessageDevice, MessageText,
                   DeliveryLogEntry, DeliveryLogPage; notices: NoticeTemplate, NoticeTemplateInput,
                   NoticeTemplateUpdate, NoticeTemplateList, NoticeSend, NoticeSent, NoticeSkip, Notice, NoticeList,
                   NoticeDelivery, NoticeDetail, InboxNotice, NoticeInbox, NoticeSelection, NoticeClear, NoticesMarked,
                   NoticesCleared, NoticePlacement, NoticePresentation, NoticePresentationInput
    oversight/     Four eyes and consented viewing: Approval, ApprovalAction, ApprovalStatus, ApprovalCreate,
                   ApprovalDecision, ApprovalList, ImpersonationConsent, ConsentStatus, ImpersonationConsentCreate,
                   ImpersonationConsentApproval, ImpersonationConsentList, ImpersonationSession,
                   ImpersonationSessionCreate, ImpersonationSessionList, ImpersonationAccess
    services/      What a partner runs: ServiceKind, ServiceStatus, Service, ServiceUpsert, ServiceList, ServiceCreate,
                   ServiceUpdate, KindAvailability, KindState, ServiceAtLocation, ServiceLocationUpdate,
                   FieldServiceSettings, FieldArea, DeliveryPricing, KilometreBand, DeliveryPricingVersion,
                   DeliveryPricingUpdate, DeliveryQuote, and the configurations by kind: ProductSalesConfig with
                   CatalogueType, FieldServiceConfig, DeliveryConfig with VehicleType and VehicleKind
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
    catalog/       The catalogue: LocalizedText, CataloguePicture, CatalogueProfile, CatalogueTaxClass, CatalogSummary,
                   CatalogCounts, MenuState, CatalogTree, TreeCategory, TreeModifier, TreeAnswer; categories: CatalogCategory,
                   CatalogCategoryList, CatalogCategoryCreate, CatalogCategoryUpdate, CatalogCategoryOrder, CatalogCategoryItems,
                   OutsideHours; items: CatalogItem, CatalogItemCreate, CatalogItemUpdate, CatalogItemRow, CatalogItemPage,
                   CatalogItemStatus, FoodMark, SpiceLevel, ItemAxis, ItemAxisValue, ItemAxisInput, ItemAxisValueInput,
                   VariantSelection, CatalogVariant, CatalogVariantInput, ItemAvailability, ItemAvailabilityInput, ItemFulfilment,
                   TaxClass, StockStatus, ItemStockSummary, CatalogStockUpdate, CatalogPriceUpdate, PriceFigures,
                   CatalogPriceChange, CatalogPriceChangeList, PriceChangeVia, CatalogItemBulk, ItemBulkAction, BulkRefusal,
                   CatalogItemBulkOutcome; questions: ModifierUse, ModifierUseInput, AnswerOverride, AnswerOverrideInput,
                   CatalogItemModifiers, CatalogModifier, CatalogModifierList, ModifierAnswer, ModifierAnswerInput,
                   CatalogModifierCreate, CatalogModifierUpdate, CatalogModifierAnswers; brands: CatalogBrand, CatalogBrandList,
                   CatalogBrandInput; oversight: CatalogOverview, CatalogOverviewPage; the published menu: MenuDocument,
                   MenuCategory, MenuItem, MenuVariant, MenuAsk, MenuModifier, MenuAnswer, MenuCategoryPage, ItemSheet; the store
                   page: StorePage, StorePagePartner, StoreLive, StoreHoursDay, StoreFulfilment, StoreMenuRef, StoreCategoryTab; search:
                   SearchResult, SearchStoreHit, SearchStore, SearchProductHit, SearchSuggestion, SearchSuggestionKind,
                   SearchSuggestionList, StoreSearchResult, SearchSynonymGroup, SearchSynonymGroupList, SearchSynonymGroupCreate
    <domain>/      One folder per further domain, one file per schema
  parameters/      Shared query, path and header parameters: PartnerIdQuery, PartnerIdPath,
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
