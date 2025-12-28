/* eslint-disable no-unused-vars */
import axios from 'axios';
import { createContext, useEffect, useState, useRef } from 'react';
import * as authHelper from '../_helpers';
// import.meta.env.DEV ? '/api' :
const API_URL =  import.meta.env.VITE_APP_API_URL;
export const LOGIN_URL = `${API_URL}/login`;
export const REGISTER_URL = `${API_URL}/register`;
export const FORGOT_PASSWORD_URL = `${API_URL}/forgot-password`;
export const RESET_PASSWORD_URL = `${API_URL}/reset-password`;
export const GET_USER_URL = `${API_URL}/profile`;

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);

  const getInitialAuth = () => {
    const auth = authHelper.getAuth();
    return auth;
  };

  const [auth, setAuth] = useState(getInitialAuth());
  const [currentUser, setCurrentUser] = useState();
  const isVerifying = useRef(false);

  const verify = async () => {
    if (isVerifying.current) return;
    isVerifying.current = true;

    const token = auth?.access_token || authHelper.getAuth()?.access_token;

    if (token) {
      try {
        const { data: user } = await getUser(token);
        setCurrentUser(user);
      } catch (error) {
        if (error.response?.status === 401) {
          saveAuth(null);
          setCurrentUser(undefined);
          window.location.href = '/auth/login';
        } else {
          setCurrentUser(undefined);
        }
      }
    }

    setLoading(false);
    isVerifying.current = false;
  };

  useEffect(() => {
    verify();
  }, [auth]);

  const saveAuth = (authData) => {
    if (authData?.token) {
      const accessTokenObj = { access_token: authData.token };
      setAuth(accessTokenObj);
      authHelper.setAuth(accessTokenObj);
    } else {
      authHelper.removeAuth();
      setAuth(null);
    }
  };

  const login = async (email, password) => {
    try {
      if (!email || !password) {
        throw new Error('Email or password is missing');
      }

      const { data: response } = await axios.post(
        LOGIN_URL,
        {
          person_email: email,
          person_password: password,
          person_mobile: '1145528091', // temp fix to pass validation

        },
        {
          headers: { Accept: 'application/json' },
        }
      );

      const user = response?.data?.user;
      const token = response?.data?.token;

      if (!response?.success || !user || !token) {
        throw new Error(response?.message || 'Invalid login response');
      }

      const authData = { user, token };
      saveAuth(authData);
      setCurrentUser(user);
      await verify();
    } catch (error) {
      saveAuth(null);
      throw new Error(error?.response?.data?.message || error.message || 'Login failed');
    }
  };

  const register = async (email, password, password_confirmation) => {
    try {
      const { data: auth } = await axios.post(REGISTER_URL, {
        email,
        password,
        password_confirmation,
      });
      const authData = {
        user: auth.data.user,
        token: auth.token,
      };
      saveAuth(authData);
      const { data: user } = await getUser(authData.token);
      setCurrentUser(user);
    } catch (error) {
      saveAuth(null);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const requestPasswordResetLink = async (email) => {
    await axios.post(FORGOT_PASSWORD_URL, { email });
  };

  const changePassword = async (email, token, password, password_confirmation) => {
    await axios.post(RESET_PASSWORD_URL, {
      email,
      token,
      password,
      password_confirmation,
    });
  };

  const getUser = async (token) => {
    if (!token) throw new Error('No token available');
    return await axios.get(GET_USER_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const logout = () => {
    saveAuth(null);
    setCurrentUser(undefined);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading: loading,
        auth,
        saveAuth,
        currentUser,
        setCurrentUser,
        login,
        register,
        requestPasswordResetLink,
        changePassword,
        getUser,
        logout,
        verify,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
