import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemSecondaryAction,
    IconButton,
    Button,
    Chip,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    FormControlLabel,
    Switch,
    Divider,
    Badge,
    Tooltip,
    Menu,
    MenuItem
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    NotificationsActive as NotificationsActiveIcon,
    MarkEmailRead as MarkEmailReadIcon,
    Delete as DeleteIcon,
    MoreVert as MoreVertIcon,
    Info as InfoIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    Settings as SettingsIcon,
    MarkEmailUnread as MarkEmailUnreadIcon
} from '@mui/icons-material';
import api from '../../config/axios';
import toast from 'react-hot-toast';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        pushNotifications: true,
        applicationUpdates: true,
        systemAlerts: true,
        weeklyDigest: false
    });

    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications');
            setNotifications(response.data.notifications || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await api.get('/notifications/unread-count');
            setUnreadCount(response.data.count || 0);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await api.put(`/notifications/${notificationId}/read`);
            setNotifications(prev =>
                prev.map(notification =>
                    notification.id === notificationId
                        ? { ...notification, isRead: true, readAt: new Date() }
                        : notification
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
            toast.success('Notification marked as read');
        } catch (error) {
            console.error('Error marking notification as read:', error);
            toast.error('Failed to mark notification as read');
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/mark-all-read');
            setNotifications(prev =>
                prev.map(notification => ({
                    ...notification,
                    isRead: true,
                    readAt: new Date()
                }))
            );
            setUnreadCount(0);
            toast.success('All notifications marked as read');
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            toast.error('Failed to mark all notifications as read');
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await api.delete(`/notifications/${notificationId}`);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            toast.success('Notification deleted');
        } catch (error) {
            console.error('Error deleting notification:', error);
            toast.error('Failed to delete notification');
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircleIcon color="success" />;
            case 'warning':
                return <WarningIcon color="warning" />;
            case 'error':
                return <ErrorIcon color="error" />;
            default:
                return <InfoIcon color="info" />;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'success':
                return 'success';
            case 'warning':
                return 'warning';
            case 'error':
                return 'error';
            default:
                return 'info';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)} hours ago`;
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString();
        }
    };

    const handleMenuOpen = (event, notification) => {
        setAnchorEl(event.currentTarget);
        setSelectedNotification(notification);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedNotification(null);
    };

    const handleSettingsChange = (setting) => {
        setNotificationSettings(prev => ({
            ...prev,
            [setting]: !prev[setting]
        }));
    };

    if (loading) {
        return (
            <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ py: 4 }}>
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" component="h1">
                    Notifications
                </Typography>
                    <Box>
                        <Button
                            startIcon={<SettingsIcon />}
                            onClick={() => setSettingsOpen(true)}
                            variant="outlined"
                            sx={{ mr: 2 }}
                        >
                            Settings
                        </Button>
                        {unreadCount > 0 && (
                            <Button
                                startIcon={<MarkEmailReadIcon />}
                                onClick={markAllAsRead}
                                variant="contained"
                            >
                                Mark All Read
                            </Button>
                        )}
                    </Box>
                </Box>

                {notifications.length === 0 ? (
                    <Card>
                        <CardContent sx={{ textAlign: 'center', py: 6 }}>
                            <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                No notifications yet
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                You'll see important updates and alerts here when they arrive.
                            </Typography>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <List>
                            {notifications.map((notification, index) => (
                                <React.Fragment key={notification.id}>
                                    <ListItem
                                        sx={{
                                            bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                                            '&:hover': {
                                                bgcolor: 'action.selected'
                                            }
                                        }}
                                    >
                                        <ListItemIcon>
                                            {getNotificationIcon(notification.type)}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="subtitle1">
                                                        {notification.title}
                                                    </Typography>
                                                    {!notification.isRead && (
                                                        <Chip
                                                            label="New"
                                                            size="small"
                                                            color="primary"
                                                            variant="outlined"
                                                        />
                                                    )}
                                                </Box>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {notification.message}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatDate(notification.createdAt)}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                        <ListItemSecondaryAction>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {!notification.isRead && (
                                                    <Tooltip title="Mark as read">
                                                        <IconButton
                                                            onClick={() => markAsRead(notification.id)}
                                                            size="small"
                                                        >
                                                            <MarkEmailReadIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                <IconButton
                                                    onClick={(e) => handleMenuOpen(e, notification)}
                                                    size="small"
                                                >
                                                    <MoreVertIcon />
                                                </IconButton>
                                            </Box>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    {index < notifications.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Card>
                )}

                {/* Notification Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    {selectedNotification && !selectedNotification.isRead && (
                        <MenuItem onClick={() => {
                            markAsRead(selectedNotification.id);
                            handleMenuClose();
                        }}>
                            <MarkEmailReadIcon sx={{ mr: 1 }} />
                            Mark as Read
                        </MenuItem>
                    )}
                    <MenuItem onClick={() => {
                        deleteNotification(selectedNotification.id);
                        handleMenuClose();
                    }}>
                        <DeleteIcon sx={{ mr: 1 }} />
                        Delete
                    </MenuItem>
                </Menu>

                {/* Notification Settings Dialog */}
                <Dialog
                    open={settingsOpen}
                    onClose={() => setSettingsOpen(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>Notification Settings</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Choose how you want to be notified about updates and activities.
                        </Typography>

                        <FormControl component="fieldset" fullWidth>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={notificationSettings.emailNotifications}
                                        onChange={() => handleSettingsChange('emailNotifications')}
                                    />
                                }
                                label="Email Notifications"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={notificationSettings.pushNotifications}
                                        onChange={() => handleSettingsChange('pushNotifications')}
                                    />
                                }
                                label="Push Notifications"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={notificationSettings.applicationUpdates}
                                        onChange={() => handleSettingsChange('applicationUpdates')}
                                    />
                                }
                                label="Application Updates"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={notificationSettings.systemAlerts}
                                        onChange={() => handleSettingsChange('systemAlerts')}
                                    />
                                }
                                label="System Alerts"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={notificationSettings.weeklyDigest}
                                        onChange={() => handleSettingsChange('weeklyDigest')}
                                    />
                                }
                                label="Weekly Digest"
                            />
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
                        <Button
                            onClick={() => {
                                setSettingsOpen(false);
                                toast.success('Notification settings updated');
                            }}
                            variant="contained"
                        >
                            Save Settings
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default Notifications;
