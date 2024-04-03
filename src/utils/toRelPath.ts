import { getWorkspacePath } from './getWorkspacePath';

export const toRelPath = (value: string): string => {
  const workspacePath = getWorkspacePath();

  if (value.startsWith(workspacePath)) {
    return value.replace(`${workspacePath}/`, '');
  }

  return value.replace(/^\//, '');
};
