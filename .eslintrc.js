// ✅ ESLint config compatible con CI y Next.js
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:eslint-comments/recommended",
    "airbnb",
    "airbnb-typescript",
    "next/core-web-vitals",
    "plugin:prettier/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname, // ✅ ruta absoluta automática
    sourceType: "module",
    ecmaVersion: 2021,
  },
  settings: {
    react: { version: "detect" },
    "import/resolver": { typescript: { alwaysTryTypes: true } },
  },
  rules: {
    quotes: ["error", "double"],
    semi: ["error", "never"],
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["warn"],
    "react/react-in-jsx-scope": "off",
    "react/jsx-filename-extension": ["warn", { extensions: [".tsx"] }],
    "react/require-default-props": "off",
    "react/prop-types": "off",
    "react/function-component-definition": [
      "error",
      { namedComponents: ["function-declaration", "arrow-function"] },
    ],
    "react/jsx-props-no-spreading": [
      "warn",
      {
        exceptions: [
          "input",
          "textarea",
          "select",
          "Form.Control",
          "Form.Check",
          "Form.Select",
          "Form.Switch",
        ],
      },
    ],
    "import/prefer-default-export": "off",
    "import/extensions": [
      "error",
      "ignorePackages",
      { ts: "never", tsx: "never" },
    ],
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: ["**/*.test.tsx", "**/*.spec.ts", "**/setupTests.ts"],
      },
    ],
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/semi": "off",
    "@typescript-eslint/member-delimiter-style": [
      "error",
      {
        multiline: { delimiter: "semi", requireLast: true },
        singleline: { delimiter: "semi", requireLast: false },
      },
    ],
    "prettier/prettier": [
      "error",
      {
        endOfLine: "auto",
        semi: false,
        singleQuote: false,
        printWidth: 100,
        trailingComma: "es5",
        tabWidth: 2,
        useTabs: false,
      },
    ],
    "eslint-comments/no-unused-disable": "error",
  },
};
