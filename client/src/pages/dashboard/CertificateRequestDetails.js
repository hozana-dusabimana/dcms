import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    Divider,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    RequestPage as RequestIcon,
    Payment as PaymentIcon,
    CheckCircle as CheckCircleIcon,
    Schedule as ScheduleIcon,
    Person as PersonIcon,
    CalendarToday as CalendarIcon,
    Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import api from '../../config/axios';
import { useAuth } from '../../contexts/AuthContext';

const CertificateRequestDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Fetch certificate request details
    const { data: requestData, isLoading, error } = useQuery(
        ['certificate-request', id],
        () => api.get(`/certificate-requests/${id}`).then(res => res.data),
        {
            enabled: !!id,
        }
    );

    const request = requestData;

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'paid': return 'info';
            case 'approved': return 'success';
            case 'issued': return 'success';
            case 'rejected': return 'error';
            default: return 'default';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'paid': return 'success';
            case 'failed': return 'error';
            default: return 'default';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
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
                        {error.response?.data?.message || 'Failed to load certificate request details'}
                    </Alert>
                </Container>
            </Box>
        );
    }

    if (!request) {
        return (
            <Box sx={{ py: 4 }}>
                <Container maxWidth="lg">
                    <Alert severity="warning">
                        Certificate request not found
                    </Alert>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ py: 4 }}>
            <Container maxWidth="lg">
                {/* Header */}
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/dashboard/certificate-requests')}
                        variant="outlined"
                    >
                        Back to Certificate Requests
                    </Button>
                    <Typography variant="h4" component="h1">
                        Certificate Request Details
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {/* Main Details */}
                    <Grid item xs={12} md={8}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Request Information
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" color="text.secondary">
                                            Request Number
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                            {request.requestNumber}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" color="text.secondary">
                                            Application Number
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                            {request.application?.applicationNumber || 'N/A'}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" color="text.secondary">
                                            Status
                                        </Typography>
                                        <Chip
                                            label={request.status}
                                            color={getStatusColor(request.status)}
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" color="text.secondary">
                                            Payment Status
                                        </Typography>
                                        <Chip
                                            label={request.paymentStatus}
                                            color={getPaymentStatusColor(request.paymentStatus)}
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" color="text.secondary">
                                            Requested Date
                                        </Typography>
                                        <Typography variant="body1">
                                            {formatDate(request.createdAt)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" color="text.secondary">
                                            Payment Reference
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                            {request.paymentReference || 'N/A'}
                                        </Typography>
                                    </Grid>
                                </Grid>

                                {request.paymentDate && (
                                    <>
                                        <Divider sx={{ my: 2 }} />
                                        <Typography variant="h6" gutterBottom>
                                            Payment Information
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Payment Date
                                                </Typography>
                                                <Typography variant="body1">
                                                    {formatDate(request.paymentDate)}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </>
                                )}

                                {request.approvedAt && (
                                    <>
                                        <Divider sx={{ my: 2 }} />
                                        <Typography variant="h6" gutterBottom>
                                            Approval Information
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Approved Date
                                                </Typography>
                                                <Typography variant="body1">
                                                    {formatDate(request.approvedAt)}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </>
                                )}

                                {request.issuedAt && (
                                    <>
                                        <Divider sx={{ my: 2 }} />
                                        <Typography variant="h6" gutterBottom>
                                            Issuance Information
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Issued Date
                                                </Typography>
                                                <Typography variant="body1">
                                                    {formatDate(request.issuedAt)}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </>
                                )}

                                {request.rejectionReason && (
                                    <>
                                        <Divider sx={{ my: 2 }} />
                                        <Alert severity="error">
                                            <Typography variant="subtitle2" gutterBottom>
                                                Rejection Reason
                                            </Typography>
                                            <Typography variant="body2">
                                                {request.rejectionReason}
                                            </Typography>
                                        </Alert>
                                    </>
                                )}

                                {request.notes && (
                                    <>
                                        <Divider sx={{ my: 2 }} />
                                        <Typography variant="h6" gutterBottom>
                                            Notes
                                        </Typography>
                                        <Typography variant="body2">
                                            {request.notes}
                                        </Typography>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Application Details */}
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Marriage Application Details
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                {request.application ? (
                                    <List dense>
                                        <ListItem>
                                            <ListItemIcon>
                                                <PersonIcon />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Groom"
                                                secondary={`${request.application.groomFirstName} ${request.application.groomLastName}`}
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <PersonIcon />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Bride"
                                                secondary={`${request.application.brideFirstName} ${request.application.brideLastName}`}
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <CalendarIcon />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Marriage Date"
                                                secondary={formatDate(request.application.marriageDate)}
                                            />
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <ReceiptIcon />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Ceremony Type"
                                                secondary={request.application.ceremonyType || 'N/A'}
                                            />
                                        </ListItem>
                                    </List>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        Application details not available
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default CertificateRequestDetails;

