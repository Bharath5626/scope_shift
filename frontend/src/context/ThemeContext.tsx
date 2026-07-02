import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  loading: false,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme === 'dark' || savedTheme === 'light') ? savedTheme : 'light';
  });
  const [loading, setLoading] = useState(false);

  // Load theme from database on mount
  useEffect(() => {
    const loadThemeFromDB = async () => {
      try {
        const token = localStorage.getItem('scopeai_token');
        if (token) {
          const userProfile = await api.get<{ theme?: string }>('/users/profile');
          if (userProfile.theme === 'light' || userProfile.theme === 'dark') {
            setTheme(userProfile.theme);
            localStorage.setItem('theme', userProfile.theme);
          }
        }
      } catch (error) {
        console.error('Failed to load theme from database:', error);
        // Fall back to localStorage theme
      }
    };

    loadThemeFromDB();
  }, []);

  // Apply theme to DOM
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    // Save to database
    try {
      setLoading(true);
      const token = localStorage.getItem('scopeai_token');
      if (token) {
        await api.put('/users/profile', { theme: newTheme });
      }
    } catch (error) {
      console.error('Failed to save theme to database:', error);
      // Revert to localStorage theme if API call fails
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
};
