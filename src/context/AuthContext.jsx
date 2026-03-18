import { createContext, useState, useEffect } from 'react';
import * as authService from '@services/authService';

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();

    return () => {
      // Cleanup subscription if needed
    };
  }, []);

  async function initializeAuth() {
    try {
      setIsLoading(true);
      const { data } = await authService.getSession();
      setUser(data.session?.user || null);

      const unsubscribe = await authService.onAuthStateChange((event, session) => {
        setUser(session?.user || null);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Auth initialization error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  const contextValue = {
    user,
    isLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
