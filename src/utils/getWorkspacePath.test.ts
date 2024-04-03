import path from 'path';
import { strictEqual } from 'assert';
import { getWorkspacePath } from './getWorkspacePath';

suite('getWorkspacePath()', () => {
  const cwd = process.cwd();
  const fixturePath = 'test/fixture/workspace';

  test('should return workspace fullpath', () => {
    const workspacePath = getWorkspacePath();
    strictEqual(workspacePath, path.resolve(cwd, fixturePath));
  });
});
