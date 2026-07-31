import { Platform } from 'react-native';

export const BrandColors = {
  paper: '#FBF6EC',
  paperDim: '#F3ECDC',
  ink: '#221C1A',
  inkSoft: '#5B534C',
  crimson: '#A0001E',
  crimsonDark: '#7A0016',
  himalaya: '#0B3D66',
  himalayaLight: '#3E6690',
  saffron: '#E8A33D',
  forest: '#1E7A46',
  line: '#E4D9C3',
  card: '#FFFFFF',
};

export const Colors = {
  light: {
    text: BrandColors.ink,
    background: BrandColors.paper,
    tint: BrandColors.crimson,
    icon: BrandColors.inkSoft,
    tabIconDefault: BrandColors.inkSoft,
    tabIconSelected: BrandColors.crimson,
    border: BrandColors.line,
    card: BrandColors.card,
  },
  dark: {
    // Keep a beautiful dark-mode version aligned with ink theme
    text: '#F3ECDC',
    background: '#141110',
    tint: '#E8A33D',
    icon: '#8A8074',
    tabIconDefault: '#8A8074',
    tabIconSelected: '#E8A33D',
    border: '#2A2422',
    card: '#221C1A',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    rounded: 'System',
    mono: 'Courier New',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "Manrope, Inter, system-ui, -apple-system, sans-serif",
    serif: "Georgia, serif",
    rounded: "system-ui, sans-serif",
    mono: "JetBrains Mono, monospace",
  },
});
