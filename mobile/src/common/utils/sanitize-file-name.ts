export const sanitizeFileName = (fileName: string): string => {
  const sanitized = fileName
    // Control characters are intentionally included in the unsafe filename characters.
    // eslint-disable-next-line no-control-regex
    .replace(/[/\\:*?"<>|\u0000-\u001f\u007f]/g, '-')
    .trim();

  return !sanitized || /^[.-]+$/.test(sanitized) ? 'document.pdf' : sanitized;
};
