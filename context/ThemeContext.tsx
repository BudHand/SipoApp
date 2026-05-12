import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

const THEME_KEY = "sipo_theme";

type ThemeContextType = {
  isDark: boolean;
  toggleDark: () => Promise<void>;
  setDarkMode: (value: boolean) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleDark: async () => {},
  setDarkMode: async () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_KEY);
        setIsDark(savedTheme === "dark");
      } catch (error) {
        console.log("Gagal membaca theme:", error);
      } finally {
        setReady(true);
      }
    };

    loadTheme();
  }, []);

  const setDarkMode = async (value: boolean) => {
    setIsDark(value);
    await AsyncStorage.setItem(THEME_KEY, value ? "dark" : "light");
  };

  const toggleDark = async () => {
    const nextValue = !isDark;
    await setDarkMode(nextValue);
  };

  if (!ready) return null;

  return (
    <ThemeContext.Provider value={{ isDark, toggleDark, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
