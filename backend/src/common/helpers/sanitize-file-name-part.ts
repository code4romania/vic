export const sanitizeFileNamePart = (value: string): string => {
  const sanitized = value
    // Control characters are intentionally included in the unsafe filename characters.
    // eslint-disable-next-line no-control-regex
    .replace(/[/\\:*?"<>|\u0000-\u001f\u007f]/g, '-')
    .trim();

  return !sanitized || /^[.-]+$/.test(sanitized) ? 'document' : sanitized;
};
