import { useContext } from 'react';
import { AuthContext } from '@context/AuthContext';
import * as authService from '@services/authService';

function useAuthentication() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthentication must be used within AuthProvider');
  }

  const { user, isLoading } = context;

  async function signIn(email, password) {
    return authService.signIn(email, password);
  }

  async function signUp(email, password, fullName) {
    return authService.signUp(email, password, fullName);
  }

  async function signOut() {
    return authService.signOut();
  }

  async function resetPassword(email) {
    return authService.resetPassword(email);
  }

  return {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
}

export default useAuthentication;
