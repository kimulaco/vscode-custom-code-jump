import { strictEqual } from 'assert';
import { getExtByFilePath } from './getExtByFilePath';

suite('getExtByFilePath()', () => {
  test('should return ext by file path', () => {
    strictEqual(getExtByFilePath('/path/filename.ts'), 'ts');
    strictEqual(getExtByFilePath('/path/filename.test.js'), 'js');
    strictEqual(getExtByFilePath('.config/filename.json'), 'json');
  });

  test('should not return ext if file path not include ext', () => {
    strictEqual(getExtByFilePath('path/filename'), '');
  });
});
