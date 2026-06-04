export const SETTINGS_SCREENS: Record<
  string,
  { title: string; description: string }
> = {
  accounts: {
    title: "Manage Accounts",
    description:
      "Connect and manage your bank accounts, credit cards, and wallets. Account linking will be available when you connect SpendWise to your financial institutions.",
  },
  security: {
    title: "Security",
    description:
      "Manage password, two-factor authentication, and biometric login. These features will be enabled with your SpendWise account.",
  },
  export: {
    title: "Export Data",
    description:
      "Export your transactions and reports as CSV or PDF. Data export will be available in a future update.",
  },
  help: {
    title: "Help Center",
    description:
      "Browse FAQs, contact support, and learn how to get the most out of SpendWise.",
  },
  share: {
    title: "Share App",
    description:
      "Invite friends to SpendWise and help them take control of their finances.",
  },
  settings: {
    title: "App Settings",
    description:
      "Configure language, date format, and other app preferences.",
  },
  currency: {
    title: "Currency",
    description:
      "Choose your preferred currency for displaying amounts throughout the app.",
  },
  profile: {
    title: "Edit Profile",
    description:
      "Update your name, email, and profile photo. Profile editing will sync with your SpendWise account when connected.",
  },
  notif: {
    title: "Notifications",
    description:
      "Customize push notifications for budgets, transactions, and insights.",
  },
};
