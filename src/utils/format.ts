export const formatDate = (value: string): string =>
  new Date(value.length === 10 ? `${value}T00:00:00` : value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

export const formatTime = (hhmm: string): string => {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${suffix}`;
};

export const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

export const formatNumber = (n: number): string => n.toLocaleString('en-US');

export const initials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');

export const daysUntil = (date: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${date}T00:00:00`);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
};
