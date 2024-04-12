import { Location, Position, Uri } from 'vscode';
import type {
  Definition,
  OutputChannel,
  ProviderResult,
  TextDocument,
} from 'vscode';
import {
  CustomCodeJump,
  type CustomCodeJumpConfig,
} from '../core/CustomCodeJump';
import { toWorkspacePath } from '../utils/toWorkspacePath';

export type CustomCodeJumpDefinitionProviderConfig = {
  config: CustomCodeJumpConfig;
  outputChannel: OutputChannel;
};

export class CustomCodeJumpDefinitionProvider {
  private _config: CustomCodeJumpConfig = {
    languages: [],
    pattern: '',
    rules: [],
  };

  private _outputChannel: OutputChannel;

  public constructor({
    config,
    outputChannel,
  }: CustomCodeJumpDefinitionProviderConfig) {
    this._config = { ...this._config, ...config };
    this._outputChannel = outputChannel;
  }

  public async provideDefinition(
    document: TextDocument,
    position: Position,
  ): Promise<ProviderResult<Definition>> {
    const customCodeJump = new CustomCodeJump(this._config);

    try {
      const targetCode = await customCodeJump.searchTargetCode(
        document,
        position,
      );
      if (!targetCode) {
        return;
      }

      const jumpPathPattern =
        customCodeJump.getJumpPathPatternByTargetCode(targetCode);
      const jumpPaths =
        await customCodeJump.searchJumpPathsByPattern(jumpPathPattern);

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
