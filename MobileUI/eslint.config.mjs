import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "off",
      "eqeqeq": ["error", "always"],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-implicit-coercion": "error",
    },
  },
  {
    files: ["features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react-native-safe-area-context",
              importNames: ["useSafeAreaInsets"],
              message:
                "Use useScreenInsets from @/hooks/useScreenInsets in feature screens.",
            },
          ],
        },
      ],
    },
  },
  {
    ignores: [
      "node_modules/",
      "e2e/",
      "dist/",
      "dist-native/",
      "static-build/",
      ".expo/",
      "babel.config.js",
      "metro.config.js",
      "eslint.config.js",
      "**/*.js",
    ],
  },
);
