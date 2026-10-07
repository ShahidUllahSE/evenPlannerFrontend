// crypto.randomUUID is only available in secure contexts (HTTPS/localhost);
// getRandomValues works everywhere, so the app also runs over plain HTTP.
export const createId = (prefix: string) => {
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  return `${prefix}_${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}`;
};
