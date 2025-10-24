import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Chip,
    Divider,
} from '@mui/material';
import { Send as SendIcon, Person as PersonIcon } from '@mui/icons-material';

const Messages = () => {
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [newMessage, setNewMessage] = useState('');

    // Mock data - in real app, this would come from API
    const messages = [
        {
            id: 1,
            sender: 'Pastor John',
            senderType: 'church_leader',
            subject: 'Marriage Application Update',
            content: 'Your marriage application has been reviewed and approved by the church. Please proceed with the civil registration.',
            timestamp: '2024-01-15 10:30 AM',
            isRead: false,
        },
        {
            id: 2,
            sender: 'Civil Admin',
            senderType: 'civil_admin',
            subject: 'Document Verification',
            content: 'We need additional documents for your marriage registration. Please upload your birth certificates.',
            timestamp: '2024-01-14 2:15 PM',
            isRead: true,
        },
        {
            id: 3,
            sender: 'System',
            senderType: 'system',
            subject: 'Application Status Update',
            content: 'Your marriage application status has been updated to "Under Review".',
            timestamp: '2024-01-13 9:00 AM',
            isRead: true,
        },
    ];

    const getSenderTypeColor = (type) => {
        switch (type) {
            case 'church_leader':
                return 'primary';
            case 'civil_admin':
                return 'secondary';
            case 'system':
                return 'success';
            default:
                return 'default';
        }
    };

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            // In real app, this would send the message via API
            console.log('Sending message:', newMessage);
            setNewMessage('');
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Messages
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Communicate with church leaders, civil administrators, and receive system notifications
            </Typography>

            <Grid container spacing={3}>
                {/* Messages List */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Inbox ({messages.filter(m => !m.isRead).length} unread)
                            </Typography>
                            <List>
                                {messages.map((message, index) => (
                                    <React.Fragment key={message.id}>
                                        <ListItem
                                            button
                                            onClick={() => setSelectedMessage(message)}
                                            sx={{
                                                bgcolor: selectedMessage?.id === message.id ? 'action.hover' : 'transparent',
                                                borderRadius: 1,
                                                mb: 1,
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: `${getSenderTypeColor(message.senderType)}.main` }}>
                                                    <PersonIcon />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="subtitle2" fontWeight={message.isRead ? 'normal' : 'bold'}>
                                                            {message.sender}
                                                        </Typography>
                                                        {!message.isRead && (
                                                            <Chip label="New" size="small" color="primary" />
                                                        )}
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary" noWrap>
                                                            {message.subject}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {message.timestamp}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                        {index < messages.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Message Content */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            {selectedMessage ? (
                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                        <Typography variant="h6">
                                            {selectedMessage.subject}
                                        </Typography>
                                        <Chip
                                            label={selectedMessage.senderType}
                                            color={getSenderTypeColor(selectedMessage.senderType)}
                                            size="small"
                                        />
                                    </Box>

                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            From: {selectedMessage.sender}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Date: {selectedMessage.timestamp}
                                        </Typography>
                                    </Box>

                                    <Divider sx={{ mb: 3 }} />

                                    <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.6 }}>
                                        {selectedMessage.content}
                                    </Typography>

                                    <Divider sx={{ mb: 3 }} />

                                    <Typography variant="h6" gutterBottom>
                                        Reply
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={3}
                                            placeholder="Type your reply..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                        />
                                        <Button
                                            variant="contained"
                                            startIcon={<SendIcon />}
                                            onClick={handleSendMessage}
                                            disabled={!newMessage.trim()}
                                            sx={{ alignSelf: 'flex-start' }}
                                        >
                                            Send
                                        </Button>
                                    </Box>
                                </Box>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 8 }}>
                                    <Typography variant="h6" color="text.secondary">
                                        Select a message to view its content
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Messages;
