module.exports = {
  env: {
    browser: true,
    es6: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
    "plugin:react/recommended"
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    "one-var": 0,
    "one-var-declaration-per-line": ["error", "initializations"],
    "no-param-reassign": 0,
    "import/prefer-default-export": 0,
    "import/no-self-import": 0,
    "react/react-in-jsx-scope": 0,
  },
};
