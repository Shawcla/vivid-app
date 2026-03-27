export const Colors = {
  purple: '#8B2FC9',
  purpleBright: '#A855F7',
  purpleNeon: '#C084FC',
  purpleGlow: '#7C3AED',
  purpleDim: 'rgba(139,47,201,0.15)',

  dark: '#0A0A0F',
  dark2: '#111118',
  dark3: '#1A1A25',
  dark4: '#22222F',

  text: '#E8E8F0',
  textMuted: '#7A7A9A',
  textDim: '#4A4A6A',

  success: '#4ADE80',
  error: '#F87171',
  warning: '#FBBF24',

  white: '#FFFFFF',
  black: '#000000',
};

// Use system fonts for now so the app can run without the missing custom font files.
export const Fonts = {
  display: 'System',
  body: 'System',
  mono: 'Courier',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
};

export const Shadow = {
  purple: {
    shadowColor: Colors.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
};
