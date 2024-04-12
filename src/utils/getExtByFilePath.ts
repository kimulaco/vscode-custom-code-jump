export const getExtByFilePath = (filePath: string): string => {
  const filePathArr = filePath.split('/');
  const fileName = filePathArr[filePathArr.length - 1];

  if (!fileName.includes('.')) {
    return '';
  }

  return fileName.replace(/.*\.(.+?)$/, '$1');
};
