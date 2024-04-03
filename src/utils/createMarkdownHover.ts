import { Hover, MarkdownString } from 'vscode';

export const createMarkdownHover = (value: string): Hover => {
  const markdown = new MarkdownString();
  markdown.isTrusted = true;
  markdown.supportHtml = true;
  markdown.appendMarkdown(value);

  return new Hover(markdown);
};
