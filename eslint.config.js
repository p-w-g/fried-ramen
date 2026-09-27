import pluginVue from 'eslint-plugin-vue';
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from '@vue/eslint-config-typescript';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';

export default defineConfigWithVueTs(
  {
    ignores: [
      'dist/**',
      'dev-dist/**',
      'test-results/**',
      'playwright-report/**',
    ],
  },
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommendedTypeChecked,
  skipFormatting,
  {
    // Postings are the fixed past: see src/postings.ts.
    files: ['src/**/*.{ts,vue}'],
    ignores: ['src/postings.ts', 'src/backup.ts', 'src/**/*.test.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.property.name=/^(add|bulkAdd|put|bulkPut|update|bulkUpdate|modify|delete|bulkDelete|clear)$/] MemberExpression[property.name='postings']",
          message:
            'Postings are never edited: write them through src/postings.ts.',
        },
      ],
    },
  },
);
