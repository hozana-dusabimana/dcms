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
    Pagination,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    Visibility as ViewIcon,
    CheckCircle as ApproveIcon,
    Cancel as RejectIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Event as CompleteIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../config/axios';
import toast from 'react-hot-toast';
import DashboardHeader from '../../components/DashboardHeader';
import { useNavigate } from 'react-router-dom';

const Applications = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Search and filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Complete marriage dialog state
    const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [completeForm, setCompleteForm] = useState({
        marriageDate: '',
        marriageLocation: '',
        comments: ''
    });


    // Build query parameters
    const queryParams = useMemo(() => {
        const params = new URLSearchParams();
        params.append('page', currentPage.toString());
        params.append('limit', pageSize.toString());
        if (searchTerm) params.append('search', searchTerm);
        if (statusFilter !== 'all') params.append('status', statusFilter);
        return params.toString();
    }, [currentPage, pageSize, searchTerm, statusFilter]);

    // Fetch applications with pagination and filtering
    const { data: applicationsData, isLoading, error } = useQuery(
        ['applications', queryParams],
        () => api.get(`/applications?${queryParams}`).then(res => res.data),
        {
            enabled: !!user,
            keepPreviousData: true,
        }
    );

    const applications = applicationsData?.applications || [];
    const pagination = applicationsData?.pagination || {};


    // Church approve application mutation (Church Leader)
    const churchApproveMutation = useMutation(
        (applicationId) => api.put(`/applications/${applicationId}/church-approve`),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['applications']);
                toast.success('Application approved at church level');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to approve application');
            },
        }
    );

    // Church reject application mutation (Church Leader)
    const churchRejectMutation = useMutation(
        ({ applicationId, reason }) => api.put(`/applications/${applicationId}/church-reject`, { reason }),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['applications']);
                toast.success('Application rejected at church level');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to reject application');
            },
        }
    );

    // Complete marriage mutation (Church Leader)
    const completeMarriageMutation = useMutation(
        ({ applicationId, data }) => api.put(`/applications/${applicationId}/complete`, data),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['applications']);
                toast.success('Marriage marked as completed successfully');
                setCompleteDialogOpen(false);
                setCompleteForm({ marriageDate: '', marriageLocation: '', comments: '' });
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to complete marriage');
            },
        }
    );


    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'under_review': return 'info';
            case 'approved': return 'success';
            case 'rejected': return 'error';
            case 'completed': return 'success';
            default: return 'default';
        }
    };

    const canReview = user?.userType === 'church_leader';

    // Server-side filtering is now handled by the API

    const handleViewApplication = (applicationId) => {
        navigate(`/dashboard/applications/${applicationId}`);
    };

    const handleApprove = (applicationId) => {
        if (user?.userType === 'church_leader') {
            churchApproveMutation.mutate(applicationId);
        }
    };

    const handleReject = (applicationId) => {
        const reason = prompt('Please provide a reason for rejection:');
        if (reason) {
            if (user?.userType === 'church_leader') {
                churchRejectMutation.mutate({ applicationId, reason });
            }
        }
    };

    const handleCompleteMarriage = (application) => {
        setSelectedApplication(application);
        setCompleteForm({
            marriageDate: application.marriageDate || '',
            marriageLocation: '',
            comments: ''
        });
        setCompleteDialogOpen(true);
    };

    const handleSubmitComplete = () => {
        if (!completeForm.marriageDate || !completeForm.marriageLocation) {
            toast.error('Please fill in all required fields');
            return;
        }

        completeMarriageMutation.mutate({
            applicationId: selectedApplication.id,
            data: completeForm
        });
    };


    // Check if user can approve/reject based on application status and user type
    const canApproveReject = (application) => {
        if (!canReview) return false;

        if (user?.userType === 'church_leader') {
            return ['pending', 'under_review'].includes(application.status);
        }

        return false;
    };

    // Check if user can complete marriage (only church leaders for approved applications)
    const canCompleteMarriage = (application) => {
        return user?.userType === 'church_leader' && application.status === 'approved';
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
                        Failed to load applications: {error.message}
                    </Alert>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ py: 4 }}>
            <Container maxWidth="lg">
                <DashboardHeader
                    title="Marriage Applications"
                    subtitle={user?.userType === 'couple'
                        ? 'View and track your marriage applications'
                        : 'Review and manage marriage applications in your church'
                    }
                    actionButton={user?.userType === 'couple' ? (
                        <Button
                            variant="contained"
                            onClick={() => navigate('/marriage-registration')}
                        >
                            New Application
                        </Button>
                    ) : null}
                />

                {/* Search and Filter Section */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    placeholder="Search by application number or couple names..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1); // Reset to first page when searching
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Status Filter</InputLabel>
                                    <Select
                                        value={statusFilter}
                                        label="Status Filter"
                                        onChange={(e) => {
                                            setStatusFilter(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <MenuItem value="all">All Statuses</MenuItem>
                                        <MenuItem value="pending">Pending</MenuItem>
                                        <MenuItem value="under_review">Under Review</MenuItem>
                                        <MenuItem value="approved">Approved</MenuItem>
                                        <MenuItem value="rejected">Rejected</MenuItem>
                                        <MenuItem value="completed">Completed</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Per Page</InputLabel>
                                    <Select
                                        value={pageSize}
                                        label="Per Page"
                                        onChange={(e) => {
                                            setPageSize(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <MenuItem value={5}>5</MenuItem>
                                        <MenuItem value={10}>10</MenuItem>
                                        <MenuItem value={25}>25</MenuItem>
                                        <MenuItem value={50}>50</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <Typography variant="body2" color="text.secondary" align="center">
                                    {pagination.totalCount ? `Total: ${pagination.totalCount}` : ''}
                                </Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {applications && applications.length > 0 ? (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Application ID</TableCell>
                                    <TableCell>Couple Names</TableCell>
                                    <TableCell>Wedding Date</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Submitted</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {applications.map((application) => (
                                    <TableRow key={application.id}>
                                        <TableCell>{application.applicationNumber}</TableCell>
                                        <TableCell>
                                            {application.groomFirstName} {application.groomLastName} & {application.brideFirstName} {application.brideLastName}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(application.marriageDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={application.status.replace('_', ' ').toUpperCase()}
                                                color={getStatusColor(application.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {new Date(application.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="View Details">
                                                <IconButton
                                                    onClick={() => handleViewApplication(application.id)}
                                                    color="primary"
                                                >
                                                    <ViewIcon />
                                                </IconButton>
                                            </Tooltip>
                                            {canApproveReject(application) && (
                                                <>
                                                    <Tooltip title="Church Approve">
                                                        <IconButton
                                                            onClick={() => handleApprove(application.id)}
                                                            color="success"
                                                            disabled={churchApproveMutation.isLoading}
                                                        >
                                                            <ApproveIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Church Reject">
                                                        <IconButton
                                                            onClick={() => handleReject(application.id)}
                                                            color="error"
                                                            disabled={churchRejectMutation.isLoading}
                                                        >
                                                            <RejectIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            )}
                                            {canCompleteMarriage(application) && (
                                                <Tooltip title="Complete Marriage">
                                                    <IconButton
                                                        onClick={() => handleCompleteMarriage(application)}
                                                        color="primary"
                                                        disabled={completeMarriageMutation.isLoading}
                                                    >
                                                        <CompleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
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
                                {searchTerm || statusFilter !== 'all'
                                    ? 'No Applications Match Your Search'
                                    : 'No Applications Found'
                                }
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                {searchTerm || statusFilter !== 'all'
                                    ? 'Try adjusting your search criteria or filters.'
                                    : user?.userType === 'couple'
                                        ? 'You haven\'t submitted any marriage applications yet.'
                                        : 'There are no applications to review at the moment.'
                                }
                            </Typography>
                            {user?.userType === 'couple' && (
                                <Button
                                    variant="contained"
                                    onClick={() => navigate('/marriage-registration')}
                                >
                                    Create New Application
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        <Stack spacing={2} alignItems="center">
                            <Pagination
                                count={pagination.totalPages}
                                page={pagination.currentPage}
                                onChange={(event, page) => setCurrentPage(page)}
                                color="primary"
                                size="large"
                                showFirstButton
                                showLastButton
                            />
                            <Typography variant="body2" color="text.secondary">
                                Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                                {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of{' '}
                                {pagination.totalCount} applications
                            </Typography>
                        </Stack>
                    </Box>
                )}

                {/* Complete Marriage Dialog */}
                <Dialog
                    open={completeDialogOpen}
                    onClose={() => setCompleteDialogOpen(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>Complete Marriage</DialogTitle>
                    <DialogContent>
                        {selectedApplication && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Completing marriage for: <strong>{selectedApplication.groomFirstName} {selectedApplication.groomLastName}</strong> & <strong>{selectedApplication.brideFirstName} {selectedApplication.brideLastName}</strong>
                                </Typography>
                            </Box>
                        )}
                        <TextField
                            fullWidth
                            label="Marriage Date"
                            type="date"
                            value={completeForm.marriageDate}
                            onChange={(e) => setCompleteForm(prev => ({ ...prev, marriageDate: e.target.value }))}
                            margin="normal"
                            required
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            fullWidth
                            label="Marriage Location"
                            value={completeForm.marriageLocation}
                            onChange={(e) => setCompleteForm(prev => ({ ...prev, marriageLocation: e.target.value }))}
                            margin="normal"
                            required
                            placeholder="e.g., St. Mary Catholic Church, Kigali"
                        />
                        <TextField
                            fullWidth
                            label="Comments (Optional)"
                            multiline
                            rows={3}
                            value={completeForm.comments}
                            onChange={(e) => setCompleteForm(prev => ({ ...prev, comments: e.target.value }))}
                            margin="normal"
                            placeholder="Any additional notes about the ceremony..."
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setCompleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmitComplete}
                            variant="contained"
                            disabled={completeMarriageMutation.isLoading}
                        >
                            {completeMarriageMutation.isLoading ? 'Completing...' : 'Complete Marriage'}
                        </Button>
                    </DialogActions>
                </Dialog>

            </Container>
        </Box>
    );
};

export default Applications;
