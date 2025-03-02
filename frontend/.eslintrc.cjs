const { a } = require("@react-spring/three");

module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs", "src"],
  parserOptions: { ecmaVersion: latests, sourceType: "module" },
  plugins: ["react-refresh"],
  settings: { react: { version: "18.2.0" } },
  rules: {
    "react-refresh/only-export-component": [
      "warn",
      { allowConstantExport: true },
    ],
  },
};
