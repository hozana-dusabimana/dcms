import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import {
    RequestPage as RequestIcon,
    Payment as PaymentIcon,
    Download as DownloadIcon,
    CheckCircle as ApproveIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as RejectIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../config/axios';
import toast from 'react-hot-toast';
import DashboardHeader from '../../components/DashboardHeader';

const CertificateRequest = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [requestDialogOpen, setRequestDialogOpen] = useState(false);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [selectedCertificateType, setSelectedCertificateType] = useState('church');
    const [phoneNumber, setPhoneNumber] = useState('');

    // Fetch applications for certificate requests
    const { data: applicationsData, isLoading: applicationsLoading } = useQuery(
        'applications-for-certificates',
        () => api.get('/applications').then(res => res.data),
        {
            enabled: !!user && user.userType === 'couple',
        }
    );

    // Fetch certificate requests
    const { data: certificateRequestsData, isLoading: requestsLoading } = useQuery(
        'certificate-requests',
        () => api.get('/certificate-requests').then(res => res.data),
        {
            enabled: !!user,
        }
    );

    // Filter applications based on their status for certificate eligibility
    const applications = applicationsData?.applications?.filter(app =>
        ['sector_approved', 'approved', 'civil_completed', 'completed'].includes(app.status)
    ) || [];
    const certificateRequests = certificateRequestsData?.certificateRequests || [];

    // Create certificate request mutation
    const createRequestMutation = useMutation(
        ({ applicationId, certificateType }) => api.post('/certificate-requests', { applicationId, certificateType }),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('certificate-requests');
                setRequestDialogOpen(false);
                setSelectedCertificateType('church');
                toast.success('Certificate request created successfully');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to create certificate request');
            },
        }
    );

    // Pay certificate request mutation using ITEC Pay
    const payRequestMutation = useMutation(
        ({ requestId, phone, amount }) => api.put(`/certificate-requests/${requestId}/pay`, { phone, amount }),
        {
            onSuccess: (response, variables) => {
                queryClient.invalidateQueries('certificate-requests');

                if (response.data.success) {
                    if (response.data.isProcessing) {
                        // Payment is processing, show processing message and start polling
                        toast.info('Payment initiated! Please confirm on your phone. Checking status...');
                        setPaymentDialogOpen(false);
                        setPhoneNumber('');

                        // Start polling for payment status
                        startPaymentStatusPolling(variables.requestId);
                    } else {
                        // Payment completed immediately
                        setPaymentDialogOpen(false);
                        setPhoneNumber('');
                        toast.success('Payment processed successfully!');
                    }
                } else {
                    toast.error('Payment failed. Please try again.');
                }
            },
            onError: (error) => {
                console.error('Payment error:', error);
                toast.error(error.response?.data?.message || 'Payment processing failed');
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
            case 'processing': return 'info';
            case 'paid': return 'success';
            case 'failed': return 'error';
            case 'refunded': return 'info';
            default: return 'default';
        }
    };

    // Payment status polling function
    const startPaymentStatusPolling = (requestId) => {
        const pollInterval = setInterval(async () => {
            try {
                const response = await api.put(`/certificate-requests/${requestId}/check-payment`);

                if (response.data.success) {
                    if (!response.data.isProcessing) {
                        // Payment completed or failed, stop polling
                        clearInterval(pollInterval);
                        queryClient.invalidateQueries('certificate-requests');

                        if (response.data.certificateRequest.paymentStatus === 'paid') {
                            toast.success('Payment confirmed successfully!');
                        } else if (response.data.certificateRequest.paymentStatus === 'failed') {
                            toast.error('Payment failed. Please try again.');
                        }
                    }
                }
            } catch (error) {
                console.error('Error checking payment status:', error);
                // Continue polling on error
            }
        }, 3000); // Check every 3 seconds

        // Stop polling after 5 minutes
        setTimeout(() => {
            clearInterval(pollInterval);
        }, 300000);
    };

    // Get available certificate types based on application status
    const getAvailableCertificateTypes = (application) => {
        const types = [];

        // Removed sector certificate option

        if (['approved', 'completed'].includes(application.status)) {
            types.push({ value: 'church', label: 'Church Certificate (Religious)' });
        }

        if (application.status === 'civil_completed') {
            types.push({ value: 'civil', label: 'Civil Marriage Certificate' });
        }

        if (application.status === 'completed') {
            types.push({ value: 'religious', label: 'Religious Marriage Certificate' });
        }

        return types;
    };

    const handleRequestCertificate = (application, certificateType = null) => {
        setSelectedApplication(application);
        if (certificateType) {
            setSelectedCertificateType(certificateType);
        }
        setRequestDialogOpen(true);
    };

    const handlePayCertificate = (request) => {
        setSelectedApplication(request);
        setPaymentDialogOpen(true);
    };

    const handleDownloadCertificate = (requestId) => {
        downloadCertificateMutation.mutate(requestId);
    };

    const confirmRequest = () => {
        if (selectedApplication) {
            createRequestMutation.mutate({
                applicationId: selectedApplication.id,
                certificateType: selectedCertificateType
            });
        }
    };

    const confirmPayment = () => {
        if (selectedApplication && phoneNumber.trim()) {
            payRequestMutation.mutate({
                requestId: selectedApplication.id,
                phone: phoneNumber.trim(),
                amount: 100 // 100 RWF for certificate
            });
        }
    };

    if (applicationsLoading || requestsLoading) {
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
                    title="Wedding Certificate Requests"
                    subtitle={user?.userType === 'couple'
                        ? 'Request and manage your wedding certificates'
                        : 'Manage wedding certificate requests'
                    }
                />

                {user?.userType === 'couple' && (
                    <>
                        {/* Available Applications for Certificate Request */}
                        <Card sx={{ mb: 4 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Marriage Applications - Ready for Certificate Request
                                </Typography>
                                {applications.length > 0 ? (
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Application Number</TableCell>
                                                    <TableCell>Couple Names</TableCell>
                                                    <TableCell>Wedding Date</TableCell>
                                                    <TableCell>Marriage Status</TableCell>
                                                    <TableCell>Available Certificates</TableCell>
                                                    <TableCell>Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {applications.map((application) => {
                                                    const availableTypes = getAvailableCertificateTypes(application);
                                                    const getStatusColor = (status) => {
                                                        switch (status) {
                                                            case 'sector_approved': return 'primary';
                                                            case 'approved': return 'success';
                                                            case 'civil_completed': return 'info';
                                                            case 'completed': return 'success';
                                                            default: return 'default';
                                                        }
                                                    };

                                                    return (
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
                                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                    {availableTypes.map((type) => (
                                                                        <Chip
                                                                            key={type.value}
                                                                            label={type.label.split(' ')[0]}
                                                                            color="secondary"
                                                                            size="small"
                                                                            variant="outlined"
                                                                        />
                                                                    ))}
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                                    {availableTypes.map((type) => {
                                                                        const hasRequestForType = certificateRequests.some(
                                                                            req => req.applicationId === application.id && req.certificateType === type.value
                                                                        );

                                                                        return (
                                                                            <Box key={type.value} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                                <Chip
                                                                                    label={type.label}
                                                                                    color="secondary"
                                                                                    size="small"
                                                                                    variant="outlined"
                                                                                />
                                                                                {hasRequestForType ? (
                                                                                    <Chip label="Requested" color="success" size="small" />
                                                                                ) : (
                                                                                    <Button
                                                                                        variant="outlined"
                                                                                        startIcon={<RequestIcon />}
                                                                                        onClick={() => handleRequestCertificate(application, type.value)}
                                                                                        size="small"
                                                                                        sx={{ minWidth: 'auto', px: 1 }}
                                                                                    >
                                                                                        Request
                                                                                    </Button>
                                                                                )}
                                                                            </Box>
                                                                        );
                                                                    })}
                                                                </Box>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <Alert severity="info">
                                        No marriage applications available for certificate requests.
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}

                {/* Certificate Requests */}
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
                                            <TableCell>Certificate Type</TableCell>
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
                                                    <Chip
                                                        label={
                                                            request.certificateType === 'sector' ? 'Sector (Civil)' :
                                                            request.certificateType === 'church' ? 'Church (Religious)' :
                                                            request.certificateType === 'civil' ? 'Civil Marriage' :
                                                            request.certificateType === 'religious' ? 'Religious Marriage' :
                                                            request.certificateType
                                                        }
                                                        color={
                                                            request.certificateType === 'sector' ? 'primary' :
                                                            request.certificateType === 'church' ? 'secondary' :
                                                            request.certificateType === 'civil' ? 'info' :
                                                            request.certificateType === 'religious' ? 'success' :
                                                            'default'
                                                        }
                                                        size="small"
                                                    />
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
                                                            <RequestIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    {request.paymentStatus === 'pending' && (user?.userType === 'couple' || user?.userType === 'church_leader' || user?.userType === 'civil_admin') && (
                                                        <Tooltip title="Pay with ITEC Pay">
                                                            <IconButton
                                                                onClick={() => handlePayCertificate(request)}
                                                                color="primary"
                                                            >
                                                                <PaymentIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {request.paymentStatus === 'processing' && (user?.userType === 'couple' || user?.userType === 'church_leader' || user?.userType === 'civil_admin') && (
                                                        <Tooltip title="Payment Processing - Please confirm on your phone">
                                                            <span>
                                                                <IconButton
                                                                    color="info"
                                                                    disabled
                                                                >
                                                                    <PaymentIcon />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    )}
                                                    {request.paymentStatus === 'failed' && (user?.userType === 'couple' || user?.userType === 'church_leader' || user?.userType === 'civil_admin') && (
                                                        <Tooltip title="Try Payment Again">
                                                            <IconButton
                                                                onClick={() => handlePayCertificate(request)}
                                                                color="warning"
                                                            >
                                                                <PaymentIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {request.paymentStatus === 'paid' && request.status === 'paid' && user?.userType === 'couple' && (
                                                        <Tooltip title="Payment Completed">
                                                            <span>
                                                                <IconButton
                                                                    color="success"
                                                                    disabled
                                                                >
                                                                    <CheckCircleIcon />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    )}
                                                    {request.status === 'approved' && (
                                                        <Tooltip title="Certificate Approved - Awaiting Issuance">
                                                            <span>
                                                                <IconButton
                                                                    color="info"
                                                                    disabled
                                                                >
                                                                    <ApproveIcon />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    )}
                                                    {(request.status === 'approved' || request.status === 'issued') && (
                                                        <Tooltip title="Download Certificate">
                                                            <IconButton
                                                                onClick={() => handleDownloadCertificate(request.id)}
                                                                color="success"
                                                            >
                                                                <DownloadIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {request.status === 'rejected' && (
                                                        <Tooltip title="Request Rejected">
                                                            <span>
                                                                <IconButton
                                                                    color="error"
                                                                    disabled
                                                                >
                                                                    <RejectIcon />
                                                                </IconButton>
                                                            </span>
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
                                No certificate requests found.
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {/* Request Certificate Dialog */}
                <Dialog open={requestDialogOpen} onClose={() => setRequestDialogOpen(false)}>
                    <DialogTitle>Request Wedding Certificate</DialogTitle>
                    <DialogContent>
                        {selectedApplication && (
                            <Box>
                                <Typography variant="body1" gutterBottom>
                                    You are about to request a wedding certificate for:
                                </Typography>
                                <Typography variant="h6" gutterBottom>
                                    {selectedApplication.groomFirstName} {selectedApplication.groomLastName} & {selectedApplication.brideFirstName} {selectedApplication.brideLastName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Application: {selectedApplication.applicationNumber}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Wedding Date: {new Date(selectedApplication.marriageDate).toLocaleDateString()}
                                </Typography>

                                <FormControl fullWidth sx={{ mt: 2 }}>
                                    <InputLabel>Certificate Type</InputLabel>
                                    <Select
                                        value={selectedCertificateType}
                                        label="Certificate Type"
                                        onChange={(e) => setSelectedCertificateType(e.target.value)}
                                    >
                                        {getAvailableCertificateTypes(selectedApplication).map((type) => (
                                            <MenuItem key={type.value} value={type.value}>
                                                {type.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <Alert severity="info" sx={{ mt: 2 }}>
                                    Certificate fee: 5,000 RWF
                                </Alert>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setRequestDialogOpen(false);
                            }}
                            type="button"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmRequest}
                            variant="contained"
                            disabled={createRequestMutation.isLoading}
                            type="button"
                        >
                            {createRequestMutation.isLoading ? 'Creating...' : 'Request Certificate'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* ITEC Pay Payment Dialog */}
                <Dialog
                    open={paymentDialogOpen}
                    onClose={(e, reason) => {
                        if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
                            setPaymentDialogOpen(false);
                        }
                    }}
                >
                    <form onSubmit={(e) => e.preventDefault()}>
                        <DialogTitle>
                            {selectedApplication?.paymentStatus === 'failed' ? 'Retry Payment with ITEC Pay' : 'Pay with ITEC Pay'}
                        </DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Phone Number"
                                placeholder="Enter your phone number (e.g., 0791724884)"
                                fullWidth
                                variant="outlined"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        confirmPayment();
                                    }
                                }}
                                sx={{ mt: 2 }}
                            />
                            {selectedApplication?.paymentStatus === 'failed' && (
                                <Alert severity="warning" sx={{ mt: 2 }}>
                                    <strong>Previous payment failed</strong><br />
                                    Please try again with a valid phone number and ensure you have sufficient balance.
                                </Alert>
                            )}
                            {selectedApplication?.paymentStatus === 'processing' && (
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    <strong>Payment is being processed</strong><br />
                                    Please confirm the payment on your phone. The system will automatically update when confirmed.
                                </Alert>
                            )}
                            <Alert severity="info" sx={{ mt: 2 }}>
                                <strong>Amount: 100 RWF</strong><br />
                                You will receive a payment prompt on your phone to complete the payment via ITEC Pay.
                            </Alert>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    e.nativeEvent.stopImmediatePropagation();
                                    setPaymentDialogOpen(false);
                                }}
                                onMouseDown={(e) => e.preventDefault()}
                                type="button"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={confirmPayment}
                                variant="contained"
                                disabled={payRequestMutation.isLoading || !phoneNumber.trim() || selectedApplication?.paymentStatus === 'processing'}
                                color={selectedApplication?.paymentStatus === 'failed' ? 'warning' : 'primary'}
                                type="button"
                            >
                                {payRequestMutation.isLoading ? 'Processing...' :
                                    selectedApplication?.paymentStatus === 'failed' ? 'Retry Payment 100 RWF' :
                                        selectedApplication?.paymentStatus === 'processing' ? 'Payment Processing...' : 'Pay 100 RWF'}
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>
            </Container>
        </Box>
    );
};

export default CertificateRequest;
