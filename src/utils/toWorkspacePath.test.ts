import path from 'path';
import { strictEqual } from 'assert';
import { toWorkspacePath } from './toWorkspacePath';

suite('toWorkspacePath()', () => {
  const cwd = process.cwd();
  const fixturePath = 'test/fixture/workspace';

  test('should convert to workspace path from relative path', () => {
    const expected = path.resolve(
      cwd,
      fixturePath,
      'scripts/project/sub/content.js',
    );

    strictEqual(toWorkspacePath('scripts/project/sub/content.js'), expected);
    strictEqual(toWorkspacePath('/scripts/project/sub/content.js'), expected);
  });

  test('should return arg as is if workspace path', () => {
    const workspacePath = path.resolve(
      cwd,
      fixturePath,
      'scripts/project/sub/content.js',
    );

    strictEqual(toWorkspacePath(workspacePath), workspacePath);
    strictEqual(toWorkspacePath(workspacePath), workspacePath);
  });
});
