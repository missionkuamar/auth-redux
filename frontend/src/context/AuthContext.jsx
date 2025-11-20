import { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI, usersAPI } from '../utils/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  error: null,
  isAuthenticated: false,
  users: [], // For user list
  userLoading: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload));
      return {
        ...state,
        ...action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'AUTH_FAIL':
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return {
        ...state,
        token: null,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return {
        ...state,
        token: null,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        users: [],
      };
    case 'CLEAR_ERRORS':
      return {
        ...state,
        error: null,
      };
    case 'USER_LOADED':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };
    case 'UPDATE_PROFILE_SUCCESS':
      localStorage.setItem('user', JSON.stringify({ ...state.user, ...action.payload }));
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        error: null,
      };
    case 'USERS_LOADING':
      return {
        ...state,
        userLoading: true,
      };
    case 'USERS_LOADED':
      return {
        ...state,
        users: action.payload,
        userLoading: false,
      };
    case 'USER_DELETED':
      return {
        ...state,
        users: state.users.filter(user => user._id !== action.payload),
      };
    case 'USER_UPDATED':
      return {
        ...state,
        users: state.users.map(user =>
          user._id === action.payload._id ? action.payload : user
        ),
        ...(state.user?._id === action.payload._id && { user: action.payload }),
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, []);

  // Load User
  const loadUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        dispatch({ type: 'AUTH_FAIL' });
        return;
      }

      const res = await authAPI.getMe();
      dispatch({
        type: 'USER_LOADED',
        payload: res.data.data,
      });
    } catch (error) {
      dispatch({
        type: 'AUTH_FAIL',
        payload: error.response?.data?.message || 'Error loading user',
      });
    }
  };

  // Register User
  const register = async (formData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const res = await authAPI.register(formData);
      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: res.data.data,
      });
      return { success: true, data: res.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({
        type: 'AUTH_FAIL',
        payload: message,
      });
      return { success: false, error: message };
    }
  };

  // Login User
  const login = async (formData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const res = await authAPI.login(formData);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: res.data.data,
      });
      return { success: true, data: res.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({
        type: 'AUTH_FAIL',
        payload: message,
      });
      return { success: false, error: message };
    }
  };

  // Update Profile
  const updateProfile = async (formData) => {
    try {
      const res = await usersAPI.updateProfile(formData);
      dispatch({
        type: 'UPDATE_PROFILE_SUCCESS',
        payload: res.data.data,
      });
      return { success: true, data: res.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      dispatch({
        type: 'AUTH_FAIL',
        payload: message,
      });
      return { success: false, error: message };
    }
  };

  // Get all users
  const getUsers = async () => {
    try {
      dispatch({ type: 'USERS_LOADING' });
      const res = await usersAPI.getUsers();
      dispatch({
        type: 'USERS_LOADED',
        payload: res.data.data,
      });
      return { success: true, data: res.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load users';
      dispatch({
        type: 'AUTH_FAIL',
        payload: message,
      });
      return { success: false, error: message };
    }
  };

  // Update user
  const updateUser = async (id, formData) => {
    try {
      const res = await usersAPI.updateUser(id, formData);
      dispatch({
        type: 'USER_UPDATED',
        payload: res.data.data,
      });
      return { success: true, data: res.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update user';
      return { success: false, error: message };
    }
  };

  // Delete user
  const deleteUser = async (id) => {
    try {
      await usersAPI.deleteUser(id);
      dispatch({
        type: 'USER_DELETED',
        payload: id,
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete user';
      return { success: false, error: message };
    }
  };

  // Logout
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  // Clear Errors
  const clearErrors = () => {
    dispatch({ type: 'CLEAR_ERRORS' });
  };

  const value = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    error: state.error,
    isAuthenticated: state.isAuthenticated,
    users: state.users,
    userLoading: state.userLoading,
    register,
    login,
    logout,
    clearErrors,
    loadUser,
    updateProfile,
    getUsers,
    updateUser,
    deleteUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};