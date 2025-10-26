import React from 'react';
import {
    Box,
    Typography,
    Button,
    IconButton,
    Tooltip,
    useTheme,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Logout as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import NotificationBell from './NotificationBell';

const DashboardHeader = ({
    title,
    subtitle,
    showBackButton = true,
    showLogoutButton = true,
    backPath = '/dashboard',
    actionButton = null
}) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleBack = () => {
        navigate(backPath);
    };

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out successfully');
            navigate('/login');
        } catch (error) {
            toast.error('Failed to logout');
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 4,
                p: 2,
                backgroundColor: theme.palette.background.paper,
                borderRadius: 2,
                boxShadow: 1,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {showBackButton && (
                    <Tooltip title="Go back">
                        <IconButton
                            onClick={handleBack}
                            color="primary"
                            sx={{
                                backgroundColor: theme.palette.primary.light,
                                color: theme.palette.primary.contrastText,
                                '&:hover': {
                                    backgroundColor: theme.palette.primary.main,
                                },
                            }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                    </Tooltip>
                )}
                <Box>
                    <Typography variant="h4" component="h1" gutterBottom>
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography variant="body1" color="text.secondary">
                            {subtitle}
                        </Typography>
                    )}
                </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {actionButton}
                <NotificationBell />
                {showLogoutButton && (
                    <Tooltip title="Logout">
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<LogoutIcon />}
                            onClick={handleLogout}
                            sx={{
                                borderColor: theme.palette.error.main,
                                color: theme.palette.error.main,
                                '&:hover': {
                                    backgroundColor: theme.palette.error.light,
                                    borderColor: theme.palette.error.main,
                                    color: theme.palette.error.contrastText,
                                },
                            }}
                        >
                            Logout
                        </Button>
                    </Tooltip>
                )}
            </Box>
        </Box>
    );
};

export default DashboardHeader;
