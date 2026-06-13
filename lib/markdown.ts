export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';

  // 1. Extract and preserve valid HTML tags
  const validTags: string[] = [];
  const tagRegex = /<\/?(p|br|strong|em|b|i|h1|h2|h3|h4|h5|h6|ul|ol|li|a|img|table|thead|tbody|tr|th|td|div|span|blockquote|hr)(?:\s+[a-zA-Z0-9_-]+(?:=(?:"[^"]*"|'[^']*'|[^>\s]+))?)*\s*\/?>/gi;
  
  let html = markdown.replace(tagRegex, (match) => {
    validTags.push(match);
    return `___HTML_TAG_${validTags.length - 1}___`;
  });

  // 2. Escape any remaining XML/HTML sensitive characters
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 3. Restore the valid HTML tags
  html = html.replace(/___HTML_TAG_(\d+)___/g, (match, index) => {
    return validTags[parseInt(index, 10)];
  });

  // 4. Convert Markdown formatting
  // Headers (only if not inside tag)
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');

  // Horizontal Rule
  html = html.replace(/^[-\*_]{3,}\s*$/gim, '<hr/>');

  // 5. Paragraph splitting
  const blocks = html.split(/\r?\n\r?\n/);
  const processedBlocks = blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';

    // If it starts with standard block-level tag, do not wrap in <p>
    if (
      trimmed.startsWith('<h1') ||
      trimmed.startsWith('<h2') ||
      trimmed.startsWith('<h3') ||
      trimmed.startsWith('<hr') ||
      trimmed.startsWith('<div') ||
      trimmed.startsWith('<table') ||
      trimmed.startsWith('<ul') ||
      trimmed.startsWith('<ol') ||
      trimmed.startsWith('<p')
    ) {
      return trimmed;
    }

    const content = trimmed.replace(/\r?\n/g, '<br/>');
    return `<p>${content}</p>`;
  });

  return processedBlocks.filter(Boolean).join('\n');
}
