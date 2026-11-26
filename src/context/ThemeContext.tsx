import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  LightColors,
  DarkColors,
  makeShadow,
  ThemeColors,
} from '../utils/theme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  mode: ThemeMode;        // user preference
  isDark: boolean;        // resolved (true when dark is active)
  colors: ThemeColors;
  shadow: ReturnType<typeof makeShadow>;
  setMode: (m: ThemeMode) => void;
  toggle: () => void;
}

const STORAGE_KEY = '@splitsmart_theme';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null
  const [mode, setModeState] = useState<ThemeMode>('system');

  // Load saved preference once on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setModeState(saved);
      }
    });
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(STORAGE_KEY, m);
  }, []);

  const toggle = useCallback(() => {
    setMode(isDark ? 'light' : 'dark');
  }, [mode, systemScheme]); // eslint-disable-line react-hooks/exhaustive-deps

  // Resolve whether dark is actually active
  const isDark =
    mode === 'dark' || (mode === 'system' && systemScheme === 'dark');

  const colors = isDark ? DarkColors : LightColors;
  const shadow = makeShadow(isDark);

  return (
    <ThemeContext.Provider value={{ mode, isDark, colors, shadow, setMode, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
