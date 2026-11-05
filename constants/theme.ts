import { Platform } from 'react-native';

export const LightColors = {
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

export type ThemeColors = typeof LightColors;

// Dark palette: slate primary, near-black surface, the logo red as the accent.
// The semantic colours (saffron, forest) keep their light-mode hue, a bit deeper.
export const DarkColors: ThemeColors = {
  paper: '#11151C',
  paperDim: '#181D26',
  ink: '#E2E8F0',
  inkSoft: '#94A3B8',
  crimson: '#C41E3A',
  crimsonDark: '#9A1730',
  himalaya: '#94A3B8',
  himalayaLight: '#B3BFCE',
  saffron: '#CF8F2E',
  forest: '#1F7443',
  line: '#262D39',
  card: '#1A202A',
};

// Light palette for code that cannot use a hook. Components should call
// useColors() so they follow the appearance setting.
export const BrandColors = LightColors;

export const Colors = {
  light: {
    text: LightColors.ink,
    background: LightColors.paper,
    tint: LightColors.crimson,
    icon: LightColors.inkSoft,
    tabIconDefault: LightColors.inkSoft,
    tabIconSelected: LightColors.crimson,
    border: LightColors.line,
    card: LightColors.card,
  },
  dark: {
    text: DarkColors.ink,
    background: DarkColors.paper,
    tint: DarkColors.crimson,
    icon: DarkColors.inkSoft,
    tabIconDefault: DarkColors.inkSoft,
    tabIconSelected: DarkColors.crimson,
    border: DarkColors.line,
    card: DarkColors.card,
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
