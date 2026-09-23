export const downloadUrl = (url: string, filename: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const downloadText = (content: string, filename: string, type = 'text/csv') => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  downloadUrl(url, filename);
  URL.revokeObjectURL(url);
};
