import React, { useState } from 'react';
import { IconButton, Badge, Tooltip } from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import { useQuery } from 'react-query';
import { useMemberAuth } from '../contexts/MemberAuthContext';
import MemberNotificationCenter from './MemberNotificationCenter';

const MemberNotificationBell = () => {
    const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
    const { member, token } = useMemberAuth();

    // Fetch unread count
    const { data: unreadData } = useQuery(
        'member-notifications-unread-count',
        () => {
            if (!token) return Promise.resolve({ count: 0 });
            return fetch('/api/member-notifications/unread-count', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json());
        },
        {
            refetchInterval: 10000, // Refetch every 10 seconds
            enabled: !!token // Only run if member is authenticated
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

            <MemberNotificationCenter
                open={notificationCenterOpen}
                onClose={() => setNotificationCenterOpen(false)}
            />
        </>
    );
};

export default MemberNotificationBell;
