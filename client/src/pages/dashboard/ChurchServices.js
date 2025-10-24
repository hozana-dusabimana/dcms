import React, { useState, useMemo } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Button,
    Chip,
    Alert,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Tooltip,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Divider,
    Badge,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Event as EventIcon,
    Person as PersonIcon,
    LocationOn as LocationIcon,
    Comment as CommentIcon,
    Visibility as ViewIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../config/axios';
import toast from 'react-hot-toast';
import DashboardHeader from '../../components/DashboardHeader';
import { useNavigate } from 'react-router-dom';

const ChurchServices = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Search and filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);
    const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);

    // Fetch church services with comments
    const { data: servicesData, isLoading, error } = useQuery(
        'church-services',
        () => api.get('/church-services').then(res => res.data),
        {
            enabled: !!user,
        }
    );

    // Fetch comments for selected service
    const { data: commentsData, isLoading: commentsLoading } = useQuery(
        ['service-comments', selectedService?.id],
        () => api.get(`/church-services/${selectedService.id}/comments`).then(res => res.data),
        {
            enabled: !!selectedService,
        }
    );

    const services = servicesData?.services || [];

    // Delete service mutation
    const deleteMutation = useMutation(
        (serviceId) => api.delete(`/church-services/${serviceId}`),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('church-services');
                toast.success('Church service deleted successfully');
                setDeleteDialogOpen(false);
                setServiceToDelete(null);
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to delete church service');
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

    // Filter services based on search term and filters
    const filteredServices = useMemo(() => {
        return services.filter(service => {
            const matchesSearch = searchTerm === '' ||
                service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                service.location?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
            const matchesType = typeFilter === 'all' || service.serviceType === typeFilter;

            return matchesSearch && matchesStatus && matchesType;
        });
    }, [services, searchTerm, statusFilter, typeFilter]);

    const handleCreateService = () => {
        navigate('/dashboard/church-services/new');
    };

    const handleEditService = (serviceId) => {
        navigate(`/dashboard/church-services/${serviceId}/edit`);
    };

    const handleDeleteService = (service) => {
        setServiceToDelete(service);
        setDeleteDialogOpen(true);
    };

    const handleViewComments = (service) => {
        setSelectedService(service);
        setCommentsDialogOpen(true);
    };

    const confirmDelete = () => {
        if (serviceToDelete) {
            deleteMutation.mutate(serviceToDelete.id);
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

    const getCommentTypeColor = (type) => {
        switch (type) {
            case 'general': return 'default';
            case 'concern': return 'error';
            case 'suggestion': return 'info';
            case 'cancellation_reason': return 'warning';
            default: return 'default';
        }
    };

    const formatCommentDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
        <Box sx={{ py: 4 }}>
            <Container maxWidth="lg">
                <DashboardHeader
                    title="Church Services"
                    subtitle="Manage scheduled ceremonies and services"
                    actionButton={
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleCreateService}
                        >
                            Add Service
                        </Button>
                    }
                />

                {/* Search and Filter Section */}
                {services && services.length > 0 && (
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        placeholder="Search services..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Status Filter</InputLabel>
                                        <Select
                                            value={statusFilter}
                                            label="Status Filter"
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                        >
                                            <MenuItem value="all">All Statuses</MenuItem>
                                            <MenuItem value="scheduled">Scheduled</MenuItem>
                                            <MenuItem value="in_progress">In Progress</MenuItem>
                                            <MenuItem value="completed">Completed</MenuItem>
                                            <MenuItem value="cancelled">Cancelled</MenuItem>
                                            <MenuItem value="postponed">Postponed</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Type Filter</InputLabel>
                                        <Select
                                            value={typeFilter}
                                            label="Type Filter"
                                            onChange={(e) => setTypeFilter(e.target.value)}
                                        >
                                            <MenuItem value="all">All Types</MenuItem>
                                            <MenuItem value="marriage">Marriage</MenuItem>
                                            <MenuItem value="baptism">Baptism</MenuItem>
                                            <MenuItem value="funeral">Funeral</MenuItem>
                                            <MenuItem value="communion">Communion</MenuItem>
                                            <MenuItem value="prayer_meeting">Prayer Meeting</MenuItem>
                                            <MenuItem value="bible_study">Bible Study</MenuItem>
                                            <MenuItem value="youth_service">Youth Service</MenuItem>
                                            <MenuItem value="other">Other</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <Typography variant="body2" color="text.secondary">
                                        Showing {filteredServices.length} of {services.length} services
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                )}

                {filteredServices && filteredServices.length > 0 ? (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Service</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Date & Time</TableCell>
                                    <TableCell>Location</TableCell>
                                    <TableCell>Officiant</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Attendees</TableCell>
                                    <TableCell>Comments</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredServices.map((service) => (
                                    <TableRow key={service.id}>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight="bold">
                                                    {service.title}
                                                </Typography>
                                                {service.description && (
                                                    <Typography variant="body2" color="text.secondary" noWrap>
                                                        {service.description}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={service.serviceType.replace('_', ' ').toUpperCase()}
                                                color={getTypeColor(service.serviceType)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2" fontWeight="bold">
                                                    {formatDate(service.scheduledDate)}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {formatTime(service.startTime)}
                                                    {service.endTime && ` - ${formatTime(service.endTime)}`}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <LocationIcon fontSize="small" color="action" />
                                                <Typography variant="body2">
                                                    {service.location || 'Main Hall'}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            {service.officiant ? (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <PersonIcon fontSize="small" color="action" />
                                                    <Typography variant="body2">
                                                        {service.officiant.firstName} {service.officiant.lastName}
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    Not assigned
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={service.status.replace('_', ' ').toUpperCase()}
                                                color={getStatusColor(service.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {service.currentAttendees}
                                                {service.maxAttendees && ` / ${service.maxAttendees}`}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                badgeContent={service.comments?.length || 0}
                                                color="primary"
                                                sx={{ mr: 1 }}
                                            >
                                                <Tooltip title="View Comments">
                                                    <IconButton
                                                        onClick={() => handleViewComments(service)}
                                                        color="primary"
                                                        size="small"
                                                    >
                                                        <CommentIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="Edit Service">
                                                <IconButton
                                                    onClick={() => handleEditService(service.id)}
                                                    color="primary"
                                                    size="small"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete Service">
                                                <IconButton
                                                    onClick={() => handleDeleteService(service)}
                                                    color="error"
                                                    size="small"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Card>
                        <CardContent sx={{ textAlign: 'center', py: 6 }}>
                            <Typography variant="h6" gutterBottom>
                                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                                    ? 'No Services Match Your Search'
                                    : 'No Church Services Found'
                                }
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                                    ? 'Try adjusting your search criteria or filters.'
                                    : 'You haven\'t scheduled any church services yet.'
                                }
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleCreateService}
                            >
                                Schedule First Service
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                    <DialogTitle>Delete Church Service</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete "{serviceToDelete?.title}"? This action cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                        <Button
                            onClick={confirmDelete}
                            color="error"
                            disabled={deleteMutation.isLoading}
                        >
                            {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Comments Dialog */}
                <Dialog
                    open={commentsDialogOpen}
                    onClose={() => setCommentsDialogOpen(false)}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>
                        Comments for "{selectedService?.title}"
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {selectedService && formatDate(selectedService.scheduledDate)} at {selectedService && formatTime(selectedService.startTime)}
                        </Typography>
                    </DialogTitle>
                    <DialogContent>
                        {commentsLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : commentsData?.comments && commentsData.comments.length > 0 ? (
                            <List>
                                {commentsData.comments.map((comment, index) => (
                                    <React.Fragment key={comment.id}>
                                        <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                    {comment.isAnonymous ? 'A' : comment.member.firstName[0]}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                        <Typography variant="subtitle2" fontWeight="bold">
                                                            {comment.isAnonymous ? 'Anonymous Member' : `${comment.member.firstName} ${comment.member.lastName}`}
                                                        </Typography>
                                                        <Chip
                                                            label={comment.commentType.replace('_', ' ').toUpperCase()}
                                                            color={getCommentTypeColor(comment.commentType)}
                                                            size="small"
                                                        />
                                                        <Typography variant="caption" color="text.secondary">
                                                            {formatCommentDate(comment.createdAt)}
                                                        </Typography>
                                                    </Box>
                                                }
                                                secondary={
                                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                                        {comment.comment}
                                                    </Typography>
                                                }
                                            />
                                        </ListItem>
                                        {index < commentsData.comments.length - 1 && <Divider variant="inset" component="li" />}
                                    </React.Fragment>
                                ))}
                            </List>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <CommentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary">
                                    No Comments Yet
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Members haven't left any comments for this service yet.
                                </Typography>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setCommentsDialogOpen(false)}>Close</Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default ChurchServices;
