import { deepStrictEqual } from 'assert';
import { Location, Position, Uri, window, workspace } from 'vscode';
import { EXTENSION_DISPLAY_NAME, EXTENSION_CONFIG_NAME } from '../configs';
import { RegExpCodeJumpDefinitionProvider } from './RegExpCodeJumpDefinitionProvider';
import { getWorkspacePath } from '../utils/getWorkspacePath';
import { toWorkspacePath } from '../utils/toWorkspacePath';

const WORKSPACE_PATH = getWorkspacePath();

const createLocationByFilePath = (filePath: string): Location => {
  return new Location(Uri.file(toWorkspacePath(filePath)), new Position(0, 0));
};

suite('RegExpCodeJumpDefinitionProvider.provideHover()', () => {
  type TestCase = {
    title: string;
    filePath: string;
    position: Position;
    expected: Location | undefined;
    definition: any;
  };

  const config = workspace.getConfiguration(EXTENSION_CONFIG_NAME);
  const output = window.createOutputChannel(EXTENSION_DISPLAY_NAME);

  const TEST_FILE_EXTS = ['ts', 'js'];

  const TEST_CASES: TestCase[] = [
    {
      title: 'should not define path if not matched',
      definition: config.definitions[0],
      filePath: '/src/project/sub/content',
      position: new Position(0, 20),
      expected: undefined,
    },
    {
      title: 'should define path if matched',
      definition: config.definitions[0],
      filePath: '/src/project/sub/content',
      position: new Position(1, 20),
      expected: createLocationByFilePath('/src/project/main/logger.ts'),
    },
    {
      title: 'should define path if matched',
      definition: config.definitions[0],
      filePath: '/src/project/sub/content',
      position: new Position(2, 20),
      expected: createLocationByFilePath('/src/project/main/tracking.js'),
    },
    {
      title: 'should define deep path if matched',
      definition: config.definitions[0],
      filePath: '/src/project/sub/content',
      position: new Position(3, 20),
      expected: createLocationByFilePath('/src/project/core/utils/array.ts'),
    },
    {
      title: 'should not define if not found',
      definition: config.definitions[0],
      filePath: '/src/project/sub/content',
      position: new Position(4, 20),
      expected: undefined,
    },
  ];

  for (const fileExt of TEST_FILE_EXTS) {
    for (const testCase of TEST_CASES) {
      test(`${testCase.title} in *.${fileExt}`, async () => {
        const fileUri = Uri.file(
          `${WORKSPACE_PATH}${testCase.filePath}.${fileExt}`,
        );
        const document = await workspace.openTextDocument(fileUri);

        const location = await new RegExpCodeJumpDefinitionProvider({
          config: testCase.definition,
          outputChannel: output,
        }).provideDefinition(document, testCase.position);

        deepStrictEqual(location, testCase.expected);
      });
    }
  }
});
