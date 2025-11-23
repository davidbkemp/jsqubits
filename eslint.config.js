import mocha from "eslint-plugin-mocha";

export default [
  {
    files: ["lib/**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        NodeJS: "readonly"
      }
    },
    rules: {}
  },
  {
    files: ["spec/**/*.spec.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module"
    },
    plugins: { mocha },
    rules: {
      ...mocha.configs["recommended"].rules
    }
  }
];
