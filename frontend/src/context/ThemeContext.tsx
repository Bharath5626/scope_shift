import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
  loading: false,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme === 'dark' || savedTheme === 'light') ? savedTheme : 'light';
  });
  const [loading, setLoading] = useState(false);

  // Load theme from database on mount and when token changes
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
        } else {
          // No token, reset to light mode
          setTheme('light');
          localStorage.setItem('theme', 'light');
        }
      } catch (error) {
        console.error('Failed to load theme from database:', error);
        // If user not found or auth error, clear token and fall back to localStorage
        const err = error as any;
        const errorMessage = err.message || err.toString() || '';
        const isAuthError = err.status === 401 || err.status === 404;
        const isUserNotFoundError = errorMessage === 'User not found' || errorMessage.includes('User not found');
        
        if (isAuthError || isUserNotFoundError) {
          console.log('Clearing invalid token due to auth/user error:', errorMessage);
          localStorage.removeItem('scopeai_token');
          setTheme('light');
          localStorage.setItem('theme', 'light');
        }
        // Fall back to localStorage theme for other errors
      }
    };

    loadThemeFromDB();

    // Listen for login event to reload theme
    const handleLogin = () => {
      loadThemeFromDB();
    };

    window.addEventListener('user-login', handleLogin);
    return () => window.removeEventListener('user-login', handleLogin);
  }, []); // Run on mount only - token changes handled by custom event

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

  const setThemeDirectly = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: setThemeDirectly, loading }}>
      {children}
    </ThemeContext.Provider>
  );
};
