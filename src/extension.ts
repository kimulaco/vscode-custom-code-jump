import { window, languages } from 'vscode';
import type {
  ExtensionContext,
  DefinitionProvider,
  HoverProvider,
} from 'vscode';
import { EXTENSION_DISPLAY_NAME } from './configs';

export const activate = (context: ExtensionContext) => {
  const output = window.createOutputChannel(EXTENSION_DISPLAY_NAME);

  context.subscriptions.push(
    languages.registerDefinitionProvider([], {} as DefinitionProvider),
  );

  context.subscriptions.push(
    languages.registerHoverProvider([], {} as HoverProvider),
  );
};

export const deactivate = () => {};
