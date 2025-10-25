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
} from '@mui/material';
import {
    Visibility as ViewIcon,
    CheckCircle as ApproveIcon,
    Cancel as RejectIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
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

    // Sector approve application mutation (Civil Admin)
    const sectorApproveMutation = useMutation(
        (applicationId) => api.put(`/applications/${applicationId}/sector-approve`),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['applications']);
                toast.success('Application approved at sector level');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to approve application');
            },
        }
    );

    // Sector reject application mutation (Civil Admin)
    const sectorRejectMutation = useMutation(
        ({ applicationId, reason }) => api.put(`/applications/${applicationId}/sector-reject`, { reason }),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['applications']);
                toast.success('Application rejected at sector level');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to reject application');
            },
        }
    );

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

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'under_review': return 'info';
            case 'sector_approved': return 'primary';
            case 'approved': return 'success';
            case 'rejected': return 'error';
            case 'completed': return 'info';
            default: return 'default';
        }
    };

    const canReview = user?.userType === 'church_leader' || user?.userType === 'civil_admin';

    // Server-side filtering is now handled by the API

    const handleViewApplication = (applicationId) => {
        navigate(`/dashboard/applications/${applicationId}`);
    };

    const handleApprove = (applicationId) => {
        if (user?.userType === 'civil_admin') {
            sectorApproveMutation.mutate(applicationId);
        } else if (user?.userType === 'church_leader') {
            churchApproveMutation.mutate(applicationId);
        }
    };

    const handleReject = (applicationId) => {
        const reason = prompt('Please provide a reason for rejection:');
        if (reason) {
            if (user?.userType === 'civil_admin') {
                sectorRejectMutation.mutate({ applicationId, reason });
            } else if (user?.userType === 'church_leader') {
                churchRejectMutation.mutate({ applicationId, reason });
            }
        }
    };

    // Check if user can approve/reject based on application status and user type
    const canApproveReject = (application) => {
        if (!canReview) return false;

        if (user?.userType === 'civil_admin') {
            return ['pending', 'under_review'].includes(application.status);
        } else if (user?.userType === 'church_leader') {
            return application.status === 'sector_approved';
        }

        return false;
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
                        : user?.userType === 'church_leader'
                            ? 'Review applications approved by sector'
                            : 'Review and manage marriage applications'
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
                                        <MenuItem value="sector_approved">Sector Approved</MenuItem>
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
                                                    <Tooltip title={
                                                        user?.userType === 'civil_admin'
                                                            ? "Sector Approve"
                                                            : "Church Approve"
                                                    }>
                                                        <IconButton
                                                            onClick={() => handleApprove(application.id)}
                                                            color="success"
                                                            disabled={
                                                                (user?.userType === 'civil_admin' && sectorApproveMutation.isLoading) ||
                                                                (user?.userType === 'church_leader' && churchApproveMutation.isLoading)
                                                            }
                                                        >
                                                            <ApproveIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title={
                                                        user?.userType === 'civil_admin'
                                                            ? "Sector Reject"
                                                            : "Church Reject"
                                                    }>
                                                        <IconButton
                                                            onClick={() => handleReject(application.id)}
                                                            color="error"
                                                            disabled={
                                                                (user?.userType === 'civil_admin' && sectorRejectMutation.isLoading) ||
                                                                (user?.userType === 'church_leader' && churchRejectMutation.isLoading)
                                                            }
                                                        >
                                                            <RejectIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
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
                                        : user?.userType === 'church_leader'
                                            ? 'There are no sector-approved applications to review at the moment.'
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
            </Container>
        </Box>
    );
};

export default Applications;
