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
    Pagination,
    Stack,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../config/axios';
import toast from 'react-hot-toast';
import DashboardHeader from '../../components/DashboardHeader';
import { useNavigate } from 'react-router-dom';

const ChurchMembers = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Search and filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState(null);

    // Build query parameters
    const queryParams = useMemo(() => {
        const params = new URLSearchParams();
        params.append('page', currentPage.toString());
        params.append('limit', pageSize.toString());
        if (searchTerm) params.append('search', searchTerm);
        if (statusFilter !== 'all') params.append('status', statusFilter);
        return params.toString();
    }, [currentPage, pageSize, searchTerm, statusFilter]);

    // Fetch church members with pagination and filtering
    const { data: membersData, isLoading, error } = useQuery(
        ['church-members', queryParams],
        () => api.get(`/church-members?${queryParams}`).then(res => res.data),
        {
            enabled: !!user,
            keepPreviousData: true,
        }
    );

    const members = membersData?.members || [];
    const pagination = membersData?.pagination || {};

    // Delete member mutation
    const deleteMutation = useMutation(
        (memberId) => api.delete(`/church-members/${memberId}`),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['church-members']);
                toast.success('Church member deleted successfully');
                setDeleteDialogOpen(false);
                setMemberToDelete(null);
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to delete church member');
            },
        }
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'success';
            case 'inactive': return 'warning';
            case 'suspended': return 'error';
            case 'transferred': return 'info';
            default: return 'default';
        }
    };

    // Server-side filtering is now handled by the API

    const handleCreateMember = () => {
        navigate('/dashboard/church-members/new');
    };

    const handleEditMember = (memberId) => {
        navigate(`/dashboard/church-members/${memberId}/edit`);
    };

    const handleDeleteMember = (member) => {
        setMemberToDelete(member);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (memberToDelete) {
            deleteMutation.mutate(memberToDelete.id);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
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
                        Failed to load church members: {error.message}
                    </Alert>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ py: 4 }}>
            <Container maxWidth="lg">
                <DashboardHeader
                    title="Church Members"
                    subtitle="View and manage church member information"
                    actionButton={
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleCreateMember}
                        >
                            Add Member
                        </Button>
                    }
                />

                {/* Search and Filter Section */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    placeholder="Search members..."
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
                                        <MenuItem value="active">Active</MenuItem>
                                        <MenuItem value="inactive">Inactive</MenuItem>
                                        <MenuItem value="suspended">Suspended</MenuItem>
                                        <MenuItem value="transferred">Transferred</MenuItem>
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

                {members && members.length > 0 ? (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Member</TableCell>
                                    <TableCell>Contact</TableCell>
                                    <TableCell>Membership</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Joined</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {members.map((member) => (
                                    <TableRow key={member.id}>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight="bold">
                                                    {member.firstName} {member.lastName}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {member.gender} • {formatDate(member.dateOfBirth)}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                {member.email && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                                        <EmailIcon fontSize="small" color="action" />
                                                        <Typography variant="body2">
                                                            {member.email}
                                                        </Typography>
                                                    </Box>
                                                )}
                                                {member.phone && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <PhoneIcon fontSize="small" color="action" />
                                                        <Typography variant="body2">
                                                            {member.phone}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2" fontWeight="bold">
                                                    {member.membershipNumber}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Joined: {formatDate(member.membershipDate)}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={member.membershipStatus.toUpperCase()}
                                                color={getStatusColor(member.membershipStatus)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {formatDate(member.membershipDate)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="Edit Member">
                                                <IconButton
                                                    onClick={() => handleEditMember(member.id)}
                                                    color="primary"
                                                    size="small"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete Member">
                                                <IconButton
                                                    onClick={() => handleDeleteMember(member)}
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
                                {searchTerm || statusFilter !== 'all'
                                    ? 'No Members Match Your Search'
                                    : 'No Church Members Found'
                                }
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                {searchTerm || statusFilter !== 'all'
                                    ? 'Try adjusting your search criteria or filters.'
                                    : 'You haven\'t added any church members yet.'
                                }
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleCreateMember}
                            >
                                Add First Member
                            </Button>
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
                                {pagination.totalCount} members
                            </Typography>
                        </Stack>
                    </Box>
                )}

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                    <DialogTitle>Delete Church Member</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete "{memberToDelete?.firstName} {memberToDelete?.lastName}"? This action cannot be undone.
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
            </Container>
        </Box>
    );
};

export default ChurchMembers;

