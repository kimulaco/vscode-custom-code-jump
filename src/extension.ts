import { window, workspace, languages } from 'vscode';
import type {
  ExtensionContext,
  DefinitionProvider,
  HoverProvider,
} from 'vscode';
import { EXTENSION_DISPLAY_NAME, EXTENSION_CONFIG_NAME } from './configs';
import { RegExpCodeJumpDefinitionProvider } from './providers/RegExpCodeJumpDefinitionProvider';
import { RegExpCodeJumpHoverProvider } from './providers/RegExpCodeJumpHoverProvider';
import { RegExpCodeJump } from './core/RegExpCodeJump';

export const activate = (context: ExtensionContext) => {
  const output = window.createOutputChannel(EXTENSION_DISPLAY_NAME);
  const config = workspace.getConfiguration(EXTENSION_CONFIG_NAME);
  console.log(config);

  for (const definition of config.definitions) {
    try {
      if (!RegExpCodeJump.validateConfig(definition)) {
        continue;
      }
    } catch (error) {
      if (error instanceof Error) {
        output.appendLine(error.message);
      }
      continue;
    }

    context.subscriptions.push(
      languages.registerDefinitionProvider(
        definition.languages,
        new RegExpCodeJumpDefinitionProvider({
          config: definition,
          outputChannel: output,
        }) as DefinitionProvider,
      ),
    );

    context.subscriptions.push(
      languages.registerHoverProvider(
        definition.languages,
        new RegExpCodeJumpHoverProvider({
          config: definition,
          outputChannel: output,
        }) as HoverProvider,
      ),
    );
  }
};

export const deactivate = () => {};
