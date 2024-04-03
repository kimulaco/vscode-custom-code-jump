import { workspace } from 'vscode';

export const getWorkspacePath = (): string => {
  return workspace.workspaceFolders?.[0].uri.fsPath ?? '';
};
