import AsyncStorage from '@react-native-async-storage/async-storage';
import { Uniwind, useUniwind } from 'uniwind';
import { renderHook, waitFor } from '@testing-library/react-native';
import {
  initializeTheme,
  setThemePreference,
  useThemePreference,
  isDarkTheme,
} from '../../src/services/themeService';

const THEME_KEY = '@HealthConnect:appTheme';

describe('themeService', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  describe('isDarkTheme', () => {
    it('returns true for dark variants', () => {
      expect(isDarkTheme('dark')).toBe(true);
      expect(isDarkTheme('amoled')).toBe(true);
      expect(isDarkTheme('catppuccin-mocha')).toBe(true);
    });

    it('returns false for light and other variants', () => {
      expect(isDarkTheme('light')).toBe(false);
      expect(isDarkTheme('system')).toBe(false);
      expect(isDarkTheme('')).toBe(false);
    });
  });

  describe('initializeTheme', () => {
    it('defaults to system when no theme is stored', async () => {
      await initializeTheme();
      expect(Uniwind.setTheme).toHaveBeenCalledWith('system');
    });

    it('applies CatppuccinMocha preference from storage', async () => {
      await AsyncStorage.setItem(THEME_KEY, 'CatppuccinMocha');
      await initializeTheme();
      expect(Uniwind.setTheme).toHaveBeenCalledWith('catppuccin-mocha');
    });

    it('applies Amoled preference from storage', async () => {
      await AsyncStorage.setItem(THEME_KEY, 'Amoled');
      await initializeTheme();
      expect(Uniwind.setTheme).toHaveBeenCalledWith('amoled');
    });

    it('falls back to system on storage error', async () => {
      jest
        .spyOn(AsyncStorage, 'getItem')
        .mockRejectedValueOnce(new Error('Storage failure'));
      await initializeTheme();
      expect(Uniwind.setTheme).toHaveBeenCalledWith('system');
    });
  });

  describe('setThemePreference', () => {
    it('saves CatppuccinMocha to storage and updates Uniwind', async () => {
      await setThemePreference('CatppuccinMocha');
      expect(await AsyncStorage.getItem(THEME_KEY)).toBe('CatppuccinMocha');
      expect(Uniwind.setTheme).toHaveBeenCalledWith('catppuccin-mocha');
    });

    it('saves Dark to storage and updates Uniwind', async () => {
      await setThemePreference('Dark');
      expect(await AsyncStorage.getItem(THEME_KEY)).toBe('Dark');
      expect(Uniwind.setTheme).toHaveBeenCalledWith('dark');
    });
  });

  describe('useThemePreference', () => {
    it('returns preference from storage when available', async () => {
      await AsyncStorage.setItem(THEME_KEY, 'CatppuccinMocha');
      const { result } = renderHook(() => useThemePreference());

      await waitFor(() => {
        expect(result.current).toBe('CatppuccinMocha');
      });
    });

    it('derives preference from Uniwind theme when not stored', async () => {
      (useUniwind as jest.Mock).mockReturnValue({
        theme: 'catppuccin-mocha',
        hasAdaptiveThemes: false,
      });

      const { result } = renderHook(() => useThemePreference());

      await waitFor(() => {
        expect(result.current).toBe('CatppuccinMocha');
      });
    });
  });
});
