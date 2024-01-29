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
    "plugin:@typescript-eslint/strict",
    "plugin:vue/vue3-recommended",
    "plugin:prettier/recommended",
  ],
  rules: {},
  overrides: [
    {
      files: ["*.js", ".jsx", "*.ts", "*.tsx", "*.mts", "*.cts", "*.vue"],
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
  ],
  ignorePatterns: ["node_modules"],
};
