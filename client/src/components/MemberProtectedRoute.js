import React from 'react';
import { Navigate } from 'react-router-dom';
import { useMemberAuth } from '../contexts/MemberAuthContext';
import { CircularProgress, Box } from '@mui/material';

const MemberProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useMemberAuth();

    if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh'
            }}>
                <CircularProgress />
            </Box>
        );
    }

    return isAuthenticated ? children : <Navigate to="/member-login" replace />;
};

export default MemberProtectedRoute;






