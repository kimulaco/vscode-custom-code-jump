import { strictEqual } from 'assert';
import { Hover, MarkdownString } from 'vscode';
import { createMarkdownHover } from './createMarkdownHover';

suite('createMarkdownHover()', () => {
  test('should return Hover instance', () => {
    const message = 'message text';
    const hover = createMarkdownHover(message);

    strictEqual(hover instanceof Hover, true);
    strictEqual(hover.contents[0] instanceof MarkdownString, true);
    strictEqual((hover.contents[0] as MarkdownString).value, message);
  });
});
