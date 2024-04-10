import type {
  Hover,
  OutputChannel,
  Position,
  ProviderResult,
  TextDocument,
} from 'vscode';
import {
  RegExpCodeJump,
  type RegExpCodeJumpConfig,
} from '../core/RegExpCodeJump';
import { toRelPath } from '../utils/toRelPath';
import { createMarkdownHover } from '../utils/createMarkdownHover';

export type RegExpCodeJumpHoverProviderConfig = {
  config: RegExpCodeJumpConfig;
  outputChannel: OutputChannel;
};

export class RegExpCodeJumpHoverProvider {
  private _config: RegExpCodeJumpConfig = {
    languages: [],
    pattern: '',
    rules: [],
  };

  private _outputChannel: OutputChannel;

  public constructor({
    config,
    outputChannel,
  }: RegExpCodeJumpHoverProviderConfig) {
    this._config = { ...this._config, ...config };
    this._outputChannel = outputChannel;
  }

  public async provideHover(
    document: TextDocument,
    position: Position,
  ): Promise<ProviderResult<Hover>> {
    const regExpCodeJump = new RegExpCodeJump(this._config);

    try {
      const targetCode = await regExpCodeJump.searchTargetCode(
        document,
        position,
      );
      if (!targetCode) {
        return;
      }

      const jumpPathPattern =
        regExpCodeJump.getJumpPathPatternByTargetCode(targetCode);
      const jumpPaths =
        await regExpCodeJump.searchJumpPathsByPattern(jumpPathPattern);

      if (jumpPaths.length <= 0) {
        const message = this._createUnmatchedMessageByPattern(jumpPathPattern);
        return createMarkdownHover(message);
      }

      const message = this._createMatchedMessageByJumpPaths(jumpPaths);
      return createMarkdownHover(message);
    } catch (error) {
      if (error instanceof Error) {
        this._outputChannel.appendLine(`Error: ${error.message}`);
      }
      return;
    }
  }

  private _createUnmatchedMessageByPattern(pattern: string): string {
    const header = this._createHeaderMessage();
    return `${header}Files not found by pattern \`${pattern}\``;
  }

  private _createMatchedMessageByJumpPaths(jumpPaths: string[]): string {
    const header = this._createHeaderMessage();
    const messages = jumpPaths.map((jumpPath: string) => {
      return `[/${toRelPath(jumpPath)}](${jumpPath})`;
    });
    return `${header}${messages.join('<br>')}`;
  }

  private _createHeaderMessage(): string {
    return this._config.hoverHeader
      ? `**${this._config.hoverHeader}**\n\n`
      : '';
  }
}
