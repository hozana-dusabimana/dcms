import React, { useState } from 'react';
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
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
} from '@mui/material';
import {
    CheckCircle as ApproveIcon,
    Cancel as RejectIcon,
    ArrowBack as BackIcon,
    Person as PersonIcon,
    CalendarToday as CalendarIcon,
    LocationOn as LocationIcon,
    Description as DocumentIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../config/axios';
import toast from 'react-hot-toast';
import DashboardHeader from '../../components/DashboardHeader';
import { useNavigate, useParams } from 'react-router-dom';

const ApplicationReview = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const queryClient = useQueryClient();
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    // Fetch application details
    const { data: application, isLoading, error } = useQuery(
        ['application', id],
        () => api.get(`/applications/${id}`).then(res => res.data),
        {
            enabled: !!id,
        }
    );

    // Sector approve application mutation (Civil Admin)
    const sectorApproveMutation = useMutation(
        () => api.put(`/applications/${id}/sector-approve`),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('applications');
                toast.success('Application approved at sector level');
                navigate('/dashboard/applications');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to approve application');
            },
        }
    );

    // Sector reject application mutation (Civil Admin)
    const sectorRejectMutation = useMutation(
        () => api.put(`/applications/${id}/sector-reject`, { reason: rejectReason }),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('applications');
                toast.success('Application rejected at sector level');
                setRejectDialogOpen(false);
                setRejectReason('');
                navigate('/dashboard/applications');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to reject application');
            },
        }
    );

    // Church approve application mutation (Church Leader)
    const churchApproveMutation = useMutation(
        () => api.put(`/applications/${id}/church-approve`),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('applications');
                toast.success('Application approved at church level');
                navigate('/dashboard/applications');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to approve application');
            },
        }
    );

    // Church reject application mutation (Church Leader)
    const churchRejectMutation = useMutation(
        () => api.put(`/applications/${id}/church-reject`, { reason: rejectReason }),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('applications');
                toast.success('Application rejected at church level');
                setRejectDialogOpen(false);
                setRejectReason('');
                navigate('/dashboard/applications');
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

    // Check if user can approve/reject based on application status and user type
    const canApproveReject = () => {
        if (!canReview || !application) return false;

        if (user?.userType === 'civil_admin') {
            return ['pending', 'under_review'].includes(application.status);
        } else if (user?.userType === 'church_leader') {
            return application.status === 'sector_approved';
        }

        return false;
    };

    const handleApprove = () => {
        if (user?.userType === 'civil_admin') {
            sectorApproveMutation.mutate();
        } else if (user?.userType === 'church_leader') {
            churchApproveMutation.mutate();
        }
    };

    const handleReject = () => {
        if (rejectReason.trim()) {
            if (user?.userType === 'civil_admin') {
                sectorRejectMutation.mutate();
            } else if (user?.userType === 'church_leader') {
                churchRejectMutation.mutate();
            }
        } else {
            toast.error('Please provide a reason for rejection');
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
                        Failed to load application: {error.message}
                    </Alert>
                </Container>
            </Box>
        );
    }

    if (!application) {
        return (
            <Box sx={{ py: 4 }}>
                <Container maxWidth="lg">
                    <Alert severity="warning">
                        Application not found
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
                    <DashboardHeader
                        title={`Application Review - ${application.applicationNumber}`}
                        subtitle={`Submitted on ${new Date(application.createdAt).toLocaleDateString()}`}
                        backPath="/dashboard/applications"
                        actionButton={
                            <Chip
                                label={application.status}
                                color={getStatusColor(application.status)}
                            />
                        }
                    />
                </Box>

                <Grid container spacing={3}>
                    {/* Application Details */}
                    <Grid item xs={12} md={8}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Application Details
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                <Grid container spacing={3}>
                                    {/* Groom Information */}
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle1" gutterBottom color="primary">
                                            Groom Information
                                        </Typography>
                                        <List dense>
                                            <ListItem>
                                                <ListItemIcon><PersonIcon /></ListItemIcon>
                                                <ListItemText
                                                    primary="Full Name"
                                                    secondary={`${application.groomFirstName} ${application.groomLastName}`}
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon><PersonIcon /></ListItemIcon>
                                                <ListItemText
                                                    primary="Date of Birth"
                                                    secondary={new Date(application.groomDateOfBirth).toLocaleDateString()}
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon><PersonIcon /></ListItemIcon>
                                                <ListItemText
                                                    primary="National ID"
                                                    secondary={application.groomIdNumber}
                                                />
                                            </ListItem>
                                        </List>
                                    </Grid>

                                    {/* Bride Information */}
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle1" gutterBottom color="primary">
                                            Bride Information
                                        </Typography>
                                        <List dense>
                                            <ListItem>
                                                <ListItemIcon><PersonIcon /></ListItemIcon>
                                                <ListItemText
                                                    primary="Full Name"
                                                    secondary={`${application.brideFirstName} ${application.brideLastName}`}
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon><PersonIcon /></ListItemIcon>
                                                <ListItemText
                                                    primary="Date of Birth"
                                                    secondary={new Date(application.brideDateOfBirth).toLocaleDateString()}
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon><PersonIcon /></ListItemIcon>
                                                <ListItemText
                                                    primary="National ID"
                                                    secondary={application.brideIdNumber}
                                                />
                                            </ListItem>
                                        </List>
                                    </Grid>

                                    {/* Wedding Details */}
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1" gutterBottom color="primary">
                                            Wedding Details
                                        </Typography>
                                        <List dense>
                                            <ListItem>
                                                <ListItemIcon><CalendarIcon /></ListItemIcon>
                                                <ListItemText
                                                    primary="Wedding Date"
                                                    secondary={new Date(application.marriageDate).toLocaleDateString()}
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon><LocationIcon /></ListItemIcon>
                                                <ListItemText
                                                    primary="Wedding Venue"
                                                    secondary={application.ceremonyType || 'Not specified'}
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon><LocationIcon /></ListItemIcon>
                                                <ListItemText
                                                    primary="Church"
                                                    secondary={application.churchId || 'Not specified'}
                                                />
                                            </ListItem>
                                        </List>
                                    </Grid>

                                    {/* Documents */}
                                    {application.documents && application.documents.length > 0 && (
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle1" gutterBottom color="primary">
                                                Submitted Documents
                                            </Typography>
                                            <List dense>
                                                {application.documents.map((doc, index) => (
                                                    <ListItem key={index}>
                                                        <ListItemIcon><DocumentIcon /></ListItemIcon>
                                                        <ListItemText
                                                            primary={doc.name}
                                                            secondary={doc.type}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Grid>
                                    )}
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Review Actions */}
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Review Actions
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                {canApproveReject() ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            startIcon={<ApproveIcon />}
                                            onClick={handleApprove}
                                            disabled={
                                                (user?.userType === 'civil_admin' && sectorApproveMutation.isLoading) ||
                                                (user?.userType === 'church_leader' && churchApproveMutation.isLoading)
                                            }
                                            fullWidth
                                        >
                                            {(user?.userType === 'civil_admin' && sectorApproveMutation.isLoading) ||
                                                (user?.userType === 'church_leader' && churchApproveMutation.isLoading)
                                                ? 'Approving...'
                                                : user?.userType === 'civil_admin'
                                                    ? 'Sector Approve'
                                                    : 'Church Approve'
                                            }
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="error"
                                            startIcon={<RejectIcon />}
                                            onClick={() => setRejectDialogOpen(true)}
                                            disabled={
                                                (user?.userType === 'civil_admin' && sectorRejectMutation.isLoading) ||
                                                (user?.userType === 'church_leader' && churchRejectMutation.isLoading)
                                            }
                                            fullWidth
                                        >
                                            {user?.userType === 'civil_admin'
                                                ? 'Sector Reject'
                                                : 'Church Reject'
                                            }
                                        </Button>
                                    </Box>
                                ) : (
                                    <Alert severity="info">
                                        {!canReview
                                            ? 'You do not have permission to review this application'
                                            : user?.userType === 'church_leader' && application.status !== 'sector_approved'
                                                ? 'This application must be approved by the sector before church review'
                                                : `This application has been ${application.status.replace('_', ' ')}`
                                        }
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Reject Dialog */}
                <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Reject Application</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Reason for Rejection"
                            fullWidth
                            multiline
                            rows={4}
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            variant="outlined"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleReject}
                            color="error"
                            disabled={
                                (user?.userType === 'civil_admin' && sectorRejectMutation.isLoading) ||
                                (user?.userType === 'church_leader' && churchRejectMutation.isLoading) ||
                                !rejectReason.trim()
                            }
                        >
                            {(user?.userType === 'civil_admin' && sectorRejectMutation.isLoading) ||
                                (user?.userType === 'church_leader' && churchRejectMutation.isLoading)
                                ? 'Rejecting...'
                                : 'Reject'
                            }
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default ApplicationReview;
