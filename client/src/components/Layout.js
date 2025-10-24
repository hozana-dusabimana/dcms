import React from 'react';
import { Box, AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, Avatar } from '@mui/material';
import { AccountCircle, Menu as MenuIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, isAuthenticated } = useAuth();
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        handleClose();
        navigate('/');
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static" sx={{ bgcolor: 'primary.main' }}>
                <Toolbar>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1, cursor: 'pointer' }}
                        onClick={() => navigate('/')}
                    >
                        DMCS MIS
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
                        <Button
                            color="inherit"
                            onClick={() => navigate('/')}
                            sx={{
                                bgcolor: isActive('/') ? 'rgba(255,255,255,0.1)' : 'transparent',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                            }}
                        >
                            Home
                        </Button>
                        <Button
                            color="inherit"
                            onClick={() => navigate('/about')}
                            sx={{
                                bgcolor: isActive('/about') ? 'rgba(255,255,255,0.1)' : 'transparent',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                            }}
                        >
                            About
                        </Button>
                        <Button
                            color="inherit"
                            onClick={() => navigate('/churches')}
                            sx={{
                                bgcolor: isActive('/churches') ? 'rgba(255,255,255,0.1)' : 'transparent',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                            }}
                        >
                            Churches
                        </Button>
                        <Button
                            color="inherit"
                            onClick={() => navigate('/services')}
                            sx={{
                                bgcolor: isActive('/services') ? 'rgba(255,255,255,0.1)' : 'transparent',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                            }}
                        >
                            Services
                        </Button>
                        <Button
                            color="inherit"
                            onClick={() => navigate('/contact')}
                            sx={{
                                bgcolor: isActive('/contact') ? 'rgba(255,255,255,0.1)' : 'transparent',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                            }}
                        >
                            Contact
                        </Button>
                        <Button
                            color="inherit"
                            onClick={() => navigate('/member-login')}
                            sx={{
                                bgcolor: isActive('/member-login') ? 'rgba(255,255,255,0.1)' : 'transparent',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                            }}
                        >
                            Member Portal
                        </Button>
                    </Box>

                    {isAuthenticated ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Button
                                color="inherit"
                                onClick={() => navigate('/dashboard')}
                                sx={{
                                    bgcolor: location.pathname.startsWith('/dashboard') ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                                }}
                            >
                                Dashboard
                            </Button>
                            <IconButton
                                size="large"
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleMenu}
                                color="inherit"
                            >
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                                    {user?.firstName?.charAt(0)}
                                </Avatar>
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorEl}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                            >
                                <MenuItem onClick={() => { navigate('/dashboard/profile'); handleClose(); }}>
                                    Profile
                                </MenuItem>
                                <MenuItem onClick={() => { navigate('/dashboard/documents'); handleClose(); }}>
                                    Documents
                                </MenuItem>
                                <MenuItem onClick={() => { navigate('/dashboard/notifications'); handleClose(); }}>
                                    Notifications
                                </MenuItem>
                                <MenuItem onClick={handleLogout}>Logout</MenuItem>
                            </Menu>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                color="inherit"
                                onClick={() => navigate('/login')}
                                sx={{
                                    bgcolor: isActive('/login') ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                                }}
                            >
                                Login
                            </Button>
                            <Button
                                color="inherit"
                                onClick={() => navigate('/register')}
                                sx={{
                                    bgcolor: isActive('/register') ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                                }}
                            >
                                Register
                            </Button>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>

            <Box component="main">
                {children}
            </Box>
        </Box>
    );
};

export default Layout;
