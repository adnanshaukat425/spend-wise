import type { ChevronRow, MenuRow } from "../components/ProfileMenuSection";

interface UseProfileMenuPropsOptions {
  accountsCount: number;
  currency: string;
  displayPlan: string;
  isDark: boolean;
  notificationsEnabled: boolean;
  onChevronPress: (row: ChevronRow) => void;
  onDarkModeChange: (value: boolean) => void;
  onNotificationsChange: (value: boolean) => void;
}

export function useProfileMenuSections({
  accountsCount,
  currency,
  displayPlan,
  isDark,
  notificationsEnabled,
  onChevronPress,
  onDarkModeChange,
  onNotificationsChange,
}: UseProfileMenuPropsOptions) {
  const sharedSectionProps = {
    isDark,
    notificationsEnabled,
    onChevronPress,
    onDarkModeChange,
    onNotificationsChange,
  };

  const preferencesRows: MenuRow[] = [
    {
      id: "notif",
      kind: "toggle",
      label: "Notifications",
      icon: "notifications-outline",
      stateKey: "notifications",
    },
    {
      id: "dark",
      kind: "toggle",
      label: "Dark Mode",
      icon: "moon-outline",
      stateKey: "darkMode",
    },
    {
      id: "currency",
      kind: "chevron",
      label: "Currency",
      icon: "card-outline",
      value: currency,
      settingsSlug: "currency",
    },
  ];

  const accountRows: MenuRow[] = [
    {
      id: "accounts",
      kind: "chevron",
      label: "Manage Accounts",
      icon: "wallet-outline",
      value: String(accountsCount),
      route: "/accounts",
    },
    {
      id: "subscription",
      kind: "chevron",
      label: "Subscription",
      icon: "ribbon-outline",
      value: displayPlan,
      route: "/subscription",
    },
    {
      id: "security",
      kind: "chevron",
      label: "Security",
      icon: "shield-outline",
      settingsSlug: "security",
    },
    {
      id: "export",
      kind: "chevron",
      label: "Export Data",
      icon: "document-text-outline",
      settingsSlug: "export",
    },
  ];

  const supportRows: MenuRow[] = [
    {
      id: "help",
      kind: "chevron",
      label: "Help Center",
      icon: "help-circle-outline",
      settingsSlug: "help",
    },
    {
      id: "share",
      kind: "chevron",
      label: "Share App",
      icon: "share-social-outline",
      settingsSlug: "share",
    },
    {
      id: "settings",
      kind: "chevron",
      label: "App Settings",
      icon: "settings-outline",
      settingsSlug: "settings",
    },
  ];

  return {
    accountSection: { label: "ACCOUNT" as const, rows: accountRows, ...sharedSectionProps },
    preferencesSection: {
      label: "PREFERENCES" as const,
      rows: preferencesRows,
      ...sharedSectionProps,
    },
    supportSection: { label: "SUPPORT" as const, rows: supportRows, ...sharedSectionProps },
  };
}
