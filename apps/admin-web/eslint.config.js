import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist", "playwright-report", "test-results"],
  },
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}", "vite.config.ts"],
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
);
