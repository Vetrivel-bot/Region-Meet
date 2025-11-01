// theme/theme.js
export const theme = {
  colors: {
    // your base brand colors (kept exactly)
    primary: '#0033A0',
    accent: '#FFAB00',
    error: '#D50000',
    text: '#FFFFFF',
    // dark surface + background
    background: '#0A0A10', // deep app background
    surface: 'rgba(18,18,20,0.55)', // semi-transparent card surface
    surfaceSolid: '#121214', // fallback solid surface
    textPrimary: '#E6EEF8', // pale text for contrast
    textSecondary: '#BFC9D9',
    headerBackground: 'rgba(6,31,83,0.94)',

    // glass border — subtle highlight for cards
    glassBorder: 'rgba(255,255,255,0.06)',
  },

  spacing: { small: 8, medium: 16, large: 24 },

  borderRadius: { small: 6, medium: 12, large: 16 },
};
