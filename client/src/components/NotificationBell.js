import React, { useState } from 'react';
import { IconButton, Badge, Tooltip } from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import { useQuery } from 'react-query';
import api from '../config/axios';
import NotificationCenter from './NotificationCenter';

const NotificationBell = () => {
    const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);

    // Fetch unread count
    const { data: unreadData } = useQuery(
        'notifications-unread-count',
        () => api.get('/notifications/unread-count').then(res => res.data),
        {
            refetchInterval: 10000, // Refetch every 10 seconds
        }
    );

    const unreadCount = unreadData?.count || 0;

    return (
        <>
            <Tooltip title="Notifications">
                <IconButton
                    color="inherit"
                    onClick={() => setNotificationCenterOpen(true)}
                >
                    <Badge badgeContent={unreadCount} color="error">
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
            </Tooltip>

            <NotificationCenter
                open={notificationCenterOpen}
                onClose={() => setNotificationCenterOpen(false)}
            />
        </>
    );
};

export default NotificationBell;






