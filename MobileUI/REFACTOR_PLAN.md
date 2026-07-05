# MobileUI Refactor Plan

Phased plan to align the codebase with [ARCHITECTURE.md](./ARCHITECTURE.md) and `.cursor/rules/react-native-expo-mobile-rules.mdc` without breaking existing features.

**Status:** In progress (Phases 0–3 complete, 4–6 partial)  
**Last updated:** 2026-07-05

---

## Goals

- Consistent screen shells (stack + tab) using shared UI primitives
- Standardized async state (loading / error / empty / content)
- Theme-aware styling — no hardcoded hex in `features/`
- Domain layer owns all financial math and validation
- Minimal redundancy; screens under 300 lines
- All UITests (specs 01–13) pass after every phase

---

## Non-Negotiable Guardrails

| Rule | Enforcement |
|------|-------------|
| Behavior preservation | Visual/functional parity first; structure second |
| Stable E2E selectors | Never rename existing `testID`s |
| One concern per PR | Foundation → one screen group → verify → merge |
| No big-bang rewrites | Migrate screen-by-screen |
| Gate before proceeding | `typecheck` + `lint` + `test` + UITests |
| Extend existing abstractions | Use `Screen`, `QueryScreenBoundary`, `domain/*` — no parallel systems |
| Functional components only | Logic in hooks; screens are orchestrators |

### Critical `testID`s (do not rename)

- `screen-back-btn`
- `add-expense`
- `sign-out-btn`
- `insights-link`
- `transaction-search-input`
- `transaction-row-{id}`
- `notifications-screen`
- `mark-all-read-btn`
- `notification-row-{id}`

---

## Phase Dependency Map

```
Phase 0 (Baseline)
    └── Phase 1 (Foundation)
            ├── Phase 2 (Async State)
            ├── Phase 3 (Tab Shells)
            ├── Phase 4 (Theme Tokens)
            └── Phase 6 (Domain Layer)
                    └── Phase 9 (Tests)
            Phase 2 + 3 + 4
                    └── Phase 5 (Shared Components)
                            └── Phase 8 (File Splitting)
                                    └── Phase 10 (Dead Code Removal)
            Phase 7 (Import Cleanup) — after Phase 2
```

Phases 2, 3, 4, and 6 can run in parallel **after Phase 1**, each in its own PR.

---

## Phase 0 — Baseline & Safety Net

**Risk:** None | **PRs:** 1

### Tasks

- [x] Run baseline: `npm run typecheck`, `npm run lint`, `npm run test` in `MobileUI/`
- [ ] Run UITests specs 01–13; record pass/fail status
- [ ] Screenshot key screens: Dashboard, Budget, AI, Profile, Expenses, Add Expense, Notifications
- [x] Add `E2E_CONTRACT.md` documenting critical `testID`s (or extend `ARCHITECTURE.md`)
- [x] Add refactor checklist to PR template (in `REFACTOR_PLAN.md` per-PR section)

### Exit criteria

- Baseline commands documented
- UITest status documented
- E2E contract written

---

## Phase 1 — Foundation Layer

**Risk:** Low | **PRs:** 1 | **Depends on:** Phase 0

### Tasks

- [x] Create `constants/layout.ts` — export `TAB_BAR_HEIGHT` (64) and `TAB_CONTENT_CLEARANCE` (110)
- [x] Update `MainTabLayout.tsx` to import from `constants/layout.ts`
- [x] Create `hooks/useTabContentInsets.ts` — single source for tab screen padding
- [x] Extend `components/ui/Screen.tsx`:
  - [x] `variant?: "stack" | "tab"` (tab uses `useTabContentInsets`)
  - [x] `hero?: boolean` (Dashboard hero — no top padding on scroll content)
  - [x] Default `variant="stack"` for backward compatibility
- [x] Extend `constants/theme.ts` — add missing typography variants (`sectionTitle`, `statValue`, `label`, etc.)
- [x] Add `touchTarget.min = 44` to theme
- [x] Verify `constants/colors.ts` has all semantic tokens used by `useColors()`
- [ ] (Optional) ESLint rule warning hex literals in `features/**`

### Files touched

- `constants/layout.ts` (new)
- `hooks/useTabContentInsets.ts` (new)
- `components/ui/Screen.tsx`
- `constants/theme.ts`
- `features/navigation/screens/MainTabLayout.tsx`

### Do NOT

- Migrate any feature screens yet

### Exit criteria

- [ ] `typecheck` + `lint` pass
- [ ] No visual changes to existing screens

---

## Phase 2 — Async State Standardization

**Risk:** Low–Medium | **PRs:** 2–3 | **Depends on:** Phase 1

### 2A — Enhance QueryScreenBoundary (PR 1)

- [ ] Support multiple queries: `queries: UseQueryResult<unknown>[]`
- [ ] Optional `renderShell` wrapper
- [ ] Keep existing single-query API

**File:** `components/ui/QueryScreenBoundary.tsx`

### 2B — Migrate screens (PR 2–3, one batch per PR)

Migration order:

1. [ ] `NotificationsScreen`
2. [ ] `AccountsScreen`
3. [ ] `BudgetScreen`
4. [ ] `DashboardScreen`
5. [ ] `InsightsScreen`
6. [ ] `ProfileScreen` — add `ScreenLoading` while dashboard loads
7. [ ] `AiScreen` — add loading + error states (currently missing)

**Pattern:**

```tsx
<QueryScreenBoundary query={query} empty={...} isEmpty={...}>
  {(data) => (
    <Screen variant="tab">{/* existing content */}</Screen>
  )}
</QueryScreenBoundary>
```

### 2C — Empty states (PR 3)

- [ ] `NotificationsScreen` — `notifications.length === 0`
- [ ] `AccountsScreen` — `accounts.length === 0`
- [ ] `BudgetScreen` — `budgetCategories.length === 0` with add-category CTA

### Exit criteria per screen

- [ ] Loading, error, empty, content all handled
- [ ] UITests for affected screen pass

---

## Phase 3 — Tab Screen Shell Migration

**Risk:** Medium | **PRs:** 4 (one tab per PR) | **Depends on:** Phase 1

### Order

1. [ ] **Profile** — `ScreenScrollView variant="tab"`; extract `useProfileMenuProps()` hook
2. [ ] **Budget** — tab shell; consider `TabScreenHeader` primitive in `components/ui/`
3. [ ] **Dashboard** — `ScreenScrollView variant="tab" hero`; adopt `SectionHeader` for "Spending by Category"
4. [ ] **AI + Insights** — shell migration + component extraction (see Phase 8)

### Per-screen checklist

- [ ] Replace raw `ScrollView` with `Screen` / `ScreenScrollView`
- [ ] Remove manual `insets.top` / `insets.bottom + 110`
- [ ] Preserve all `testID`s and navigation behavior
- [ ] Keep pull-to-refresh handlers unchanged

### Do NOT change

- Routes under `app/`
- Tab bar layout in `MainTabLayout`
- FAB positions or voice modal trigger

### Exit criteria

- [ ] Visual parity with Phase 0 screenshots
- [ ] UITests: `03-dashboard`, `06-budget`, `11-profile` pass

---

## Phase 4 — Theme Token Enforcement

**Risk:** Low | **PRs:** 3–4 (by feature area) | **Depends on:** Phase 1

### PR breakdown

| PR | Scope |
|----|-------|
| 4A | Dashboard + Profile (`DashboardHero`, `DashboardMetrics`, `ProfileHeader`) |
| 4B | Budget + Transactions (modals, `ExpenseForm`, `TransactionDetailScreen`) |
| 4C | Insights + AI + Onboarding |
| 4D | Subscription + Auth + Voice |

### Replacement rules

| Instead of | Use |
|------------|-----|
| `#FFFFFF` on themed backgrounds | `colors.primaryForeground` |
| `#F59E0B` | `colors.warning` / `palette.amber500` |
| `#22C55E` / `#EF4444` | `colors.success` / `colors.expense` |
| `shadowColor: "#000"` blocks | `shadows.card` / `shadows.floating` |
| `fontFamily: "Inter_700Bold"` | `typography.*` tokens |
| Hardcoded `20` padding | `spacing.xl` / `spacing.xxl` |

### Allowlisted exceptions

- User-selectable account colors → `constants/accountColors.ts`
- API-driven category/chart colors → keep dynamic
- Onboarding illustration colors → `constants/onboarding.ts`

### Exit criteria per PR

- [ ] Dark mode toggle — all touched screens readable
- [ ] `rg '#[0-9a-fA-F]{3,8}' features/<area>/` → zero matches (except allowlisted files)

---

## Phase 5 — Shared Component Adoption

**Risk:** Low | **PRs:** 2 | **Depends on:** Phases 3 + 4

### 5A — SectionHeader + Button

- [ ] Dashboard, Budget, Insights section headers → `SectionHeader`
- [ ] Login, Subscription CTAs → `Button` with `loading` prop
- [ ] Touch targets ≥ 44×44

### 5B — MetricCard + shadows

- [ ] Insights monthly summary → `MetricCard`
- [ ] Replace all duplicate shadow StyleSheet blocks with `...shadows.card`

### Exit criteria

- [ ] `accessibilityRole="button"` preserved on all CTAs
- [ ] No visual regression on primary actions

---

## Phase 6 — Domain Layer Consolidation

**Risk:** Medium | **PRs:** 2 | **Depends on:** Phase 1

### 6A — Budget metrics

- [ ] Add `calculateSavingsRate(income, expenses)` to `domain/budget.ts`
- [ ] Use `calculateBudgetMetrics` / `getBudgetStatusTone` in `AiScreen`, `InsightsScreen`
- [ ] Remove inline budget % math from screens

### 6B — Transaction validation

- [ ] Move `expenseSchema` → `features/transactions/validation.ts`
- [ ] Wire `getSignedTransactionAmount` in create mutation path
- [ ] Consolidate or remove `domain/transactions.ts` (grep for imports first)

### Exit criteria

- [ ] Add expense (expense + income) saves with correct signs
- [ ] Voice prefill → add expense still works
- [ ] Unit tests for new domain helpers (Phase 9)

---

## Phase 7 — Import / Module Boundary Cleanup

**Risk:** Low | **PRs:** 1–2 | **Depends on:** Phase 2

### Tasks

- [ ] Remove cross-feature re-exports from `features/*/api.ts`:
  - `profile/api.ts`, `dashboard/api.ts`, `transactions/api.ts`, `insights/api.ts`, `budget/api.ts`
- [ ] Update screen imports to use `@/features/<domain>/queries` directly
- [ ] Document in `ARCHITECTURE.md`: screens import from owning feature `queries.ts`
- [ ] (Optional) Move `TransactionRow` → `features/transactions/components/`

### Exit criteria

- [ ] `typecheck` passes
- [ ] No circular imports
- [ ] All screens load data correctly

---

## Phase 8 — File Size Reduction

**Risk:** Low | **PRs:** 1 per file | **Depends on:** Phase 5

Extract UI only — parent screen keeps query/mutation wiring.

| File | Lines | Extract to |
|------|-------|------------|
| `AiScreen.tsx` | 405 | `AiScreenHeader`, `AiBudgetHealthCard`, `AiInsightsList`, `AiProUpsell` |
| `SubscriptionScreen.tsx` | 402 | `SubscriptionPlanList`, `SubscriptionFooter` |
| `AddAccountScreen.tsx` | 382 | `AccountColorPicker`, `AccountTypePicker` |
| `ExpenseForm.tsx` | 379 | `TransactionTypeToggle`, `AmountInput` |
| `VoiceExpenseModal.tsx` | 354 | `VoiceRecordingControls`, `VoiceTranscriptPreview` |
| `AddBudgetCategoryModal.tsx` | 341 | `CategoryIconPicker` |
| `TransactionDetailScreen.tsx` | 329 | `TransactionDetailForm`, `TransactionDetailActions` |

### Exit criteria

- [ ] All screen orchestrators < 300 lines
- [ ] No behavior changes

---

## Phase 9 — Test Expansion

**Risk:** Low | **PRs:** 1–2 | **Parallel with:** Phases 6–8

### Unit tests (existing `tsconfig.test.json` pattern)

- [ ] `domain/budget.test.ts` — savings rate, status tone edge cases
- [ ] `domain/transactions.test.ts` — validation, signed amounts
- [ ] `lib/mappers.test.ts` — `mapTransaction`, `mapBudgetSummary`
- [ ] `hooks/useTabContentInsets.test.ts` — padding calculation

### E2E

- [ ] Run full UITests suite after Phases 2, 3, and 4
- [ ] Add AI tab smoke spec if not covered

---

## Phase 10 — Dead Code Removal

**Risk:** Low | **PRs:** 1 | **Depends on:** Phases 2–5 complete

Remove only after grep confirms zero imports:

- [ ] Unused cross-feature `api.ts` re-exports
- [ ] `domain/transactions.ts` (if consolidated in Phase 6B)
- [ ] `useQueryScreenState` (if unused — wire into `QueryScreenBoundary` or delete)

**Keep:** `MetricCard`, `QueryScreenBoundary`, `SectionHeader`, `Button` (adopted in Phase 5)

---

## Recommended PR Sequence

| # | Phase | Title | Risk |
|---|-------|-------|------|
| 1 | 0 | `chore: baseline E2E contract and refactor checklist` | None |
| 2 | 1 | `feat: tab insets hook and Screen tab variant` | Low |
| 3 | 2A | `feat: enhance QueryScreenBoundary for multi-query` | Low |
| 4 | 2B | `refactor: migrate notifications + accounts async state` | Low |
| 5 | 2B | `refactor: migrate budget + dashboard async state` | Medium |
| 6 | 2B/C | `fix: AI + profile loading/error; add empty states` | Medium |
| 7 | 3 | `refactor: profile tab shell migration` | Medium |
| 8 | 3 | `refactor: budget tab shell migration` | Medium |
| 9 | 3 | `refactor: dashboard tab shell + SectionHeader` | Medium |
| 10 | 3+8 | `refactor: split and migrate AI + insights screens` | Medium |
| 11 | 4A | `style: theme tokens dashboard + profile` | Low |
| 12 | 4B–D | `style: theme tokens remaining features` (2–3 PRs) | Low |
| 13 | 5 | `refactor: adopt Button, SectionHeader, MetricCard, shadows` | Low |
| 14 | 6 | `refactor: consolidate domain budget + transaction validation` | Medium |
| 15 | 7 | `refactor: clean feature import boundaries` | Low |
| 16 | 9+10 | `test: expand domain tests; remove dead code` | Low |

---

## Per-PR Verification Checklist

Copy into every refactor PR:

```markdown
## Refactor verification
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run test` passes
- [ ] No `testID` renames
- [ ] Manual smoke: [list affected flows]
- [ ] UITests: [list affected specs]
- [ ] Dark mode checked (if colors touched)
- [ ] No new hex literals in features/ (grep)
- [ ] Screen file < 300 lines (if screen was touched)
```

### Manual smoke flows (test affected subset)

1. Onboarding → Login → Dashboard
2. Add expense (manual; voice if touched)
3. View / edit / delete transaction
4. Budget: adjust total, edit category
5. Notifications: mark read / mark all
6. Profile: toggles, sign out
7. Subscription screen
8. Tab navigation + FAB

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Layout shift on tab screens | `useTabContentInsets` derived from same constant as tab bar |
| Breaking UITests | Frozen `testID` contract; run specs after each PR |
| Dark mode regressions | Phase 4 gated on theme toggle check |
| Double-submit on forms | Keep `disabled={mutation.isPending}` |
| Stale cache after mutations | Keep `invalidateFinancialQueries` unchanged in style PRs |
| Voice/AI confirmation bypass | `VoiceExpenseModal` save flow — extract only in Phase 8 |

---

## Out of Scope

- Renaming routes or restructuring `app/`
- Changing API contracts or query keys
- Introducing Redux / Zustand
- Adding NativeWind or styled-components
- Big-bang rewrite of all screens in one PR
- Replacing every `TouchableOpacity` with `Button`

---

## Success Criteria (project complete)

- [ ] All data-fetching screens use `QueryScreenBoundary`
- [ ] Tab screens use `Screen` / `ScreenScrollView` with `variant="tab"`
- [ ] Zero hardcoded hex in `features/` (except allowlisted data files)
- [ ] `SectionHeader`, `Button`, `shadows.*`, `typography.*` adopted consistently
- [ ] Financial math only in `domain/`
- [ ] No cross-feature `api.ts` re-exports
- [ ] All screen orchestrators < 300 lines
- [ ] UITests 01–13 pass
- [ ] `ARCHITECTURE.md` updated to reflect final patterns

---

## Audit Reference

This plan addresses findings from the MobileUI code audit (2026-07-05):

- Two parallel layout patterns (stack vs tab screens)
- `QueryScreenBoundary`, `SectionHeader`, `Button`, `MetricCard` built but underused
- 100+ hardcoded hex literals in `features/`
- Missing async states on AI tab and Profile loading
- Cross-feature `api.ts` coupling
- `domain/transactions.ts` unused; inline math in screens
- Only 2 domain unit tests
- 7+ files exceeding 300-line screen guideline

**Overall grade at audit:** B+ (good structure, uneven execution)
