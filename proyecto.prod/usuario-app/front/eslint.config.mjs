// eslint.config.mjs (ESLint v9 - Flat Config, ESM)
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint'; // meta pkg: parser + plugin + configs
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactNative from 'eslint-plugin-react-native';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  { ignores: ['node_modules/', 'dist/', 'build/', '.expo/', 'coverage/'] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx,js,jsx}'],

    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        // project: './tsconfig.json', // (activar cuando quieras reglas type-aware)
      },
      globals: { ...globals.browser, ...globals.node },
    },

    plugins: {
      '@typescript-eslint': tseslint.plugin,
      react: reactPlugin,
      'react-hooks': reactHooks,
      'react-native': reactNative,
      import: importPlugin,
      prettier: prettierPlugin,
    },

    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        typescript: { project: './tsconfig.json' },
        node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
      },
    },

    rules: {
      'prettier/prettier': 'error',
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-native/no-unused-styles': 'warn',
      'react-native/split-platform-components': 'warn',
      'react-native/no-single-element-style-arrays': 'warn',
    },
  },

  // Archivos CommonJS (configuraciones como babel/metro/jest)
  {
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        module: 'readonly',   // evita "no-undef" en module.exports
        require: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        exports: 'readonly',
      },
    },
  }

];
