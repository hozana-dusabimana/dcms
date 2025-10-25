import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/axios';

const MemberAuthContext = createContext();

export const useMemberAuth = () => {
    const context = useContext(MemberAuthContext);
    if (!context) {
        throw new Error('useMemberAuth must be used within a MemberAuthProvider');
    }
    return context;
};

export const MemberAuthProvider = ({ children }) => {
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('memberToken'));

    // Set default authorization header
    useEffect(() => {
        if (token) {
            api.defaults.headers.common['x-auth-token'] = token;
        } else {
            delete api.defaults.headers.common['x-auth-token'];
        }
    }, [token]);

    // Verify token on app load
    useEffect(() => {
        const verifyToken = async () => {
            if (token) {
                try {
                    const response = await api.get('/member-auth/verify');
                    setMember(response.data.member);
                } catch (error) {
                    console.error('Token verification failed:', error);
                    logout();
                }
            }
            setLoading(false);
        };

        verifyToken();
    }, [token]);

    const login = async (phone) => {
        try {
            const response = await api.post('/member-auth/login', { phone });
            const { token: newToken, member: memberData } = response.data;

            setToken(newToken);
            setMember(memberData);
            localStorage.setItem('memberToken', newToken);

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const logout = () => {
        setToken(null);
        setMember(null);
        localStorage.removeItem('memberToken');
        delete api.defaults.headers.common['x-auth-token'];
    };

    const value = {
        member,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!member
    };

    return (
        <MemberAuthContext.Provider value={value}>
            {children}
        </MemberAuthContext.Provider>
    );
};

