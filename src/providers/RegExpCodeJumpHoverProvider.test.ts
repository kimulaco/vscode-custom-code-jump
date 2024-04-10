import { deepStrictEqual } from 'assert';
import { Hover, Position, Uri, window, workspace } from 'vscode';
import type { MarkdownString } from 'vscode';
import { EXTENSION_DISPLAY_NAME, EXTENSION_CONFIG_NAME } from '../configs';
import { RegExpCodeJumpHoverProvider } from './RegExpCodeJumpHoverProvider';
import { getWorkspacePath } from '../utils/getWorkspacePath';
import { createMarkdownHover } from '../utils/createMarkdownHover';
import { toRelPath } from '../utils/toRelPath';

const WORKSPACE_PATH = getWorkspacePath();

const createMatchedExpectedHover = (
  relPaths: string[],
  headerMessage?: string,
): Hover => {
  if (relPaths.length <= 0) {
    throw new Error('required relPaths');
  }

  const header = headerMessage ? `**${headerMessage}**\n\n` : '';

  const messages = relPaths.map((relPath: string) => {
    return `[${relPath}](${WORKSPACE_PATH}/${toRelPath(relPath)})`;
  });

  return createMarkdownHover(`${header}${messages.join('<br>')}`);
};

const createUnmatchedExpectedHover = (
  pattern: string,
  headerMessage?: string,
): Hover => {
  const header = headerMessage ? `**${headerMessage}**\n\n` : '';

  return createMarkdownHover(
    `${header}Files not found by pattern \`${pattern}\``,
  );
};

suite('RegExpCodeJumpHoverProvider.provideHover()', () => {
  type TestCase = {
    title: string;
    filePath: string;
    position: Position;
    expected: Hover | undefined;
    definition: any;
  };

  const config = workspace.getConfiguration(EXTENSION_CONFIG_NAME);
  const output = window.createOutputChannel(EXTENSION_DISPLAY_NAME);

  const TEST_FILE_EXTS = ['ts', 'js'];

  const TEST_CASES: TestCase[] = [
    {
      title: 'should not display jump paths if not matched',
      definition: config.definitions[0],
      filePath: '/src/project/sub/content',
      position: new Position(0, 20),
      expected: undefined,
    },
    {
      title: 'should display multiple jump paths if matched',
      definition: config.definitions[0],
      filePath: '/src/project/sub/content',
      position: new Position(1, 20),
      expected: createMatchedExpectedHover(
        ['/src/project/main/logger.js', '/src/project/main/logger.ts'],
        'namespace-js',
      ),
    },
    {
      title: 'should display a jump path if matched',
      definition: config.definitions[0],
      filePath: '/src/project/sub/content',
      position: new Position(2, 20),
      expected: createMatchedExpectedHover(
        ['/src/project/main/tracking.js'],
        'namespace-js',
      ),
    },
    {
      title: 'should display multiple deep jump paths if matched',
      definition: config.definitions[0],
      filePath: '/src/project/sub/content',
      position: new Position(3, 20),
      expected: createMatchedExpectedHover(
        [
          '/src/project/core/utils/array.js',
          '/src/project/core/utils/array.ts',
        ],
        'namespace-js',
      ),
    },
    {
      title: 'should display not found pattern if not found',
      definition: config.definitions[0],
      filePath: '/src/project/sub/content',
      position: new Position(4, 20),
      expected: createUnmatchedExpectedHover(
        '/src/project/not/found.{ts,js}',
        'namespace-js',
      ),
    },
  ];

  for (const fileExt of TEST_FILE_EXTS) {
    for (const testCase of TEST_CASES) {
      test(`${testCase.title} in *.${fileExt}`, async () => {
        const fileUri = Uri.file(
          `${WORKSPACE_PATH}${testCase.filePath}.${fileExt}`,
        );
        const document = await workspace.openTextDocument(fileUri);

        const hover = await new RegExpCodeJumpHoverProvider({
          config: testCase.definition,
          outputChannel: output,
        }).provideHover(document, testCase.position);

        deepStrictEqual(hover, testCase.expected);

        if (typeof testCase.expected !== 'undefined') {
          deepStrictEqual(hover, testCase.expected);
          deepStrictEqual(
            (hover?.contents[0] as MarkdownString)?.value,
            (testCase.expected?.contents[0] as MarkdownString)?.value,
          );
        }
      });
    }
  }
});
