export const theme = {
  colors: {
    primary: '#0E7C7B',
    primaryHover: '#0B6665',
    primarySoft: '#E3F2F1',
    accent: '#D4A437',
    accentSoft: '#FBF3DF',

    sidebar: '#0F1B2D',
    sidebarHover: '#1A2A42',
    sidebarActive: '#213551',
    sidebarText: '#A9B6C8',

    background: '#F4F6F9',
    surface: '#FFFFFF',
    surfaceAlt: '#F8FAFC',
    text: '#16202E',
    textMuted: '#64748B',
    textLight: '#94A3B8',
    border: '#E3E8EF',
    borderStrong: '#CBD5E1',

    success: '#15803D',
    successSoft: '#E7F6EC',
    warning: '#B45309',
    warningSoft: '#FEF3E2',
    danger: '#DC2626',
    dangerSoft: '#FDECEC',
    info: '#1D4ED8',
    infoSoft: '#E8F0FE',
    neutral: '#475569',
    neutralSoft: '#EEF2F6',
  },
  fonts: {
    body: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, Consolas, monospace",
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.8125rem',
    md: '0.875rem',
    lg: '1rem',
    xl: '1.25rem',
    xxl: '1.625rem',
    display: '2.25rem',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  radii: {
    sm: '6px',
    md: '10px',
    lg: '14px',
    pill: '999px',
  },
  shadows: {
    sm: '0 1px 2px rgba(15, 27, 45, 0.06)',
    md: '0 4px 16px rgba(15, 27, 45, 0.08)',
    lg: '0 20px 48px rgba(15, 27, 45, 0.18)',
  },
  layout: {
    sidebarWidth: '256px',
    topbarHeight: '68px',
    contentMaxWidth: '1440px',
  },
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
  },
} as const;

export type AppTheme = typeof theme;
