import React, { useState } from 'react';
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Switch,
    FormControlLabel,
    Grid,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    LocationOn as LocationIcon,
    Church as ChurchIcon,
    Email as EmailIcon,
    Phone as PhoneIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import api from '../../config/axios';
import DashboardHeader from '../../components/DashboardHeader';

const ChurchManagement = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [selectedChurch, setSelectedChurch] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        denomination: '',
        address: '',
        location: '',
        phone: '',
        email: '',
        website: '',
        description: '',
        isActive: true,
    });
    const [createForm, setCreateForm] = useState({
        name: '',
        denomination: '',
        address: '',
        location: '',
        phone: '',
        email: '',
        website: '',
        description: '',
        isActive: true
    });

    // Fetch churches
    const { data: churches, isLoading, error } = useQuery(
        'churches-all',
        () => api.get('/churches/all').then(res => res.data),
        {
            enabled: user?.userType === 'civil_admin' || user?.userType === 'super_admin',
        }
    );

    // Update church mutation
    const updateChurchMutation = useMutation(
        ({ churchId, churchData }) => api.put(`/churches/${churchId}`, churchData),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('churches-all');
                toast.success('Church updated successfully');
                setEditDialogOpen(false);
                setSelectedChurch(null);
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to update church');
            },
        }
    );

    // Create church mutation
    const createChurchMutation = useMutation(
        (churchData) => api.post('/churches', churchData),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('churches-all');
                setCreateDialogOpen(false);
                setCreateForm({
                    name: '',
                    denomination: '',
                    address: '',
                    location: '',
                    phone: '',
                    email: '',
                    website: '',
                    description: '',
                    isActive: true
                });
                toast.success('Church created successfully');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to create church');
            }
        }
    );

    // Delete church mutation
    const deleteChurchMutation = useMutation(
        (churchId) => api.delete(`/churches/${churchId}`),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('churches-all');
                toast.success('Church deleted successfully');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to delete church');
            },
        }
    );

    const handleEditChurch = (churchData) => {
        setSelectedChurch(churchData);
        setEditForm({
            name: churchData.name,
            denomination: churchData.denomination || '',
            address: churchData.address || '',
            location: churchData.location || '',
            phone: churchData.phone || '',
            email: churchData.email || '',
            website: churchData.website || '',
            description: churchData.description || '',
            isActive: churchData.isActive,
        });
        setEditDialogOpen(true);
    };

    const handleCreateChurch = () => {
        setCreateDialogOpen(true);
    };

    const handleCreateSubmit = () => {
        createChurchMutation.mutate(createForm);
    };

    const handleUpdateChurch = () => {
        if (selectedChurch) {
            updateChurchMutation.mutate({
                churchId: selectedChurch.id,
                churchData: editForm,
            });
        }
    };

    const handleDeleteChurch = (churchId) => {
        if (window.confirm('Are you sure you want to delete this church?')) {
            deleteChurchMutation.mutate(churchId);
        }
    };

    if (user?.userType !== 'civil_admin' && user?.userType !== 'super_admin') {
        return (
            <Box sx={{ py: 4 }}>
                <Container maxWidth="lg">
                    <Alert severity="error">
                        Access denied. You don't have permission to manage churches.
                    </Alert>
                </Container>
            </Box>
        );
    }

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
                        Failed to load churches: {error.message}
                    </Alert>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ py: 4 }}>
            <Container maxWidth="lg">
                <DashboardHeader
                    title="Church Management"
                    subtitle="Manage registered churches and religious institutions"
                    actionButton={
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleCreateChurch}
                        >
                            Add Church
                        </Button>
                    }
                />

                {churches && churches.length > 0 ? (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Church Name</TableCell>
                                    <TableCell>Denomination</TableCell>
                                    <TableCell>Location</TableCell>
                                    <TableCell>Contact</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {churches.map((church) => (
                                    <TableRow key={church.id}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <ChurchIcon color="primary" />
                                                <Box>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {church.name}
                                                    </Typography>
                                                    {church.website && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            {church.website}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={church.denomination || 'N/A'}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <LocationIcon fontSize="small" color="action" />
                                                <Box>
                                                    <Typography variant="body2">
                                                        {church.location || 'N/A'}
                                                    </Typography>
                                                    {church.address && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            {church.address}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                {church.phone && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                                        <PhoneIcon fontSize="small" color="action" />
                                                        <Typography variant="caption">
                                                            {church.phone}
                                                        </Typography>
                                                    </Box>
                                                )}
                                                {church.email && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <EmailIcon fontSize="small" color="action" />
                                                        <Typography variant="caption">
                                                            {church.email}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={church.isActive ? 'Active' : 'Inactive'}
                                                color={church.isActive ? 'success' : 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="Edit Church">
                                                <IconButton
                                                    onClick={() => handleEditChurch(church)}
                                                    color="primary"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete Church">
                                                <IconButton
                                                    onClick={() => handleDeleteChurch(church.id)}
                                                    color="error"
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
                        <CardContent sx={{ textAlign: 'center', py: 4 }}>
                            <ChurchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                No Churches Found
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Get started by registering your first church.
                            </Typography>
                            <Button variant="contained" onClick={handleCreateChurch}>
                                Add First Church
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Edit Church Dialog */}
                <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
                    <DialogTitle>Edit Church</DialogTitle>
                    <DialogContent>
                        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                label="Church Name"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                fullWidth
                                required
                            />
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Denomination"
                                        value={editForm.denomination}
                                        onChange={(e) => setEditForm({ ...editForm, denomination: e.target.value })}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Location"
                                        value={editForm.location}
                                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                        fullWidth
                                    />
                                </Grid>
                            </Grid>
                            <TextField
                                label="Address"
                                value={editForm.address}
                                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                fullWidth
                                multiline
                                rows={2}
                            />
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Phone"
                                        value={editForm.phone}
                                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Email"
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        fullWidth
                                    />
                                </Grid>
                            </Grid>
                            <TextField
                                label="Website"
                                value={editForm.website}
                                onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                                fullWidth
                            />
                            <TextField
                                label="Description"
                                value={editForm.description}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                fullWidth
                                multiline
                                rows={3}
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={editForm.isActive}
                                        onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                                    />
                                }
                                label="Active"
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleUpdateChurch}
                            variant="contained"
                            disabled={updateChurchMutation.isLoading}
                        >
                            {updateChurchMutation.isLoading ? 'Updating...' : 'Update'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Create Church Dialog */}
                <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
                    <DialogTitle>Create New Church</DialogTitle>
                    <DialogContent>
                        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                label="Church Name"
                                value={createForm.name}
                                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                fullWidth
                                required
                            />
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Denomination"
                                        value={createForm.denomination}
                                        onChange={(e) => setCreateForm({ ...createForm, denomination: e.target.value })}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Location"
                                        value={createForm.location}
                                        onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                                        fullWidth
                                    />
                                </Grid>
                            </Grid>
                            <TextField
                                label="Address"
                                value={createForm.address}
                                onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                                fullWidth
                                multiline
                                rows={2}
                            />
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Phone"
                                        value={createForm.phone}
                                        onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Email"
                                        type="email"
                                        value={createForm.email}
                                        onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                        fullWidth
                                    />
                                </Grid>
                            </Grid>
                            <TextField
                                label="Website"
                                value={createForm.website}
                                onChange={(e) => setCreateForm({ ...createForm, website: e.target.value })}
                                fullWidth
                            />
                            <TextField
                                label="Description"
                                value={createForm.description}
                                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                                fullWidth
                                multiline
                                rows={3}
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={createForm.isActive}
                                        onChange={(e) => setCreateForm({ ...createForm, isActive: e.target.checked })}
                                    />
                                }
                                label="Active"
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleCreateSubmit}
                            variant="contained"
                            disabled={createChurchMutation.isLoading}
                        >
                            {createChurchMutation.isLoading ? 'Creating...' : 'Create Church'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default ChurchManagement;