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
    targetRegexp: '',
    jumpPathFormat: '',
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
    try {
      const jumpPaths = await this._searchJumpPathsByDocument(
        document,
        position,
      );
      if (jumpPaths.length <= 0) {
        return;
      }

      const message = this._createMessageByJumpPaths(jumpPaths);
      return createMarkdownHover(message);
    } catch (error) {
      if (error instanceof Error) {
        this._outputChannel.appendLine(`Error: ${error.message}`);
      }
      return;
    }
  }

  private async _searchJumpPathsByDocument(
    document: TextDocument,
    position: Position,
  ): Promise<string[]> {
    const regExpCodeJump = new RegExpCodeJump(this._config);

    const targetCode = await regExpCodeJump.searchTargetCode(
      document,
      position,
    );
    if (!targetCode) {
      return [];
    }
    const jumpPathPattern =
      regExpCodeJump.getJumpPathPatternByTargetCode(targetCode);
    const jumpPaths =
      await regExpCodeJump.searchJumpPathsByPattern(jumpPathPattern);

    return jumpPaths;
  }

  private _createMessageByJumpPaths(jumpPaths: string[]): string {
    let message = '';

    for (const jumpPath of jumpPaths) {
      message += `[/${toRelPath(jumpPath)}](${jumpPath})<br>`;
    }

    return message;
  }
}
