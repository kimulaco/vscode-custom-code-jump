import { workspace } from 'vscode';
import type { Position, TextDocument } from 'vscode';
import { toRelPath } from '../utils/toRelPath';

export type RegExpCodeJumpConfig = {
  languages: string[];
  targetRegexp: string;
  jumpPathFormat: string;
};

export class RegExpCodeJump {
  private _config: RegExpCodeJumpConfig = {
    languages: [],
    targetRegexp: '',
    jumpPathFormat: '',
  };

  private _regexp: RegExp;

  public constructor(config: RegExpCodeJumpConfig) {
    this._config = { ...this._config, ...config };
    RegExpCodeJump.validateConfig(this._config);
    this._regexp = new RegExp(this._config.targetRegexp, 'g');
  }

  public async searchTargetCode(
    document: TextDocument,
    position: Position,
  ): Promise<string> {
    const range = document.getWordRangeAtPosition(position, this._regexp);
    if (!range) {
      return '';
    }

    const text = document.getText(range);
    if (!this._regexp.test(text)) {
      return '';
    }

    return text;
  }

  public getJumpPathPatternByTargetCode(targetCode: string): string {
    return targetCode.replace(this._regexp, this._config.jumpPathFormat);
  }

  public async searchJumpPathsByPattern(
    jumpPathPattern: string,
  ): Promise<string[]> {
    const files = await workspace.findFiles(toRelPath(jumpPathPattern));
    if (files.length <= 0) {
      throw new Error(`${jumpPathPattern} not found`);
    }

    return files.map((file) => file.fsPath);
  }

  public static validateConfig(
    config: unknown,
  ): config is RegExpCodeJumpConfig {
    if (typeof config !== 'object' || config === null) {
      throw new Error('config must be an object');
    }

    if (
      !('languages' in config) ||
      !Array.isArray(config.languages) ||
      config.languages.length <= 0
    ) {
      throw new Error('require config.languages');
    }

    if (!('targetRegexp' in config) || !config.targetRegexp) {
      throw new Error('require config.targetRegexp');
    }

    if (!('jumpPathFormat' in config) || !config.jumpPathFormat) {
      throw new Error('require config.jumpPathFormat');
    }

    return true;
  }
}
