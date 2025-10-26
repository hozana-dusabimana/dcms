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
    ListItemAvatar,
    Tabs,
    Tab,
    Switch,
    FormControlLabel,
    Paper
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
    Church as ChurchIcon,
    RequestQuote as RequestIcon,
    Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useMemberAuth } from '../contexts/MemberAuthContext';
import MemberNotificationBell from '../components/MemberNotificationBell';
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

    // Service Request states
    const [requestDialogOpen, setRequestDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0); // 0: Services, 1: My Requests
    const [requestForm, setRequestForm] = useState({
        serviceType: 'baptism',
        title: '',
        description: '',
        requestedDate: '',
        preferredTime: '',
        location: '',
        priority: 'medium',
        specialRequirements: '',
        contactPhone: '',
        contactEmail: '',
        estimatedAttendees: '',
        isUrgent: false
    });

    // Fetch church services
    const { data: servicesData, isLoading, error } = useQuery(
        'member-services',
        () => api.get('/service-comments/services').then(res => res.data),
        {
            enabled: !!member,
        }
    );

    // Fetch member's service requests
    const { data: requestsData, isLoading: requestsLoading, error: requestsError } = useQuery(
        'member-requests',
        () => api.get('/service-requests/member').then(res => res.data),
        {
            enabled: !!member,
        }
    );

    const services = servicesData?.services || [];
    const requests = requestsData?.requests || [];

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

    // Add service request mutation
    const addRequestMutation = useMutation(
        (requestData) => api.post('/service-requests', requestData),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('member-requests');
                toast.success('Service request submitted successfully');
                setRequestDialogOpen(false);
                setRequestForm({
                    serviceType: 'baptism',
                    title: '',
                    description: '',
                    requestedDate: '',
                    preferredTime: '',
                    location: '',
                    priority: 'medium',
                    specialRequirements: '',
                    contactPhone: '',
                    contactEmail: '',
                    estimatedAttendees: '',
                    isUrgent: false
                });
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to submit service request');
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

    const handleRequestService = () => {
        setRequestDialogOpen(true);
    };

    const handleSubmitRequest = () => {
        if (!requestForm.title.trim()) {
            toast.error('Please enter a title for your request');
            return;
        }

        addRequestMutation.mutate(requestForm);
    };

    const handleRequestFormChange = (field, value) => {
        setRequestForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const getRequestStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'under_review': return 'info';
            case 'approved': return 'success';
            case 'scheduled': return 'primary';
            case 'completed': return 'success';
            case 'rejected': return 'error';
            case 'cancelled': return 'default';
            default: return 'default';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'low': return 'success';
            case 'medium': return 'info';
            case 'high': return 'warning';
            case 'urgent': return 'error';
            default: return 'default';
        }
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
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <MemberNotificationBell />
                                <Button
                                    variant="outlined"
                                    startIcon={<LogoutIcon />}
                                    onClick={handleLogout}
                                    color="error"
                                >
                                    Logout
                                </Button>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                {/* Tabs Section */}
                <Paper sx={{ mb: 3 }}>
                    <Tabs
                        value={activeTab}
                        onChange={(e, newValue) => setActiveTab(newValue)}
                        variant="fullWidth"
                    >
                        <Tab
                            label="Church Services"
                            icon={<EventIcon />}
                            iconPosition="start"
                        />
                        <Tab
                            label="My Service Requests"
                            icon={<RequestIcon />}
                            iconPosition="start"
                        />
                    </Tabs>
                </Paper>

                {/* Services Section */}
                {activeTab === 0 && (
                    <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h5" component="h2" fontWeight="bold">
                                Upcoming Church Services
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<RequestIcon />}
                                onClick={handleRequestService}
                                color="primary"
                            >
                                Request Service
                            </Button>
                        </Box>
                    </>
                )}

                {/* Service Requests Section */}
                {activeTab === 1 && (
                    <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h5" component="h2" fontWeight="bold">
                                My Service Requests
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleRequestService}
                                color="primary"
                            >
                                New Request
                            </Button>
                        </Box>
                    </>
                )}

                {/* Services Tab Content */}
                {activeTab === 0 && (
                    <>
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
                    </>
                )}

                {/* Service Requests Tab Content */}
                {activeTab === 1 && (
                    <>
                        {requestsLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : requestsError ? (
                            <Alert severity="error">
                                Failed to load service requests: {requestsError.message}
                            </Alert>
                        ) : requests && requests.length > 0 ? (
                            <Grid container spacing={3}>
                                {requests.map((request) => (
                                    <Grid item xs={12} md={6} lg={4} key={request.id}>
                                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                            <CardContent sx={{ flexGrow: 1 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                    <Typography variant="h6" component="h3" fontWeight="bold">
                                                        {request.title}
                                                    </Typography>
                                                    <Chip
                                                        label={request.status.replace('_', ' ').toUpperCase()}
                                                        color={getRequestStatusColor(request.status)}
                                                        size="small"
                                                    />
                                                </Box>

                                                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                                    <Chip
                                                        label={request.serviceType.replace('_', ' ').toUpperCase()}
                                                        color={getTypeColor(request.serviceType)}
                                                        size="small"
                                                    />
                                                    <Chip
                                                        label={request.priority.toUpperCase()}
                                                        color={getPriorityColor(request.priority)}
                                                        size="small"
                                                    />
                                                    {request.isUrgent && (
                                                        <Chip
                                                            label="URGENT"
                                                            color="error"
                                                            size="small"
                                                        />
                                                    )}
                                                </Box>

                                                {request.description && (
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                        {request.description}
                                                    </Typography>
                                                )}

                                                {request.requestedDate && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                        <EventIcon fontSize="small" color="action" />
                                                        <Typography variant="body2" fontWeight="bold">
                                                            {formatDate(request.requestedDate)}
                                                        </Typography>
                                                    </Box>
                                                )}

                                                {request.preferredTime && (
                                                    <Typography variant="body2" color="text.secondary" sx={{ ml: 3, mb: 2 }}>
                                                        Preferred time: {formatTime(request.preferredTime)}
                                                    </Typography>
                                                )}

                                                {request.location && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                        <LocationIcon fontSize="small" color="action" />
                                                        <Typography variant="body2">
                                                            {request.location}
                                                        </Typography>
                                                    </Box>
                                                )}

                                                {request.estimatedAttendees && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                        <PersonIcon fontSize="small" color="action" />
                                                        <Typography variant="body2">
                                                            {request.estimatedAttendees} attendees expected
                                                        </Typography>
                                                    </Box>
                                                )}

                                                {request.specialRequirements && (
                                                    <Box sx={{ mb: 2 }}>
                                                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                                                            Special Requirements:
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {request.specialRequirements}
                                                        </Typography>
                                                    </Box>
                                                )}

                                                {request.reviewComments && (
                                                    <Box sx={{ mb: 2 }}>
                                                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                                                            Review Comments:
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {request.reviewComments}
                                                        </Typography>
                                                    </Box>
                                                )}

                                                {request.rejectionReason && (
                                                    <Alert severity="error" sx={{ mb: 2 }}>
                                                        <Typography variant="subtitle2" fontWeight="bold">
                                                            Rejection Reason:
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            {request.rejectionReason}
                                                        </Typography>
                                                    </Alert>
                                                )}
                                            </CardContent>

                                            <Box sx={{ p: 2, pt: 0 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Request #{request.requestNumber}
                                                </Typography>
                                            </Box>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Card>
                                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                                    <Typography variant="h6" gutterBottom>
                                        No Service Requests Found
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                        You haven't submitted any service requests yet.
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        startIcon={<AddIcon />}
                                        onClick={handleRequestService}
                                    >
                                        Submit Your First Request
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </>
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

                {/* Service Request Dialog */}
                <Dialog open={requestDialogOpen} onClose={() => setRequestDialogOpen(false)} maxWidth="md" fullWidth>
                    <DialogTitle>Request a Church Service</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Service Type</InputLabel>
                                    <Select
                                        value={requestForm.serviceType}
                                        label="Service Type"
                                        onChange={(e) => handleRequestFormChange('serviceType', e.target.value)}
                                    >
                                        <MenuItem value="baptism">Baptism</MenuItem>
                                        <MenuItem value="marriage">Marriage Ceremony</MenuItem>
                                        <MenuItem value="funeral">Funeral Service</MenuItem>
                                        <MenuItem value="communion">Communion</MenuItem>
                                        <MenuItem value="confirmation">Confirmation</MenuItem>
                                        <MenuItem value="dedication">Dedication</MenuItem>
                                        <MenuItem value="other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Priority</InputLabel>
                                    <Select
                                        value={requestForm.priority}
                                        label="Priority"
                                        onChange={(e) => handleRequestFormChange('priority', e.target.value)}
                                    >
                                        <MenuItem value="low">Low</MenuItem>
                                        <MenuItem value="medium">Medium</MenuItem>
                                        <MenuItem value="high">High</MenuItem>
                                        <MenuItem value="urgent">Urgent</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Service Title"
                                    value={requestForm.title}
                                    onChange={(e) => handleRequestFormChange('title', e.target.value)}
                                    placeholder="e.g., Baptism of John Smith"
                                    margin="normal"
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Description"
                                    value={requestForm.description}
                                    onChange={(e) => handleRequestFormChange('description', e.target.value)}
                                    placeholder="Please provide details about the service you're requesting..."
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Requested Date"
                                    type="date"
                                    value={requestForm.requestedDate}
                                    onChange={(e) => handleRequestFormChange('requestedDate', e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Preferred Time"
                                    type="time"
                                    value={requestForm.preferredTime}
                                    onChange={(e) => handleRequestFormChange('preferredTime', e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Location"
                                    value={requestForm.location}
                                    onChange={(e) => handleRequestFormChange('location', e.target.value)}
                                    placeholder="e.g., Main Church Hall"
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Estimated Attendees"
                                    type="number"
                                    value={requestForm.estimatedAttendees}
                                    onChange={(e) => handleRequestFormChange('estimatedAttendees', e.target.value)}
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Contact Phone"
                                    value={requestForm.contactPhone}
                                    onChange={(e) => handleRequestFormChange('contactPhone', e.target.value)}
                                    placeholder={member?.phone || "Your phone number"}
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Contact Email"
                                    type="email"
                                    value={requestForm.contactEmail}
                                    onChange={(e) => handleRequestFormChange('contactEmail', e.target.value)}
                                    placeholder={member?.email || "Your email address"}
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={2}
                                    label="Special Requirements"
                                    value={requestForm.specialRequirements}
                                    onChange={(e) => handleRequestFormChange('specialRequirements', e.target.value)}
                                    placeholder="Any special requirements or accommodations needed..."
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={requestForm.isUrgent}
                                            onChange={(e) => handleRequestFormChange('isUrgent', e.target.checked)}
                                        />
                                    }
                                    label="This is an urgent request"
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setRequestDialogOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleSubmitRequest}
                            variant="contained"
                            disabled={addRequestMutation.isLoading}
                        >
                            {addRequestMutation.isLoading ? 'Submitting...' : 'Submit Request'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default MemberDashboard;


