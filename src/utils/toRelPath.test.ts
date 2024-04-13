import path from 'path';
import { strictEqual } from 'assert';
import { toRelPath } from './toRelPath';

suite('toRelPath()', () => {
  const cwd = process.cwd();
  const fixturePath = 'test/fixture/workspace';

  test('should convert to relative path from workspace path', () => {
    const relativePath = 'scripts/project/sub/content.js';
    const workspacePath = path.resolve(cwd, fixturePath, relativePath);

    strictEqual(toRelPath(workspacePath), relativePath);
  });

  test('should returns path without start slash if relative path', () => {
    const relPath = 'scripts/project/sub/content.js';

    strictEqual(toRelPath(relPath), relPath);
    strictEqual(toRelPath(`/${relPath}`), relPath);
  });
});
