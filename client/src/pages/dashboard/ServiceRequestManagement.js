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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Tooltip,
    Tabs,
    Tab,
    Badge,
    Avatar,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Divider
} from '@mui/material';
import {
    Assignment as AssignmentIcon,
    Event as EventIcon,
    LocationOn as LocationIcon,
    Person as PersonIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    Edit as EditIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Visibility as VisibilityIcon,
    FilterList as FilterIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../config/axios';
import toast from 'react-hot-toast';
import DashboardHeader from '../../components/DashboardHeader';
import { useAuth } from '../../contexts/AuthContext';

const ServiceRequestManagement = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const [selectedTab, setSelectedTab] = useState(0);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [filters, setFilters] = useState({
        status: '',
        serviceType: '',
        priority: ''
    });
    const [reviewForm, setReviewForm] = useState({
        status: '',
        reviewComments: '',
        rejectionReason: '',
        assignedToId: ''
    });

    // Fetch service requests
    const { data: requestsData, isLoading, error, refetch } = useQuery(
        'service-requests',
        () => api.get('/service-requests').then(res => res.data),
        {
            refetchInterval: 30000, // Refetch every 30 seconds
        }
    );

    const requests = requestsData?.requests || [];

    // Filter requests based on selected tab and filters
    const filteredRequests = requests.filter(request => {
        if (selectedTab === 0) return request.status === 'pending';
        if (selectedTab === 1) return request.status === 'under_review';
        if (selectedTab === 2) return ['approved', 'scheduled'].includes(request.status);
        if (selectedTab === 3) return ['completed', 'rejected', 'cancelled'].includes(request.status);

        if (filters.status && request.status !== filters.status) return false;
        if (filters.serviceType && request.serviceType !== filters.serviceType) return false;
        if (filters.priority && request.priority !== filters.priority) return false;

        return true;
    });

    // Update request mutation
    const updateRequestMutation = useMutation(
        ({ id, data }) => api.put(`/service-requests/${id}`, data),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('service-requests');
                toast.success('Service request updated successfully');
                setReviewDialogOpen(false);
                setDetailsDialogOpen(false);
                setReviewForm({
                    status: '',
                    reviewComments: '',
                    rejectionReason: '',
                    assignedToId: ''
                });
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to update service request');
            },
        }
    );

    const getStatusColor = (status) => {
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

    const getTypeColor = (type) => {
        switch (type) {
            case 'marriage': return 'success';
            case 'baptism': return 'info';
            case 'funeral': return 'error';
            case 'communion': return 'primary';
            case 'confirmation': return 'secondary';
            case 'dedication': return 'warning';
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

    const handleViewDetails = (request) => {
        setSelectedRequest(request);
        setDetailsDialogOpen(true);
    };

    const handleReviewRequest = (request) => {
        setSelectedRequest(request);
        setReviewForm({
            status: request.status,
            reviewComments: request.reviewComments || '',
            rejectionReason: request.rejectionReason || '',
            assignedToId: request.assignedToId || ''
        });
        setReviewDialogOpen(true);
    };

    const handleSubmitReview = () => {
        if (!reviewForm.status) {
            toast.error('Please select a status');
            return;
        }

        updateRequestMutation.mutate({
            id: selectedRequest.id,
            data: reviewForm
        });
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const getTabCounts = () => {
        return {
            pending: requests.filter(r => r.status === 'pending').length,
            underReview: requests.filter(r => r.status === 'under_review').length,
            approved: requests.filter(r => ['approved', 'scheduled'].includes(r.status)).length,
            completed: requests.filter(r => ['completed', 'rejected', 'cancelled'].includes(r.status)).length
        };
    };

    const counts = getTabCounts();

    // Check if user can edit requests (only church leaders and super admins)
    const canEditRequests = user?.userType === 'church_leader' || user?.userType === 'super_admin';

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
                        Failed to load service requests: {error.message}
                    </Alert>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ py: 4 }}>
            <Container maxWidth="lg">
                <DashboardHeader
                    title="Service Request Management"
                    subtitle="Manage and review service requests from church members"
                    showBackButton={true}
                />

                {/* Tabs */}
                <Paper sx={{ mb: 3 }}>
                    <Tabs
                        value={selectedTab}
                        onChange={(e, newValue) => setSelectedTab(newValue)}
                        variant="fullWidth"
                    >
                        <Tab
                            label={
                                <Badge badgeContent={counts.pending} color="warning">
                                    Pending
                                </Badge>
                            }
                        />
                        <Tab
                            label={
                                <Badge badgeContent={counts.underReview} color="info">
                                    Under Review
                                </Badge>
                            }
                        />
                        <Tab
                            label={
                                <Badge badgeContent={counts.approved} color="success">
                                    Approved
                                </Badge>
                            }
                        />
                        <Tab
                            label={
                                <Badge badgeContent={counts.completed} color="default">
                                    Completed
                                </Badge>
                            }
                        />
                    </Tabs>
                </Paper>

                {/* Filters */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={filters.status}
                                        label="Status"
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                    >
                                        <MenuItem value="">All Statuses</MenuItem>
                                        <MenuItem value="pending">Pending</MenuItem>
                                        <MenuItem value="under_review">Under Review</MenuItem>
                                        <MenuItem value="approved">Approved</MenuItem>
                                        <MenuItem value="scheduled">Scheduled</MenuItem>
                                        <MenuItem value="completed">Completed</MenuItem>
                                        <MenuItem value="rejected">Rejected</MenuItem>
                                        <MenuItem value="cancelled">Cancelled</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Service Type</InputLabel>
                                    <Select
                                        value={filters.serviceType}
                                        label="Service Type"
                                        onChange={(e) => handleFilterChange('serviceType', e.target.value)}
                                    >
                                        <MenuItem value="">All Types</MenuItem>
                                        <MenuItem value="baptism">Baptism</MenuItem>
                                        <MenuItem value="marriage">Marriage</MenuItem>
                                        <MenuItem value="funeral">Funeral</MenuItem>
                                        <MenuItem value="communion">Communion</MenuItem>
                                        <MenuItem value="confirmation">Confirmation</MenuItem>
                                        <MenuItem value="dedication">Dedication</MenuItem>
                                        <MenuItem value="other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Priority</InputLabel>
                                    <Select
                                        value={filters.priority}
                                        label="Priority"
                                        onChange={(e) => handleFilterChange('priority', e.target.value)}
                                    >
                                        <MenuItem value="">All Priorities</MenuItem>
                                        <MenuItem value="low">Low</MenuItem>
                                        <MenuItem value="medium">Medium</MenuItem>
                                        <MenuItem value="high">High</MenuItem>
                                        <MenuItem value="urgent">Urgent</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <Button
                                    variant="outlined"
                                    startIcon={<RefreshIcon />}
                                    onClick={() => refetch()}
                                    fullWidth
                                >
                                    Refresh
                                </Button>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Requests Table */}
                <Card>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Request #</TableCell>
                                    <TableCell>Member</TableCell>
                                    <TableCell>Service Type</TableCell>
                                    <TableCell>Title</TableCell>
                                    <TableCell>Priority</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Requested Date</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredRequests.map((request) => (
                                    <TableRow key={request.id}>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="bold">
                                                {request.requestNumber}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                                                    {request.member?.firstName?.[0]}{request.member?.lastName?.[0]}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {request.member?.firstName} {request.member?.lastName}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {request.member?.church?.name}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={request.serviceType.replace('_', ' ').toUpperCase()}
                                                color={getTypeColor(request.serviceType)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {request.title}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={request.status.replace('_', ' ').toUpperCase()}
                                                color={getStatusColor(request.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {request.requestedDate ? formatDate(request.requestedDate) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Tooltip title="View Details">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleViewDetails(request)}
                                                    >
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                {canEditRequests && ['pending', 'under_review'].includes(request.status) && (
                                                    <Tooltip title="Review Request">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleReviewRequest(request)}
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>

                {filteredRequests.length === 0 && (
                    <Card sx={{ mt: 3 }}>
                        <CardContent sx={{ textAlign: 'center', py: 6 }}>
                            <Typography variant="h6" gutterBottom>
                                No Service Requests Found
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                There are no service requests matching your current filters.
                            </Typography>
                        </CardContent>
                    </Card>
                )}

                {/* Request Details Dialog */}
                <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
                    <DialogTitle>Service Request Details</DialogTitle>
                    <DialogContent>
                        {selectedRequest && (
                            <Box sx={{ mt: 2 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2" fontWeight="bold">Request Number:</Typography>
                                        <Typography variant="body2" sx={{ mb: 2 }}>{selectedRequest.requestNumber}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2" fontWeight="bold">Status:</Typography>
                                        <Chip
                                            label={selectedRequest.status.replace('_', ' ').toUpperCase()}
                                            color={getStatusColor(selectedRequest.status)}
                                            size="small"
                                            sx={{ mb: 2 }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2" fontWeight="bold">Service Type:</Typography>
                                        <Chip
                                            label={selectedRequest.serviceType.replace('_', ' ').toUpperCase()}
                                            color={getTypeColor(selectedRequest.serviceType)}
                                            size="small"
                                            sx={{ mb: 2 }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2" fontWeight="bold">Priority:</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                            <Chip
                                                label={selectedRequest.priority.toUpperCase()}
                                                color={getPriorityColor(selectedRequest.priority)}
                                                size="small"
                                            />
                                            {selectedRequest.isUrgent && (
                                                <Chip label="URGENT" color="error" size="small" />
                                            )}
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" fontWeight="bold">Title:</Typography>
                                        <Typography variant="body2" sx={{ mb: 2 }}>{selectedRequest.title}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" fontWeight="bold">Description:</Typography>
                                        <Typography variant="body2" sx={{ mb: 2 }}>{selectedRequest.description || 'No description provided'}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2" fontWeight="bold">Requested Date:</Typography>
                                        <Typography variant="body2" sx={{ mb: 2 }}>
                                            {selectedRequest.requestedDate ? formatDate(selectedRequest.requestedDate) : 'Not specified'}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2" fontWeight="bold">Preferred Time:</Typography>
                                        <Typography variant="body2" sx={{ mb: 2 }}>
                                            {selectedRequest.preferredTime ? formatTime(selectedRequest.preferredTime) : 'Not specified'}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2" fontWeight="bold">Location:</Typography>
                                        <Typography variant="body2" sx={{ mb: 2 }}>{selectedRequest.location || 'Not specified'}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2" fontWeight="bold">Estimated Attendees:</Typography>
                                        <Typography variant="body2" sx={{ mb: 2 }}>{selectedRequest.estimatedAttendees || 'Not specified'}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2" fontWeight="bold">Contact Phone:</Typography>
                                        <Typography variant="body2" sx={{ mb: 2 }}>{selectedRequest.contactPhone || 'Not provided'}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2" fontWeight="bold">Contact Email:</Typography>
                                        <Typography variant="body2" sx={{ mb: 2 }}>{selectedRequest.contactEmail || 'Not provided'}</Typography>
                                    </Grid>
                                    {selectedRequest.specialRequirements && (
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle2" fontWeight="bold">Special Requirements:</Typography>
                                            <Typography variant="body2" sx={{ mb: 2 }}>{selectedRequest.specialRequirements}</Typography>
                                        </Grid>
                                    )}
                                    {selectedRequest.reviewComments && (
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle2" fontWeight="bold">Review Comments:</Typography>
                                            <Typography variant="body2" sx={{ mb: 2 }}>{selectedRequest.reviewComments}</Typography>
                                        </Grid>
                                    )}
                                    {selectedRequest.rejectionReason && (
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle2" fontWeight="bold" color="error">Rejection Reason:</Typography>
                                            <Typography variant="body2" color="error" sx={{ mb: 2 }}>{selectedRequest.rejectionReason}</Typography>
                                        </Grid>
                                    )}
                                </Grid>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
                        {canEditRequests && selectedRequest && ['pending', 'under_review'].includes(selectedRequest.status) && (
                            <Button
                                variant="contained"
                                onClick={() => {
                                    setDetailsDialogOpen(false);
                                    handleReviewRequest(selectedRequest);
                                }}
                            >
                                Review Request
                            </Button>
                        )}
                    </DialogActions>
                </Dialog>

                {/* Review Dialog */}
                <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Review Service Request</DialogTitle>
                    <DialogContent>
                        <Box sx={{ mt: 2 }}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={reviewForm.status}
                                    label="Status"
                                    onChange={(e) => setReviewForm(prev => ({ ...prev, status: e.target.value }))}
                                >
                                    <MenuItem value="under_review">Under Review</MenuItem>
                                    <MenuItem value="approved">Approved</MenuItem>
                                    <MenuItem value="scheduled">Scheduled</MenuItem>
                                    <MenuItem value="rejected">Rejected</MenuItem>
                                    <MenuItem value="cancelled">Cancelled</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Review Comments"
                                value={reviewForm.reviewComments}
                                onChange={(e) => setReviewForm(prev => ({ ...prev, reviewComments: e.target.value }))}
                                placeholder="Add your review comments..."
                                margin="normal"
                            />

                            {reviewForm.status === 'rejected' && (
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={2}
                                    label="Rejection Reason"
                                    value={reviewForm.rejectionReason}
                                    onChange={(e) => setReviewForm(prev => ({ ...prev, rejectionReason: e.target.value }))}
                                    placeholder="Please provide a reason for rejection..."
                                    margin="normal"
                                    required
                                />
                            )}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleSubmitReview}
                            variant="contained"
                            disabled={updateRequestMutation.isLoading}
                        >
                            {updateRequestMutation.isLoading ? 'Updating...' : 'Update Request'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default ServiceRequestManagement;
