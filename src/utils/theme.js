import { MD3LightTheme } from 'react-native-paper';

export const colors = {
  primary: '#3498DB',
  secondary: '#2ECC71',
  accent: '#E74C3C',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  text: '#2C3E50',
  textSecondary: '#7F8C8D',
  border: '#ECF0F1',
  success: '#2ECC71',
  warning: '#F39C12',
  error: '#E74C3C',
  info: '#3498DB'
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.accent,
    background: colors.background,
    surface: colors.surface,
    text: colors.text,
    error: colors.error,
  },
  fonts: {
    ...MD3LightTheme.fonts,
  }
};