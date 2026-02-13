import React from 'react';
export { Home } from './Home';
export { EnterData } from './EnterData';

import { createTheme, ThemeProvider } from '@fluentui/react';
import { initializeIcons } from '@fluentui/font-icons-mdl2';

// Register Fluent UI icons
initializeIcons();

const theme = createTheme({
	palette: {
		themePrimary: '#ff6600',
		themeLighterAlt: '#fff3ea',
		themeLighter: '#ffd9bd',
		themeLight: '#ffb682',
		themeTertiary: '#ff8a33',
		themeSecondary: '#ff7920',
		themeDarkAlt: '#e65500',
		themeDark: '#cc4b00',
		themeDarker: '#b04100',
		neutralLighterAlt: '#faf9f8',
		neutralLighter: '#f3f2f1',
		neutralLight: '#edebe9',
		neutralQuaternaryAlt: '#e1dfdd',
		neutralQuaternary: '#d0d0d0',
		neutralTertiaryAlt: '#c8c8c8',
		neutralTertiary: '#a19f9d',
		neutralSecondary: '#605e5c',
		neutralPrimaryAlt: '#3b3a39',
		neutralPrimary: '#323130',
		neutralDark: '#201f1e',
		black: '#000000',
		white: '#ffffff'
	}
});

export const AppProviders: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
	<ThemeProvider theme={theme}>{children}</ThemeProvider>
);

export { theme };
