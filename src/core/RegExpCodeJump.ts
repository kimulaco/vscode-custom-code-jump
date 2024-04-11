import { workspace } from 'vscode';
import type { Position, TextDocument } from 'vscode';
import { toRelPath } from '../utils/toRelPath';

export type RegExpCodeJumpRuleType = 'string' | 'regexp';

export type RegExpCodeJumpRule = {
  type: RegExpCodeJumpRuleType;
  pattern: string;
  replacement: string;
};

export type RegExpCodeJumpConfig = {
  languages: string[];
  pattern: string;
  hoverHeader?: string;
  rules: RegExpCodeJumpRule[];
};

export const CODE_JUMP_RULE_TYPES = {
  STRING: 'string',
  REGEXP: 'regexp',
} as const;

export class RegExpCodeJump {
  private _config: RegExpCodeJumpConfig = {
    languages: [],
    pattern: '',
    rules: [],
  };

  private _regexp: RegExp;

  public constructor(config: RegExpCodeJumpConfig) {
    this._config = { ...this._config, ...config };
    RegExpCodeJump.validateConfig(this._config);
    this._regexp = new RegExp(this._config.pattern, 'g');
  }

  public get config(): RegExpCodeJumpConfig {
    return this._config;
  }

  public get regexp(): RegExp {
    return this._regexp;
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
    let jumpPath = targetCode;

    for (const rule of this._config.rules) {
      const pattern =
        rule.type === CODE_JUMP_RULE_TYPES.REGEXP
          ? new RegExp(rule.pattern, 'g')
          : rule.pattern;

      jumpPath = jumpPath.replace(pattern, rule.replacement);
    }

    return jumpPath;
  }

  public async searchJumpPathsByPattern(
    jumpPathPattern: string,
  ): Promise<string[]> {
    const files = await workspace.findFiles(toRelPath(jumpPathPattern));
    if (files.length <= 0) {
      return [];
    }

    return files.map((file) => file.fsPath).sort();
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

    if (!('pattern' in config) || !config.pattern) {
      throw new Error('require config.pattern');
    }

    if (!('rules' in config) || !config.rules) {
      throw new Error('require config.rules');
    }

    if (!Array.isArray(config.rules)) {
      throw new Error('config.rules must be array');
    }

    for (const rule of config.rules) {
      this.validateConfigRule(rule);
    }

    return true;
  }

  public static validateConfigRule(rule: unknown): rule is RegExpCodeJumpRule {
    if (typeof rule !== 'object' || rule === null) {
      throw new Error('config.rules[] must be object');
    }

    const ruleTypes: string[] = Object.values(CODE_JUMP_RULE_TYPES);

    if (
      !('type' in rule) ||
      !rule.type ||
      typeof rule.type !== 'string' ||
      !ruleTypes.includes(rule.type)
    ) {
      throw new Error(`config.rules[].type must be 'string' or 'regexp'`);
    }

    if (
      !('pattern' in rule) ||
      !rule.pattern ||
      typeof rule.pattern !== 'string'
    ) {
      throw new Error(`config.rules[].pattern must be string type`);
    }

    if (
      !('replacement' in rule) ||
      !rule.replacement ||
      typeof rule.replacement !== 'string'
    ) {
      throw new Error(`config.rules[].replacement must be string type`);
    }

    return true;
  }
}
