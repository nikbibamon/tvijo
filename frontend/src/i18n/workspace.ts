import type { Locale } from './config';

/**
 * Workspace copy dictionary (Tvijo client control plane).
 *
 * English is the base (source of truth); Ukrainian and Russian are the other
 * fully supported languages. This dictionary lives OUTSIDE the `Translations` contract
 * (`typeof en`, shared by all 11 locale files) because the workspace surface
 * has its own release cadence — adding
 * `workspace` to `en.ts` would force every other locale file to carry the
 * same keys and break `check:i18n` (tsc inside src/i18n).
 *
 * The pattern mirrors `src/i18n/module-catalog.ts`. Changing the shape here
 * does not touch the other 10 locale files, API endpoints, JSON fields, types,
 * routes, or business logic. Product identifiers, provider/model names, BYOK,
 * currencies, timezone names, scopes and API-returned values stay verbatim.
 */

/* ------------------------------- helpers --------------------------------- */

/** Interpolate `{key}` placeholders. Unknown keys are left untouched. */
export function formatTemplate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    params && params[key] !== undefined ? String(params[key]) : `{${key}}`);
}

/** Current locale renders the workspace surface in Ukrainian. */
export function isUkrainian(locale: Locale): boolean {
  return locale === 'uk';
}

/** Current locale renders the workspace surface in Russian. */
export function isRussian(locale: Locale): boolean {
  return locale === 'ru';
}

/* ------------------------------- types ----------------------------------- */

type NavGroup = { label?: string; items: ReadonlyArray<{ label: string }> };

type ShellCopy = {
  brandWord: string;
  personalWorkspace: string;
  search: string;
  openNavigation: string;
  closeNavigation: string;
  expandNavigation: string;
  collapseNavigation: string;
  close: string;
  expand: string;
  collapse: string;
  navAria: string;
  commandAria: string;
  commandPlaceholder: string;
  commandSection: string;
  commandNoMatch: string;
  notificationsTitle: string;
  publicWebsite: string;
  home: string;
  logOut: string;
  userMenuAria: string;
  loadingAria: string;
  accountFallback: string;
  workspaceTitle: string;
  groups: NavGroup[];
  /** Short labels for the mobile bottom tab bar (≤900px). */
  mobileTabs: ReadonlyArray<{ href: string; label: string }>;
  bottomNavAria: string;
};

type GlobalCopy = {
  localeFallback: string;
  loadingDataAria: string;
  loadFailed: string;
  retry: string;
  /* A refused budget is a decision the user can act on, not an outage. */
  budgetExceededTitle: string;
  budgetExceededAction: string;
};

type HomeCopy = {
  eyebrow: string;
  greeting: string;
  subtitle: string;
  liveEyebrow: string;
  liveTitle: string;
  liveBadge: string;
  provider: string;
  verified: string;
  notConnected: string;
  budget: string;
  configured: string;
  notSet: string;
  runs: string;
  loading: string;
  noRunsStatus: string;
  evidence: string;
  available: string;
  pendingFirstRun: string;
  retryLive: string;
  getOrientedEyebrow: string;
  startWithTvijo: string;
  commercialEyebrow: string;
  businessServices: string;
  exploreEyebrow: string;
  exploreTvijo: string;
  approvalRequired: string;
  loadFailed: string;
  start1Title: string;
  start1Copy: string;
  start2Title: string;
  start2Copy: string;
  service1Title: string;
  service1Copy: string;
  service2Title: string;
  service2Copy: string;
  service3Title: string;
  service3Copy: string;
  service4Title: string;
  service4Copy: string;
  explore1Title: string;
  explore1Copy: string;
  explore2Title: string;
  explore2Copy: string;
  explore3Title: string;
  explore3Copy: string;
  nextStepEyebrow: string;
  browseAll: string;
  knowledgeEyebrow: string;
  setupShow: string;
  setupHide: string;
  setupDone: string;
  nextProvider: string;
  nextProviderCopy: string;
  nextBudget: string;
  nextBudgetCopy: string;
  nextRun: string;
  nextRunCopy: string;
  nextOperate: string;
  nextOperateCopy: string;
  explore4Title: string;
  explore4Copy: string;
};

type SetupStepCopy = { label: string; description: string; action: string };
type SetupCopy = {
  homeTitle: string;
  overviewTitle: string;
  doneOf: string;
  complete: string;
  current: string;
  pending: string;
  viewActivity: string;
  openWorkspace: string;
  activationTarget: string;
  activationTargetSub: string;
  whyThisMatters: string;
  steps: SetupStepCopy[];
};

type OverviewCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  viewActivity: string;
  startRun: string;
  connectProvider: string;
  measuredSpend: string;
  providerUsage: string;
  noUsage: string;
  requests: string;
  inSelectedPeriod: string;
  totalTokens: string;
  inputOutput: string;
  runs: string;
  evidenceBacked: string;
  usageEyebrow: string;
  usageTitle: string;
  openActivity: string;
  noUsageTitle: string;
  connectAndRun: string;
  topModels: string;
  unknownModel: string;
  noModelBreakdown: string;
  topProviders: string;
  unknownProvider: string;
  noProviderBreakdown: string;
  stateEyebrow: string;
  controlTitle: string;
  providerConnection: string;
  required: string;
  budgetPolicy: string;
  notConfigured: string;
  managementKeys: string;
  active: string;
  verified: string;
  secretIsolation: string;
  defaultDeny: string;
  reviewGuardrails: string;
  latestEyebrow: string;
  recentRuns: string;
  viewAll: string;
  workspaceRun: string;
  modelNotReported: string;
  noRunsTitle: string;
  browseApps: string;
  calloutTitle: string;
  calloutBody: string;
  runsEvidence: string;
  billingSeparation: string;
  billingCreditsLink: string;
  monthSuffix: string;
  daySuffix: string;
};

type ActivityCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  range7: string;
  range30: string;
  range90: string;
  spend: string;
  requests: string;
  paidToProviders: string;
  inputTokens: string;
  outputTokens: string;
  topModels: string;
  topProviders: string;
  unknown: string;
  noModelActivity: string;
  noModelActivityCopy: string;
  noProviderActivity: string;
  noProviderActivityCopy: string;
};

type BillingCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  setBudget: string;
  providerUsage: string;
  measuredPaid: string;
  details: string;
  tvijoCharges: string;
  seeLedger: string;
  zero: string;
  recordedInLedger: string;
  noPaymentLedger: string;
  budgetPolicy: string;
  hardStopEnabled: string;
  warningActive: string;
  addBoundary: string;
  edit: string;
  flowEyebrow: string;
  howBillingWorks: string;
  stepProviderCalls: string;
  stepProviderCopy: string;
  stepTvijoServices: string;
  stepTvijoCopy: string;
  stepManagedCompute: string;
  stepManagedCopy: string;
  stepDomains: string;
  stepDomainsCopy: string;
  ledgerEyebrow: string;
  chargesCredits: string;
  charges: string;
  credits: string;
  noChargesTitle: string;
  noChargesCopy: string;
  noCreditsTitle: string;
  noCreditsCopy: string;
  managedEyebrow: string;
  infrastructure: string;
  managedCopy: string;
  manageBenefitQuote: string;
  manageBenefitNoAuto: string;
  manageBenefitPricing: string;
  exploreInfra: string;
  separationNote: string;
  dialogEyebrow: string;
  setBudgetPolicy: string;
  dialogSub: string;
  dialogCloseAria: string;
  dailyLimit: string;
  monthlyLimit: string;
  perRequestLimit: string;
  warnAt: string;
  optional: string;
  enableHardStop: string;
  hardStopHelp: string;
  cancel: string;
  saving: string;
  savePolicy: string;
  saveFailed: string;
  month: string;
  day: string;
  /* Who the provider actually billed. One number for both would tell a BYOK
     customer that Tvijo's spend is theirs. */
  byokSpend: string;
  byokSpendNote: string;
  platformSpend: string;
  platformSpendNote: string;
  /* $0 for "free" and $0 for "no price known" must not read the same. */
  unpricedNote: string;
};

type ConnectionsCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  addKey: string;
  providerLabel: string;
  labelLabel: string;
  labelPlaceholder: string;
  secretLabel: string;
  secretPlaceholder: string;
  addVerify: string;
  noCredsTitle: string;
  noCredsCopy: string;
  credsTitle: string;
  secretRequired: string;
  createFailed: string;
  verifyFailed: string;
  revokeFailed: string;
  confirmRevoke: string;
  headProvider: string;
  headLabel: string;
  headStatus: string;
  headHint: string;
  headActions: string;
  verify: string;
  revoke: string;
  revoked: string;
  manageKeysLink: string;
  viewAppsLink: string;
  viewModelsLink: string;
  openRouterTitle: string;
  openRouterCopy: string;
  openRouterPrivacy: string;
  openRouterResources: string;
  openRouterDocs: string;
  openRouterModels: string;
  /** Shown only when the provider was really contacted during verify. */
  verifiedLive: string;
  keyCreditRemaining: string;
  /* Provider cards: what each provider can actually do, and what the AI Radar
     snapshot measured for it. */
  providersTitle: string;
  providersCopy: string;
  liveCheckYes: string;
  liveCheckNo: string;
  liveCheckNoHint: string;
  catalogModels: string;
  catalogInput: string;
  catalogOutput: string;
  catalogContext: string;
  catalogNone: string;
  catalogSourceLabel: string;
  catalogScopeAggregated: string;
  catalogScopeVendor: string;
  perMillion: string;
  stateLiveVerified: string;
  stateStored: string;
  stateError: string;
  storedNotVerified: string;
  headVerification: string;
  noCredential: string;
  gatewayEyebrow: string;
  gatewayTitle: string;
  gatewayCopy: string;
  gatewayNotConfiguredTitle: string;
  gatewayNotConfiguredCopy: string;
  gatewayNameLabel: string;
  gatewayNamePlaceholder: string;
  gatewayBudgetLabel: string;
  gatewayCreate: string;
  gatewayCreating: string;
  gatewayNameRequired: string;
  gatewayCreateFailed: string;
  gatewayStatusFailed: string;
  gatewayRevokeFailed: string;
  gatewayConfirmRevoke: string;
  gatewaySecretOnce: string;
  gatewayConfigTitle: string;
  copySecret: string;
  copyConfig: string;
  copied: string;
  gatewayEmptyTitle: string;
  gatewayEmptyCopy: string;
  gatewayKeysTitle: string;
  gatewayKeyHead: string;
  gatewayBudgetHead: string;
  gatewayUsageHead: string;
  gatewayRequests: string;
  refreshStatus: string;
  loadingStatus: string;
  gatewayTraceTitle: string;
  gatewayTraces: string;
  day: string;
  month: string;
};

type GuardrailsCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  budgetPolicy: string;
  softLimitCopy: string;
  limit: string;
  value: string;
  rowsDaily: string;
  rowsMonthly: string;
  rowsPerRequest: string;
  rowsHardStop: string;
  yes: string;
  no: string;
  decisionTrailTitle: string;
  decisionTrailCopy: string;
  onTrail: string;
  onTrailCopy: string;
  rowAction: string;
  rowResource: string;
  rowWhen: string;
  /** Control names, keyed by the backend's `controls[].key`. */
  ctlSpendCap: string;
  ctlSecretStorage: string;
  ctlExecutionIsolation: string;
  ctlHumanAcceptance: string;
  ctlToolAuthorization: string;
  /** Control states, keyed by `controls[].state`. */
  stNotConfigured: string;
  stConfiguredSoft: string;
  stEnforced: string;
  stEncrypted: string;
  stUnavailable: string;
  stWorker: string;
  stInline: string;
  stOff: string;
  stActive: string;
  stNoRuns: string;
  /** Why a control reads the way it does. */
  whySpendCap: string;
  whySecretStorage: string;
  whyExecutionIsolation: string;
  whyHumanAcceptance: string;
  whyToolAuthorization: string;
  decisionsAllowed: string;
  decisionsDenied: string;
  windowDays: string;
};

type DomainsCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  describeIdea: string;
  ideaPlaceholder: string;
  checking: string;
  findDomains: string;
  notConfiguredTitle: string;
  notConfiguredCopy: string;
  suggestionsTitle: string;
  purchaseExternal: string;
  statesAvailable: string;
  statesUnavailable: string;
  statesUnverified: string;
  recentSearches: string;
  states: string;
  whenFail: string;
};

type InfraCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  providerIntegration: string;
  configured: string;
  notConfigured: string;
  capabilityVerified: string;
  notGranted: string;
  provisioning: string;
  featureEnabled: string;
  humanApprovalOnly: string;
  quoteApproval: string;
  safeFlowTitle: string;
  stepChoose: string;
  stepChooseCopy: string;
  stepQuote: string;
  stepQuoteCopy: string;
  stepApproval: string;
  stepApprovalCopy: string;
  stepRule: string;
  stepRuleCopy: string;
  yourRequests: string;
  quotePending: string;
  noRequestsTitle: string;
  noRequestsCopy: string;
};

type KeysCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  createTitle: string;
  keyName: string;
  keyNamePlaceholder: string;
  creating: string;
  createKey: string;
  secretOnce: string;
  copyText: string;
  keyNameRequired: string;
  createFailed: string;
  revokeFailed: string;
  confirmRevoke: string;
  headName: string;
  headKey: string;
  headScopes: string;
  headStatus: string;
  revoke: string;
  revoked: string;
  noKeyList: string;
  noKeysCopy: string;
  activeRevokedTitle: string;
};

type ModelsCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  registryTitle: string;
  headProvider: string;
  headSupported: string;
  headCredential: string;
  headLastVerified: string;
  yes: string;
  no: string;
  footnote: string;
  byModel: string;
  byProvider: string;
  headModel: string;
  headCalls: string;
  headCost: string;
  noUsageTitle: string;
  noUsageCopy: string;
  connectProviderKey: string;
  viewGuardrails: string;
  catalogSource: string;
  openRouterPolicy: string;
};

type PrefCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  display: string;
  timezone: string;
  dateFormat: string;
  defaultRange: string;
  range7: string;
  range30: string;
  range90: string;
  tzHelp: string;
  saving: string;
  savePrefs: string;
  saved: string;
  couldNotSave: string;
};

type ProfileCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  displayName: string;
  email: string;
  notSet: string;
  editPublic: string;
};

type ContractsCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  splitContract: string;
  splitBinding: string;
  splitAuthorization: string;
  artifactsTitle: string;
  artifactsIntro: string;
  statusLine: string;
  runsLink: string;
  runsHref: string;
  articleLink: string;
  articleHref: string;
  honestNote: string;
  /* Live list */
  listTitle: string;
  listCopy: string;
  emptyTitle: string;
  emptyCopy: string;
  colGoal: string;
  colHash: string;
  colBudget: string;
  colRuns: string;
  colCreated: string;
  statusDraft: string;
  statusApproved: string;
  statusBlocked: string;
  /* Detail */
  backToList: string;
  frozenTitle: string;
  frozenCopy: string;
  fieldGoal: string;
  fieldExpected: string;
  fieldHash: string;
  fieldVersion: string;
  fieldModels: string;
  fieldTools: string;
  fieldForbidden: string;
  fieldGates: string;
  fieldAcceptance: string;
  fieldKnowledge: string;
  budgetUsd: string;
  budgetTokens: string;
  budgetMinutes: string;
  budgetSteps: string;
  runsTitle: string;
  runNo: string;
  runCost: string;
  runTokens: string;
  runSteps: string;
  runAcceptance: string;
  runEvidence: string;
  noRunsTitle: string;
  noRunsCopy: string;
  evidenceButton: string;
  evidenceLoading: string;
  evidenceNone: string;
  evidenceHash: string;
  loadFailed: string;
  /* Builder — five screens (spec 2026-09-contract-builder §4.C) */
  newContract: string;
  builderTitle: string;
  step: string;
  of: string;
  back: string;
  next: string;
  cancel: string;
  stepGoal: string;
  stepKnowledge: string;
  stepPermissions: string;
  stepBudget: string;
  stepAcceptance: string;
  stepReview: string;
  goalLabel: string;
  goalPlaceholder: string;
  expectedLabel: string;
  expectedPlaceholder: string;
  knowledgeIntro: string;
  knowledgeRef: string;
  knowledgeKind: string;
  knowledgeVersion: string;
  knowledgeAdd: string;
  knowledgeRemove: string;
  knowledgeEmpty: string;
  permissionsIntro: string;
  enforcementNote: string;
  toolsLabel: string;
  forbiddenLabel: string;
  gatesLabel: string;
  sideEffect: string;
  modelsLabel: string;
  modelsEmpty: string;
  modelsFilter: string;
  modelsNoKey: string;
  modelsRunnableNote: string;
  budgetIntro: string;
  moneyRule: string;
  acceptanceIntro: string;
  acceptanceOnlyThese: string;
  reviewIntro: string;
  reviewHash: string;
  reviewHashNote: string;
  freeze: string;
  freezing: string;
  frozenOk: string;
  errGoal: string;
  errExpected: string;
  errModels: string;
  errAcceptance: string;
  errBudget: string;
  createFailedContract: string;
  noRunsExecutorCopy: string;
  runTitle: string;
  runIntro: string;
  runModelLabel: string;
  runSpendWarning: string;
  runConfirm: string;
  runCancel: string;
  runStarting: string;
  runNoKey: string;
  runResultPassed: string;
  runResultRework: string;
  runResultBlocked: string;
  runResultUnfinished: string;
  none: string;
};

type RunsCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  noRunsTitle: string;
  noRunsCopy: string;
  headRoute: string;
  headModel: string;
  headStatus: string;
  headCost: string;
  headWhen: string;
  connectProvider: string;
  viewGuardrails: string;
};

type SkillPacksCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  tierLabel: string;
  filesLabel: string;
  howToLink: string;
  markdownOnly: string;
  gatewayLabel: string;
  gatewayConfigured: string;
  gatewayNotConfigured: string;
  gatewayConfiguredNote: string;
  gatewayNotConfiguredNote: string;
  openConnections: string;
  versionLabel: string;
  downloadPack: string;
  downloading: string;
  downloadFailed: string;
  howToEyebrow: string;
  howToTitle: string;
  howToSubtitle: string;
  step1Title: string;
  step1Copy: string;
  step2Title: string;
  step2Copy: string;
  step3Title: string;
  step3Copy: string;
  step4Title: string;
  step4Copy: string;
  byokTitle: string;
  byokCopy: string;
  loadFailed: string;
  emptyTitle: string;
  emptyCopy: string;
  cta: string;
};


type DeliveryCopy = { label: string; tagline: string; cta: string };

type CatalogCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  allCategories: string;
  categorySupport: string;
  categoryKnowledge: string;
  categoryGrowth: string;
  categoryControl: string;
  liveLabel: string;
  assistedLabel: string;
  plannedLabel: string;
  liveHint: string;
  assistedHint: string;
  plannedHint: string;
  selfServe: DeliveryCopy;
  guided: DeliveryCopy;
  doneForYou: DeliveryCopy;
  notifyCta: string;
  howToGet: string;
  whatYouGet: string;
  whatItSolves: string;
  needsFirst: string;
  runsToday: string;
  ownDeployment: string;
  openIn: string;
  etaLabel: string;
  copySnippet: string;
  copied: string;
  snippetTitle: string;
  detailAria: string;
  close: string;
  open: string;
  requested: string;
  requestTitle: string;
  requestNote: string;
  messageLabel: string;
  messagePlaceholder: string;
  contactLabel: string;
  contactPlaceholder: string;
  submit: string;
  sending: string;
  cancel: string;
  sentTitle: string;
  sentCopy: string;
  failed: string;
  plannedTitle: string;
  plannedCopy: string;
  notifyAck: string;
  pathUnavailable: string;
  notAvailableShort: string;
  showAll: string;
  statusLabel: string;
  nextStepLabel: string;
  firstReplyLabel: string;
  stepAwaitingReview: string;
  stepScoping: string;
  stepScheduled: string;
  stepDelivered: string;
  stepDeclined: string;
  yourRequests: string;
  noRequests: string;
  statusNew: string;
  statusInReview: string;
  statusScheduled: string;
  statusDone: string;
  statusDeclined: string;
  escalationLabel: string;
  emptyTitle: string;
  emptyCopy: string;
  loadFailed: string;
};

type AssistantCopy = {
  name: string;
  launcher: string;
  title: string;
  subtitle: string;
  greeting: string;
  placeholder: string;
  send: string;
  thinking: string;
  close: string;
  clear: string;
  you: string;
  sourcesLabel: string;
  unsureBadge: string;
  suggestions: ReadonlyArray<string>;
  escalateCta: string;
  escalateTitle: string;
  escalateCopy: string;
  escalateContactLabel: string;
  escalateContactPlaceholder: string;
  escalateMessageLabel: string;
  escalateMessagePlaceholder: string;
  escalateSubmit: string;
  escalateConsent: string;
  escalateConsentRequired: string;
  escalateDone: string;
  failed: string;
  scopeNote: string;
};

export type WorkspaceCopy = {
  shell: ShellCopy;
  global: GlobalCopy;
  home: HomeCopy;
  setup: SetupCopy;
  overview: OverviewCopy;
  activity: ActivityCopy;
  billing: BillingCopy;
  connections: ConnectionsCopy;
  guardrails: GuardrailsCopy;
  domains: DomainsCopy;
  infrastructure: InfraCopy;
  keys: KeysCopy;
  models: ModelsCopy;
  preferences: PrefCopy;
  profile: ProfileCopy;
  contracts: ContractsCopy;
  runs: RunsCopy;
  skillPacks: SkillPacksCopy;
  catalog: CatalogCopy;
  assistant: AssistantCopy;
  reference: ReferenceCopy;
};

type ReferenceCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  listTitle: string;
  emptyTitle: string;
  emptyCopy: string;
  backToList: string;
  minutes: string;
};

/* ------------------------------- English --------------------------------- */

const EN: WorkspaceCopy = {
  shell: {
    brandWord: "Tvijo",
    personalWorkspace: "Personal Workspace",
    search: "Search",
    openNavigation: "Open navigation",
    closeNavigation: "Close navigation",
    expandNavigation: "Expand navigation",
    collapseNavigation: "Collapse navigation",
    close: "Close",
    expand: "Expand",
    collapse: "Collapse",
    navAria: "Tvijo workspace navigation",
    commandAria: "Workspace command palette",
    commandPlaceholder: "Jump to a workspace screen...",
    commandSection: "TVIJO WORKSPACE",
    commandNoMatch: "No workspace screen matches “{query}”.",
    notificationsTitle: "Notifications are not enabled yet",
    publicWebsite: "Public site",
    home: "Home",
    logOut: "Log out",
    userMenuAria: "User menu",
    loadingAria: "Loading your workspace",
    accountFallback: "Tvijo account",
    workspaceTitle: "Your personal Tvijo workspace",
    groups: [
      { items: [{ label: "Home" }] },
      { label: "Workspace", items: [{ label: "Overview" }, { label: "Activity" }, { label: "Runs & Evidence" }, { label: "Models" }, { label: "Apps & Plugins" }, { label: "Contracts" }, { label: "Reference" }] },
      { label: "Control", items: [{ label: "Connections" }, { label: "Management Keys" }, { label: "Guardrails" }] },
      { label: "Resources", items: [{ label: "Infrastructure" }, { label: "Domains" }] },
      { label: "Account", items: [{ label: "Billing & Credits" }, { label: "Profile" }, { label: "Preferences" }] },
    ],
    mobileTabs: [
      { href: "/dashboard", label: "Home" },
      { href: "/workspace", label: "Overview" },
      { href: "/workspace/activity", label: "Activity" },
      { href: "/workspace/apps", label: "Apps" },
      { href: "#more", label: "Menu" },
    ],
    bottomNavAria: "Workspace sections",
  },
  global: { loadingDataAria: "Loading data", loadFailed: "Unable to load this data.", retry: "Retry", localeFallback: "The workspace is available in English, Ukrainian and Russian. Showing English.", budgetExceededTitle: "Budget limit reached", budgetExceededAction: "Adjust budget" },
  home: {
    eyebrow: "TVIJO · PERSONAL WORKSPACE",
    greeting: "Good afternoon, {name}",
    subtitle: "Set up your workspace, then run and audit AI from one place.",
    liveEyebrow: "LIVE ACCOUNT STATE",
    liveTitle: "Workspace status",
    liveBadge: "Live",
    provider: "Provider",
    verified: "{count} verified",
    notConnected: "Not connected",
    budget: "Budget",
    configured: "Configured",
    notSet: "Not set",
    runs: "Runs",
    loading: "Loading…",
    noRunsStatus: "No runs yet",
    evidence: "Evidence",
    available: "Available",
    pendingFirstRun: "Pending first run",
    retryLive: "Retry live status",
    getOrientedEyebrow: "GET ORIENTED",
    startWithTvijo: "Start with Tvijo",
    commercialEyebrow: "CLEAR COMMERCIAL LANES",
    businessServices: "Business services",
    exploreEyebrow: "PUBLIC PRODUCT",
    exploreTvijo: "Explore Tvijo",
    approvalRequired: "Approval required",
    loadFailed: "Workspace could not be loaded.",
    start1Title: "AI Control Plane",
    start1Copy: "Connect providers, choose models and keep runs governed.",
    start2Title: "Exposure & ownership",
    start2Copy: "Scan a project before making an operational decision.",
    service1Title: "Provider usage",
    service1Copy: "Measured usage from your connected provider keys.",
    service2Title: "Tvijo services",
    service2Copy: "Separate Tvijo charges and available credits.",
    service3Title: "Managed compute",
    service3Copy: "Request infrastructure with quote and human approval.",
    service4Title: "Domains",
    service4Copy: "Check availability, then purchase through an external registrar.",
    explore1Title: "Knowledge Base",
    explore1Copy: "Research, guides and practical references.",
    explore2Title: "Learn",
    explore2Copy: "Courses on AI, finance and technology.",
    explore3Title: "Decision Center",
    explore3Copy: "Structured decisions, votes and discussion.",
    explore4Title: "Bubbles",
    explore4Copy: "Build visual maps around your knowledge.",
    nextStepEyebrow: "YOUR NEXT STEP",
    browseAll: "Browse all solutions",
    knowledgeEyebrow: "KNOWLEDGE",
    setupShow: "Show setup steps",
    setupHide: "Hide setup steps",
    setupDone: "Setup complete",
    nextProvider: "Connect a provider",
    nextProviderCopy: "Add your own AI provider key. It is encrypted and you can revoke it at any time.",
    nextBudget: "Set a spend limit",
    nextBudgetCopy: "A daily or monthly cap, so an experiment can never become an invoice.",
    nextRun: "Pick your first solution",
    nextRunCopy: "Choose a result you want and how you want to get it.",
    nextOperate: "Review what ran",
    nextOperateCopy: "Every call with its model, status and cost.",
  },
  catalog: {
    eyebrow: "WHAT YOU CAN GET",
    title: "Solutions",
    subtitle: "Pick the result you want. Then choose how you get it: do it yourself, do it with us, or have it done for you.",
    allCategories: "All",
    categorySupport: "Customer support",
    categoryKnowledge: "Knowledge",
    categoryGrowth: "Growth",
    categoryControl: "Control",
    liveLabel: "Live in your workspace",
    assistedLabel: "Delivered with a person",
    plannedLabel: "Not built yet",
    liveHint: "Works right now with your own keys.",
    assistedHint: "A person is involved in setting this up.",
    plannedHint: "We are not pretending this exists. Ask to be told when it does.",
    selfServe: { label: "Do it yourself", tagline: "Copy what you need and go.", cta: "Get the setup" },
    guided: { label: "Do it with us", tagline: "One working session, your hands on the wheel.", cta: "Book a session" },
    doneForYou: { label: "We do it for you", tagline: "We deliver it and hand it over working.", cta: "Request delivery" },
    notifyCta: "Tell me when it exists",
    howToGet: "How you get it",
    whatYouGet: "What you get",
    whatItSolves: "What it solves",
    needsFirst: "Needs first",
    runsToday: "Where it runs today",
    ownDeployment: "our own deployment",
    openIn: "Open",
    etaLabel: "Typically",
    copySnippet: "Copy",
    copied: "Copied",
    snippetTitle: "Copy this",
    detailAria: "{name} details",
    close: "Close",
    open: "Open",
    requested: "Requested",
    requestTitle: "Request {name}",
    requestNote: "A person replies within {sla} with a written scope. No card, no automatic billing.",
    messageLabel: "What should we know?",
    messagePlaceholder: "The one thing that would make this worth it for you...",
    contactLabel: "Better contact (optional)",
    contactPlaceholder: "Phone, Telegram or another email",
    submit: "Send request",
    sending: "Sending...",
    cancel: "Cancel",
    sentTitle: "Request received",
    sentCopy: "It is in the queue with your note attached. You can track it under Your requests.",
    failed: "The request could not be sent. Try again.",
    plannedTitle: "Not built yet",
    plannedCopy: "This is on the map, not in the product. Ask to be notified and you will hear about it once — when it actually works.",
    notifyAck: "Noted. You will hear about it once — when it actually works.",
    pathUnavailable: "This path is not available yet.",
    notAvailableShort: "not yet",
    showAll: "Show {count} more",
    statusLabel: "Status",
    nextStepLabel: "Next step",
    firstReplyLabel: "First reply",
    stepAwaitingReview: "A person reads your note and comes back with scope.",
    stepScoping: "We are scoping it with you.",
    stepScheduled: "Scheduled — you have a date.",
    stepDelivered: "Delivered.",
    stepDeclined: "We did not take this on. You should have the reason in writing.",
    yourRequests: "Your requests",
    noRequests: "Nothing requested yet.",
    statusNew: "New",
    statusInReview: "In review",
    statusScheduled: "Scheduled",
    statusDone: "Done",
    statusDeclined: "Declined",
    escalationLabel: "Question passed to a person",
    emptyTitle: "No solutions in this category",
    emptyCopy: "Switch the filter to see everything available.",
    loadFailed: "The catalog could not be loaded.",
  },
  assistant: {
    name: "Tvijo Assistant",
    launcher: "Ask Tvijo",
    title: "Ask Tvijo",
    subtitle: "Answers from the knowledge base, or a person.",
    greeting: "Ask about your workspace, keys, limits or any solution. If I do not have a reliable answer, I will say so and pass it to a person.",
    placeholder: "Ask a question...",
    send: "Send",
    thinking: "Looking...",
    close: "Close assistant",
    clear: "Clear",
    you: "You",
    sourcesLabel: "Sources",
    unsureBadge: "No reliable answer",
    suggestions: [
      "Whose API keys are used?",
      "How do I cap the spend?",
      "Do I have to install it myself?",
    ],
    escalateCta: "Pass this to a person",
    escalateTitle: "Pass to a person",
    escalateCopy: "Your question goes along with it, so you do not have to retype it.",
    escalateContactLabel: "Better contact (optional)",
    escalateContactPlaceholder: "Phone, Telegram or another email",
    escalateMessageLabel: "Anything to add?",
    escalateMessagePlaceholder: "Context, urgency, what you already tried...",
    escalateSubmit: "Send to a person",
    escalateConsent: "Send my question as I wrote it",
    escalateConsentRequired: "Tick the box, or a person only gets your note — not the question.",
    escalateDone: "Sent. A person will pick it up.",
    failed: "Something went wrong. Try again.",
    scopeNote: "Answers come from the knowledge base only — no guesses about prices, limits or your data.",
  },
  setup: {
    homeTitle: "Workspace setup",
    overviewTitle: "Finish workspace setup",
    doneOf: "{count} of {total}",
    complete: "Complete",
    current: "Current",
    pending: "Pending",
    viewActivity: "View activity",
    openWorkspace: "Open workspace",
    activationTarget: "Activation target",
    activationTargetSub: "Verified provider + first run",
    whyThisMatters: "Why this matters",
    steps: [
      { label: "Create workspace", description: "Your personal workspace is ready.", action: "Open workspace" },
      { label: "Connect a provider", description: "Link an AI provider to start routing and running.", action: "Connect provider" },
      { label: "Set a budget cap", description: "Define daily or monthly spend limits.", action: "Set budget" },
      { label: "Run your first workflow", description: "Use an app to create your first evidence-backed run.", action: "Choose an app" },
    ],
  },
  overview: {
    eyebrow: "AI CONTROL PLANE",
    title: "Workspace overview",
    subtitle: "Govern provider usage, spend, runs and evidence from one place.",
    viewActivity: "View activity",
    startRun: "Start a run",
    connectProvider: "Connect provider",
    measuredSpend: "Measured spend",
    providerUsage: "Provider usage",
    noUsage: "No usage yet",
    requests: "Requests",
    inSelectedPeriod: "In selected period",
    totalTokens: "Total tokens",
    inputOutput: "Input + output",
    runs: "Runs",
    evidenceBacked: "Evidence-backed activity",
    usageEyebrow: "MEASURED PROVIDER USAGE",
    usageTitle: "Usage & activity",
    openActivity: "Open activity",
    noUsageTitle: "No usage yet",
    connectAndRun: "Connect a provider and run an app. Measured spend and model activity will appear here.",
    topModels: "Top models",
    unknownModel: "Unknown model",
    noModelBreakdown: "No model breakdown",
    topProviders: "Top providers",
    unknownProvider: "Unknown provider",
    noProviderBreakdown: "No provider breakdown",
    stateEyebrow: "CURRENT STATE",
    controlTitle: "Control status",
    providerConnection: "Provider connection",
    required: "Required",
    budgetPolicy: "Budget policy",
    notConfigured: "Not configured",
    managementKeys: "Management keys",
    active: "{count} active",
    verified: "{count} verified",
    secretIsolation: "Secret isolation",
    defaultDeny: "Default deny",
    reviewGuardrails: "Review guardrails",
    latestEyebrow: "LATEST EVIDENCE",
    recentRuns: "Recent runs",
    viewAll: "View all",
    workspaceRun: "Workspace run",
    modelNotReported: "Model not reported",
    noRunsTitle: "No runs yet",
    browseApps: "Browse apps",
    calloutTitle: "Evidence is created by real runs",
    calloutBody: "Tvijo records model, route, status and timing after activity occurs. Empty states stay empty — nothing is simulated.",
    runsEvidence: "Runs & evidence",
    billingSeparation: "Provider usage is paid directly to providers through BYOK. Tvijo services and credits are shown separately in",
    billingCreditsLink: "Billing & Credits",
    monthSuffix: "/mo",
    daySuffix: "/day",
  },
  activity: {
    eyebrow: "WORKSPACE · MEASURED USAGE",
    title: "Activity",
    subtitle: "User-scoped provider usage. Empty metrics stay empty until real calls occur.",
    range7: "7 days",
    range30: "30 days",
    range90: "90 days",
    spend: "Measured spend",
    requests: "Requests",
    paidToProviders: "Paid directly to providers",
    inputTokens: "Input tokens",
    outputTokens: "Output tokens",
    topModels: "Top models",
    topProviders: "Top providers",
    unknown: "Unknown",
    noModelActivity: "No model activity",
    noModelActivityCopy: "Model usage appears after your first routed call.",
    noProviderActivity: "No provider activity",
    noProviderActivityCopy: "Connect a provider to begin measuring usage.",
  },
  billing: {
    eyebrow: "ACCOUNT · CLEAR COMMERCIAL LANES",
    title: "Billing & Credits",
    subtitle: "Provider usage, Tvijo charges and managed services stay separate.",
    setBudget: "Set budget",
    providerUsage: "Provider usage",
    measuredPaid: "Measured only · paid to providers",
    details: "Details",
    tvijoCharges: "Tvijo charges",
    seeLedger: "See ledger",
    zero: "{currency} 0.00",
    recordedInLedger: "Recorded in your Tvijo ledger",
    noPaymentLedger: "No payment ledger for BYOK",
    budgetPolicy: "Budget policy",
    hardStopEnabled: "Hard stop enabled",
    warningActive: "Warning policy active",
    addBoundary: "Add a spend boundary",
    edit: "Edit",
    flowEyebrow: "NO HIDDEN MIXING",
    howBillingWorks: "How billing works",
    stepProviderCalls: "Provider calls",
    stepProviderCopy: "BYOK usage is billed directly by your provider.",
    stepTvijoServices: "Tvijo services",
    stepTvijoCopy: "Workspace and approved managed work are charged by Tvijo.",
    stepManagedCompute: "Managed compute",
    stepManagedCopy: "Infrastructure begins with a quote and human approval.",
    stepDomains: "Domains",
    stepDomainsCopy: "Tvijo checks availability; registration stays with the registrar.",
    ledgerEyebrow: "ACCOUNT LEDGER",
    chargesCredits: "Charges & credits",
    charges: "Charges",
    credits: "Credits",
    noChargesTitle: "No Tvijo charges yet",
    noChargesCopy: "Provider spend is not a Tvijo transaction. When a paid Tvijo service is activated, its charges will appear here.",
    noCreditsTitle: "Credits are not enabled",
    noCreditsCopy: "Credits and automatic top-ups appear only when a real payment ledger is available for your account.",
    managedEyebrow: "MANAGED SERVICE",
    infrastructure: "Infrastructure",
    managedCopy: "Request managed compute through a transparent quote. Every order waits for human approval before provisioning.",
    manageBenefitQuote: "Quote before commitment",
    manageBenefitNoAuto: "No automatic provisioning",
    manageBenefitPricing: "Separate service pricing",
    exploreInfra: "Explore infrastructure",
    separationNote: "Provider amounts are measurements, not Tvijo invoices. Credits remain hidden from purchasing flows until the backend payment ledger is enabled.",
    dialogEyebrow: "SPEND BOUNDARIES",
    setBudgetPolicy: "Set budget policy",
    dialogSub: "Limits apply to measured usage and do not charge your account.",
    dialogCloseAria: "Close budget policy",
    dailyLimit: "Daily limit ({currency})",
    monthlyLimit: "Monthly limit ({currency})",
    perRequestLimit: "Per-request limit ({currency})",
    warnAt: "Warn at",
    optional: "Optional",
    enableHardStop: "Enable hard stop",
    hardStopHelp: "Stop routed activity when the configured cap is reached.",
    cancel: "Cancel",
    saving: "Saving…",
    savePolicy: "Save policy",
    saveFailed: "Budget policy could not be saved.",
    month: "/month",
    day: "/day",
    byokSpend: "On your own key",
    byokSpendNote: "Billed to you by the provider · Tvijo never charges this",
    platformSpend: "On Tvijo keys",
    platformSpendNote: "Ran without a verified key of yours",
    unpricedNote: "{count} calls are recorded at 0 because no price is known for the model — not because they were free.",
  },


  connections: {
    eyebrow: "CONNECTIONS · DEFAULT DENY",
    title: "Connections",
    subtitle: "Connect your own AI providers. Secrets are write-only and never re-shown.",
    addKey: "Add a provider key (BYOK)",
    providerLabel: "Provider",
    labelLabel: "Label",
    labelPlaceholder: "Production key",
    secretLabel: "Secret (write-only)",
    secretPlaceholder: "sk-…",
    addVerify: "Add & verify key",
    noCredsTitle: "No credentials yet",
    noCredsCopy: "Add a provider key above to start.",
    credsTitle: "Provider credentials",
    secretRequired: "Secret is required.",
    createFailed: "Create failed",
    verifyFailed: "Verify failed",
    revokeFailed: "Revoke failed",
    confirmRevoke: "Revoke this credential? It can no longer be used.",
    headProvider: "Provider",
    headLabel: "Label",
    headStatus: "Status",
    headHint: "Hint",
    headActions: "Actions",
    verify: "Verify",
    revoke: "Revoke",
    revoked: "revoked",
    manageKeysLink: "Manage Tvijo API keys",
    viewAppsLink: "View apps",
    viewModelsLink: "View models",
    openRouterTitle: "One key, curated model access",
    openRouterCopy: "Tvijo verifies the key without a paid model call. Requests stay on the server and use the configured model allowlist.",
    openRouterPrivacy: "Default route: zero-data-retention endpoints, data collection denied, required parameters enforced, fallbacks allowed.",
    openRouterResources: "Official OpenRouter resources",
    openRouterDocs: "Quickstart docs",
    openRouterModels: "Model catalog",
    verifiedLive: "Key checked against the provider — no tokens spent.",
    keyCreditRemaining: "Credit left",
    gatewayEyebrow: "HERMES · MANAGED GATEWAY",
    gatewayTitle: "AI OS gateway key",
    gatewayCopy: "Create a separate key for a Hermes agent on your server. Every key has its own daily USD cap, usage meter and trace lane.",
    gatewayNotConfiguredTitle: "Gateway provisioning is not configured",
    gatewayNotConfiguredCopy: "An operator must connect the AI OS control plane before gateway keys can be created.",
    gatewayNameLabel: "Key name",
    gatewayNamePlaceholder: "Production Hermes server",
    gatewayBudgetLabel: "Daily hard cap (USD)",
    gatewayCreate: "Create gateway key",
    gatewayCreating: "Creating…",
    gatewayNameRequired: "Key name is required.",
    gatewayCreateFailed: "Gateway key could not be created.",
    gatewayStatusFailed: "Gateway status could not be loaded.",
    gatewayRevokeFailed: "Gateway key could not be revoked.",
    gatewayConfirmRevoke: "Revoke this gateway key? Hermes will stop working with it immediately.",
    gatewaySecretOnce: "Copy this key now. It will not be shown again.",
    gatewayConfigTitle: "Hermes config.yaml",
    copySecret: "Copy key",
    copyConfig: "Copy config",
    copied: "Copied",
    gatewayEmptyTitle: "No gateway keys yet",
    gatewayEmptyCopy: "Create one to connect Hermes through Tvijo routing and budget guards.",
    gatewayKeysTitle: "Gateway keys",
    gatewayKeyHead: "Key",
    gatewayBudgetHead: "Hard cap",
    gatewayUsageHead: "Today",
    gatewayRequests: "requests",
    refreshStatus: "Refresh usage",
    loadingStatus: "Loading…",
    gatewayTraceTitle: "Sanitized AI OS status",
    gatewayTraces: "recent traces",
    day: "day",
    month: "month",
    providersTitle: "Providers",
    providersCopy: "What Tvijo can actually do with each provider, and what today's model snapshot measured for it.",
    liveCheckYes: "Key check available",
    liveCheckNo: "No key check",
    liveCheckNoHint: "A key for this provider can be stored and encrypted, but Tvijo cannot confirm it works.",
    catalogModels: "Models",
    catalogInput: "Input",
    catalogOutput: "Output",
    catalogContext: "Max context",
    catalogNone: "No catalog data for this provider.",
    catalogSourceLabel: "Source: OpenRouter, measured",
    catalogScopeAggregated: "whole routed catalog",
    catalogScopeVendor: "this vendor via OpenRouter",
    perMillion: "per 1M tokens",
    stateLiveVerified: "Verified with provider",
    stateStored: "Stored, not verified",
    stateError: "Rejected",
    storedNotVerified: "The secret is stored and encrypted. Tvijo has no key check for this provider, so it has not been confirmed.",
    headVerification: "Verification",
    noCredential: "No key added",
  },
  guardrails: {
    eyebrow: "GUARDRAILS · PROVABLE ONLY",
    title: "Guardrails",
    subtitle: "Every control below is read from configuration or from your own data. A control we cannot prove is not shown at all.",
    budgetPolicy: "Budget policy",
    softLimitCopy: "A limit is set but hard stop is off — runs are not refused.",
    limit: "Limit",
    value: "Value",
    rowsDaily: "Daily",
    rowsMonthly: "Monthly",
    rowsPerRequest: "Per request",
    rowsHardStop: "Hard stop",
    yes: "yes",
    no: "no",
    decisionTrailTitle: "Decision trail",
    decisionTrailCopy: "Every change to a key, budget or contract, newest first.",
    onTrail: "Nothing recorded yet",
    onTrailCopy: "Creating a key, changing a budget or approving a contract will appear here.",
    rowAction: "Action",
    rowResource: "Resource",
    rowWhen: "When",
    ctlSpendCap: "Spend hard cap",
    ctlSecretStorage: "Secret storage",
    ctlExecutionIsolation: "Execution isolation",
    ctlHumanAcceptance: "Human acceptance",
    ctlToolAuthorization: "Tool authorization",
    stNotConfigured: "Not configured",
    stConfiguredSoft: "Soft limit",
    stEnforced: "Enforced",
    stEncrypted: "Encrypted",
    stUnavailable: "Unavailable",
    stWorker: "Separate worker",
    stInline: "In-request",
    stOff: "Off",
    stActive: "Active",
    stNoRuns: "No runs yet",
    whySpendCap: "Read from your budget policy. Enforced means a limit exists and hard stop is on, so a run over budget is refused.",
    whySecretStorage: "Read from the encryption key. Encrypted means stored secrets are sealed with Fernet; without it, saving a credential fails rather than storing plaintext.",
    whyExecutionIsolation: "Read from the task queue configuration: work runs in a separate worker process, or inline in the request.",
    whyHumanAcceptance: "Read from your approved contracts. A contract with a before_external_action gate needs a person before any side effect.",
    whyToolAuthorization: "Counted from authorization decisions on your runs. No runs means no evidence either way.",
    decisionsAllowed: "allowed",
    decisionsDenied: "denied",
    windowDays: "last 30 days",
  },
  domains: {
    eyebrow: "RESOURCES · AVAILABILITY ONLY",
    title: "Domains",
    subtitle: "Generate names and check real availability. Registration stays with an external registrar.",
    describeIdea: "Describe your idea",
    ideaPlaceholder: "e.g. evidence-first AI workspace",
    checking: "Checking…",
    findDomains: "Find domains",
    notConfiguredTitle: "Availability provider is not configured",
    notConfiguredCopy: "Suggestions are shown below, but availability cannot be verified yet.",
    suggestionsTitle: "Suggestions",
    purchaseExternal: "Purchase external",
    statesAvailable: "Available",
    statesUnavailable: "Unavailable",
    statesUnverified: "Not verified",
    recentSearches: "Recent searches",
    states: "{count} available",
    whenFail: "Domain search failed.",
  },
  infrastructure: {
    eyebrow: "RESOURCES · MANAGED COMPUTE",
    title: "Infrastructure",
    subtitle: "Transparent quotes and human-approved provisioning. No server is created automatically.",
    providerIntegration: "Provider integration",
    configured: "Configured",
    notConfigured: "Not configured",
    capabilityVerified: "Capability verified",
    notGranted: "Capability not granted",
    provisioning: "Provisioning",
    featureEnabled: "Feature enabled",
    humanApprovalOnly: "Human approval only",
    quoteApproval: "Quote and approval are required before any provider action.",
    safeFlowTitle: "Safe request flow",
    stepChoose: "Choose compute",
    stepChooseCopy: "Select an available server type and location.",
    stepQuote: "Receive quote",
    stepQuoteCopy: "Provider and service pricing are shown separately.",
    stepApproval: "Human approval",
    stepApprovalCopy: "The request waits for explicit review.",
    stepRule: "Provision",
    stepRuleCopy: "Only approved, enabled orders may proceed.",
    yourRequests: "Your requests",
    quotePending: "Quote pending",
    noRequestsTitle: "No infrastructure requests",
    noRequestsCopy: "The quote builder will be available when the provider catalog and commercial pricing are configured.",
  },
  keys: {
    eyebrow: "CONTROL · PROGRAMMATIC ACCESS",
    title: "Management Keys",
    subtitle: "Create scoped Tvijo keys. A secret is visible only once and cannot be recovered.",
    createTitle: "Create a read-only key",
    keyName: "Key name",
    keyNamePlaceholder: "analytics-readonly",
    creating: "Creating…",
    createKey: "Create key",
    secretOnce: "Copy this secret now — it will not be shown again.",
    copyText: "Copy",
    keyNameRequired: "Key name is required.",
    createFailed: "Key could not be created.",
    revokeFailed: "Key could not be revoked.",
    confirmRevoke: "Revoke this management key?",
    headName: "Name",
    headKey: "Key",
    headScopes: "Scopes",
    headStatus: "Status / action",
    revoke: "Revoke",
    revoked: "revoked",
    noKeyList: "No management keys",
    noKeysCopy: "Create a scoped key only when you need programmatic access.",
    activeRevokedTitle: "Active and revoked keys",
  },
  models: {
    eyebrow: "MODELS · USER-SCOPED",
    title: "Models & usage",
    subtitle: "Provider adapters, credential status, and your measured usage.",
    registryTitle: "Provider registry",
    headProvider: "Provider",
    headSupported: "Supported",
    headCredential: "Credential",
    headLastVerified: "Last verified",
    yes: "Yes",
    no: "No",
    footnote: "Supported reflects an installed adapter, not a working connection.",
    byModel: "By model",
    byProvider: "By provider",
    headModel: "Model",
    headCalls: "Calls",
    headCost: "Cost",
    noUsageTitle: "No usage yet",
    noUsageCopy: "Usage aggregates appear after your first user-scoped call.",
    connectProviderKey: "Connect a provider key",
    viewGuardrails: "View guardrails",
    catalogSource: "Official catalog",
    openRouterPolicy: "ZDR · data collection denied · parameter match",
  },
  preferences: {
    eyebrow: "PREFERENCES · STORED SETTINGS",
    title: "Preferences",
    subtitle: "Only settings we actually store and use. Name and email live in your account profile.",
    display: "Display",
    timezone: "Timezone",
    dateFormat: "Date format",
    defaultRange: "Default activity range",
    range7: "Last 7 days",
    range30: "Last 30 days",
    range90: "Last 90 days",
    tzHelp: "IANA name, e.g. Europe/Kiev. Used to group activity by day.",
    saving: "Saving…",
    savePrefs: "Save preferences",
    saved: "Saved · {date}",
    couldNotSave: "Could not save",
  },
  profile: {
    eyebrow: "ACCOUNT · IDENTITY",
    title: "Profile",
    subtitle: "Your authenticated Tvijo identity and account details.",
    displayName: "Display name",
    email: "Email",
    notSet: "Not set",
    editPublic: "Edit public profile",
  },
  contracts: {
    eyebrow: "EXECUTION CONTRACTS",
    title: "Every agent run starts with a contract",
    subtitle: "Goal, approved knowledge, permissions, model routes, budget and deterministic acceptance rules are frozen before a run — and every run returns a verifiable evidence pack.",
    splitContract: "Contract — what result is authorized",
    splitBinding: "Binding — which model and tool perform it",
    splitAuthorization: "Authorization — whether each action is allowed right now",
    artifactsTitle: "Seven recorded artifacts",
    artifactsIntro: "After a run, Tvijo keeps the contract hash, the knowledge snapshot, the binding, the authorization log, the execution trace, the acceptance results and the evidence pack.",
    statusLine: "Approved → Bound → Running → Verification → Passed / Rework / Blocked",
    runsLink: "See your own runs",
    articleLink: "Read the full explainer",
    honestNote: "Contracts below are yours alone. Another account's contract is not listed and its id resolves to a 404.",
    listTitle: "Your contracts",
    listCopy: "Frozen envelopes owned by this account, newest first.",
    emptyTitle: "No contracts yet",
    emptyCopy: "A contract is created when a run is started under one. Nothing here is a placeholder — this list stays empty until you own a real contract.",
    colGoal: "Goal",
    colHash: "Hash",
    colBudget: "Budget",
    colRuns: "Runs",
    colCreated: "Created",
    statusDraft: "Draft",
    statusApproved: "Approved",
    statusBlocked: "Blocked",
    backToList: "Back to contracts",
    frozenTitle: "Frozen contract",
    frozenCopy: "These values were hashed at approval and cannot change. A correction is a new version, never an edit.",
    fieldGoal: "Goal",
    fieldExpected: "Expected result",
    fieldHash: "Contract hash",
    fieldVersion: "Version",
    fieldModels: "Allowed models",
    fieldTools: "Allowed tools",
    fieldForbidden: "Forbidden actions",
    fieldGates: "Approval gates",
    fieldAcceptance: "Acceptance rules",
    fieldKnowledge: "Approved knowledge",
    budgetUsd: "Max USD",
    budgetTokens: "Max tokens",
    budgetMinutes: "Max minutes",
    budgetSteps: "Max steps",
    runsTitle: "Runs",
    runNo: "Run",
    runCost: "Cost",
    runTokens: "Tokens",
    runSteps: "Steps",
    runAcceptance: "Acceptance",
    runEvidence: "Evidence",
    noRunsTitle: "No runs on this contract",
    noRunsCopy: "The contract is frozen but nothing has executed under it yet.",
    evidenceButton: "Evidence pack",
    evidenceLoading: "Loading…",
    evidenceNone: "No evidence pack recorded for this run.",
    evidenceHash: "Pack hash",
    loadFailed: "Could not load the contract.",
    none: "—",
    runsHref: "/workspace/runs",
    articleHref: "/kb/ai-governance/every-agent-run-starts-with-a-contract",
    newContract: "New contract",
    builderTitle: "New execution contract",
    step: "Step",
    of: "of",
    back: "Back",
    next: "Next",
    cancel: "Cancel",
    stepGoal: "Goal",
    stepKnowledge: "Knowledge",
    stepPermissions: "Permissions",
    stepBudget: "Budget",
    stepAcceptance: "Acceptance",
    stepReview: "Review",
    goalLabel: "What should be done",
    goalPlaceholder: "Check a company and prepare a report",
    expectedLabel: "What counts as the result",
    expectedPlaceholder: "Report with a source per claim",
    knowledgeIntro: "Pin the exact sources and versions the run may rely on. A source added later is not part of this contract.",
    knowledgeRef: "Reference",
    knowledgeKind: "Kind",
    knowledgeVersion: "Version",
    knowledgeAdd: "Add source",
    knowledgeRemove: "Remove",
    knowledgeEmpty: "No sources pinned. A contract without approved knowledge is allowed, but the run has nothing versioned to cite.",
    permissionsIntro: "Allow only the tools the work needs, and name the actions that must never happen.",
    enforcementNote: "These are declarations enforced at the tool boundary: a tool outside the allowlist, or an action on the forbidden list, is refused. Tvijo itself runs model calls; tools run in ai-os under this same frozen contract.",
    toolsLabel: "Allowed tools",
    forbiddenLabel: "Forbidden actions",
    gatesLabel: "Approval gates",
    sideEffect: "changes something outside the run",
    modelsLabel: "Allowed models",
    modelsEmpty: "No models available. Add and verify a provider key on Connections first.",
    budgetIntro: "Frozen before the first call. A run that exceeds any of these is blocked, not truncated.",
    moneyRule: "A whole amount is sent as a number and a fractional one as text — that is what keeps the hash identical on both sides.",
    acceptanceIntro: "Deterministic checks run over the result. A failed mandatory check sends the work to Rework.",
    acceptanceOnlyThese: "These three are the rules Tvijo actually implements. An unknown rule is treated as failed, so nothing else is offered.",
    reviewIntro: "This is the exact JSON that will be hashed and frozen.",
    reviewHash: "Contract hash",
    reviewHashNote: "Computed in your browser with the same algorithm the backend uses. It must match what the server returns.",
    freeze: "Freeze contract",
    freezing: "Freezing…",
    frozenOk: "Contract frozen and approved.",
    errGoal: "Describe what should be done.",
    errExpected: "Describe what counts as the result.",
    errModels: "Choose at least one model.",
    errAcceptance: "Choose at least one acceptance rule.",
    errBudget: "Every budget field needs a positive number.",
    createFailedContract: "Could not create the contract.",
    noRunsExecutorCopy: "The contract is frozen and ready. Runs appear here when execution happens under it — Tvijo's own executor is not wired to this button yet, so a run today comes from ai-os calling the contract API with a service token.",
    modelsFilter: "Filter models",
    modelsNoKey: "You have no verified key for a provider that can execute a run. Add and verify an OpenRouter key on Connections; the contract can be frozen without one, but not run.",
    modelsRunnableNote: "These are the models Tvijo can actually execute. The catalog on Connections lists everything the provider offers — that is what exists, not what runs here.",
    runTitle: "Run this contract",
    runIntro: "One model call under the frozen contract. The result is checked against the acceptance rules; the executor does not decide its own success.",
    runModelLabel: "Model",
    runSpendWarning: "This spends money on your own provider key, up to the contract's budget. Tvijo does not pay for it and does not resell tokens.",
    runConfirm: "Run and spend up to",
    runCancel: "Not now",
    runStarting: "Running…",
    runNoKey: "Running needs a verified OpenRouter key. Add one on Connections — the contract stays frozen either way.",
    runResultPassed: "Passed — every acceptance rule held.",
    runResultRework: "Rework — an acceptance rule failed. The output is kept and the contract is unchanged.",
    runResultBlocked: "Blocked — the contract refused this run.",
    runResultUnfinished: "The provider did not answer. Nothing was accepted and the run is recorded as unfinished.",
  },

  runs: {
    eyebrow: "EVIDENCE · USER-SCOPED",
    title: "Runs & Evidence",
    subtitle: "Your own decisions and AI call log — no imported demo counters.",
    noRunsTitle: "No runs yet",
    noRunsCopy: "Runs from your model calls and decisions will appear here. Connect a provider and run a task to start.",
    headRoute: "Route",
    headModel: "Model",
    headStatus: "Status",
    headCost: "Cost",
    headWhen: "When",
    connectProvider: "Connect a provider",
    viewGuardrails: "View guardrails",
  },
  skillPacks: {
    eyebrow: "AGENT SKILL PACKS",
    title: "Skill packs",
    subtitle: "Markdown documents you give to an agent you run on your own server. Read what each pack does before you install anything.",
    tierLabel: "Trust tier",
    filesLabel: "{count} files",
    howToLink: "How to install on your own server",
    markdownOnly: "These packs are Markdown documents. There is no executable code inside any of them.",
    gatewayLabel: "AI OS gateway",
    gatewayConfigured: "configured",
    gatewayNotConfigured: "not configured",
    gatewayConfiguredNote: "Create a per-client key with its own hard budget cap and trace lane in Connections.",
    gatewayNotConfiguredNote: "An operator must connect the AI OS control plane before gateway keys can be created.",
    openConnections: "Create or manage a gateway key",
    versionLabel: "version",
    downloadPack: "Download ZIP",
    downloading: "Downloading…",
    downloadFailed: "The skill pack could not be downloaded.",
    howToEyebrow: "HOW TO INSTALL",
    howToTitle: "Run a pack on your own server",
    howToSubtitle: "You run the agent runtime yourself. The packs are documents, not code, and they run only where you put them.",
    step1Title: "Install the agent",
    step1Copy: "Install Hermes on your own VPS using its official installer, or use any agent that reads agentskills.io SKILL.md files.",
    step2Title: "Add the packs",
    step2Copy: "Download the ZIP and copy its Markdown files into the agent's skills directory. Review every file before use.",
    step3Title: "Create a gateway key",
    step3Copy: "In Connections, create a dedicated key and copy it immediately. Tvijo stores only its prefix and last four characters.",
    step4Title: "Point Hermes at Tvijo",
    step4Copy: "Copy the ready config.yaml block from Connections. Your key gets a separate budget cap, usage meter and audit trail.",
    byokTitle: "Your keys stay yours",
    byokCopy: "The packs do not contain credentials and do not store your keys. BYOK keeps provider billing with you.",
    loadFailed: "The skill packs could not be loaded.",
    emptyTitle: "No skill packs published yet",
    emptyCopy: "Packs will appear here once they are published.",
    cta: "Browse skill packs",
  },
  reference: {
    eyebrow: "AI REFERENCE",
    title: "AI reference",
    subtitle: "How to connect and use models through OpenRouter as a BYOK provider.",
    listTitle: "Topics",
    emptyTitle: "Reference not available yet",
    emptyCopy: "The reference articles will appear here once they are published.",
    backToList: "Back to topics",
    minutes: "min read",
  },
};

/* ------------------------------ Ukrainian -------------------------------- */

const UK: WorkspaceCopy = {
  shell: {
    brandWord: "Tvijo",
    personalWorkspace: "Особистий робочий простір",
    search: "Пошук",
    openNavigation: "Відкрити навігацію",
    closeNavigation: "Закрити навігацію",
    expandNavigation: "Розгорнути навігацію",
    collapseNavigation: "Згорнути навігацію",
    close: "Закрити",
    expand: "Розгорнути",
    collapse: "Згорнути",
    navAria: "Навігація робочого простору Tvijo",
    commandAria: "Палітра команд робочого простору",
    commandPlaceholder: "Перейти до екрана робочого простору...",
    commandSection: "РОБОЧИЙ ПРОСТІР TVIJO",
    commandNoMatch: "Немає екрана робочого простору за запитом “{query}”.",
    notificationsTitle: "Сповіщення ще не ввімкнені",
    publicWebsite: "Публічний сайт",
    home: "Головна",
    logOut: "Вийти",
    userMenuAria: "Меню користувача",
    loadingAria: "Завантаження робочого простору",
    accountFallback: "Акаунт Tvijo",
    workspaceTitle: "Ваш особистий робочий простір Tvijo",
    groups: [
      { items: [{ label: "Головна" }] },
      { label: "Робочий простір", items: [{ label: "Огляд" }, { label: "Активність" }, { label: "Запуски та докази" }, { label: "Моделі" }, { label: "Застосунки й плагіни" }, { label: "Контракти" }, { label: "Довідник" }] },
      { label: "Керування", items: [{ label: "Під’єднання" }, { label: "Ключі управління" }, { label: "Запобіжники" }] },
      { label: "Ресурси", items: [{ label: "Інфраструктура" }, { label: "Домени" }] },
      { label: "Акаунт", items: [{ label: "Білінг та кредити" }, { label: "Профіль" }, { label: "Налаштування" }] },
    ],
    mobileTabs: [
      { href: "/dashboard", label: "Головна" },
      { href: "/workspace", label: "Огляд" },
      { href: "/workspace/activity", label: "Активність" },
      { href: "/workspace/apps", label: "Застосунки" },
      { href: "#more", label: "Меню" },
    ],
    bottomNavAria: "Розділи робочого простору",
  },
  global: { loadingDataAria: "Завантаження даних", loadFailed: "Не вдалося завантажити ці дані.", retry: "Повторити", localeFallback: "Робочий простір доступний англійською, українською та російською. Показано англійську.", budgetExceededTitle: "Ліміт бюджету вичерпано", budgetExceededAction: "Змінити бюджет" },
  home: {
    eyebrow: "TVIJO · ОСОБИСТИЙ РОБОЧИЙ ПРОСТІР",
    greeting: "Доброго дня, {name}",
    subtitle: "Налаштуйте робочий простір, а потім запускайте та перевіряйте ШІ в одному місці.",
    liveEyebrow: "ПОТОЧНИЙ СТАН АКАУНТА",
    liveTitle: "Стан робочого простору",
    liveBadge: "Онлайн",
    provider: "Провайдер",
    verified: "{count} підтверджено",
    notConnected: "Не під’єднано",
    budget: "Бюджет",
    configured: "Налаштовано",
    notSet: "Не задано",
    runs: "Запуски",
    loading: "Завантаження…",
    noRunsStatus: "Запусків ще немає",
    evidence: "Докази",
    available: "Доступно",
    pendingFirstRun: "Очікування першого запуску",
    retryLive: "Повторити оновлення статусу",
    getOrientedEyebrow: "З ЧОГО ПОЧАТИ",
    startWithTvijo: "Почніть із Tvijo",
    commercialEyebrow: "ЧІТКІ КОМЕРЦІЙНІ ПОТОКИ",
    businessServices: "Бізнес-сервіси",
    exploreEyebrow: "ПУБЛІЧНИЙ ПРОДУКТ",
    exploreTvijo: "Досліджуйте Tvijo",
    approvalRequired: "Потрібне погодження",
    loadFailed: "Не вдалося завантажити робочий простір.",
    start1Title: "AI Control Plane",
    start1Copy: "Під’єднуйте провайдерів, обирайте моделі та тримайте запуски під контролем.",
    start2Title: "Експозиція та право власності",
    start2Copy: "Перевірте проєкт перед ухваленням операційного рішення.",
    service1Title: "Використання провайдера",
    service1Copy: "Виміряне використання за вашими ключами провайдера.",
    service2Title: "Сервіси Tvijo",
    service2Copy: "Окреме нарахування Tvijo та доступні кредити.",
    service3Title: "Керовані обчислення",
    service3Copy: "Замовляйте інфраструктуру з рахунком і погодженням людини.",
    service4Title: "Домени",
    service4Copy: "Перевіряйте доступність, а тоді купуйте через зовнішнього реєстратора.",
    explore1Title: "Knowledge Base",
    explore1Copy: "Дослідження, гайди та практичні матеріали.",
    explore2Title: "Навчання",
    explore2Copy: "Курси зі штучного інтелекту, фінансів і технологій.",
    explore3Title: "Центр рішень",
    explore3Copy: "Структуровані рішення, голосування та обговорення.",
    nextStepEyebrow: "ВАШ НАСТУПНИЙ КРОК",
    browseAll: "Усі рішення",
    knowledgeEyebrow: "ЗНАННЯ",
    setupShow: "Показати кроки налаштування",
    setupHide: "Сховати кроки налаштування",
    setupDone: "Налаштування завершено",
    nextProvider: "Під’єднайте провайдера",
    nextProviderCopy: "Додайте власний ключ AI-провайдера. Він шифрується, і його можна відкликати будь-коли.",
    nextBudget: "Встановіть ліміт витрат",
    nextBudgetCopy: "Денний або місячний ліміт, щоб експеримент не став рахунком.",
    nextRun: "Оберіть перше рішення",
    nextRunCopy: "Оберіть потрібний результат і спосіб, у який хочете його отримати.",
    nextOperate: "Перегляньте, що виконалось",
    nextOperateCopy: "Кожен виклик із моделлю, статусом і вартістю.",
    explore4Title: "Bubbles",
    explore4Copy: "Створюйте візуальні мапи навколо ваших знань.",
  },
  catalog: {
    eyebrow: "ЩО МОЖНА ОТРИМАТИ",
    title: "Рішення",
    subtitle: "Оберіть результат, який вам потрібен. Далі оберіть спосіб: зробити самому, зробити разом або доручити нам.",
    allCategories: "Усі",
    categorySupport: "Підтримка клієнтів",
    categoryKnowledge: "Знання",
    categoryGrowth: "Зростання",
    categoryControl: "Контроль",
    liveLabel: "Працює у вашому workspace",
    assistedLabel: "Впроваджується за участі людини",
    plannedLabel: "Ще не побудовано",
    liveHint: "Працює вже зараз із вашими ключами.",
    assistedHint: "У налаштуванні бере участь людина.",
    plannedHint: "Ми не вдаємо, що це вже є. Можна попросити повідомити, коли з’явиться.",
    selfServe: { label: "Зроблю сам", tagline: "Скопіюйте потрібне і працюйте.", cta: "Отримати інструкцію" },
    guided: { label: "Зробимо разом", tagline: "Одна робоча сесія, кермо у ваших руках.", cta: "Записатися на сесію" },
    doneForYou: { label: "Зробимо за вас", tagline: "Впроваджуємо і передаємо робочим.", cta: "Замовити впровадження" },
    notifyCta: "Повідомити, коли з’явиться",
    howToGet: "Як це отримати",
    whatYouGet: "Що ви отримаєте",
    whatItSolves: "Який біль знімає",
    needsFirst: "Спершу потрібно",
    runsToday: "Де це вже працює",
    ownDeployment: "наше власне впровадження",
    openIn: "Відкрити",
    etaLabel: "Зазвичай",
    copySnippet: "Копіювати",
    copied: "Скопійовано",
    snippetTitle: "Скопіюйте це",
    detailAria: "Деталі: {name}",
    close: "Закрити",
    open: "Відкрити",
    requested: "Заявку надіслано",
    requestTitle: "Заявка: {name}",
    requestNote: "Людина відповідає протягом {sla} і надсилає письмовий обсяг робіт. Без картки і без автоматичних списань.",
    messageLabel: "Що нам варто знати?",
    messagePlaceholder: "Одна річ, заради якої це має сенс саме для вас...",
    contactLabel: "Зручніший контакт (необов’язково)",
    contactPlaceholder: "Телефон, Telegram або інша пошта",
    submit: "Надіслати заявку",
    sending: "Надсилаємо...",
    cancel: "Скасувати",
    sentTitle: "Заявку отримано",
    sentCopy: "Вона в черзі разом із вашою нотаткою. Статус видно в розділі «Ваші заявки».",
    failed: "Не вдалося надіслати заявку. Спробуйте ще раз.",
    plannedTitle: "Ще не побудовано",
    plannedCopy: "Це є на карті, але не в продукті. Попросіть повідомити — і почуєте про це один раз, коли воно справді запрацює.",
    notifyAck: "Записали. Ви почуєте про це один раз — коли воно справді запрацює.",
    pathUnavailable: "Цей шлях поки недоступний.",
    notAvailableShort: "поки ні",
    showAll: "Показати ще {count}",
    statusLabel: "Статус",
    nextStepLabel: "Наступний крок",
    firstReplyLabel: "Перша відповідь",
    stepAwaitingReview: "Людина читає вашу нотатку і повертається з обсягом робіт.",
    stepScoping: "Узгоджуємо обсяг разом із вами.",
    stepScheduled: "Заплановано — дата є.",
    stepDelivered: "Виконано.",
    stepDeclined: "Ми не взялися за це. Причина має бути у вас письмово.",
    yourRequests: "Ваші заявки",
    noRequests: "Заявок поки немає.",
    statusNew: "Нова",
    statusInReview: "На розгляді",
    statusScheduled: "Заплановано",
    statusDone: "Виконано",
    statusDeclined: "Відхилено",
    escalationLabel: "Питання передано людині",
    emptyTitle: "У цій категорії немає рішень",
    emptyCopy: "Змініть фільтр, щоб побачити все доступне.",
    loadFailed: "Не вдалося завантажити каталог.",
  },
  assistant: {
    name: "Асистент Tvijo",
    launcher: "Запитати Tvijo",
    title: "Запитати Tvijo",
    subtitle: "Відповіді з бази знань або від людини.",
    greeting: "Питайте про workspace, ключі, ліміти чи будь-яке рішення. Якщо надійної відповіді немає — скажу про це і передам питання людині.",
    placeholder: "Поставте питання...",
    send: "Надіслати",
    thinking: "Шукаю...",
    close: "Закрити асистента",
    clear: "Очистити",
    you: "Ви",
    sourcesLabel: "Джерела",
    unsureBadge: "Надійної відповіді немає",
    suggestions: [
      "Чиї API-ключі використовуються?",
      "Як обмежити витрати?",
      "Чи треба встановлювати самому?",
    ],
    escalateCta: "Передати людині",
    escalateTitle: "Передати людині",
    escalateCopy: "Ваше питання піде разом із заявкою — переписувати його не доведеться.",
    escalateContactLabel: "Зручніший контакт (необов’язково)",
    escalateContactPlaceholder: "Телефон, Telegram або інша пошта",
    escalateMessageLabel: "Що додати?",
    escalateMessagePlaceholder: "Контекст, терміновість, що вже пробували...",
    escalateSubmit: "Надіслати людині",
    escalateConsent: "Надіслати моє питання так, як я його написав",
    escalateConsentRequired: "Позначте пункт, інакше людина отримає лише вашу нотатку — без питання.",
    escalateDone: "Надіслано. Людина візьме це в роботу.",
    failed: "Щось пішло не так. Спробуйте ще раз.",
    scopeNote: "Відповіді беруться лише з бази знань — жодних здогадок про ціни, ліміти чи ваші дані.",
  },
  setup: {
    homeTitle: "Налаштування робочого простору",
    overviewTitle: "Завершіть налаштування робочого простору",
    doneOf: "{count} з {total}",
    complete: "Виконано",
    current: "Поточний",
    pending: "Очікує",
    viewActivity: "Переглянути активність",
    openWorkspace: "Відкрити робочий простір",
    activationTarget: "Ціль активації",
    activationTargetSub: "Підтверджений провайдер + перший запуск",
    whyThisMatters: "Чому це важливо",
    steps: [
      { label: "Створіть робочий простір", description: "Ваш особистий робочий простір готовий.", action: "Відкрити робочий простір" },
      { label: "Під’єднайте провайдера", description: "Зв’яжіть AI-провайдера, щоб почати маршрутизацію та запуски.", action: "Під’єднати провайдера" },
      { label: "Встановіть ліміт бюджету", description: "Задайте добові чи місячні ліміти витрат.", action: "Встановити бюджет" },
      { label: "Запустіть перший процес", description: "Використайте застосунок, щоб створити перший запуск із доказами.", action: "Обрати застосунок" },
    ],
  },
  overview: {
    eyebrow: "AI CONTROL PLANE",
    title: "Огляд робочого простору",
    subtitle: "Керуйте використанням провайдера, витратами, запусками та доказами в одному місці.",
    viewActivity: "Переглянути активність",
    startRun: "Запустити",
    connectProvider: "Під’єднати провайдера",
    measuredSpend: "Виміряні витрати",
    providerUsage: "Використання провайдера",
    noUsage: "Використання ще немає",
    requests: "Запити",
    inSelectedPeriod: "За обраний період",
    totalTokens: "Усього токенів",
    inputOutput: "Вхід + вихід",
    runs: "Запуски",
    evidenceBacked: "Активність із доказами",
    usageEyebrow: "ВИМІРЯНЕ ВИКОРИСТАННЯ ПРОВАЙДЕРА",
    usageTitle: "Використання та активність",
    openActivity: "Відкрити активність",
    noUsageTitle: "Використання ще немає",
    connectAndRun: "Під’єднайте провайдера та запустіть застосунок. Виміряні витрати й активність моделей з’являться тут.",
    topModels: "Топ моделі",
    unknownModel: "Невідома модель",
    noModelBreakdown: "Немає розбивки за моделями",
    topProviders: "Топ провайдери",
    unknownProvider: "Невідомий провайдер",
    noProviderBreakdown: "Немає розбивки за провайдерами",
    stateEyebrow: "ПОТОЧНИЙ СТАН",
    controlTitle: "Стан керування",
    providerConnection: "Під’єднання провайдера",
    required: "Потрібно",
    budgetPolicy: "Політика бюджету",
    notConfigured: "Не налаштовано",
    managementKeys: "Ключі управління",
    active: "{count} активних",
    verified: "{count} підтверджено",
    secretIsolation: "Ізоляція секретів",
    defaultDeny: "За замовчуванням заборонено",
    reviewGuardrails: "Переглянути запобіжники",
    latestEyebrow: "ОСТАННІ ДОКАЗИ",
    recentRuns: "Останні запуски",
    viewAll: "Переглянути все",
    workspaceRun: "Запуск робочого простору",
    modelNotReported: "Модель не зазначено",
    noRunsTitle: "Запусків ще немає",
    browseApps: "Переглянути застосунки",
    calloutTitle: "Докази створюються реальними запусками",
    calloutBody: "Tvijo записує модель, маршрут, статус і час після фактичної активності. Пусті стани залишаються пустими — нічого не симулюється.",
    runsEvidence: "Запуски та докази",
    billingSeparation: "Використання провайдера оплачується напряму провайдерам через BYOK. Сервіси та кредити Tvijo показані окремо в розділі",
    billingCreditsLink: "Білінг та кредити",
    monthSuffix: "/міс",
    daySuffix: "/день",
  },
  activity: {
    eyebrow: "РОБОЧИЙ ПРОСТІР · ВИМІРЯНЕ ВИКОРИСТАННЯ",
    title: "Активність",
    subtitle: "Використання провайдера в межах користувача. Пусті метрики залишаються пустими, доки не станеться реальних викликів.",
    range7: "7 днів",
    range30: "30 днів",
    range90: "90 днів",
    spend: "Виміряні витрати",
    requests: "Запити",
    paidToProviders: "Сплачено напряму провайдерам",
    inputTokens: "Вхідні токени",
    outputTokens: "Вихідні токени",
    topModels: "Топ-моделі",
    topProviders: "Топ-провайдери",
    unknown: "Невідомо",
    noModelActivity: "Активності моделей немає",
    noModelActivityCopy: "Використання моделей з’явиться після першого маршрутизованого виклику.",
    noProviderActivity: "Активності провайдера немає",
    noProviderActivityCopy: "Під’єднайте провайдера, щоб почати вимірювання використання.",
  },
  billing: {
    eyebrow: "АКАУНТ · ЧІТКІ КОМЕРЦІЙНІ ПОТОКИ",
    title: "Білінг та кредити",
    subtitle: "Використання провайдера, нарахування Tvijo та керовані сервіси розділені.",
    setBudget: "Встановити бюджет",
    providerUsage: "Використання провайдера",
    measuredPaid: "Лише виміряне · оплачується провайдерам",
    details: "Деталі",
    tvijoCharges: "Нарахування Tvijo",
    seeLedger: "Показати реєстр",
    zero: "{currency} 0.00",
    recordedInLedger: "Зафіксовано у вашому реєстрі Tvijo",
    noPaymentLedger: "Немає платіжного реєстру для BYOK",
    budgetPolicy: "Політика бюджету",
    hardStopEnabled: "Жорстка зупинка ввімкнена",
    warningActive: "Політика попередження активна",
    addBoundary: "Додати межу витрат",
    edit: "Змінити",
    flowEyebrow: "БЕЗ ПРИХОВАНОГО ЗМІШУВАННЯ",
    howBillingWorks: "Як працює білінг",
    stepProviderCalls: "Виклики провайдера",
    stepProviderCopy: "Використання BYOK оплачує напряму ваш провайдер.",
    stepTvijoServices: "Сервіси Tvijo",
    stepTvijoCopy: "Робочий простір та схвалені керовані роботи нараховуються Tvijo.",
    stepManagedCompute: "Керовані обчислення",
    stepManagedCopy: "Інфраструктура починається з рахунку та погодження людини.",
    stepDomains: "Домени",
    stepDomainsCopy: "Tvijo перевіряє доступність; реєстрація залишається за реєстратором.",
    ledgerEyebrow: "РЕЄСТР АКАУНТА",
    chargesCredits: "Нарахування та кредити",
    charges: "Нарахування",
    credits: "Кредити",
    noChargesTitle: "Нарахувань Tvijo поки що немає",
    noChargesCopy: "Витрати провайдера — не транзакція Tvijo. Коли буде активований платний сервіс Tvijo, його нарахування з’являться тут.",
    noCreditsTitle: "Кредити не ввімкнені",
    noCreditsCopy: "Кредити та автопоповнення з’являться лише тоді, коли буде доступний реальний платіжний реєстр для вашого акаунта.",
    managedEyebrow: "КЕРОВАНИЙ СЕРВІС",
    infrastructure: "Інфраструктура",
    managedCopy: "Замовляйте керовані обчислення через прозорий рахунок. Кожне замовлення чекає на погодження перед наданням.",
    manageBenefitQuote: "Рахунок до зобов’язань",
    manageBenefitNoAuto: "Без автоматичного надання",
    manageBenefitPricing: "Окреме тарифування сервісу",
    exploreInfra: "Дізнатися про інфраструктуру",
    separationNote: "Суми провайдера є вимірами, а не рахунками Tvijo. Кредити приховані від процесів купівлі, доки не ввімкнеться платіжний реєстр бекенду.",
    dialogEyebrow: "МЕЖІ ВИТРАТ",
    setBudgetPolicy: "Встановити політику бюджету",
    dialogSub: "Межі застосовуються до виміряного використання і не стягують кошти з акаунта.",
    dialogCloseAria: "Закрити політику бюджету",
    dailyLimit: "Денний ліміт ({currency})",
    monthlyLimit: "Місячний ліміт ({currency})",
    perRequestLimit: "Ліміт на запит ({currency})",
    warnAt: "Попереджати при",
    optional: "Необов’язково",
    enableHardStop: "Увімкнути жорстку зупинку",
    hardStopHelp: "Зупиняти маршрутовану активність під час досягнення налаштованої межі.",
    cancel: "Скасувати",
    saving: "Збереження…",
    savePolicy: "Зберегти політику",
    saveFailed: "Не вдалося зберегти політику бюджету.",
    month: "/місяць",
    day: "/день",
    byokSpend: "На вашому ключі",
    byokSpendNote: "Провайдер виставляє рахунок вам · Tvijo цього не стягує",
    platformSpend: "На ключах Tvijo",
    platformSpendNote: "Виконано без вашого підтвердженого ключа",
    unpricedNote: "{count} викликів записано як 0, бо ціна моделі невідома, а не тому що вони були безкоштовні.",
  },
  connections: {
    eyebrow: "ПІД’ЄДНАННЯ · ЗА ЗАМОВЧУВАННЯМ ЗАБОРОНЕНО",
    title: "Під’єднання",
    subtitle: "Під’єднуйте власних AI-провайдерів. Секрети лише записуються та ніколи не показуються знову.",
    addKey: "Додати ключ провайдера (BYOK)",
    providerLabel: "Провайдер",
    labelLabel: "Назва",
    labelPlaceholder: "Production key",
    secretLabel: "Секрет (лише запис)",
    secretPlaceholder: "sk-…",
    addVerify: "Додати та перевірити",
    noCredsTitle: "Облікових даних ще немає",
    noCredsCopy: "Додайте ключ провайдера вище, щоб почати.",
    credsTitle: "Облікові дані провайдера",
    secretRequired: "Секрет обов’язковий.",
    createFailed: "Не вдалося створити",
    verifyFailed: "Не вдалося перевірити",
    revokeFailed: "Не вдалося відкликати",
    confirmRevoke: "Відкликати ці облікові дані? Після цього їх не можна буде використовувати.",
    headProvider: "Провайдер",
    headLabel: "Назва",
    headStatus: "Статус",
    headHint: "Підказка",
    headActions: "Дії",
    verify: "Перевірити",
    revoke: "Відкликати",
    revoked: "відкликано",
    manageKeysLink: "Керувати API-ключами Tvijo",
    viewAppsLink: "Переглянути застосунки",
    viewModelsLink: "Переглянути моделі",
    openRouterTitle: "Один ключ, контрольований доступ до моделей",
    openRouterCopy: "Tvijo перевіряє ключ без платного виклику моделі. Запити залишаються на сервері й використовують налаштований список дозволених моделей.",
    openRouterPrivacy: "Типовий маршрут: лише ZDR-провайдери, збір даних заборонено, параметри перевіряються, резервні маршрути дозволені.",
    openRouterResources: "Офіційні ресурси OpenRouter",
    openRouterDocs: "Швидкий старт",
    openRouterModels: "Каталог моделей",
    verifiedLive: "Ключ перевірено у провайдера — токени не витрачено.",
    keyCreditRemaining: "Залишок кредиту",
    gatewayEyebrow: "HERMES · КЕРОВАНИЙ ШЛЮЗ",
    gatewayTitle: "Ключ шлюзу AI OS",
    gatewayCopy: "Створіть окремий ключ для Hermes-агента на вашому сервері. Кожен ключ має власний денний USD-ліміт, облік використання та смугу трасування.",
    gatewayNotConfiguredTitle: "Видачу ключів шлюзу не налаштовано",
    gatewayNotConfiguredCopy: "Оператор має під’єднати control plane AI OS, перш ніж можна буде створювати ключі шлюзу.",
    gatewayNameLabel: "Назва ключа",
    gatewayNamePlaceholder: "Production Hermes server",
    gatewayBudgetLabel: "Жорсткий денний ліміт (USD)",
    gatewayCreate: "Створити ключ шлюзу",
    gatewayCreating: "Створення…",
    gatewayNameRequired: "Назва ключа обов’язкова.",
    gatewayCreateFailed: "Не вдалося створити ключ шлюзу.",
    gatewayStatusFailed: "Не вдалося завантажити стан шлюзу.",
    gatewayRevokeFailed: "Не вдалося відкликати ключ шлюзу.",
    gatewayConfirmRevoke: "Відкликати цей ключ шлюзу? Hermes одразу припинить із ним працювати.",
    gatewaySecretOnce: "Скопіюйте ключ зараз. Його більше не буде показано.",
    gatewayConfigTitle: "Hermes config.yaml",
    copySecret: "Скопіювати ключ",
    copyConfig: "Скопіювати конфігурацію",
    copied: "Скопійовано",
    gatewayEmptyTitle: "Ключів шлюзу ще немає",
    gatewayEmptyCopy: "Створіть ключ, щоб під’єднати Hermes через маршрутизацію та бюджетні обмеження Tvijo.",
    gatewayKeysTitle: "Ключі шлюзу",
    gatewayKeyHead: "Ключ",
    gatewayBudgetHead: "Жорсткий ліміт",
    gatewayUsageHead: "Сьогодні",
    gatewayRequests: "запитів",
    refreshStatus: "Оновити використання",
    loadingStatus: "Завантаження…",
    gatewayTraceTitle: "Очищений стан AI OS",
    gatewayTraces: "останніх трас",
    day: "день",
    month: "місяць",
    providersTitle: "Провайдери",
    providersCopy: "Що Tvijo насправді вміє з кожним провайдером і що виміряв сьогоднішній знімок моделей.",
    liveCheckYes: "Перевірка ключа доступна",
    liveCheckNo: "Перевірки ключа немає",
    liveCheckNoHint: "Ключ для цього провайдера можна зберегти й зашифрувати, але Tvijo не може підтвердити, що він працює.",
    catalogModels: "Моделі",
    catalogInput: "Вхід",
    catalogOutput: "Вихід",
    catalogContext: "Макс. контекст",
    catalogNone: "Даних каталогу для цього провайдера немає.",
    catalogSourceLabel: "Джерело: OpenRouter, виміряно",
    catalogScopeAggregated: "весь маршрутизований каталог",
    catalogScopeVendor: "цей вендор через OpenRouter",
    perMillion: "за 1M токенів",
    stateLiveVerified: "Підтверджено провайдером",
    stateStored: "Збережено, не підтверджено",
    stateError: "Відхилено",
    storedNotVerified: "Секрет збережено й зашифровано. У Tvijo немає перевірки ключа для цього провайдера, тому він не підтверджений.",
    headVerification: "Підтвердження",
    noCredential: "Ключ не додано",
  },
  guardrails: {
    eyebrow: "GUARDRAILS · ЛИШЕ ДОВІДНЕ",
    title: "Guardrails",
    subtitle: "Кожен контроль нижче зчитано з конфігурації або з ваших власних даних. Контроль, який ми не можемо довести, не показуємо взагалі.",
    budgetPolicy: "Бюджетна політика",
    softLimitCopy: "Ліміт заданий, але жорсткий стоп вимкнено — запуски не відхиляються.",
    limit: "Ліміт",
    value: "Значення",
    rowsDaily: "Щодня",
    rowsMonthly: "Щомісяця",
    rowsPerRequest: "За запит",
    rowsHardStop: "Жорсткий стоп",
    yes: "так",
    no: "ні",
    decisionTrailTitle: "Журнал рішень",
    decisionTrailCopy: "Кожна зміна ключа, бюджету чи контракту, найновіші згори.",
    onTrail: "Записів поки немає",
    onTrailCopy: "Створення ключа, зміна бюджету або затвердження контракту з’являться тут.",
    rowAction: "Дія",
    rowResource: "Ресурс",
    rowWhen: "Коли",
    ctlSpendCap: "Жорсткий ліміт витрат",
    ctlSecretStorage: "Зберігання секретів",
    ctlExecutionIsolation: "Ізоляція виконання",
    ctlHumanAcceptance: "Приймання людиною",
    ctlToolAuthorization: "Авторизація інструментів",
    stNotConfigured: "Не налаштовано",
    stConfiguredSoft: "М’який ліміт",
    stEnforced: "Діє",
    stEncrypted: "Зашифровано",
    stUnavailable: "Недоступно",
    stWorker: "Окремий воркер",
    stInline: "У запиті",
    stOff: "Вимкнено",
    stActive: "Активно",
    stNoRuns: "Запусків ще немає",
    whySpendCap: "Зчитано з вашої бюджетної політики. «Діє» означає, що ліміт заданий і жорсткий стоп увімкнено, тому запуск понад бюджет відхиляється.",
    whySecretStorage: "Зчитано з ключа шифрування. «Зашифровано» означає, що збережені секрети запечатані Fernet; без ключа збереження облікових даних падає, а не зберігає відкритий текст.",
    whyExecutionIsolation: "Зчитано з конфігурації черги задач: робота виконується в окремому воркері або всередині запиту.",
    whyHumanAcceptance: "Зчитано з ваших затверджених контрактів. Контракт із гейтом before_external_action потребує людини перед будь-яким зовнішнім ефектом.",
    whyToolAuthorization: "Підраховано за рішеннями авторизації на ваших запусках. Немає запусків — немає доказів ні в той, ні в інший бік.",
    decisionsAllowed: "дозволено",
    decisionsDenied: "відхилено",
    windowDays: "останні 30 днів",
  },
  domains: {
    eyebrow: "РЕСУРСИ · ЛИШЕ ДОСТУПНІСТЬ",
    title: "Домени",
    subtitle: "Придумуйте назви та перевіряйте реальну доступність. Реєстрація залишається у зовнішнього реєстратора.",
    describeIdea: "Опишіть вашу ідею",
    ideaPlaceholder: "наприклад, evidence-first AI workspace",
    checking: "Перевіряємо…",
    findDomains: "Знайти домени",
    notConfiguredTitle: "Сервіс доступності не налаштований",
    notConfiguredCopy: "Пропозиції показано нижче, але доступність поки що не можна перевірити.",
    suggestionsTitle: "Пропозиції",
    purchaseExternal: "Купити зовні",
    statesAvailable: "Доступний",
    statesUnavailable: "Недоступний",
    statesUnverified: "Не перевірено",
    recentSearches: "Останні пошуки",
    states: "{count} доступно",
    whenFail: "Не вдалося виконати пошук домену.",
  },
  infrastructure: {
    eyebrow: "РЕСУРСИ · КЕРОВАНІ ОБЧИСЛЕННЯ",
    title: "Інфраструктура",
    subtitle: "Прозорі рахунки та надання з погодженням людини. Жоден сервер не створюється автоматично.",
    providerIntegration: "Інтеграція провайдера",
    configured: "Налаштовано",
    notConfigured: "Не налаштовано",
    capabilityVerified: "Можливість підтверджена",
    notGranted: "Можливість не надана",
    provisioning: "Надання",
    featureEnabled: "Функцію ввімкнено",
    humanApprovalOnly: "Лише з погодженням людини",
    quoteApproval: "Рахунок і погодження потрібні перед будь-якою дією провайдера.",
    safeFlowTitle: "Безпечний потік запитів",
    stepChoose: "Оберіть обчислення",
    stepChooseCopy: "Виберіть доступний тип сервера та розташування.",
    stepQuote: "Отримайте рахунок",
    stepQuoteCopy: "Тарифи провайдера та сервісу показані окремо.",
    stepApproval: "Погодження людини",
    stepApprovalCopy: "Запит чекає на явний огляд.",
    stepRule: "Надати",
    stepRuleCopy: "Продовжувати можуть лише схвалені та ввімкнені замовлення.",
    yourRequests: "Ваші заявки",
    quotePending: "Рахунок очікується",
    noRequestsTitle: "Заявок на інфраструктуру немає",
    noRequestsCopy: "Конструктор рахунків буде доступний, коли налаштують каталог провайдерів і комерційні тарифи.",
  },
  keys: {
    eyebrow: "КЕРУВАННЯ · ПРОГРАМНИЙ ДОСТУП",
    title: "Ключі управління",
    subtitle: "Створюйте обмежені ключі Tvijo. Секрет відображається лише один раз і його неможливо відновити.",
    createTitle: "Створити ключ лише для читання",
    keyName: "Назва ключа",
    keyNamePlaceholder: "analytics-readonly",
    creating: "Створення…",
    createKey: "Створити ключ",
    secretOnce: "Скопіюйте цей секрет зараз — він більше не буде показаний.",
    copyText: "Копіювати",
    keyNameRequired: "Назва ключа обов’язкова.",
    createFailed: "Не вдалося створити ключ.",
    revokeFailed: "Не вдалося відкликати ключ.",
    confirmRevoke: "Відкликати цей ключ управління?",
    headName: "Назва",
    headKey: "Ключ",
    headScopes: "Області",
    headStatus: "Статус / дія",
    revoke: "Відкликати",
    revoked: "відкликано",
    noKeyList: "Ключів управління немає",
    noKeysCopy: "Створюйте обмежений ключ лише тоді, коли потрібен програмний доступ.",
    activeRevokedTitle: "Активні та відкликані ключі",
  },
  models: {
    eyebrow: "МОДЕЛІ · У МЕЖАХ КОРИСТУВАЧА",
    title: "Моделі та використання",
    subtitle: "Адаптери провайдерів, статус облікових даних і ваше виміряне використання.",
    registryTitle: "Реєстр провайдерів",
    headProvider: "Провайдер",
    headSupported: "Підтримується",
    headCredential: "Облікові дані",
    headLastVerified: "Востаннє перевірено",
    yes: "Так",
    no: "Ні",
    footnote: "«Підтримується» відображає встановлений адаптер, а не робоче з’єднання.",
    byModel: "За моделлю",
    byProvider: "За провайдером",
    headModel: "Модель",
    headCalls: "Виклики",
    headCost: "Вартість",
    noUsageTitle: "Використання ще немає",
    noUsageCopy: "Агрегати використання з’являться після вашого першого виклику.",
    connectProviderKey: "Під’єднати ключ провайдера",
    viewGuardrails: "Переглянути запобіжники",
    catalogSource: "Офіційний каталог",
    openRouterPolicy: "ZDR · збір даних заборонено · параметри узгоджено",
  },
  preferences: {
    eyebrow: "НАЛАШТУВАННЯ · ЗБЕРЕЖЕНІ ПАРАМЕТРИ",
    title: "Налаштування",
    subtitle: "Лише параметри, які ми справді зберігаємо й використовуємо. Ім’я та пошта — у профілі акаунта.",
    display: "Відображення",
    dateFormat: "Формат дати",
    timezone: "Часовий пояс",
    defaultRange: "Період активності за замовчуванням",
    range7: "Останні 7 днів",
    range30: "Останні 30 днів",
    range90: "Останні 90 днів",
    tzHelp: "IANA-ім’я, напр. Europe/Kiev. Використовується для групування активності за днями.",
    saving: "Збереження…",
    savePrefs: "Зберегти налаштування",
    saved: "Збережено · {date}",
    couldNotSave: "Не вдалося зберегти",
  },
  profile: {
    eyebrow: "АКАУНТ · ІДЕНТИЧНІСТЬ",
    title: "Профіль",
    subtitle: "Ваша автентифікована ідентичність Tvijo та деталі акаунта.",
    displayName: "Відображуване ім’я",
    email: "Email",
    notSet: "Не задано",
    editPublic: "Редагувати публічний профіль",
  },
  contracts: {
    eyebrow: "EXECUTION CONTRACTS",
    title: "Кожен запуск агента починається з контракту",
    subtitle: "Мета, схвалені знання, дозволи, маршрути моделей, бюджет і детерміновані правила приймання фіксуються до запуску — і кожен запуск повертає перевірюваний пакет доказів.",
    splitContract: "Contract — який результат дозволено",
    splitBinding: "Binding — яка модель та інструмент його виконують",
    splitAuthorization: "Authorization — чи дозволена кожна дія саме зараз",
    artifactsTitle: "Сім записаних артефактів",
    artifactsIntro: "Після запуску Tvijo зберігає хеш контракту, знімок знань, binding, журнал авторизації, трасу виконання, результати приймання та пакет доказів.",
    statusLine: "Approved → Bound → Running → Verification → Passed / Rework / Blocked",
    runsLink: "Переглянути власні запуски",
    articleLink: "Прочитати повний розбір",
    honestNote: "Контракти нижче належать лише вам. Контракт іншого облікового запису не показується, а його id повертає 404.",
    listTitle: "Ваші контракти",
    listCopy: "Заморожені конверти цього облікового запису, найновіші згори.",
    emptyTitle: "Контрактів поки немає",
    emptyCopy: "Контракт створюється, коли під ним стартує запуск. Тут немає заповнювачів — список лишається порожнім, доки у вас не буде справжнього контракту.",
    colGoal: "Мета",
    colHash: "Хеш",
    colBudget: "Бюджет",
    colRuns: "Запуски",
    colCreated: "Створено",
    statusDraft: "Чернетка",
    statusApproved: "Затверджено",
    statusBlocked: "Заблоковано",
    backToList: "Назад до контрактів",
    frozenTitle: "Заморожений контракт",
    frozenCopy: "Ці значення захешовані під час затвердження і не можуть змінитися. Виправлення — це нова версія, а не редагування.",
    fieldGoal: "Мета",
    fieldExpected: "Очікуваний результат",
    fieldHash: "Хеш контракту",
    fieldVersion: "Версія",
    fieldModels: "Дозволені моделі",
    fieldTools: "Дозволені інструменти",
    fieldForbidden: "Заборонені дії",
    fieldGates: "Гейти затвердження",
    fieldAcceptance: "Правила приймання",
    fieldKnowledge: "Схвалені знання",
    budgetUsd: "Макс. USD",
    budgetTokens: "Макс. токенів",
    budgetMinutes: "Макс. хвилин",
    budgetSteps: "Макс. кроків",
    runsTitle: "Запуски",
    runNo: "Запуск",
    runCost: "Вартість",
    runTokens: "Токени",
    runSteps: "Кроки",
    runAcceptance: "Приймання",
    runEvidence: "Докази",
    noRunsTitle: "Запусків за цим контрактом немає",
    noRunsCopy: "Контракт заморожено, але під ним ще нічого не виконувалось.",
    evidenceButton: "Пакет доказів",
    evidenceLoading: "Завантаження…",
    evidenceNone: "Для цього запуску пакет доказів не записано.",
    evidenceHash: "Хеш пакета",
    loadFailed: "Не вдалося завантажити контракт.",
    none: "—",
    runsHref: "/workspace/runs",
    articleHref: "/kb/ai-governance/every-agent-run-starts-with-a-contract",
    newContract: "Новий контракт",
    builderTitle: "Новий execution contract",
    step: "Крок",
    of: "з",
    back: "Назад",
    next: "Далі",
    cancel: "Скасувати",
    stepGoal: "Мета",
    stepKnowledge: "Знання",
    stepPermissions: "Дозволи",
    stepBudget: "Бюджет",
    stepAcceptance: "Приймання",
    stepReview: "Перевірка",
    goalLabel: "Що потрібно зробити",
    goalPlaceholder: "Перевірити компанію та підготувати звіт",
    expectedLabel: "Що вважається результатом",
    expectedPlaceholder: "Звіт із джерелом до кожного твердження",
    knowledgeIntro: "Зафіксуйте точні джерела та версії, на які може спиратися запуск. Джерело, додане пізніше, до цього контракту не входить.",
    knowledgeRef: "Посилання",
    knowledgeKind: "Тип",
    knowledgeVersion: "Версія",
    knowledgeAdd: "Додати джерело",
    knowledgeRemove: "Прибрати",
    knowledgeEmpty: "Джерел не зафіксовано. Контракт без схвалених знань дозволений, але запуску нема на що версійно послатися.",
    permissionsIntro: "Дозвольте лише ті інструменти, які потрібні, і назвіть дії, яких не має статися ніколи.",
    enforcementNote: "Це декларації, що застосовуються на межі інструмента: інструмент поза списком дозволених або дія зі списку заборонених відхиляється. Сам Tvijo виконує виклики моделей; інструменти виконує ai-os під цим самим замороженим контрактом.",
    toolsLabel: "Дозволені інструменти",
    forbiddenLabel: "Заборонені дії",
    gatesLabel: "Гейти затвердження",
    sideEffect: "змінює щось поза запуском",
    modelsLabel: "Дозволені моделі",
    modelsEmpty: "Моделей немає. Спершу додайте та підтвердіть ключ провайдера в розділі Connections.",
    budgetIntro: "Заморожується до першого виклику. Запуск, що перевищує будь-що з цього, блокується, а не обрізається.",
    moneyRule: "Ціла сума надсилається числом, дробова — текстом: саме це тримає хеш однаковим з обох боків.",
    acceptanceIntro: "Детерміновані перевірки виконуються над результатом. Провалена обовʼязкова перевірка відправляє роботу в Rework.",
    acceptanceOnlyThese: "Ці три — правила, які Tvijo дійсно реалізує. Невідоме правило вважається проваленим, тому інших не пропонуємо.",
    reviewIntro: "Це точний JSON, який буде захешовано та заморожено.",
    reviewHash: "Хеш контракту",
    reviewHashNote: "Обчислено у вашому браузері тим самим алгоритмом, що й на бекенді. Він має збігтися з тим, що поверне сервер.",
    freeze: "Заморозити контракт",
    freezing: "Заморожуємо…",
    frozenOk: "Контракт заморожено та затверджено.",
    errGoal: "Опишіть, що потрібно зробити.",
    errExpected: "Опишіть, що вважається результатом.",
    errModels: "Оберіть хоча б одну модель.",
    errAcceptance: "Оберіть хоча б одне правило приймання.",
    errBudget: "Кожне поле бюджету потребує додатного числа.",
    createFailedContract: "Не вдалося створити контракт.",
    noRunsExecutorCopy: "Контракт заморожено й готово. Запуски зʼявляться тут, коли під ним відбудеться виконання — власний виконавець Tvijo до цієї кнопки ще не підключений, тому сьогодні запуск приходить з ai-os, що звертається до API контрактів із сервісним токеном.",
    modelsFilter: "Фільтр моделей",
    modelsNoKey: "У вас немає підтвердженого ключа провайдера, здатного виконати запуск. Додайте та підтвердіть ключ OpenRouter у розділі Connections; контракт можна заморозити й без нього, але не виконати.",
    modelsRunnableNote: "Це моделі, які Tvijo дійсно може виконати. Каталог у розділі Connections перелічує все, що пропонує провайдер, — це те, що існує, а не те, що тут виконується.",
    runTitle: "Виконати цей контракт",
    runIntro: "Один виклик моделі під замороженим контрактом. Результат перевіряється правилами приймання; виконавець не вирішує сам, чи він успішний.",
    runModelLabel: "Модель",
    runSpendWarning: "Це витрачає гроші на вашому власному ключі провайдера, у межах бюджету контракту. Tvijo за це не платить і не перепродає токени.",
    runConfirm: "Виконати, витративши до",
    runCancel: "Не зараз",
    runStarting: "Виконуємо…",
    runNoKey: "Для виконання потрібен підтверджений ключ OpenRouter. Додайте його в розділі Connections — контракт лишається замороженим у будь-якому разі.",
    runResultPassed: "Passed — усі правила приймання виконано.",
    runResultRework: "Rework — правило приймання не пройдено. Результат збережено, контракт не змінено.",
    runResultBlocked: "Blocked — контракт відхилив цей запуск.",
    runResultUnfinished: "Провайдер не відповів. Нічого не прийнято, запуск записано як незавершений.",
  },

  runs: {
    eyebrow: "ДОКАЗИ · У МЕЖАХ КОРИСТУВАЧА",
    title: "Запуски та докази",
    subtitle: "Ваші власні рішення та журнал AI-викликів — без імпортованих демо-лічильників.",
    noRunsTitle: "Запусків ще немає",
    noRunsCopy: "Запуски з ваших модельних викликів і рішень з’являться тут. Під’єднайте провайдера та запустіть завдання, щоб почати.",
    headRoute: "Маршрут",
    headModel: "Модель",
    headStatus: "Статус",
    headCost: "Вартість",
    headWhen: "Коли",
    connectProvider: "Під’єднати провайдера",
    viewGuardrails: "Переглянути запобіжники",
  },
  skillPacks: {
    eyebrow: "ПАКЕТИ НАВИЧОК АГЕНТА",
    title: "Пакети навичок",
    subtitle: "Markdown-документи, які ви даєте агенту, що працює на вашому сервері. Прочитайте, що робить кожен пакет, перш ніж щось встановлювати.",
    tierLabel: "Рівень довіри",
    filesLabel: "{count} файлів",
    howToLink: "Як встановити на власному сервері",
    markdownOnly: "Ці пакети — це Markdown-документи. У жодному з них немає виконуваного коду.",
    gatewayLabel: "Шлюз AI OS",
    gatewayConfigured: "налаштовано",
    gatewayNotConfigured: "не налаштовано",
    gatewayConfiguredNote: "Створіть у Під’єднаннях окремий клієнтський ключ із власним жорстким бюджетом і смугою трасування.",
    gatewayNotConfiguredNote: "Оператор має під’єднати control plane AI OS, перш ніж можна буде створювати ключі шлюзу.",
    openConnections: "Створити або налаштувати ключ шлюзу",
    versionLabel: "версія",
    downloadPack: "Завантажити ZIP",
    downloading: "Завантаження…",
    downloadFailed: "Не вдалося завантажити пакет навичок.",
    howToEyebrow: "ЯК ВСТАНОВИТИ",
    howToTitle: "Запустіть пакет на власному сервері",
    howToSubtitle: "Середовище агента ви запускаєте самі. Пакети — це документи, а не код, і працюють лише там, куди ви їх покладете.",
    step1Title: "Встановіть агента",
    step1Copy: "Встановіть Hermes на власний VPS через його офіційний інсталятор або використайте будь-якого агента, що читає SKILL.md у форматі agentskills.io.",
    step2Title: "Додайте пакети",
    step2Copy: "Завантажте ZIP і скопіюйте Markdown-файли до каталогу навичок агента. Перегляньте кожен файл перед використанням.",
    step3Title: "Створіть ключ шлюзу",
    step3Copy: "У Під’єднаннях створіть окремий ключ і одразу скопіюйте його. Tvijo зберігає лише префікс і останні чотири символи.",
    step4Title: "Спрямуйте Hermes на Tvijo",
    step4Copy: "Скопіюйте готовий блок config.yaml із Під’єднань. Ключ матиме окремий бюджет, облік використання та журнал аудиту.",
    byokTitle: "Ваші ключі лишаються вашими",
    byokCopy: "Пакети не містять облікових даних і не зберігають ваші ключі. BYOK лишає білінг провайдера на вас.",
    loadFailed: "Не вдалося завантажити пакети навичок.",
    emptyTitle: "Пакети навичок ще не опубліковано",
    emptyCopy: "Пакети з'являться тут після публікації.",
    cta: "Переглянути пакети навичок",
  },
  reference: {
    eyebrow: "AI ДОВІДНИК",
    title: "AI довідник",
    subtitle: "Як підключити та використовувати моделі через OpenRouter як BYOK-провайдера.",
    listTitle: "Розділи",
    emptyTitle: "Довідник поки недоступний",
    emptyCopy: "Статті довідника з’являться тут після публікації.",
    backToList: "Назад до розділів",
    minutes: "хв читання",
  },
};

/* -------------------------------- Russian -------------------------------- */

/**
 * Russian workspace surface — full translation of every screen.
 * English remains the source of truth; `...EN` stays as a fallback so any
 * future key inherits English text until it is translated here.
 */
const RU: WorkspaceCopy = {
  ...EN,
  shell: {
    ...EN.shell,
    brandWord: "Tvijo",
    personalWorkspace: "Личное пространство",
    search: "Поиск",
    openNavigation: "Открыть навигацию",
    closeNavigation: "Закрыть навигацию",
    expandNavigation: "Развернуть навигацию",
    collapseNavigation: "Свернуть навигацию",
    close: "Закрыть",
    expand: "Развернуть",
    collapse: "Свернуть",
    navAria: "Навигация рабочего пространства Tvijo",
    commandAria: "Палитра команд рабочего пространства",
    commandPlaceholder: "Перейти к экрану рабочего пространства...",
    commandSection: "РАБОЧЕЕ ПРОСТРАНСТВО TVIJO",
    commandNoMatch: "Нет экрана рабочего пространства по запросу “{query}”.",
    notificationsTitle: "Уведомления пока не включены",
    publicWebsite: "Публичный сайт",
    home: "Главная",
    logOut: "Выйти",
    userMenuAria: "Меню пользователя",
    loadingAria: "Загрузка рабочего пространства",
    accountFallback: "Аккаунт Tvijo",
    workspaceTitle: "Ваше личное рабочее пространство Tvijo",
    groups: [
      { items: [{ label: "Главная" }] },
      { label: "Пространство", items: [{ label: "Обзор" }, { label: "Активность" }, { label: "Запуски и доказательства" }, { label: "Модели" }, { label: "Приложения и плагины" }, { label: "Контракты" }, { label: "Справочник" }] },
      { label: "Управление", items: [{ label: "Подключения" }, { label: "Ключи управления" }, { label: "Ограничения" }] },
      { label: "Ресурсы", items: [{ label: "Инфраструктура" }, { label: "Домены" }] },
      { label: "Аккаунт", items: [{ label: "Биллинг и кредиты" }, { label: "Профиль" }, { label: "Настройки" }] },
    ],
    mobileTabs: [
      { href: "/dashboard", label: "Главная" },
      { href: "/workspace", label: "Обзор" },
      { href: "/workspace/activity", label: "Активность" },
      { href: "/workspace/apps", label: "Приложения" },
      { href: "#more", label: "Меню" },
    ],
    bottomNavAria: "Разделы рабочего пространства",
  },
  global: {
    loadingDataAria: "Загрузка данных",
    loadFailed: "Не удалось загрузить эти данные.",
    retry: "Повторить",
    localeFallback: "Рабочее пространство доступно на английском, украинском и русском. Показан английский.",
    budgetExceededTitle: "Лимит бюджета исчерпан",
    budgetExceededAction: "Изменить бюджет",
  },
  home: {
    ...EN.home,
    eyebrow: "TVIJO · ЛИЧНОЕ РАБОЧЕЕ ПРОСТРАНСТВО",
    greeting: "Добрый день, {name}",
    subtitle: "Настройте пространство, а затем запускайте и проверяйте ИИ в одном месте.",
    liveEyebrow: "ТЕКУЩЕЕ СОСТОЯНИЕ АККАУНТА",
    liveTitle: "Статус пространства",
    liveBadge: "Онлайн",
    provider: "Провайдер",
    verified: "{count} подтверждено",
    notConnected: "Не подключено",
    budget: "Бюджет",
    configured: "Настроено",
    notSet: "Не задано",
    runs: "Запуски",
    loading: "Загрузка…",
    noRunsStatus: "Запусков пока нет",
    evidence: "Доказательства",
    available: "Доступны",
    pendingFirstRun: "Ждут первого запуска",
    retryLive: "Повторить обновление статуса",
    getOrientedEyebrow: "С ЧЕГО НАЧАТЬ",
    startWithTvijo: "Начните с Tvijo",
    commercialEyebrow: "ПОНЯТНЫЕ КОММЕРЧЕСКИЕ НАПРАВЛЕНИЯ",
    businessServices: "Бизнес-сервисы",
    exploreEyebrow: "ПУБЛИЧНЫЙ ПРОДУКТ",
    exploreTvijo: "Изучить Tvijo",
    approvalRequired: "Требуется одобрение",
    loadFailed: "Не удалось загрузить рабочее пространство.",
    start1Title: "AI Control Plane",
    start1Copy: "Подключайте провайдеров, выбирайте модели и держите запуски под контролем.",
    start2Title: "Подверженность и владение",
    start2Copy: "Проверьте проект перед принятием операционного решения.",
    service1Title: "Использование провайдера",
    service1Copy: "Измеренное использование по вашим ключам провайдера.",
    service2Title: "Сервисы Tvijo",
    service2Copy: "Отдельные начисления Tvijo и доступные кредиты.",
    service3Title: "Управляемые вычисления",
    service3Copy: "Заказывайте инфраструктуру со счётом и одобрением человека.",
    service4Title: "Домены",
    service4Copy: "Проверяйте доступность, затем покупайте через внешнего регистратора.",
    explore1Title: "Knowledge Base",
    explore1Copy: "Исследования, гайды и практические материалы.",
    explore2Title: "Обучение",
    explore2Copy: "Курсы по ИИ, финансам и технологиям.",
    explore3Title: "Центр решений",
    explore3Copy: "Структурированные решения, голосования и обсуждения.",
    explore4Title: "Bubbles",
    explore4Copy: "Стройте визуальные карты вокруг своих знаний.",
    nextStepEyebrow: "ВАШ СЛЕДУЮЩИЙ ШАГ",
    browseAll: "Все решения",
    knowledgeEyebrow: "ЗНАНИЯ",
    setupShow: "Показать шаги настройки",
    setupHide: "Скрыть шаги настройки",
    setupDone: "Настройка завершена",
    nextProvider: "Подключите провайдера",
    nextProviderCopy: "Добавьте собственный ключ ИИ-провайдера. Он шифруется, и вы можете отозвать его в любой момент.",
    nextBudget: "Установите лимит расходов",
    nextBudgetCopy: "Дневной или месячный лимит, чтобы эксперимент никогда не стал счётом.",
    nextRun: "Выберите первое решение",
    nextRunCopy: "Выберите нужный результат и способ его получения.",
    nextOperate: "Просмотрите, что выполнялось",
    nextOperateCopy: "Каждый вызов с моделью, статусом и стоимостью.",
  },
  catalog: {
    eyebrow: "ЧТО МОЖНО ПОЛУЧИТЬ",
    title: "Решения",
    subtitle: "Выберите нужный результат. Затем выберите способ: сделать самому, сделать вместе или поручить нам.",
    allCategories: "Все",
    categorySupport: "Поддержка клиентов",
    categoryKnowledge: "Знания",
    categoryGrowth: "Рост",
    categoryControl: "Контроль",
    liveLabel: "Работает в вашем рабочем пространстве",
    assistedLabel: "Внедряется с участием человека",
    plannedLabel: "Ещё не создано",
    liveHint: "Работает прямо сейчас с вашими ключами.",
    assistedHint: "В настройке участвует человек.",
    plannedHint: "Мы не притворяемся, что это уже есть. Можно попросить сообщить, когда появится.",
    selfServe: { label: "Сделаю сам", tagline: "Скопируйте нужное и работайте.", cta: "Получить инструкцию" },
    guided: { label: "Сделаем вместе", tagline: "Одна рабочая сессия, руль в ваших руках.", cta: "Записаться на сессию" },
    doneForYou: { label: "Сделаем за вас", tagline: "Внедряем и передаём в рабочем виде.", cta: "Заказать внедрение" },
    notifyCta: "Сообщить, когда появится",
    howToGet: "Как это получить",
    whatYouGet: "Что вы получите",
    whatItSolves: "Какую боль снимает",
    needsFirst: "Что нужно сначала",
    runsToday: "Где это уже работает",
    ownDeployment: "наше собственное развёртывание",
    openIn: "Открыть",
    etaLabel: "Обычно",
    copySnippet: "Копировать",
    copied: "Скопировано",
    snippetTitle: "Скопируйте это",
    detailAria: "Подробнее: {name}",
    close: "Закрыть",
    open: "Открыть",
    requested: "Заявка отправлена",
    requestTitle: "Заявка: {name}",
    requestNote: "Человек отвечает в течение {sla} и присылает письменный объём работ. Без карты и без автоматических списаний.",
    messageLabel: "Что нам стоит знать?",
    messagePlaceholder: "Одна вещь, ради которой это имеет смысл именно для вас...",
    contactLabel: "Удобный контакт (необязательно)",
    contactPlaceholder: "Телефон, Telegram или другая почта",
    submit: "Отправить заявку",
    sending: "Отправляем...",
    cancel: "Отмена",
    sentTitle: "Заявка получена",
    sentCopy: "Она в очереди вместе с вашей заметкой. Статус виден в разделе «Ваши заявки».",
    failed: "Не удалось отправить заявку. Попробуйте ещё раз.",
    plannedTitle: "Ещё не создано",
    plannedCopy: "Это есть на карте, но не в продукте. Попросите сообщить — и услышите об этом один раз, когда оно действительно заработает.",
    notifyAck: "Записали. Вы услышите об этом один раз — когда оно действительно заработает.",
    pathUnavailable: "Этот путь пока недоступен.",
    notAvailableShort: "пока нет",
    showAll: "Показать ещё {count}",
    statusLabel: "Статус",
    nextStepLabel: "Следующий шаг",
    firstReplyLabel: "Первый ответ",
    stepAwaitingReview: "Человек читает вашу заметку и возвращается с объёмом работ.",
    stepScoping: "Согласуем объём вместе с вами.",
    stepScheduled: "Запланировано — дата есть.",
    stepDelivered: "Выполнено.",
    stepDeclined: "Мы не взялись за это. Причина должна быть у вас письменно.",
    yourRequests: "Ваши заявки",
    noRequests: "Заявок пока нет.",
    statusNew: "Новая",
    statusInReview: "На рассмотрении",
    statusScheduled: "Запланировано",
    statusDone: "Выполнено",
    statusDeclined: "Отклонено",
    escalationLabel: "Вопрос передан человеку",
    emptyTitle: "В этой категории нет решений",
    emptyCopy: "Измените фильтр, чтобы увидеть всё доступное.",
    loadFailed: "Не удалось загрузить каталог.",
  },
  assistant: {
    name: "Ассистент Tvijo",
    launcher: "Спросить Tvijo",
    title: "Спросить Tvijo",
    subtitle: "Ответы из базы знаний или от человека.",
    greeting: "Спрашивайте о рабочем пространстве, ключах, лимитах или любом решении. Если надёжного ответа нет — скажу об этом и передам вопрос человеку.",
    placeholder: "Задайте вопрос...",
    send: "Отправить",
    thinking: "Ищу...",
    close: "Закрыть ассистента",
    clear: "Очистить",
    you: "Вы",
    sourcesLabel: "Источники",
    unsureBadge: "Надёжного ответа нет",
    suggestions: [
      "Чьи API-ключи используются?",
      "Как ограничить расходы?",
      "Нужно ли устанавливать самому?",
    ],
    escalateCta: "Передать человеку",
    escalateTitle: "Передать человеку",
    escalateCopy: "Ваш вопрос пойдёт вместе с заявкой — переписывать его не придётся.",
    escalateContactLabel: "Удобный контакт (необязательно)",
    escalateContactPlaceholder: "Телефон, Telegram или другая почта",
    escalateMessageLabel: "Что добавить?",
    escalateMessagePlaceholder: "Контекст, срочность, что уже пробовали...",
    escalateSubmit: "Отправить человеку",
    escalateConsent: "Отправить мой вопрос так, как я его написал",
    escalateConsentRequired: "Отметьте пункт, иначе человек получит только вашу заметку — без вопроса.",
    escalateDone: "Отправлено. Человек возьмёт это в работу.",
    failed: "Что-то пошло не так. Попробуйте ещё раз.",
    scopeNote: "Ответы берутся только из базы знаний — никаких догадок о ценах, лимитах или ваших данных.",
  },
  setup: {
    homeTitle: "Настройка рабочего пространства",
    overviewTitle: "Завершите настройку рабочего пространства",
    doneOf: "{count} из {total}",
    complete: "Выполнено",
    current: "Текущий",
    pending: "Ожидает",
    viewActivity: "Просмотреть активность",
    openWorkspace: "Открыть рабочее пространство",
    activationTarget: "Цель активации",
    activationTargetSub: "Подтверждённый провайдер + первый запуск",
    whyThisMatters: "Почему это важно",
    steps: [
      { label: "Создайте рабочее пространство", description: "Ваше личное рабочее пространство готово.", action: "Открыть рабочее пространство" },
      { label: "Подключите провайдера", description: "Свяжите ИИ-провайдера, чтобы начать маршрутизацию и запуски.", action: "Подключить провайдера" },
      { label: "Установите лимит бюджета", description: "Задайте дневные или месячные лимиты расходов.", action: "Установить бюджет" },
      { label: "Запустите первый процесс", description: "Используйте приложение, чтобы создать первый запуск с доказательствами.", action: "Выбрать приложение" },
    ],
  },
  overview: {
    eyebrow: "AI CONTROL PLANE",
    title: "Обзор рабочего пространства",
    subtitle: "Управляйте использованием провайдера, расходами, запусками и доказательствами в одном месте.",
    viewActivity: "Просмотреть активность",
    startRun: "Запустить",
    connectProvider: "Подключить провайдера",
    measuredSpend: "Измеренные расходы",
    providerUsage: "Использование провайдера",
    noUsage: "Использования пока нет",
    requests: "Запросы",
    inSelectedPeriod: "За выбранный период",
    totalTokens: "Всего токенов",
    inputOutput: "Вход + выход",
    runs: "Запуски",
    evidenceBacked: "Активность с доказательствами",
    usageEyebrow: "ИЗМЕРЕННОЕ ИСПОЛЬЗОВАНИЕ ПРОВАЙДЕРА",
    usageTitle: "Использование и активность",
    openActivity: "Открыть активность",
    noUsageTitle: "Использования пока нет",
    connectAndRun: "Подключите провайдера и запустите приложение. Измеренные расходы и активность моделей появятся здесь.",
    topModels: "Топ модели",
    unknownModel: "Неизвестная модель",
    noModelBreakdown: "Нет разбивки по моделям",
    topProviders: "Топ провайдеры",
    unknownProvider: "Неизвестный провайдер",
    noProviderBreakdown: "Нет разбивки по провайдерам",
    stateEyebrow: "ТЕКУЩЕЕ СОСТОЯНИЕ",
    controlTitle: "Состояние управления",
    providerConnection: "Подключение провайдера",
    required: "Требуется",
    budgetPolicy: "Политика бюджета",
    notConfigured: "Не настроено",
    managementKeys: "Ключи управления",
    active: "{count} активных",
    verified: "{count} подтверждено",
    secretIsolation: "Изоляция секретов",
    defaultDeny: "Запрещено по умолчанию",
    reviewGuardrails: "Просмотреть ограничения",
    latestEyebrow: "ПОСЛЕДНИЕ ДОКАЗАТЕЛЬСТВА",
    recentRuns: "Последние запуски",
    viewAll: "Просмотреть всё",
    workspaceRun: "Запуск рабочего пространства",
    modelNotReported: "Модель не указана",
    noRunsTitle: "Запусков пока нет",
    browseApps: "Просмотреть приложения",
    calloutTitle: "Доказательства создаются реальными запусками",
    calloutBody: "Tvijo записывает модель, маршрут, статус и время после фактической активности. Пустые состояния остаются пустыми — ничего не имитируется.",
    runsEvidence: "Запуски и доказательства",
    billingSeparation: "Использование провайдера оплачивается напрямую провайдерам через BYOK. Сервисы и кредиты Tvijo показаны отдельно в разделе",
    billingCreditsLink: "Биллинг и кредиты",
    monthSuffix: "/мес",
    daySuffix: "/день",
  },
  activity: {
    eyebrow: "РАБОЧЕЕ ПРОСТРАНСТВО · ИЗМЕРЕННОЕ ИСПОЛЬЗОВАНИЕ",
    title: "Активность",
    subtitle: "Использование провайдера в рамках пользователя. Пустые метрики остаются пустыми, пока не произойдут реальные вызовы.",
    range7: "7 дней",
    range30: "30 дней",
    range90: "90 дней",
    spend: "Измеренные расходы",
    requests: "Запросы",
    paidToProviders: "Оплачено напрямую провайдерам",
    inputTokens: "Входные токены",
    outputTokens: "Выходные токены",
    topModels: "Топ-модели",
    topProviders: "Топ-провайдеры",
    unknown: "Неизвестно",
    noModelActivity: "Активности моделей нет",
    noModelActivityCopy: "Использование моделей появится после первого маршрутизированного вызова.",
    noProviderActivity: "Активности провайдера нет",
    noProviderActivityCopy: "Подключите провайдера, чтобы начать измерение использования.",
  },
  billing: {
    eyebrow: "АККАУНТ · ПОНЯТНЫЕ КОММЕРЧЕСКИЕ НАПРАВЛЕНИЯ",
    title: "Биллинг и кредиты",
    subtitle: "Использование провайдера, начисления Tvijo и управляемые сервисы разделены.",
    setBudget: "Установить бюджет",
    providerUsage: "Использование провайдера",
    measuredPaid: "Только измеренное · оплачивается провайдерам",
    details: "Подробности",
    tvijoCharges: "Начисления Tvijo",
    seeLedger: "Показать реестр",
    zero: "{currency} 0.00",
    recordedInLedger: "Зафиксировано в вашем реестре Tvijo",
    noPaymentLedger: "Нет платёжного реестра для BYOK",
    budgetPolicy: "Политика бюджета",
    hardStopEnabled: "Жёсткая остановка включена",
    warningActive: "Политика предупреждения активна",
    addBoundary: "Добавить границу расходов",
    edit: "Изменить",
    flowEyebrow: "БЕЗ СКРЫТОГО СМЕШИВАНИЯ",
    howBillingWorks: "Как работает биллинг",
    stepProviderCalls: "Вызовы провайдера",
    stepProviderCopy: "Использование BYOK оплачивает напрямую ваш провайдер.",
    stepTvijoServices: "Сервисы Tvijo",
    stepTvijoCopy: "Рабочее пространство и одобренные управляемые работы начисляются Tvijo.",
    stepManagedCompute: "Управляемые вычисления",
    stepManagedCopy: "Инфраструктура начинается со счёта и одобрения человека.",
    stepDomains: "Домены",
    stepDomainsCopy: "Tvijo проверяет доступность; регистрация остаётся за регистратором.",
    ledgerEyebrow: "РЕЕСТР АККАУНТА",
    chargesCredits: "Начисления и кредиты",
    charges: "Начисления",
    credits: "Кредиты",
    noChargesTitle: "Начислений Tvijo пока нет",
    noChargesCopy: "Расходы провайдера — не транзакция Tvijo. Когда будет активирован платный сервис Tvijo, его начисления появятся здесь.",
    noCreditsTitle: "Кредиты не включены",
    noCreditsCopy: "Кредиты и автопополнение появятся только тогда, когда для вашего аккаунта будет доступен реальный платёжный реестр.",
    managedEyebrow: "УПРАВЛЯЕМЫЙ СЕРВИС",
    infrastructure: "Инфраструктура",
    managedCopy: "Заказывайте управляемые вычисления через прозрачный счёт. Каждый заказ ждёт одобрения перед предоставлением.",
    manageBenefitQuote: "Счёт до обязательств",
    manageBenefitNoAuto: "Без автоматического предоставления",
    manageBenefitPricing: "Отдельные тарифы сервиса",
    exploreInfra: "Узнать об инфраструктуре",
    separationNote: "Суммы провайдера — это измерения, а не счета Tvijo. Кредиты скрыты от процессов покупки, пока не включится платёжный реестр бэкенда.",
    dialogEyebrow: "ГРАНИЦЫ РАСХОДОВ",
    setBudgetPolicy: "Установить политику бюджета",
    dialogSub: "Границы применяются к измеренному использованию и не списывают средства с аккаунта.",
    dialogCloseAria: "Закрыть политику бюджета",
    dailyLimit: "Дневной лимит ({currency})",
    monthlyLimit: "Месячный лимит ({currency})",
    perRequestLimit: "Лимит на запрос ({currency})",
    warnAt: "Предупреждать при",
    optional: "Необязательно",
    enableHardStop: "Включить жёсткую остановку",
    hardStopHelp: "Останавливать маршрутизированную активность при достижении настроенной границы.",
    cancel: "Отмена",
    saving: "Сохранение…",
    savePolicy: "Сохранить политику",
    saveFailed: "Не удалось сохранить политику бюджета.",
    month: "/месяц",
    day: "/день",
    byokSpend: "На вашем ключе",
    byokSpendNote: "Счёт выставляет провайдер вам · Tvijo это не взимает",
    platformSpend: "На ключах Tvijo",
    platformSpendNote: "Выполнено без вашего подтверждённого ключа",
    unpricedNote: "{count} вызовов записаны как 0, потому что цена модели неизвестна, а не потому что они были бесплатны.",
  },
  connections: {
    ...EN.connections,
    eyebrow: "ПОДКЛЮЧЕНИЯ · ЗАПРЕЩЕНО ПО УМОЛЧАНИЮ",
    title: "Подключения",
    subtitle: "Подключайте собственных ИИ-провайдеров. Секреты только записываются и никогда не показываются снова.",
    addKey: "Добавить ключ провайдера (BYOK)",
    providerLabel: "Провайдер",
    labelLabel: "Название",
    labelPlaceholder: "Production key",
    secretLabel: "Секрет (только запись)",
    secretPlaceholder: "sk-…",
    addVerify: "Добавить и проверить",
    noCredsTitle: "Учётных данных пока нет",
    noCredsCopy: "Добавьте ключ провайдера выше, чтобы начать.",
    credsTitle: "Учётные данные провайдера",
    secretRequired: "Секрет обязателен.",
    createFailed: "Не удалось создать",
    verifyFailed: "Не удалось проверить",
    revokeFailed: "Не удалось отозвать",
    confirmRevoke: "Отозвать эти учётные данные? После этого их нельзя будет использовать.",
    headProvider: "Провайдер",
    headLabel: "Название",
    headStatus: "Статус",
    headHint: "Подсказка",
    headActions: "Действия",
    verify: "Проверить",
    revoke: "Отозвать",
    revoked: "отозвано",
    manageKeysLink: "Управлять API-ключами Tvijo",
    viewAppsLink: "Просмотреть приложения",
    viewModelsLink: "Просмотреть модели",
    openRouterTitle: "Один ключ, контролируемый доступ к моделям",
    openRouterCopy: "Tvijo проверяет ключ без платного вызова модели. Запросы остаются на сервере и используют настроенный список разрешённых моделей.",
    openRouterPrivacy: "Маршрут по умолчанию: только ZDR-провайдеры, сбор данных запрещён, параметры проверяются, резервные маршруты разрешены.",
    openRouterResources: "Официальные ресурсы OpenRouter",
    openRouterDocs: "Быстрый старт",
    openRouterModels: "Каталог моделей",
    verifiedLive: "Ключ проверен у провайдера — токены не списаны.",
    keyCreditRemaining: "Остаток кредита",
    gatewayEyebrow: "HERMES · УПРАВЛЯЕМЫЙ ШЛЮЗ",
    gatewayTitle: "Ключ шлюза AI OS",
    gatewayCopy: "Создайте отдельный ключ для Hermes-агента на вашем сервере. У каждого ключа свой дневной USD-лимит, учёт использования и полоса трассировки.",
    gatewayNotConfiguredTitle: "Выдача ключей шлюза не настроена",
    gatewayNotConfiguredCopy: "Оператор должен подключить control plane AI OS, прежде чем можно будет создавать ключи шлюза.",
    gatewayNameLabel: "Название ключа",
    gatewayNamePlaceholder: "Production Hermes server",
    gatewayBudgetLabel: "Жёсткий дневной лимит (USD)",
    gatewayCreate: "Создать ключ шлюза",
    gatewayCreating: "Создание…",
    gatewayNameRequired: "Название ключа обязательно.",
    gatewayCreateFailed: "Не удалось создать ключ шлюза.",
    gatewayStatusFailed: "Не удалось загрузить состояние шлюза.",
    gatewayRevokeFailed: "Не удалось отозвать ключ шлюза.",
    gatewayConfirmRevoke: "Отозвать этот ключ шлюза? Hermes сразу перестанет с ним работать.",
    gatewaySecretOnce: "Скопируйте ключ сейчас. Он больше не будет показан.",
    gatewayConfigTitle: "Hermes config.yaml",
    copySecret: "Скопировать ключ",
    copyConfig: "Скопировать конфигурацию",
    copied: "Скопировано",
    gatewayEmptyTitle: "Ключей шлюза пока нет",
    gatewayEmptyCopy: "Создайте ключ, чтобы подключить Hermes через маршрутизацию и бюджетные ограничения Tvijo.",
    gatewayKeysTitle: "Ключи шлюза",
    gatewayKeyHead: "Ключ",
    gatewayBudgetHead: "Жёсткий лимит",
    gatewayUsageHead: "Сегодня",
    gatewayRequests: "запросов",
    refreshStatus: "Обновить использование",
    loadingStatus: "Загрузка…",
    gatewayTraceTitle: "Очищенное состояние AI OS",
    gatewayTraces: "последних трасс",
    day: "день",
    month: "месяц",
    providersTitle: "Провайдеры",
    providersCopy: "Что Tvijo реально умеет с каждым провайдером и что измерил сегодняшний снимок моделей.",
    liveCheckYes: "Проверка ключа доступна",
    liveCheckNo: "Проверки ключа нет",
    liveCheckNoHint: "Ключ для этого провайдера можно сохранить и зашифровать, но Tvijo не может подтвердить, что он работает.",
    catalogModels: "Модели",
    catalogInput: "Вход",
    catalogOutput: "Выход",
    catalogContext: "Макс. контекст",
    catalogNone: "Данных каталога для этого провайдера нет.",
    catalogSourceLabel: "Источник: OpenRouter, измерено",
    catalogScopeAggregated: "весь маршрутизируемый каталог",
    catalogScopeVendor: "этот вендор через OpenRouter",
    perMillion: "за 1M токенов",
    stateLiveVerified: "Подтверждён провайдером",
    stateStored: "Сохранён, не подтверждён",
    stateError: "Отклонён",
    storedNotVerified: "Секрет сохранён и зашифрован. У Tvijo нет проверки ключа для этого провайдера, поэтому он не подтверждён.",
    headVerification: "Подтверждение",
    noCredential: "Ключ не добавлен",
  },
  guardrails: {
    eyebrow: "GUARDRAILS · ТОЛЬКО ДОКАЗУЕМОЕ",
    title: "Guardrails",
    subtitle: "Каждый контроль ниже считан из конфигурации или из ваших собственных данных. Контроль, который нельзя доказать, мы не показываем вовсе.",
    budgetPolicy: "Бюджетная политика",
    softLimitCopy: "Лимит задан, но жёсткий стоп выключен — запуски не отклоняются.",
    limit: "Лимит",
    value: "Значение",
    rowsDaily: "В день",
    rowsMonthly: "В месяц",
    rowsPerRequest: "За запрос",
    rowsHardStop: "Жёсткий стоп",
    yes: "да",
    no: "нет",
    decisionTrailTitle: "Журнал решений",
    decisionTrailCopy: "Каждое изменение ключа, бюджета или контракта, новые сверху.",
    onTrail: "Записей пока нет",
    onTrailCopy: "Создание ключа, изменение бюджета или утверждение контракта появятся здесь.",
    rowAction: "Действие",
    rowResource: "Ресурс",
    rowWhen: "Когда",
    ctlSpendCap: "Жёсткий лимит расходов",
    ctlSecretStorage: "Хранение секретов",
    ctlExecutionIsolation: "Изоляция исполнения",
    ctlHumanAcceptance: "Приёмка человеком",
    ctlToolAuthorization: "Авторизация инструментов",
    stNotConfigured: "Не настроено",
    stConfiguredSoft: "Мягкий лимит",
    stEnforced: "Действует",
    stEncrypted: "Зашифровано",
    stUnavailable: "Недоступно",
    stWorker: "Отдельный воркер",
    stInline: "В запросе",
    stOff: "Выключено",
    stActive: "Активно",
    stNoRuns: "Запусков ещё нет",
    whySpendCap: "Считано из вашей бюджетной политики. «Действует» означает, что лимит задан и жёсткий стоп включён, поэтому запуск сверх бюджета отклоняется.",
    whySecretStorage: "Считано из ключа шифрования. «Зашифровано» означает, что сохранённые секреты запечатаны Fernet; без ключа сохранение учётных данных падает, а не кладёт открытый текст.",
    whyExecutionIsolation: "Считано из конфигурации очереди задач: работа идёт в отдельном воркере или внутри запроса.",
    whyHumanAcceptance: "Считано из ваших утверждённых контрактов. Контракт с гейтом before_external_action требует человека перед любым внешним действием.",
    whyToolAuthorization: "Подсчитано по решениям авторизации на ваших запусках. Нет запусков — нет доказательств ни в ту, ни в другую сторону.",
    decisionsAllowed: "разрешено",
    decisionsDenied: "отклонено",
    windowDays: "последние 30 дней",
  },
  domains: {
    eyebrow: "РЕСУРСЫ · ТОЛЬКО ДОСТУПНОСТЬ",
    title: "Домены",
    subtitle: "Придумывайте названия и проверяйте реальную доступность. Регистрация остаётся у внешнего регистратора.",
    describeIdea: "Опишите вашу идею",
    ideaPlaceholder: "например, evidence-first AI workspace",
    checking: "Проверяем…",
    findDomains: "Найти домены",
    notConfiguredTitle: "Сервис доступности не настроен",
    notConfiguredCopy: "Предложения показаны ниже, но доступность пока нельзя проверить.",
    suggestionsTitle: "Предложения",
    purchaseExternal: "Купить вовне",
    statesAvailable: "Доступен",
    statesUnavailable: "Недоступен",
    statesUnverified: "Не проверено",
    recentSearches: "Недавние поиски",
    states: "{count} доступно",
    whenFail: "Не удалось выполнить поиск домена.",
  },
  infrastructure: {
    eyebrow: "РЕСУРСЫ · УПРАВЛЯЕМЫЕ ВЫЧИСЛЕНИЯ",
    title: "Инфраструктура",
    subtitle: "Прозрачные счета и предоставление с одобрением человека. Ни один сервер не создаётся автоматически.",
    providerIntegration: "Интеграция провайдера",
    configured: "Настроено",
    notConfigured: "Не настроено",
    capabilityVerified: "Возможность подтверждена",
    notGranted: "Возможность не предоставлена",
    provisioning: "Предоставление",
    featureEnabled: "Функция включена",
    humanApprovalOnly: "Только с одобрением человека",
    quoteApproval: "Счёт и одобрение требуются перед любым действием провайдера.",
    safeFlowTitle: "Безопасный поток запросов",
    stepChoose: "Выберите вычисления",
    stepChooseCopy: "Выберите доступный тип сервера и расположение.",
    stepQuote: "Получите счёт",
    stepQuoteCopy: "Тарифы провайдера и сервиса показаны отдельно.",
    stepApproval: "Одобрение человека",
    stepApprovalCopy: "Запрос ждёт явного рассмотрения.",
    stepRule: "Предоставить",
    stepRuleCopy: "Продолжать могут только одобренные и включённые заказы.",
    yourRequests: "Ваши заявки",
    quotePending: "Счёт ожидается",
    noRequestsTitle: "Заявок на инфраструктуру нет",
    noRequestsCopy: "Конструктор счетов будет доступен, когда настроят каталог провайдеров и коммерческие тарифы.",
  },
  keys: {
    eyebrow: "УПРАВЛЕНИЕ · ПРОГРАММНЫЙ ДОСТУП",
    title: "Ключи управления",
    subtitle: "Создавайте ограниченные ключи Tvijo. Секрет отображается только один раз, и его невозможно восстановить.",
    createTitle: "Создать ключ только для чтения",
    keyName: "Название ключа",
    keyNamePlaceholder: "analytics-readonly",
    creating: "Создание…",
    createKey: "Создать ключ",
    secretOnce: "Скопируйте этот секрет сейчас — он больше не будет показан.",
    copyText: "Копировать",
    keyNameRequired: "Название ключа обязательно.",
    createFailed: "Не удалось создать ключ.",
    revokeFailed: "Не удалось отозвать ключ.",
    confirmRevoke: "Отозвать этот ключ управления?",
    headName: "Название",
    headKey: "Ключ",
    headScopes: "Области",
    headStatus: "Статус / действие",
    revoke: "Отозвать",
    revoked: "отозвано",
    noKeyList: "Ключей управления нет",
    noKeysCopy: "Создавайте ограниченный ключ только тогда, когда нужен программный доступ.",
    activeRevokedTitle: "Активные и отозванные ключи",
  },
  models: {
    ...EN.models,
    eyebrow: "МОДЕЛИ · В РАМКАХ ПОЛЬЗОВАТЕЛЯ",
    title: "Модели и использование",
    subtitle: "Адаптеры провайдеров, статус учётных данных и ваше измеренное использование.",
    registryTitle: "Реестр провайдеров",
    headProvider: "Провайдер",
    headSupported: "Поддерживается",
    headCredential: "Учётные данные",
    headLastVerified: "Последняя проверка",
    yes: "Да",
    no: "Нет",
    footnote: "«Поддерживается» отражает установленный адаптер, а не рабочее соединение.",
    byModel: "По модели",
    byProvider: "По провайдеру",
    headModel: "Модель",
    headCalls: "Вызовы",
    headCost: "Стоимость",
    noUsageTitle: "Использования пока нет",
    noUsageCopy: "Агрегаты использования появятся после вашего первого вызова.",
    connectProviderKey: "Подключить ключ провайдера",
    viewGuardrails: "Просмотреть ограничения",
    catalogSource: "Официальный каталог",
    openRouterPolicy: "ZDR · сбор данных запрещён · параметры согласованы",
  },
  preferences: {
    eyebrow: "НАСТРОЙКИ · СОХРАНЁННЫЕ ПАРАМЕТРЫ",
    title: "Настройки",
    subtitle: "Только параметры, которые мы действительно сохраняем и используем. Имя и почта — в профиле аккаунта.",
    display: "Отображение",
    timezone: "Часовой пояс",
    dateFormat: "Формат даты",
    defaultRange: "Период активности по умолчанию",
    range7: "Последние 7 дней",
    range30: "Последние 30 дней",
    range90: "Последние 90 дней",
    tzHelp: "IANA-имя, напр. Europe/Kiev. Используется для группировки активности по дням.",
    saving: "Сохранение…",
    savePrefs: "Сохранить настройки",
    saved: "Сохранено · {date}",
    couldNotSave: "Не удалось сохранить",
  },
  profile: {
    eyebrow: "АККАУНТ · ЛИЧНОСТЬ",
    title: "Профиль",
    subtitle: "Ваша аутентифицированная личность Tvijo и детали аккаунта.",
    displayName: "Отображаемое имя",
    email: "Email",
    notSet: "Не задано",
    editPublic: "Редактировать публичный профиль",
  },
  contracts: {
    eyebrow: "EXECUTION CONTRACTS",
    title: "Каждый запуск агента начинается с контракта",
    subtitle: "Цель, одобренные знания, полномочия, маршруты моделей, бюджет и детерминированные правила приёмки фиксируются до запуска — и каждый запуск возвращает проверяемый пакет доказательств.",
    splitContract: "Contract — какой результат разрешён",
    splitBinding: "Binding — какая модель и инструмент его выполняют",
    splitAuthorization: "Authorization — разрешено ли каждое действие прямо сейчас",
    artifactsTitle: "Семь записанных артефактов",
    artifactsIntro: "После запуска Tvijo хранит хеш контракта, снимок знаний, binding, журнал авторизации, трассу исполнения, результаты приёмки и пакет доказательств.",
    statusLine: "Approved → Bound → Running → Verification → Passed / Rework / Blocked",
    runsLink: "Посмотреть свои запуски",
    articleLink: "Прочитать полный разбор",
    honestNote: "Контракты ниже принадлежат только вам. Контракт другой учётной записи не показывается, а его id возвращает 404.",
    listTitle: "Ваши контракты",
    listCopy: "Замороженные конверты этой учётной записи, новые сверху.",
    emptyTitle: "Контрактов пока нет",
    emptyCopy: "Контракт создаётся, когда под ним стартует запуск. Здесь нет заглушек — список остаётся пустым, пока у вас не появится настоящий контракт.",
    colGoal: "Цель",
    colHash: "Хеш",
    colBudget: "Бюджет",
    colRuns: "Запуски",
    colCreated: "Создан",
    statusDraft: "Черновик",
    statusApproved: "Утверждён",
    statusBlocked: "Заблокирован",
    backToList: "Назад к контрактам",
    frozenTitle: "Замороженный контракт",
    frozenCopy: "Эти значения захешированы при утверждении и не могут измениться. Исправление — это новая версия, а не правка.",
    fieldGoal: "Цель",
    fieldExpected: "Ожидаемый результат",
    fieldHash: "Хеш контракта",
    fieldVersion: "Версия",
    fieldModels: "Разрешённые модели",
    fieldTools: "Разрешённые инструменты",
    fieldForbidden: "Запрещённые действия",
    fieldGates: "Гейты утверждения",
    fieldAcceptance: "Правила приёмки",
    fieldKnowledge: "Одобренные знания",
    budgetUsd: "Макс. USD",
    budgetTokens: "Макс. токенов",
    budgetMinutes: "Макс. минут",
    budgetSteps: "Макс. шагов",
    runsTitle: "Запуски",
    runNo: "Запуск",
    runCost: "Стоимость",
    runTokens: "Токены",
    runSteps: "Шаги",
    runAcceptance: "Приёмка",
    runEvidence: "Доказательства",
    noRunsTitle: "Запусков по этому контракту нет",
    noRunsCopy: "Контракт заморожен, но под ним ещё ничего не выполнялось.",
    evidenceButton: "Пакет доказательств",
    evidenceLoading: "Загрузка…",
    evidenceNone: "Для этого запуска пакет доказательств не записан.",
    evidenceHash: "Хеш пакета",
    loadFailed: "Не удалось загрузить контракт.",
    none: "—",
    runsHref: "/workspace/runs",
    articleHref: "/kb/ai-governance/every-agent-run-starts-with-a-contract",
    newContract: "Новый контракт",
    builderTitle: "Новый execution contract",
    step: "Шаг",
    of: "из",
    back: "Назад",
    next: "Далее",
    cancel: "Отмена",
    stepGoal: "Цель",
    stepKnowledge: "Знания",
    stepPermissions: "Полномочия",
    stepBudget: "Бюджет",
    stepAcceptance: "Приёмка",
    stepReview: "Проверка",
    goalLabel: "Что нужно сделать",
    goalPlaceholder: "Проверить компанию и подготовить отчёт",
    expectedLabel: "Что считается результатом",
    expectedPlaceholder: "Отчёт с источником к каждому утверждению",
    knowledgeIntro: "Зафиксируйте точные источники и версии, на которые может опираться запуск. Источник, добавленный позже, в этот контракт не входит.",
    knowledgeRef: "Ссылка",
    knowledgeKind: "Тип",
    knowledgeVersion: "Версия",
    knowledgeAdd: "Добавить источник",
    knowledgeRemove: "Убрать",
    knowledgeEmpty: "Источники не зафиксированы. Контракт без одобренных знаний допустим, но запуску не на что версионно сослаться.",
    permissionsIntro: "Разрешите только те инструменты, которые нужны, и назовите действия, которых не должно случиться никогда.",
    enforcementNote: "Это декларации, применяемые на границе инструмента: инструмент вне списка разрешённых или действие из списка запрещённых отклоняется. Сам Tvijo выполняет вызовы моделей; инструменты выполняет ai-os под этим же замороженным контрактом.",
    toolsLabel: "Разрешённые инструменты",
    forbiddenLabel: "Запрещённые действия",
    gatesLabel: "Гейты утверждения",
    sideEffect: "меняет что-то вне запуска",
    modelsLabel: "Разрешённые модели",
    modelsEmpty: "Моделей нет. Сначала добавьте и подтвердите ключ провайдера в разделе Connections.",
    budgetIntro: "Замораживается до первого вызова. Запуск, превысивший любое из этих значений, блокируется, а не обрезается.",
    moneyRule: "Целая сумма отправляется числом, дробная — текстом: именно это держит хеш одинаковым с обеих сторон.",
    acceptanceIntro: "Детерминированные проверки выполняются над результатом. Проваленная обязательная проверка отправляет работу в Rework.",
    acceptanceOnlyThese: "Эти три — правила, которые Tvijo действительно реализует. Неизвестное правило считается проваленным, поэтому других не предлагаем.",
    reviewIntro: "Это точный JSON, который будет захеширован и заморожен.",
    reviewHash: "Хеш контракта",
    reviewHashNote: "Вычислен в вашем браузере тем же алгоритмом, что и на бэкенде. Он должен совпасть с тем, что вернёт сервер.",
    freeze: "Заморозить контракт",
    freezing: "Замораживаем…",
    frozenOk: "Контракт заморожен и утверждён.",
    errGoal: "Опишите, что нужно сделать.",
    errExpected: "Опишите, что считается результатом.",
    errModels: "Выберите хотя бы одну модель.",
    errAcceptance: "Выберите хотя бы одно правило приёмки.",
    errBudget: "Каждое поле бюджета требует положительного числа.",
    createFailedContract: "Не удалось создать контракт.",
    noRunsExecutorCopy: "Контракт заморожен и готов. Запуски появятся здесь, когда под ним произойдёт исполнение — собственный исполнитель Tvijo к этой кнопке пока не подключён, поэтому сегодня запуск приходит из ai-os, обращающегося к API контрактов по сервисному токену.",
    modelsFilter: "Фильтр моделей",
    modelsNoKey: "У вас нет подтверждённого ключа провайдера, способного выполнить запуск. Добавьте и подтвердите ключ OpenRouter в разделе Connections; контракт можно заморозить и без него, но не выполнить.",
    modelsRunnableNote: "Это модели, которые Tvijo действительно может выполнить. Каталог в разделе Connections перечисляет всё, что предлагает провайдер, — это то, что существует, а не то, что здесь исполняется.",
    runTitle: "Выполнить этот контракт",
    runIntro: "Один вызов модели под замороженным контрактом. Результат проверяется правилами приёмки; исполнитель не решает сам, успешен ли он.",
    runModelLabel: "Модель",
    runSpendWarning: "Это тратит деньги на вашем собственном ключе провайдера, в пределах бюджета контракта. Tvijo за это не платит и не перепродаёт токены.",
    runConfirm: "Выполнить, потратив до",
    runCancel: "Не сейчас",
    runStarting: "Выполняем…",
    runNoKey: "Для выполнения нужен подтверждённый ключ OpenRouter. Добавьте его в разделе Connections — контракт остаётся замороженным в любом случае.",
    runResultPassed: "Passed — все правила приёмки выполнены.",
    runResultRework: "Rework — правило приёмки не прошло. Результат сохранён, контракт не изменён.",
    runResultBlocked: "Blocked — контракт отклонил этот запуск.",
    runResultUnfinished: "Провайдер не ответил. Ничего не принято, запуск записан как незавершённый.",
  },

  runs: {
    eyebrow: "ДОКАЗАТЕЛЬСТВА · В РАМКАХ ПОЛЬЗОВАТЕЛЯ",
    title: "Запуски и доказательства",
    subtitle: "Ваши собственные решения и журнал ИИ-вызовов — без импортированных демо-счётчиков.",
    noRunsTitle: "Запусков пока нет",
    noRunsCopy: "Запуски из ваших вызовов моделей и решений появятся здесь. Подключите провайдера и запустите задачу, чтобы начать.",
    headRoute: "Маршрут",
    headModel: "Модель",
    headStatus: "Статус",
    headCost: "Стоимость",
    headWhen: "Когда",
    connectProvider: "Подключить провайдера",
    viewGuardrails: "Просмотреть ограничения",
  },
  skillPacks: {
    eyebrow: "ПАКЕТЫ НАВЫКОВ АГЕНТА",
    title: "Пакеты навыков",
    subtitle: "Markdown-документы, которые вы даёте агенту, работающему на вашем сервере. Прочитайте, что делает каждый пакет, прежде чем что-либо устанавливать.",
    tierLabel: "Уровень доверия",
    filesLabel: "{count} файлов",
    howToLink: "Как установить на своём сервере",
    markdownOnly: "Эти пакеты — Markdown-документы. Ни в одном из них нет исполняемого кода.",
    gatewayLabel: "Шлюз AI OS",
    gatewayConfigured: "настроен",
    gatewayNotConfigured: "не настроен",
    gatewayConfiguredNote: "Создайте в Подключениях отдельный клиентский ключ со своим жёстким бюджетом и полосой трассировки.",
    gatewayNotConfiguredNote: "Оператор должен подключить control plane AI OS, прежде чем можно будет создавать ключи шлюза.",
    openConnections: "Создать или настроить ключ шлюза",
    versionLabel: "версия",
    downloadPack: "Скачать ZIP",
    downloading: "Загрузка…",
    downloadFailed: "Не удалось скачать пакет навыков.",
    howToEyebrow: "КАК УСТАНОВИТЬ",
    howToTitle: "Запустите пакет на своём сервере",
    howToSubtitle: "Среду агента вы запускаете сами. Пакеты — это документы, а не код, и работают только там, куда вы их положите.",
    step1Title: "Установите агента",
    step1Copy: "Установите Hermes на собственный VPS через официальный установщик или используйте любого агента, читающего SKILL.md в формате agentskills.io.",
    step2Title: "Добавьте пакеты",
    step2Copy: "Скачайте ZIP и скопируйте Markdown-файлы в каталог навыков агента. Просмотрите каждый файл перед использованием.",
    step3Title: "Создайте ключ шлюза",
    step3Copy: "В Подключениях создайте отдельный ключ и сразу скопируйте его. Tvijo хранит только префикс и последние четыре символа.",
    step4Title: "Направьте Hermes на Tvijo",
    step4Copy: "Скопируйте готовый блок config.yaml из Подключений. У ключа будет отдельный бюджет, учёт использования и журнал аудита.",
    byokTitle: "Ваши ключи остаются вашими",
    byokCopy: "Пакеты не содержат учётных данных и не хранят ваши ключи. BYOK оставляет биллинг провайдера на вас.",
    loadFailed: "Не удалось загрузить пакеты навыков.",
    emptyTitle: "Пакеты навыков ещё не опубликованы",
    emptyCopy: "Пакеты появятся здесь после публикации.",
    cta: "Посмотреть пакеты навыков",
  },
  reference: {
    eyebrow: "СПРАВОЧНИК AI",
    title: "Справочник AI",
    subtitle: "Как подключить и использовать модели через OpenRouter как BYOK-провайдера.",
    listTitle: "Разделы",
    emptyTitle: "Справочник пока недоступен",
    emptyCopy: "Статьи справочника появятся здесь после публикации.",
    backToList: "Назад к разделам",
    minutes: "мин чтения",
  },
};

/* ------------------------------ selector --------------------------------- */

export function getWorkspaceCopy(locale: Locale): WorkspaceCopy {
  if (locale === "uk") return UK;
  if (locale === "ru") return RU;
  return EN;
}
