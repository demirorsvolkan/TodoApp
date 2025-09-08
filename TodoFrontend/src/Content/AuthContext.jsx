import { createContext, useContext, useEffect, useState } from 'react';
import { verifyToken } from './Api/verify';

const AuthContext = createContext({
  isAuthenticated: false,
  user: null,            // user bilgisi
  token: null,
  login: () => {},
  logout: () => {},
  checking: true,
});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);     // user state
  const [token, setToken] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
      setChecking(false);
      return;
    }

    verifyToken(savedToken)
      .then((userData) => {
        setIsAuthenticated(true);
        setUser(userData);         // user bilgisi state’e yazılıyor
        setToken(savedToken);
      })
      .catch(() => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
      })
      .finally(() => setChecking(false));
  }, []);
  const register = async (registerData) => {
    const response = await fetch('https://localhost:7299/api/Auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData),
    });
    
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Kayıt işlemi başarısız oldu');
    }
        return true; // başarılıysa dönüş
  };
  const login = async (newToken) => {
    localStorage.setItem('token', newToken);

    try {
      const userData = await verifyToken(newToken);
      setIsAuthenticated(true);
      setUser(userData); 
      setToken(newToken);
    } catch {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout, register, checking }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
