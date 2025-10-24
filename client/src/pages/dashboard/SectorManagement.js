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
    Business as BusinessIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import api from '../../config/axios';
import DashboardHeader from '../../components/DashboardHeader';

const SectorManagement = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [selectedSector, setSelectedSector] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        code: '',
        district: '',
        province: '',
        address: '',
        phone: '',
        email: '',
        isActive: true,
    });
    const [createForm, setCreateForm] = useState({
        name: '',
        code: '',
        district: '',
        province: '',
        address: '',
        phone: '',
        email: '',
        isActive: true
    });

    // Fetch sectors
    const { data: sectors, isLoading, error } = useQuery(
        'sectors-all',
        () => api.get('/sectors/all').then(res => res.data),
        {
            enabled: user?.userType === 'civil_admin' || user?.userType === 'super_admin',
        }
    );

    // Update sector mutation
    const updateSectorMutation = useMutation(
        ({ sectorId, sectorData }) => api.put(`/sectors/${sectorId}`, sectorData),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('sectors-all');
                toast.success('Sector updated successfully');
                setEditDialogOpen(false);
                setSelectedSector(null);
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to update sector');
            },
        }
    );

    // Create sector mutation
    const createSectorMutation = useMutation(
        (sectorData) => api.post('/sectors', sectorData),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('sectors-all');
                setCreateDialogOpen(false);
                setCreateForm({
                    name: '',
                    code: '',
                    district: '',
                    province: '',
                    address: '',
                    phone: '',
                    email: '',
                    isActive: true
                });
                toast.success('Sector created successfully');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to create sector');
            }
        }
    );

    // Delete sector mutation
    const deleteSectorMutation = useMutation(
        (sectorId) => api.delete(`/sectors/${sectorId}`),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('sectors-all');
                toast.success('Sector deleted successfully');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to delete sector');
            },
        }
    );

    const handleEditSector = (sectorData) => {
        setSelectedSector(sectorData);
        setEditForm({
            name: sectorData.name,
            code: sectorData.code,
            district: sectorData.district || '',
            province: sectorData.province || '',
            address: sectorData.address || '',
            phone: sectorData.phone || '',
            email: sectorData.email || '',
            isActive: sectorData.isActive,
        });
        setEditDialogOpen(true);
    };

    const handleCreateSector = () => {
        setCreateDialogOpen(true);
    };

    const handleCreateSubmit = () => {
        createSectorMutation.mutate(createForm);
    };

    const handleUpdateSector = () => {
        if (selectedSector) {
            updateSectorMutation.mutate({
                sectorId: selectedSector.id,
                sectorData: editForm,
            });
        }
    };

    const handleDeleteSector = (sectorId) => {
        if (window.confirm('Are you sure you want to delete this sector?')) {
            deleteSectorMutation.mutate(sectorId);
        }
    };

    if (user?.userType !== 'civil_admin' && user?.userType !== 'super_admin') {
        return (
            <Box sx={{ py: 4 }}>
                <Container maxWidth="lg">
                    <Alert severity="error">
                        Access denied. You don't have permission to manage sectors.
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
                        Failed to load sectors: {error.message}
                    </Alert>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ py: 4 }}>
            <Container maxWidth="lg">
                <DashboardHeader
                    title="Sector Management"
                    subtitle="Manage civil sectors and administrative areas"
                    actionButton={
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleCreateSector}
                        >
                            Add Sector
                        </Button>
                    }
                />

                {sectors && sectors.length > 0 ? (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Code</TableCell>
                                    <TableCell>District</TableCell>
                                    <TableCell>Province</TableCell>
                                    <TableCell>Location</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sectors.map((sector) => (
                                    <TableRow key={sector.id}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <BusinessIcon color="primary" />
                                                <Typography variant="body2" fontWeight="medium">
                                                    {sector.name}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={sector.code} size="small" variant="outlined" />
                                        </TableCell>
                                        <TableCell>{sector.district || 'N/A'}</TableCell>
                                        <TableCell>{sector.province || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <LocationIcon fontSize="small" color="action" />
                                                <Typography variant="body2">
                                                    {sector.address || 'N/A'}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={sector.isActive ? 'Active' : 'Inactive'}
                                                color={sector.isActive ? 'success' : 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="Edit Sector">
                                                <IconButton
                                                    onClick={() => handleEditSector(sector)}
                                                    color="primary"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete Sector">
                                                <IconButton
                                                    onClick={() => handleDeleteSector(sector.id)}
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
                            <BusinessIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                No Sectors Found
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Get started by creating your first civil sector.
                            </Typography>
                            <Button variant="contained" onClick={handleCreateSector}>
                                Add First Sector
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Edit Sector Dialog */}
                <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
                    <DialogTitle>Edit Sector</DialogTitle>
                    <DialogContent>
                        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Sector Name"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Sector Code"
                                        value={editForm.code}
                                        onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        label="District"
                                        value={editForm.district}
                                        onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Province"
                                        value={editForm.province}
                                        onChange={(e) => setEditForm({ ...editForm, province: e.target.value })}
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
                            onClick={handleUpdateSector}
                            variant="contained"
                            disabled={updateSectorMutation.isLoading}
                        >
                            {updateSectorMutation.isLoading ? 'Updating...' : 'Update'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Create Sector Dialog */}
                <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
                    <DialogTitle>Create New Sector</DialogTitle>
                    <DialogContent>
                        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Sector Name"
                                        value={createForm.name}
                                        onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Sector Code"
                                        value={createForm.code}
                                        onChange={(e) => setCreateForm({ ...createForm, code: e.target.value })}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        label="District"
                                        value={createForm.district}
                                        onChange={(e) => setCreateForm({ ...createForm, district: e.target.value })}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Province"
                                        value={createForm.province}
                                        onChange={(e) => setCreateForm({ ...createForm, province: e.target.value })}
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
                            disabled={createSectorMutation.isLoading}
                        >
                            {createSectorMutation.isLoading ? 'Creating...' : 'Create Sector'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default SectorManagement;
