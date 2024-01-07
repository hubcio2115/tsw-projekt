/** @type {import("eslint").Linter.Config} */
module.exports = {
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
  },
  plugins: ["@typescript-eslint"],
  env: {
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/strict",
    "plugin:vue/vue3-recommended",
    "plugin:prettier/recommended",
  ],
  rules: {},
  overrides: [
    {
      files: ["*.ts", "*.tsx", "*.mts", "*.cts", "*.vue"],
      rules: {
        // The core 'no-unused-vars' rules (in the eslint:recommended ruleset)
        // does not work with type definitions.
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": [
          "warn",
          { argsIgnorePattern: "^_" },
        ],
      },
    },
    {
      files: [
        // These pages are not used directly by users so they can have one-word names.
        "**/pages/**/*.{js,ts,jsx,tsx,vue}",
        "**/layouts/**/*.{js,ts,jsx,tsx,vue}",
        "**/app.{js,ts,jsx,tsx,vue}",
        "**/error.{js,ts,jsx,tsx,vue}",
        // These files should have multiple words in their names as they are within subdirectories.
        "**/components/*/**/*.{js,ts,jsx,tsx,vue}",
      ],
      rules: { "vue/multi-word-component-names": "off" },
    },
    {
      // Pages and layouts are required to have a single root element if transitions are enabled.
      files: [
        "**/pages/**/*.{js,ts,jsx,tsx,vue}",
        "**/layouts/**/*.{js,ts,jsx,tsx,vue}",
      ],
      rules: { "vue/no-multiple-template-root": "error" },
    },
  ],
  ignorePatterns: ["node_modules"],
};
