import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
  files: 'dist/**/*.test.js',
  srcDir: 'src',
  workspaceFolder: './test/fixture/workspace',
  coverage: {
    includeAll: true,
  },
});
