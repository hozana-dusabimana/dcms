import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Button,
    Alert,
    CircularProgress,
    Chip,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Tooltip,
    Divider,
    Avatar,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar
} from '@mui/material';
import {
    Event as EventIcon,
    LocationOn as LocationIcon,
    Person as PersonIcon,
    Comment as CommentIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Logout as LogoutIcon,
    Church as ChurchIcon
} from '@mui/icons-material';
import { useMemberAuth } from '../contexts/MemberAuthContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../config/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const MemberDashboard = () => {
    const { member, logout } = useMemberAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [commentDialogOpen, setCommentDialogOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [comment, setComment] = useState('');
    const [commentType, setCommentType] = useState('general');
    const [isAnonymous, setIsAnonymous] = useState(false);

    // Fetch church services
    const { data: servicesData, isLoading, error } = useQuery(
        'member-services',
        () => api.get('/service-comments/services').then(res => res.data),
        {
            enabled: !!member,
        }
    );

    const services = servicesData?.services || [];

    // Add comment mutation
    const addCommentMutation = useMutation(
        (commentData) => api.post('/service-comments', commentData),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('member-services');
                toast.success('Comment added successfully');
                setCommentDialogOpen(false);
                setComment('');
                setCommentType('general');
                setIsAnonymous(false);
                setSelectedService(null);
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to add comment');
            },
        }
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'scheduled': return 'primary';
            case 'in_progress': return 'warning';
            case 'completed': return 'success';
            case 'cancelled': return 'error';
            case 'postponed': return 'info';
            default: return 'default';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'marriage': return 'success';
            case 'baptism': return 'info';
            case 'funeral': return 'error';
            case 'communion': return 'primary';
            case 'prayer_meeting': return 'secondary';
            case 'bible_study': return 'warning';
            case 'youth_service': return 'info';
            default: return 'default';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const handleAddComment = (service) => {
        setSelectedService(service);
        setCommentDialogOpen(true);
    };

    const handleSubmitComment = () => {
        if (!comment.trim()) {
            toast.error('Please enter a comment');
            return;
        }

        addCommentMutation.mutate({
            serviceId: selectedService.id,
            comment: comment.trim(),
            commentType,
            isAnonymous
        });
    };

    const handleLogout = () => {
        logout();
        navigate('/member-login');
    };

    if (isLoading) {
        return (
            <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ py: 4 }}>
                <Container maxWidth="lg">
                    <Alert severity="error">
                        Failed to load church services: {error.message}
                    </Alert>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ py: 4, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <Container maxWidth="lg">
                {/* Header */}
                <Card sx={{ mb: 4 }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                                    Welcome, {member?.firstName} {member?.lastName}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <ChurchIcon color="primary" />
                                    <Typography variant="body1" color="text.secondary">
                                        {member?.church?.name}
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                    {member?.church?.address}
                                </Typography>
                            </Box>
                            <Button
                                variant="outlined"
                                startIcon={<LogoutIcon />}
                                onClick={handleLogout}
                                color="error"
                            >
                                Logout
                            </Button>
                        </Box>
                    </CardContent>
                </Card>

                {/* Services Section */}
                <Typography variant="h5" component="h2" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                    Upcoming Church Services
                </Typography>

                {services && services.length > 0 ? (
                    <Grid container spacing={3}>
                        {services.map((service) => (
                            <Grid item xs={12} md={6} lg={4} key={service.id}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                            <Typography variant="h6" component="h3" fontWeight="bold">
                                                {service.title}
                                            </Typography>
                                            <Chip
                                                label={service.status.replace('_', ' ').toUpperCase()}
                                                color={getStatusColor(service.status)}
                                                size="small"
                                            />
                                        </Box>

                                        <Chip
                                            label={service.serviceType.replace('_', ' ').toUpperCase()}
                                            color={getTypeColor(service.serviceType)}
                                            size="small"
                                            sx={{ mb: 2 }}
                                        />

                                        {service.description && (
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                {service.description}
                                            </Typography>
                                        )}

                                        <Box sx={{ mb: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                <EventIcon fontSize="small" color="action" />
                                                <Typography variant="body2" fontWeight="bold">
                                                    {formatDate(service.scheduledDate)}
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
                                                {formatTime(service.startTime)}
                                                {service.endTime && ` - ${formatTime(service.endTime)}`}
                                            </Typography>
                                        </Box>

                                        {service.location && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                <LocationIcon fontSize="small" color="action" />
                                                <Typography variant="body2">
                                                    {service.location}
                                                </Typography>
                                            </Box>
                                        )}

                                        {service.officiant && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                <PersonIcon fontSize="small" color="action" />
                                                <Typography variant="body2">
                                                    {service.officiant.firstName} {service.officiant.lastName}
                                                </Typography>
                                            </Box>
                                        )}

                                        {/* Comments Section */}
                                        {service.comments && service.comments.length > 0 && (
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                                                    Comments ({service.comments.length})
                                                </Typography>
                                                <List dense>
                                                    {service.comments.slice(0, 2).map((comment) => (
                                                        <ListItem key={comment.id} sx={{ px: 0 }}>
                                                            <ListItemAvatar>
                                                                <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                                                                    {comment.isAnonymous ? 'A' : comment.member.firstName[0]}
                                                                </Avatar>
                                                            </ListItemAvatar>
                                                            <ListItemText
                                                                primary={
                                                                    <Typography variant="body2">
                                                                        {comment.isAnonymous ? 'Anonymous' : `${comment.member.firstName} ${comment.member.lastName}`}
                                                                    </Typography>
                                                                }
                                                                secondary={
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        {comment.comment}
                                                                    </Typography>
                                                                }
                                                            />
                                                        </ListItem>
                                                    ))}
                                                </List>
                                                {service.comments.length > 2 && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        +{service.comments.length - 2} more comments
                                                    </Typography>
                                                )}
                                            </Box>
                                        )}
                                    </CardContent>

                                    <Box sx={{ p: 2, pt: 0 }}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            startIcon={<CommentIcon />}
                                            onClick={() => handleAddComment(service)}
                                            size="small"
                                        >
                                            Add Comment
                                        </Button>
                                    </Box>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Card>
                        <CardContent sx={{ textAlign: 'center', py: 6 }}>
                            <Typography variant="h6" gutterBottom>
                                No Church Services Found
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                There are no upcoming church services scheduled at this time.
                            </Typography>
                        </CardContent>
                    </Card>
                )}

                {/* Add Comment Dialog */}
                <Dialog open={commentDialogOpen} onClose={() => setCommentDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Add Comment for {selectedService?.title}</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Your Comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your thoughts, concerns, or suggestions about this service..."
                            margin="normal"
                        />

                        <FormControl fullWidth margin="normal">
                            <InputLabel>Comment Type</InputLabel>
                            <Select
                                value={commentType}
                                label="Comment Type"
                                onChange={(e) => setCommentType(e.target.value)}
                            >
                                <MenuItem value="general">General Comment</MenuItem>
                                <MenuItem value="concern">Concern</MenuItem>
                                <MenuItem value="suggestion">Suggestion</MenuItem>
                                <MenuItem value="cancellation_reason">Cancellation Reason</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth margin="normal">
                            <InputLabel>Post Anonymously</InputLabel>
                            <Select
                                value={isAnonymous}
                                label="Post Anonymously"
                                onChange={(e) => setIsAnonymous(e.target.value)}
                            >
                                <MenuItem value={false}>No (Show my name)</MenuItem>
                                <MenuItem value={true}>Yes (Post anonymously)</MenuItem>
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setCommentDialogOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleSubmitComment}
                            variant="contained"
                            disabled={addCommentMutation.isLoading}
                        >
                            {addCommentMutation.isLoading ? 'Adding...' : 'Add Comment'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default MemberDashboard;

