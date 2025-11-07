// theme/theme.js
export const theme = {
  colors: {
    // your base brand colors (kept exactly)
    primary: '#25B5AB',
    accent: '#FFAB00',
    error: '#D50000',
    text: '#FFFFFF',
    // dark surface + background
    background: '#233448', // deep app background
    surface: '#30445bff', // semi-transparent card surface
    surfaceSolid: '#121214', // fallback solid surface
    textPrimary: '#E6EEF8', // pale text for contrast
    textSecondary: '#BFC9D9',
    headerBackground: '#192738ff',
    chipInactive: 'rgba(255,255,255,0.12)',
    tabInactive: '#668987ff',

    // glass border — subtle highlight for cards
    glassBorder: 'rgba(255,255,255,0.06)',
  },

  spacing: { small: 8, medium: 16, large: 24 },

  borderRadius: { small: 6, medium: 12, large: 16 },
};
