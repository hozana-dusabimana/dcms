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
    const [selectedCertificateType, setSelectedCertificateType] = useState('sector');
    const [paymentReference, setPaymentReference] = useState('');

    // Fetch approved applications for certificate requests
    const { data: applicationsData, isLoading: applicationsLoading } = useQuery(
        'approved-applications',
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

    const applications = applicationsData?.applications?.filter(app => app.status === 'approved') || [];
    const certificateRequests = certificateRequestsData?.certificateRequests || [];

    // Create certificate request mutation
    const createRequestMutation = useMutation(
        ({ applicationId, certificateType }) => api.post('/certificate-requests', { applicationId, certificateType }),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('certificate-requests');
                setRequestDialogOpen(false);
                setSelectedCertificateType('sector');
                toast.success('Certificate request created successfully');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to create certificate request');
            },
        }
    );

    // Pay certificate request mutation
    const payRequestMutation = useMutation(
        ({ requestId, paymentRef }) => api.put(`/certificate-requests/${requestId}/pay`, { paymentReference: paymentRef }),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('certificate-requests');
                setPaymentDialogOpen(false);
                setPaymentReference('');
                toast.success('Payment recorded successfully');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to record payment');
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

    const handleRequestCertificate = (application) => {
        setSelectedApplication(application);
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
        if (selectedApplication && paymentReference.trim()) {
            payRequestMutation.mutate({
                requestId: selectedApplication.id,
                paymentRef: paymentReference.trim()
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
                                    Approved Applications - Ready for Certificate Request
                                </Typography>
                                {applications.length > 0 ? (
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Application Number</TableCell>
                                                    <TableCell>Couple Names</TableCell>
                                                    <TableCell>Wedding Date</TableCell>
                                                    <TableCell>Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {applications.map((application) => {
                                                    const hasRequest = certificateRequests.some(
                                                        req => req.applicationId === application.id
                                                    );

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
                                                                {hasRequest ? (
                                                                    <Chip label="Request Already Made" color="info" size="small" />
                                                                ) : (
                                                                    <Button
                                                                        variant="contained"
                                                                        startIcon={<RequestIcon />}
                                                                        onClick={() => handleRequestCertificate(application)}
                                                                        size="small"
                                                                    >
                                                                        Request Certificate
                                                                    </Button>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <Alert severity="info">
                                        No approved applications available for certificate requests.
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
                                                        label={request.certificateType === 'sector' ? 'Sector (Civil)' : 'Church (Religious)'}
                                                        color={request.certificateType === 'sector' ? 'primary' : 'secondary'}
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
                                                    {request.paymentStatus === 'pending' && user?.userType === 'couple' && (
                                                        <Tooltip title="Record Payment">
                                                            <IconButton
                                                                onClick={() => handlePayCertificate(request)}
                                                                color="primary"
                                                            >
                                                                <PaymentIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {request.paymentStatus === 'paid' && request.status === 'paid' && user?.userType === 'couple' && (
                                                        <Tooltip title="Payment Completed">
                                                            <IconButton
                                                                color="success"
                                                                disabled
                                                            >
                                                                <CheckCircleIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {request.status === 'approved' && (
                                                        <Tooltip title="Certificate Approved - Awaiting Issuance">
                                                            <IconButton
                                                                color="info"
                                                                disabled
                                                            >
                                                                <ApproveIcon />
                                                            </IconButton>
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
                                        <MenuItem value="sector">Sector Certificate (Civil)</MenuItem>
                                        <MenuItem value="church">Church Certificate (Religious)</MenuItem>
                                    </Select>
                                </FormControl>

                                <Alert severity="info" sx={{ mt: 2 }}>
                                    Certificate fee: 5,000 RWF
                                </Alert>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setRequestDialogOpen(false)}>Cancel</Button>
                        <Button
                            onClick={confirmRequest}
                            variant="contained"
                            disabled={createRequestMutation.isLoading}
                        >
                            {createRequestMutation.isLoading ? 'Creating...' : 'Request Certificate'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Payment Dialog */}
                <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)}>
                    <DialogTitle>Record Payment</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Payment Reference"
                            placeholder="Enter payment reference number"
                            fullWidth
                            variant="outlined"
                            value={paymentReference}
                            onChange={(e) => setPaymentReference(e.target.value)}
                            sx={{ mt: 2 }}
                        />
                        <Alert severity="info" sx={{ mt: 2 }}>
                            Please enter the payment reference number from your bank transfer or mobile money payment.
                        </Alert>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
                        <Button
                            onClick={confirmPayment}
                            variant="contained"
                            disabled={payRequestMutation.isLoading || !paymentReference.trim()}
                        >
                            {payRequestMutation.isLoading ? 'Recording...' : 'Record Payment'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default CertificateRequest;
