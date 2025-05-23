import { createContext, useContext, useEffect, useState } from 'react';
import axiosInstance from '../config/axios';
import { logout as logoutService } from '../services/AuthService';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.get('/auth/me');

      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('accessToken'); // ❌ This might be causing the issue
      setUser(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', {
        email,
        password,
      });
      localStorage.setItem('accessToken', response.data.accessToken);
      fetchUser(); // Fetch user immediately after login
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  };

  const logout = async () => {
    await logoutService();
    localStorage.removeItem('accessToken');
    console.log('User logged out successfully'); // ✅ Debugging step
    setUser(null);
  };

  // Update user profile
  const updateUser = async (data, isMultipart = false) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('No token found in localStorage');
        return;
      }

      const response = await axiosInstance.put('/auth/me/update', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          ...(isMultipart && { 'Content-Type': 'multipart/form-data' }),
        },
      });

      setUser(response.data); // update context
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  useEffect(() => {
    console.log('CONTEXT USER:', user);
  }, [user]);
  useEffect(() => {
    const interceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Don't attempt refresh if there is no access token
        if (!localStorage.getItem('accessToken')) {
          return Promise.reject(error);
        }

        // Refresh token only for 401, NOT 403 (to prevent looping)
        if (
          error.response &&
          error.response.status === 401 &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;

          try {
            const refreshResponse = await axiosInstance.post('/auth/refresh');
            localStorage.setItem(
              'accessToken',
              refreshResponse.data.accessToken
            );
            originalRequest.headers[
              'Authorization'
            ] = `Bearer ${refreshResponse.data.accessToken}`;

            return axiosInstance(originalRequest);
          } catch (refreshError) {
            if (refreshError.response?.status === 403) {
              logout();
            }

            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => axiosInstance.interceptors.response.eject(interceptor);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, login, setUser, logout, fetchUser, loading, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
