# MobileUI E2E Contract

Stable `testID` and accessibility identifiers used by UITests. **Do not rename** during refactors.

## Navigation

| testID | Location | Used by |
|--------|----------|---------|
| `screen-back-btn` | `ScreenHeader` | All stack screens, UITests back navigation |
| `tab-home` | `MainTabLayout` | Dashboard tab |
| `tab-budget` | `MainTabLayout` | Budget tab |
| `tab-ai` | `MainTabLayout` | AI tab |
| `tab-profile` | `MainTabLayout` | Profile tab |
| `add-expense` | `MainTabLayout` FAB | Add expense flow |

## Auth & Onboarding

| testID | Screen |
|--------|--------|
| `onboarding-continue-btn` | Onboarding |
| `login-apple-btn` | Login |
| `login-google-btn` | Login |

## Dashboard

| testID | Element |
|--------|---------|
| `insights-link` | Spending by Category → Details |

## Transactions

| testID | Element |
|--------|---------|
| `transaction-search-input` | Expenses search |
| `transaction-row-{id}` | `TransactionRow` |
| `add-expense-submit` | Add expense form |
| `account-picker` | Add expense account field |
| `account-picker-empty` | Add expense account field (no accounts) |
| `account-select-modal` | Account select modal root |
| `account-select-row-{id}` | Selectable account row in modal |
| `account-select-close-btn` | Close account select modal |
| `account-select-manage-btn` | Manage accounts link in modal |

## Accounts

| testID | Element |
|--------|---------|
| `accounts-total-balance` | Summary card |
| `account-row-{id}` | Account list row (tap to edit) |
| `delete-account-btn-{id}` | Delete button |
| `add-account-btn` | Connect new account |
| `account-name-input` | Add / edit account form |
| `account-balance-input` | Add / edit account balance |
| `save-account-btn` | Save add / edit account |
| `account-default-badge-{id}` | Default badge on account row |
| `account-set-default-btn-{id}` | Set default action on list row |
| `account-set-default-btn` | Set as default on edit account screen |

## Notifications

| testID | Element |
|--------|---------|
| `notifications-screen` | Screen root wrapper |
| `mark-all-read-btn` | Header action |
| `notification-row-{id}` | Notification card |

## Profile

| testID | Element |
|--------|---------|
| `sign-out-btn` | Sign out button |

## Baseline (2026-07-05)

| Command | Status |
|---------|--------|
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm run test` | Pass |
| UITests 01–13 | Not run in CI session — run locally before release |
