import React, { createContext, useContext, useState } from 'react';

// create context
const AppContext = createContext(null);

// provider
export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');

  const login = () => setUser({ name });
  const logout = () => setUser(null);

  return (
    <AppContext.Provider value={{ user, login, logout, theme, setTheme }}>
      {children}
    </AppContext.Provider>
  );
};

// easy hook
export const useApp = () => useContext(AppContext);
