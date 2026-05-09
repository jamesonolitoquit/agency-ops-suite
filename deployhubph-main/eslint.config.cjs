const js = require('@eslint/js');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const reactPlugin = require('eslint-plugin-react');
const nextPlugin = require('@next/eslint-plugin-next');

// Shared browser globals
const browserGlobals = {
  window: 'readonly',
  document: 'readonly',
  fetch: 'readonly',
  URL: 'readonly',
  URLSearchParams: 'readonly',
  AbortSignal: 'readonly',
  HTMLElement: 'readonly',
  HTMLInputElement: 'readonly',
  HTMLFormElement: 'readonly',
  HTMLTextAreaElement: 'readonly',
  HTMLSelectElement: 'readonly',
  navigator: 'readonly'
};

// Shared Node globals
const nodeGlobals = {
  process: 'readonly',
  global: 'readonly',
  Buffer: 'readonly',
  __dirname: 'readonly',
  __filename: 'readonly',
  module: 'readonly',
  require: 'readonly'
};

// Shared console and globals
const commonGlobals = {
  console: 'readonly'
};

module.exports = [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '.vercel/**'
    ]
  },
  // CommonJS/Node files
  {
    files: ['**/*.{cjs,mjs}', 'postcss.config.js', 'next.config.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...commonGlobals,
        ...nodeGlobals
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-undef': 'off'
    }
  },
  // Client-side JS/JSX (including app directory route handlers)
  {
    files: ['**/*.{js,jsx}', '!**/*.config.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...commonGlobals,
        ...nodeGlobals,
        ...browserGlobals
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-undef': 'off'
    }
  },
  // TypeScript files (including .tsx in app directory)
  {
    files: ['**/*.{ts,tsx}', '!eslint.config.cjs'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        project: null
      },
      globals: {
        ...commonGlobals,
        ...nodeGlobals,
        ...browserGlobals,
        React: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      ...js.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' }
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-undef': 'off'
    }
  },
  // React/JSX specific
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      react: reactPlugin,
      '@next/next': nextPlugin
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      '@next/next/no-html-link-for-pages': 'warn'
    }
  }
];
