import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../config/axios';
import toast from 'react-hot-toast';

// Create Auth Context
const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_START':
            return {
                ...state,
                loading: true,
                error: null,
            };
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                loading: false,
                isAuthenticated: true,
                user: action.payload.user,
                token: action.payload.token,
                error: null,
            };
        case 'LOGIN_FAILURE':
            return {
                ...state,
                loading: false,
                isAuthenticated: false,
                user: null,
                token: null,
                error: action.payload,
            };
        case 'LOGOUT':
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                token: null,
                error: null,
                loading: false,
            };
        case 'UPDATE_USER':
            return {
                ...state,
                user: { ...state.user, ...action.payload },
            };
        case 'CLEAR_ERROR':
            return {
                ...state,
                error: null,
            };
        default:
            return state;
    }
};

// Initial state
const initialState = {
    isAuthenticated: false,
    user: null,
    token: localStorage.getItem('token'),
    loading: true,
    error: null,
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Set up axios defaults
    useEffect(() => {
        if (state.token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        } else {
            delete api.defaults.headers.common['Authorization'];
        }
    }, [state.token]);

    // Check if user is logged in on app start
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await api.get('/auth/me');
                    dispatch({
                        type: 'LOGIN_SUCCESS',
                        payload: {
                            user: response.data.user,
                            token,
                        },
                    });
                } catch (error) {
                    localStorage.removeItem('token');
                    dispatch({ type: 'LOGOUT' });
                }
            } else {
                dispatch({ type: 'LOGOUT' });
            }
        };

        checkAuth();
    }, []);

    // Login function
    const login = async (email, password) => {
        dispatch({ type: 'LOGIN_START' });
        try {
            const response = await api.post('/auth/login', {
                email,
                password,
            });

            const { token, user } = response.data;
            localStorage.setItem('token', token);

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: { user, token },
            });

            toast.success('Login successful!');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            dispatch({
                type: 'LOGIN_FAILURE',
                payload: message,
            });
            toast.error(message);
            return { success: false, error: message };
        }
    };

    // Register function
    const register = async (userData) => {
        dispatch({ type: 'LOGIN_START' });
        try {
            console.log('Registering user with data:', userData);
            const response = await api.post('/auth/register', userData);
            const { token, user } = response.data;
            localStorage.setItem('token', token);

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: { user, token },
            });

            toast.success('Registration successful!');
            return { success: true };
        } catch (error) {
            console.error('Registration error:', error);

            let message = 'Registration failed';

            if (error.response?.data?.message) {
                message = error.response.data.message;
            } else if (error.response?.data?.errors) {
                // Handle validation errors
                const errors = error.response.data.errors;
                if (Array.isArray(errors)) {
                    message = errors.map(err => err.msg || err.message).join(', ');
                } else {
                    message = 'Validation error: ' + JSON.stringify(errors);
                }
            } else if (error.message) {
                message = error.message;
            }

            dispatch({
                type: 'LOGIN_FAILURE',
                payload: message,
            });
            toast.error(message);
            return { success: false, error: message };
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('token');
        dispatch({ type: 'LOGOUT' });
        toast.success('Logged out successfully');
    };

    // Update user profile
    const updateProfile = async (profileData) => {
        try {
            const response = await api.put('/auth/profile', profileData);
            dispatch({
                type: 'UPDATE_USER',
                payload: response.data.user,
            });
            toast.success('Profile updated successfully');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Profile update failed';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    // Change password
    const changePassword = async (currentPassword, newPassword) => {
        try {
            await api.put('/auth/change-password', {
                currentPassword,
                newPassword,
            });
            toast.success('Password changed successfully');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Password change failed';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    // Clear error
    const clearError = () => {
        dispatch({ type: 'CLEAR_ERROR' });
    };

    const value = {
        ...state,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        clearError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
