import React, { useState, useMemo } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Button,
    Chip,
    Grid,
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Divider,
    Stack,
    Pagination,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    InputAdornment,
} from '@mui/material';
import {
    CheckCircle as ApproveIcon,
    Cancel as RejectIcon,
    Download as DownloadIcon,
    Visibility as ViewIcon,
    Payment as PaymentIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../config/axios';
import toast from 'react-hot-toast';
import DashboardHeader from '../../components/DashboardHeader';
import { useNavigate } from 'react-router-dom';

const CertificateManagement = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
    const [certificateTypeFilter, setCertificateTypeFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Query parameters for pagination and filtering
    const queryParams = useMemo(() => {
        const params = new URLSearchParams();
        params.append('page', currentPage.toString());
        params.append('limit', pageSize.toString());
        if (searchTerm) params.append('search', searchTerm);
        if (statusFilter) params.append('status', statusFilter);
        if (paymentStatusFilter) params.append('paymentStatus', paymentStatusFilter);
        if (certificateTypeFilter) params.append('certificateType', certificateTypeFilter);
        return params.toString();
    }, [currentPage, pageSize, searchTerm, statusFilter, paymentStatusFilter, certificateTypeFilter]);

    // Fetch certificate requests with pagination
    const { data: certificateRequestsData, isLoading } = useQuery(
        ['certificate-requests', queryParams],
        () => api.get(`/certificate-requests?${queryParams}`).then(res => res.data),
        {
            enabled: !!user,
            keepPreviousData: true,
        }
    );

    const certificateRequests = certificateRequestsData?.certificateRequests || [];
    const pagination = certificateRequestsData?.pagination || {};

    // Approve certificate request mutation
    const approveRequestMutation = useMutation(
        (requestId) => api.put(`/certificate-requests/${requestId}/approve`),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['certificate-requests']);
                setApproveDialogOpen(false);
                toast.success('Certificate request approved successfully');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to approve certificate request');
            },
        }
    );

    // Reject certificate request mutation
    const rejectRequestMutation = useMutation(
        ({ requestId, reason }) => api.put(`/certificate-requests/${requestId}/reject`, { reason }),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['certificate-requests']);
                setRejectDialogOpen(false);
                setRejectionReason('');
                toast.success('Certificate request rejected');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to reject certificate request');
            },
        }
    );

    // Download certificate mutation
    const downloadCertificateMutation = useMutation(
        (requestId) => api.get(`/certificate-requests/${requestId}/download`, { responseType: 'blob' }),
        {
            onSuccess: (response, requestId) => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `marriage-certificate-${requestId}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
                toast.success('Certificate downloaded successfully');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to download certificate');
            },
        }
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'paid': return 'info';
            case 'approved': return 'success';
            case 'rejected': return 'error';
            case 'issued': return 'primary';
            default: return 'default';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'paid': return 'success';
            case 'failed': return 'error';
            case 'refunded': return 'info';
            default: return 'default';
        }
    };

    const handleApproveRequest = (request) => {
        setSelectedRequest(request);
        setApproveDialogOpen(true);
    };

    const handleRejectRequest = (request) => {
        setSelectedRequest(request);
        setRejectDialogOpen(true);
    };

    const handleDownloadCertificate = (requestId) => {
        downloadCertificateMutation.mutate(requestId);
    };

    const confirmApprove = () => {
        if (selectedRequest) {
            approveRequestMutation.mutate(selectedRequest.id);
        }
    };

    const confirmReject = () => {
        if (selectedRequest && rejectionReason.trim()) {
            rejectRequestMutation.mutate({
                requestId: selectedRequest.id,
                reason: rejectionReason.trim()
            });
        }
    };

    const canApprove = (request) => {
        return request.paymentStatus === 'paid' && request.status === 'paid';
    };

    const canReject = (request) => {
        return request.status === 'pending' || request.status === 'paid';
    };

    if (isLoading) {
        return (
            <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ py: 4 }}>
            <Container maxWidth="lg">
                <DashboardHeader
                    title="Certificate Request Management"
                    subtitle="Review and manage wedding certificate requests"
                />

                {/* Search and Filter Controls */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    placeholder="Search by request number or payment reference..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
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
                            <Grid item xs={12} md={2}>
                                <FormControl fullWidth>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={statusFilter}
                                        label="Status"
                                        onChange={(e) => {
                                            setStatusFilter(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <MenuItem value="">All Statuses</MenuItem>
                                        <MenuItem value="pending">Pending</MenuItem>
                                        <MenuItem value="paid">Paid</MenuItem>
                                        <MenuItem value="approved">Approved</MenuItem>
                                        <MenuItem value="rejected">Rejected</MenuItem>
                                        <MenuItem value="issued">Issued</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <FormControl fullWidth>
                                    <InputLabel>Payment Status</InputLabel>
                                    <Select
                                        value={paymentStatusFilter}
                                        label="Payment Status"
                                        onChange={(e) => {
                                            setPaymentStatusFilter(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <MenuItem value="">All Payment Statuses</MenuItem>
                                        <MenuItem value="pending">Pending</MenuItem>
                                        <MenuItem value="paid">Paid</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <FormControl fullWidth>
                                    <InputLabel>Certificate Type</InputLabel>
                                    <Select
                                        value={certificateTypeFilter}
                                        label="Certificate Type"
                                        onChange={(e) => {
                                            setCertificateTypeFilter(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <MenuItem value="">All Types</MenuItem>
                                        <MenuItem value="sector">Sector</MenuItem>
                                        <MenuItem value="church">Church</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={2}>
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
                            <Grid item xs={12} md={1}>
                                <Typography variant="body2" color="text.secondary" align="center">
                                    {pagination.totalCount ? `Total: ${pagination.totalCount}` : ''}
                                </Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Certificate Requests
                        </Typography>
                        {certificateRequests.length > 0 ? (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Request Number</TableCell>
                                            <TableCell>Application</TableCell>
                                            <TableCell>Couple Names</TableCell>
                                            <TableCell>Amount</TableCell>
                                            <TableCell>Payment Status</TableCell>
                                            <TableCell>Request Status</TableCell>
                                            <TableCell>Requested Date</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {certificateRequests.map((request) => (
                                            <TableRow key={request.id}>
                                                <TableCell>{request.requestNumber}</TableCell>
                                                <TableCell>
                                                    {request.application?.applicationNumber || 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    {request.application ?
                                                        `${request.application.groomFirstName} ${request.application.groomLastName} & ${request.application.brideFirstName} ${request.application.brideLastName}`
                                                        : 'N/A'
                                                    }
                                                </TableCell>
                                                <TableCell>
                                                    {request.paymentAmount ? `${request.paymentAmount} RWF` : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={request.paymentStatus}
                                                        color={getPaymentStatusColor(request.paymentStatus)}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={request.status}
                                                        color={getStatusColor(request.status)}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(request.requestedAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Tooltip title="View Details">
                                                        <IconButton
                                                            onClick={() => navigate(`/dashboard/certificate-requests/${request.id}`)}
                                                            color="primary"
                                                        >
                                                            <ViewIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    {canApprove(request) && (
                                                        <Tooltip title="Approve Request">
                                                            <IconButton
                                                                onClick={() => handleApproveRequest(request)}
                                                                color="success"
                                                            >
                                                                <ApproveIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {canReject(request) && (
                                                        <Tooltip title="Reject Request">
                                                            <IconButton
                                                                onClick={() => handleRejectRequest(request)}
                                                                color="error"
                                                            >
                                                                <RejectIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {request.status === 'issued' && (
                                                        <Tooltip title="Download Certificate">
                                                            <IconButton
                                                                onClick={() => handleDownloadCertificate(request.id)}
                                                                color="primary"
                                                            >
                                                                <DownloadIcon />
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
                            <Alert severity="info">
                                {searchTerm || statusFilter || paymentStatusFilter || certificateTypeFilter
                                    ? 'No certificate requests match your search criteria. Try adjusting your filters.'
                                    : 'No certificate requests found.'
                                }
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination Controls */}
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
                                {pagination.totalCount} certificate requests
                            </Typography>
                        </Stack>
                    </Box>
                )}

                {/* Approve Request Dialog */}
                <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)}>
                    <DialogTitle>Approve Certificate Request</DialogTitle>
                    <DialogContent>
                        {selectedRequest && (
                            <Box>
                                <Typography variant="body1" gutterBottom>
                                    You are about to approve the certificate request:
                                </Typography>
                                <Typography variant="h6" gutterBottom>
                                    {selectedRequest.requestNumber}
                                </Typography>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="body2" color="text.secondary">
                                    Application: {selectedRequest.application?.applicationNumber || 'N/A'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Couple: {selectedRequest.application ?
                                        `${selectedRequest.application.groomFirstName} ${selectedRequest.application.groomLastName} & ${selectedRequest.application.brideFirstName} ${selectedRequest.application.brideLastName}`
                                        : 'N/A'
                                    }
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Amount: {selectedRequest.paymentAmount} RWF
                                </Typography>
                                <Alert severity="success" sx={{ mt: 2 }}>
                                    This will approve the certificate request and allow the couple to download their wedding certificate.
                                </Alert>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
                        <Button
                            onClick={confirmApprove}
                            variant="contained"
                            color="success"
                            disabled={approveRequestMutation.isLoading}
                        >
                            {approveRequestMutation.isLoading ? 'Approving...' : 'Approve Request'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Reject Request Dialog */}
                <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
                    <DialogTitle>Reject Certificate Request</DialogTitle>
                    <DialogContent>
                        {selectedRequest && (
                            <Box>
                                <Typography variant="body1" gutterBottom>
                                    You are about to reject the certificate request:
                                </Typography>
                                <Typography variant="h6" gutterBottom>
                                    {selectedRequest.requestNumber}
                                </Typography>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    label="Rejection Reason"
                                    placeholder="Please provide a reason for rejection"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    variant="outlined"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    sx={{ mt: 2 }}
                                />
                                <Alert severity="warning" sx={{ mt: 2 }}>
                                    This action cannot be undone. The couple will be notified of the rejection.
                                </Alert>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
                        <Button
                            onClick={confirmReject}
                            variant="contained"
                            color="error"
                            disabled={rejectRequestMutation.isLoading || !rejectionReason.trim()}
                        >
                            {rejectRequestMutation.isLoading ? 'Rejecting...' : 'Reject Request'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default CertificateManagement;
