import { deepStrictEqual, throws } from 'assert';
import { Position, workspace, Uri } from 'vscode';
import { RegExpCodeJump } from './RegExpCodeJump';
import type {
  RegExpCodeJumpConfig,
  RegExpCodeJumpRule,
} from './RegExpCodeJump';
import { getWorkspacePath } from '../utils/getWorkspacePath';
import { toWorkspacePath } from '../utils/toWorkspacePath';

suite('RegExpCodeJump.constructor()', () => {
  type TestCase = {
    title: string;
    config: RegExpCodeJumpConfig;
    expected: { config: RegExpCodeJumpConfig; regexp: RegExp } | Error;
  };

  const TEST_CASES: TestCase[] = [
    {
      title: 'should throw errror if config is empty',
      config: {} as RegExpCodeJumpConfig,
      expected: new Error('require config.languages'),
    },
    {
      title: 'should throw errror if config.languages is empty',
      config: {
        languages: [],
        pattern: '\\.\\*',
        rules: [
          {
            type: 'string',
            pattern: '.',
            replacement: '/',
          },
        ],
      },
      expected: new Error('require config.languages'),
    },
    {
      title: 'should throw errror if config.pattern is empty',
      config: {
        languages: ['javascript'],
        pattern: '',
        rules: [
          {
            type: 'string',
            pattern: '.',
            replacement: '/',
          },
        ],
      },
      expected: new Error('require config.pattern'),
    },
    {
      title: 'should throw errror if config.rules is empty',
      config: {
        languages: ['javascript'],
        pattern: '\\.\\*',
        rules: undefined as unknown as RegExpCodeJumpRule[],
      },
      expected: new Error('require config.rules'),
    },
    {
      title: 'should throw errror if config.rules is not array',
      config: {
        languages: ['javascript'],
        pattern: '\\.\\*',
        rules: {} as unknown as RegExpCodeJumpRule[],
      },
      expected: new Error('config.rules must be array'),
    },
    {
      title: 'should throw errror if config.rules[] is not object',
      config: {
        languages: ['javascript'],
        pattern: '\\.\\*',
        rules: ['$1'] as unknown as RegExpCodeJumpRule[],
      },
      expected: new Error('config.rules[] must be object'),
    },
    {
      title: 'should throw errror if config.rules[] is null',
      config: {
        languages: ['javascript'],
        pattern: '\\.\\*',
        rules: [null] as unknown as RegExpCodeJumpRule[],
      },
      expected: new Error('config.rules[] must be object'),
    },
    {
      title: 'should throw errror if config.rules[].type is invalid',
      config: {
        languages: ['javascript'],
        pattern: '\\.\\*',
        rules: [
          { type: 'glob', pattern: '*', replacement: '-' },
        ] as unknown as RegExpCodeJumpRule[],
      },
      expected: new Error(`config.rules[].type must be 'string' or 'regexp'`),
    },
    {
      title: 'should throw errror if config.rules[].pattern is not string',
      config: {
        languages: ['javascript'],
        pattern: '\\.\\*',
        rules: [
          {
            type: 'string',
            pattern: /\./,
            replacement: '/',
          },
        ] as unknown as RegExpCodeJumpRule[],
      },
      expected: new Error('config.rules[].pattern must be string type'),
    },
    {
      title: 'should throw errror if config.rules[].replacement is not string',
      config: {
        languages: ['javascript'],
        pattern: '\\.\\*',
        rules: [
          {
            type: 'string',
            pattern: '.',
            replacement: 1,
          },
        ] as unknown as RegExpCodeJumpRule[],
      },
      expected: new Error('config.rules[].replacement must be string type'),
    },
    {
      title: 'should initialize private properties',
      config: {
        languages: ['javascript'],
        pattern: '\\.\\*',
        rules: [
          {
            type: 'string',
            pattern: '.',
            replacement: '/',
          },
        ],
      },
      expected: {
        config: {
          languages: ['javascript'],
          pattern: '\\.\\*',
          rules: [
            {
              type: 'string',
              pattern: '.',
              replacement: '/',
            },
          ],
        },
        regexp: new RegExp('\\.\\*', 'g'),
      },
    },
  ];

  for (const testCase of TEST_CASES) {
    test(testCase.title, () => {
      if (testCase.expected instanceof Error) {
        throws(
          () => {
            new RegExpCodeJump(testCase.config);
          },
          testCase.expected,
          testCase.expected,
        );
      } else {
        const instance = new RegExpCodeJump(testCase.config);
        deepStrictEqual(instance.config, testCase.expected.config);
        deepStrictEqual(instance.regexp, testCase.expected.regexp);
      }
    });
  }
});

suite('RegExpCodeJump.searchTargetCode()', () => {
  type TestCase = {
    title: string;
    filePath: string;
    config: RegExpCodeJumpConfig;
    position: Position;
    expected: string;
  };

  const TEST_CASES: TestCase[] = [
    {
      title: 'should return target code by matched position',
      filePath: '/src/project/sub/content.ts',
      config: {
        languages: ['javascript'],
        pattern: `\\.use\\('jp\\.co\\.project\\.(.*?)\\.(.*?)'\\)`,
        rules: [
          {
            type: 'string',
            pattern: '.',
            replacement: '/',
          },
        ],
      },
      position: new Position(1, 20),
      expected: `.use('jp.co.project.main.logger')`,
    },
    {
      title: 'should return empty string by unmatched position',
      filePath: '/src/project/sub/content.js',
      config: {
        languages: ['javascript'],
        pattern: `\\.use\\('jp\\.co\\.project\\.(.*?)\\.(.*?)'\\)`,
        rules: [
          {
            type: 'string',
            pattern: '.',
            replacement: '/',
          },
        ],
      },
      position: new Position(0, 20),
      expected: '',
    },
  ];

  for (const testCase of TEST_CASES) {
    test(testCase.title, async () => {
      const fileUri = Uri.file(toWorkspacePath(testCase.filePath));
      const document = await workspace.openTextDocument(fileUri);
      const instance = new RegExpCodeJump(testCase.config);
      const paths = await instance.searchTargetCode(
        document,
        testCase.position,
      );
      deepStrictEqual(paths, testCase.expected);
    });
  }
});

suite('RegExpCodeJump.searchJumpPathsByPattern()', () => {
  type TestCase = {
    title: string;
    config: RegExpCodeJumpConfig;
    pattern: string;
    expected: string[];
  };

  const TEST_CASES: TestCase[] = [
    {
      title: 'should return searched file paths by file path pattern',
      config: {
        languages: ['javascript'],
        pattern: '\\.\\*',
        rules: [
          {
            type: 'string',
            pattern: '.',
            replacement: '/',
          },
        ],
      },
      pattern: '/src/project/core/utils/array.{js,ts}',
      expected: [
        toWorkspacePath('/src/project/core/utils/array.js'),
        toWorkspacePath('/src/project/core/utils/array.ts'),
      ],
    },
    {
      title: 'should return empty array by nothing file path pattern',
      config: {
        languages: ['javascript'],
        pattern: '\\.\\*',
        rules: [
          {
            type: 'string',
            pattern: '.',
            replacement: '/',
          },
        ],
      },
      pattern: '/src/project/not/found.{js,ts}',
      expected: [],
    },
  ];

  for (const testCase of TEST_CASES) {
    test(testCase.title, async () => {
      const instance = new RegExpCodeJump(testCase.config);
      const paths = await instance.searchJumpPathsByPattern(testCase.pattern);
      deepStrictEqual(paths, testCase.expected);
    });
  }
});

suite('RegExpCodeJump.getJumpPathPatternByTargetCode()', () => {
  type TestCase = {
    title: string;
    config: RegExpCodeJumpConfig;
    targetCode: string;
    expected: string;
  };

  const TEST_CASES: TestCase[] = [
    {
      title: 'should return replaced string by string type config.rules',
      config: {
        languages: ['javascript'],
        pattern: '\\.\\*',
        rules: [
          {
            type: 'string',
            pattern: '4',
            replacement: '-',
          },
          {
            type: 'string',
            pattern: '8',
            replacement: '_',
          },
        ],
      },
      targetCode: 'path/123456789',
      expected: 'path/123-567_9',
    },
    {
      title: 'should return replaced string by regexp type config.rules',
      config: {
        languages: ['javascript'],
        pattern: '\\.\\*',
        rules: [
          {
            type: 'regexp',
            pattern: '123',
            replacement: '-',
          },
          {
            type: 'regexp',
            pattern: '^path\\/(.+?)4(.+?)7(.+?)9',
            replacement: 'path/$2/$3/-456789',
          },
        ],
      },
      targetCode: 'path/123456789',
      expected: 'path/56/8/-456789',
    },
  ];

  for (const testCase of TEST_CASES) {
    test(testCase.title, () => {
      const instance = new RegExpCodeJump(testCase.config);
      deepStrictEqual(
        instance.getJumpPathPatternByTargetCode(testCase.targetCode),
        testCase.expected,
      );
    });
  }
});
