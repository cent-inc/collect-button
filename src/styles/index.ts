import { DefaultTheme } from 'styled-components';
import Typography from './typography';
import Radius from './radius';
import Spacing from './spacing';
import { Colors as DarkColors } from './Dark/colors';
import { Effects as DarkEffects } from './Dark/effects';
import { Colors as LightColors } from './Light/colors';
import { Effects as LightEffects } from './Light/effects';

export const DarkTheme: DefaultTheme = {
  name: 'dark',
  Typography,
  Radius,
  Spacing,
  Colors: DarkColors,
  Effects: DarkEffects,
};

export const LightTheme: DefaultTheme = {
  name: 'light',
  Typography,
  Radius,
  Spacing,
  Colors: LightColors,
  Effects: LightEffects,
};
