import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Uniwind, useUniwind } from 'uniwind';
import { getErrorMessage } from '../utils/errors';
import { addLog } from './LogService';

const THEME_KEY = '@HealthConnect:appTheme';

export type ThemePreference =
  'System' | 'Light' | 'Dark' | 'Amoled' | 'CatppuccinMocha';

export type UniwindTheme =
  'system' | 'light' | 'dark' | 'amoled' | 'catppuccin-mocha';

/**
 * Check if the given theme is a dark variant.
 */
export function isDarkTheme(theme: string): boolean {
  return theme === 'dark' || theme === 'amoled' || theme === 'catppuccin-mocha';
}

/**
 * Convert user-facing theme preference to Uniwind theme string
 */
function toUniwindTheme(pref: ThemePreference): UniwindTheme {
  switch (pref) {
    case 'System':
      return 'system';
    case 'Light':
      return 'light';
    case 'Dark':
      return 'dark';
    case 'Amoled':
      return 'amoled';
    case 'CatppuccinMocha':
      return 'catppuccin-mocha';
  }
}

/**
 * Convert Uniwind theme string to user-facing theme preference
 */
function fromUniwindTheme(
  theme: string,
  hasAdaptiveThemes: boolean
): ThemePreference {
  if (hasAdaptiveThemes) return 'System';
  switch (theme) {
    case 'light':
      return 'Light';
    case 'dark':
      return 'Dark';
    case 'amoled':
      return 'Amoled';
    case 'catppuccin-mocha':
      return 'CatppuccinMocha';
    default:
      return 'System';
  }
}

/**
 * Load saved theme preference and apply it via Uniwind.
 * Call this once on app startup.
 */
export async function initializeTheme(): Promise<void> {
  try {
    const savedTheme = await AsyncStorage.getItem(THEME_KEY);
    const preference = savedTheme ? (savedTheme as ThemePreference) : 'System';
    Uniwind.setTheme(toUniwindTheme(preference));
  } catch (error) {
    addLog(
      `Failed to load theme preference: ${getErrorMessage(error)}`,
      'ERROR'
    );
    Uniwind.setTheme('system');
  }
}

/**
 * Set theme preference - saves to storage and updates Uniwind
 */
export async function setThemePreference(
  preference: ThemePreference
): Promise<void> {
  try {
    await AsyncStorage.setItem(THEME_KEY, preference);
    Uniwind.setTheme(toUniwindTheme(preference));
  } catch (error) {
    addLog(
      `Failed to save theme preference: ${getErrorMessage(error)}`,
      'ERROR'
    );
  }
}

/**
 * Hook to get the current theme preference for UI display.
 * Returns the user-facing preference (System/Light/Dark/Amoled).
 */
export function useThemePreference(): ThemePreference {
  const { theme, hasAdaptiveThemes } = useUniwind();
  const [preference, setPreference] = useState<ThemePreference>('System');

  useEffect(() => {
    // Load saved preference to get accurate user selection
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved) {
        setPreference(saved as ThemePreference);
      } else {
        setPreference(fromUniwindTheme(theme, hasAdaptiveThemes));
      }
    });
  }, [theme, hasAdaptiveThemes]);

  return preference;
}
