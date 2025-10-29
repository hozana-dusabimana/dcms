import React, { useState, useEffect } from 'react';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    IconButton,
    Badge,
    Typography,
    Divider,
    Button,
    Chip,
    Tooltip,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    Close as CloseIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Warning as WarningIcon,
    Info as InfoIcon,
    MarkEmailRead as MarkReadIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../config/axios';
import toast from 'react-hot-toast';

const NotificationCenter = ({ open, onClose }) => {
    const queryClient = useQueryClient();
    const [selectedNotification, setSelectedNotification] = useState(null);

    // Fetch notifications
    const { data: notificationsData, isLoading, error } = useQuery(
        'notifications',
        () => api.get('/notifications?limit=50').then(res => res.data),
        {
            refetchInterval: 30000, // Refetch every 30 seconds
            enabled: open
        }
    );

    // Fetch unread count
    const { data: unreadData } = useQuery(
        'notifications-unread-count',
        () => api.get('/notifications/unread-count').then(res => res.data),
        {
            refetchInterval: 10000, // Refetch every 10 seconds
        }
    );

    const notifications = notificationsData?.notifications || [];
    const unreadCount = unreadData?.count || 0;

    // Mark as read mutation
    const markAsReadMutation = useMutation(
        (id) => api.put(`/notifications/${id}/read`),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('notifications');
                queryClient.invalidateQueries('notifications-unread-count');
            },
            onError: (error) => {
                toast.error('Failed to mark notification as read');
            }
        }
    );

    // Mark all as read mutation
    const markAllAsReadMutation = useMutation(
        () => api.put('/notifications/mark-all-read'),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('notifications');
                queryClient.invalidateQueries('notifications-unread-count');
                toast.success('All notifications marked as read');
            },
            onError: (error) => {
                toast.error('Failed to mark all notifications as read');
            }
        }
    );

    // Delete notification mutation
    const deleteNotificationMutation = useMutation(
        (id) => api.delete(`/notifications/${id}`),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('notifications');
                queryClient.invalidateQueries('notifications-unread-count');
                toast.success('Notification deleted');
            },
            onError: (error) => {
                toast.error('Failed to delete notification');
            }
        }
    );

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircleIcon color="success" />;
            case 'error':
                return <ErrorIcon color="error" />;
            case 'warning':
                return <WarningIcon color="warning" />;
            default:
                return <InfoIcon color="info" />;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'success':
                return 'success';
            case 'error':
                return 'error';
            case 'warning':
                return 'warning';
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

    const handleMarkAsRead = (notification) => {
        if (!notification.isRead) {
            markAsReadMutation.mutate(notification.id);
        }
    };

    const handleDelete = (notificationId) => {
        deleteNotificationMutation.mutate(notificationId);
    };

    const handleMarkAllAsRead = () => {
        markAllAsReadMutation.mutate();
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { width: 400, maxWidth: '90vw' }
            }}
        >
            <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                        Notifications
                        {unreadCount > 0 && (
                            <Chip
                                label={unreadCount}
                                color="primary"
                                size="small"
                                sx={{ ml: 1 }}
                            />
                        )}
                    </Typography>
                    <Box>
                        {unreadCount > 0 && (
                            <Button
                                size="small"
                                startIcon={<MarkReadIcon />}
                                onClick={handleMarkAllAsRead}
                                disabled={markAllAsReadMutation.isLoading}
                                sx={{ mr: 1 }}
                            >
                                Mark All Read
                            </Button>
                        )}
                        <IconButton onClick={onClose}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error">
                        Failed to load notifications
                    </Alert>
                ) : notifications.length === 0 ? (
                    <Box sx={{ textAlign: 'center', p: 3 }}>
                        <Typography color="text.secondary">
                            No notifications yet
                        </Typography>
                    </Box>
                ) : (
                    <List>
                        {notifications.map((notification) => (
                            <ListItem
                                key={notification.id}
                                sx={{
                                    backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                                    borderRadius: 1,
                                    mb: 1,
                                    cursor: 'pointer',
                                    '&:hover': {
                                        backgroundColor: 'action.selected'
                                    }
                                }}
                                onClick={() => handleMarkAsRead(notification)}
                            >
                                <ListItemIcon>
                                    {getNotificationIcon(notification.type)}
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    fontWeight: notification.isRead ? 'normal' : 'bold',
                                                    color: notification.isRead ? 'text.primary' : 'primary.main'
                                                }}
                                            >
                                                {notification.title}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                                                <Tooltip title="Delete">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(notification.id);
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Box>
                                    }
                                    secondary={
                                        <Box>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ mb: 0.5 }}
                                            >
                                                {notification.message}
                                            </Typography>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatDate(notification.createdAt)}
                                                </Typography>
                                                <Chip
                                                    label={notification.type}
                                                    color={getNotificationColor(notification.type)}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </Box>
                                        </Box>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </Box>
        </Drawer>
    );
};

export default NotificationCenter;






