module.exports = {
  parser: "@babel/eslint-parser",
  parserOptions: {
    sourceType: "module",
    allowImportExportEverywhere: false,
    ecmaFeatures: {
      "jsx": true
    },
    babelOptions: {
      configFile: "path/to/config.js",
    },
  },
}
