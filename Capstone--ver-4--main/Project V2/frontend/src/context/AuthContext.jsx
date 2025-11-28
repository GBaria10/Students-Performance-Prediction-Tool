import { createContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'spft_auth_v1';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).token : null;
  });
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).user : null;
  });
  const isAuthenticated = Boolean(token);

  useEffect(() => {
    if (token && user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [token, user]);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated,
      login: ({ token: authToken, faculty }) => {
        setToken(authToken);
        setUser(faculty);
      },
      logout: () => {
        setToken(null);
        setUser(null);
      }
    }),
    [token, user, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
