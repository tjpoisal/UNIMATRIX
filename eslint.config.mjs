import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default defineConfig([
  globalIgnores(["dist", "build", ".next", ".turbo", "node_modules"]),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.recommended,
  reactHooks.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },
]);
