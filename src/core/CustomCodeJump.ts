import { workspace } from 'vscode';
import type { Position, TextDocument } from 'vscode';
import { getExtByFilePath } from '../utils/getExtByFilePath';
import { toRelPath } from '../utils/toRelPath';

export type CustomCodeJumpRuleType = 'string' | 'regexp';

export type CustomCodeJumpRule = {
  type: CustomCodeJumpRuleType;
  pattern: string;
  replacement: string;
};

export type CustomCodeJumpConfig = {
  languages: string[];
  pattern: string;
  hoverHeader?: string;
  rules: CustomCodeJumpRule[];
};

export const CODE_JUMP_RULE_TYPES = {
  STRING: 'string',
  REGEXP: 'regexp',
} as const;

export class CustomCodeJump {
  private _config: CustomCodeJumpConfig = {
    languages: [],
    pattern: '',
    rules: [],
  };

  private _regexp: RegExp;

  public constructor(config: CustomCodeJumpConfig) {
    this._config = { ...this._config, ...config };
    CustomCodeJump.validateConfig(this._config);
    this._regexp = new RegExp(this._config.pattern, 'g');
  }

  public get config(): CustomCodeJumpConfig {
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
      if (rule.type === CODE_JUMP_RULE_TYPES.REGEXP) {
        jumpPath = jumpPath.replace(
          new RegExp(rule.pattern, 'g'),
          rule.replacement,
        );
        continue;
      }

      if (rule.type === CODE_JUMP_RULE_TYPES.STRING) {
        jumpPath = jumpPath.replaceAll(rule.pattern, rule.replacement);
      }
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

    return this._sortFilePathsByPattern(
      files.map((file) => file.fsPath),
      jumpPathPattern,
    );
  }

  private _sortFilePathsByPattern(files: string[], pattern: string): string[] {
    if (files.length <= 0 || !pattern) {
      return files.sort();
    }

    const matches = pattern.match(/\.\{([^}]+)\}/);
    if (!matches || matches.length <= 1) {
      return files.sort();
    }

    const exts = matches[1].split(',').map((ext) => ext.trim());
    const extOrders: Record<string, number> = {};
    for (const ext of exts) {
      extOrders[ext] = exts.indexOf(ext);
    }

    return files.sort((a: string, b: string) => {
      const extA = getExtByFilePath(a);
      const extB = getExtByFilePath(b);

      if (extOrders[extA] < extOrders[extB]) return -1;
      if (extOrders[extA] > extOrders[extB]) return 1;

      return a.localeCompare(b);
    });
  }

  public static validateConfig(
    config: unknown,
  ): config is CustomCodeJumpConfig {
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

  public static validateConfigRule(rule: unknown): rule is CustomCodeJumpRule {
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
