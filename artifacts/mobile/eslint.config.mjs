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
    },
  },
  {
    ignores: [
      "node_modules/",
      "dist/",
      "dist-web/",
      "dist-native/",
      "static-build/",
      ".expo/",
      "babel.config.js",
      "metro.config.js",
      "scripts/",
      "server/",
      "eslint.config.js",
      "**/*.js",
    ],
  },
);
