import { useState, useEffect, useCallback } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import * as AuthService from '../firebase/authService';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Reset error state
  const resetError = useCallback(() => {
    setError(null);
  }, []);

  // Register new user
  const register = useCallback(async (
    email: string, 
    password: string, 
    displayName: string,
    phone: string,
    address?: string,
    dob?: string,
    gender?: 'male' | 'female' | 'other'
  ) => {
    setLoading(true);
    setError(null);
    try {
      const user = await AuthService.registerUser(
        email, 
        password, 
        displayName, 
        phone, 
        address, 
        dob, 
        gender
      );
      setLoading(false);
      return user;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      return null;
    }
  }, []);

  // Login user
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const user = await AuthService.loginUser(email, password);
      setLoading(false);
      return user;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      return null;
    }
  }, []);

  // Logout user
  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await AuthService.logoutUser();
      setLoading(false);
      return true;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      return false;
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await AuthService.resetPassword(email);
      setLoading(false);
      return true;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      return false;
    }
  }, []);

  return {
    user,
    loading,
    error,
    resetError,
    register,
    login,
    logout,
    resetPassword,
    isLoggedIn: !!user,
  };
}; 