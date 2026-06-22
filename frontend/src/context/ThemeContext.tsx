import React, { createContext, useContext, useState } from 'react';                                                                                                
                                                                                                                                                                   
                                                                                                                                                                   
                                                                                                                                                                   
type Theme = 'light' | 'dark';                                                                                                                                     
                                                                                                                                                                   
                                                                                                                                                                   
                                                                                                                                                                   
interface ThemeContextType {                                                                                                                                       
                                                                                                                                                                   
  theme: Theme;                                                                                                                                                    
                                                                                                                                                                   
  toggleTheme: () => void;                                                                                                                                         
                                                                                                                                                                   
}                                                                                                                                                                  
                                                                                                                                                                   
                                                                                                                                                                   
                                                                                                                                                                   
const ThemeContext = createContext<ThemeContextType>({                                                                                                             
                                                                                                                                                                   
  theme: 'light',                                                                                                                                                  
                                                                                                                                                                   
  toggleTheme: () => {},                                                                                                                                           
                                                                                                                                                                   
});                                                                                                                                                                
                                                                                                                                                                   
                                                                                                                                                                   
                                                                                                                                                                   
export const useTheme = () => useContext(ThemeContext);                                                                                                            
                                                                                                                                                                   
                                                                                                                                                                   
                                                                                                                                                                   
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {                                                                          
                                                                                                                                                                   
  const [theme, setTheme] = useState<Theme>('light');                                                                                                              
                                                                                                                                                                   
                                                                                                                                                                   
                                                                                                                                                                   
  const toggleTheme = () => {                                                                                                                                      
                                                                                                                                                                   
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));                                                                                             
                                                                                                                                                                   
  };                                                                                                                                                               
                                                                                                                                                                   
                                                                                                                                                                   
                                                                                                                                                                   
  return (                                                                                                                                                         
                                                                                                                                                                   
    <ThemeContext.Provider value={{ theme, toggleTheme }}>                                                                                                         
                                                                                                                                                                   
      {children}                                                                                                                                                   
                                                                                                                                                                   
    </ThemeContext.Provider>                                                                                                                                       
                                                                                                                                                                   
  );                                                                                                                                                               
                                                                                                                                                                   
};                                                                                                                                                                 
                                                                                                                                                                   
``            