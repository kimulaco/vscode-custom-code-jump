import { getWorkspacePath } from './getWorkspacePath';
import { toRelPath } from './toRelPath';

export const toFullPath = (value: string): string => {
  const workspacePath = getWorkspacePath();

  if (value.startsWith(workspacePath)) {
    return value;
  }

  return `${workspacePath}/${toRelPath(value)}`;
};
