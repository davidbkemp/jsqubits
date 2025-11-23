export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        NodeJS: "readonly"
      }
    },
    plugins: {},
    rules: {}
  }
];

