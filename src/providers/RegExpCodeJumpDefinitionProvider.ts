import { Location, Position, Uri } from 'vscode';
import type {
  Definition,
  OutputChannel,
  ProviderResult,
  TextDocument,
} from 'vscode';
import {
  RegExpCodeJump,
  type RegExpCodeJumpConfig,
} from '../core/RegExpCodeJump';
import { toWorkspacePath } from '../utils/toWorkspacePath';

export type RegExpCodeJumpDefinitionProviderConfig = {
  config: RegExpCodeJumpConfig;
  outputChannel: OutputChannel;
};

export class RegExpCodeJumpDefinitionProvider {
  private _config: RegExpCodeJumpConfig = {
    languages: [],
    pattern: '',
    rules: [],
  };

  private _outputChannel: OutputChannel;

  public constructor({
    config,
    outputChannel,
  }: RegExpCodeJumpDefinitionProviderConfig) {
    this._config = { ...this._config, ...config };
    this._outputChannel = outputChannel;
  }

  public async provideDefinition(
    document: TextDocument,
    position: Position,
  ): Promise<ProviderResult<Definition>> {
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
        return;
      }

      return this._createLocationByFilePath(jumpPaths[0]);
    } catch (error) {
      if (error instanceof Error) {
        this._outputChannel.appendLine(`Error: ${error.message}`);
      }
      return;
    }
  }

  private _createLocationByFilePath(filePath: string): Location {
    return new Location(
      Uri.file(toWorkspacePath(filePath)),
      new Position(0, 0),
    );
  }
}
