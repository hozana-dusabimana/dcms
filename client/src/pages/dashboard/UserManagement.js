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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    Grid,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    PersonAdd as AddUserIcon,
    Block as BlockIcon,
    CheckCircle as ActivateIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../config/axios';
import DashboardHeader from '../../components/DashboardHeader';
import toast from 'react-hot-toast';

const UserManagement = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        userType: '',
        isActive: true,
    });
    const [createForm, setCreateForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        password: '',
        userType: 'couple',
        phone: '',
        isActive: true
    });

    // Fetch users
    const { data: users, isLoading, error } = useQuery(
        'users',
        () => api.get('/users').then(res => res.data),
        {
            enabled: user?.userType === 'civil_admin' || user?.userType === 'super_admin',
        }
    );

    // Update user mutation
    const updateUserMutation = useMutation(
        ({ userId, userData }) => api.put(`/users/${userId}`, userData),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('users');
                toast.success('User updated successfully');
                setEditDialogOpen(false);
                setSelectedUser(null);
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to update user');
            },
        }
    );

    // Create user mutation
    const createUserMutation = useMutation(
        (userData) => api.post('/auth/register', userData),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('users');
                setCreateDialogOpen(false);
                setCreateForm({
                    firstName: '',
                    lastName: '',
                    email: '',
                    username: '',
                    password: '',
                    userType: 'couple',
                    phone: '',
                    isActive: true
                });
                toast.success('User created successfully');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to create user');
            }
        }
    );

    // Delete user mutation
    const deleteUserMutation = useMutation(
        (userId) => api.delete(`/users/${userId}`),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('users');
                toast.success('User deleted successfully');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to delete user');
            },
        }
    );

    // Toggle user status mutation
    const toggleUserStatusMutation = useMutation(
        ({ userId, isActive }) => api.put(`/users/${userId}/status`, { isActive }),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('users');
                toast.success('User status updated successfully');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to update user status');
            },
        }
    );

    const getUserTypeColor = (userType) => {
        switch (userType) {
            case 'couple': return 'primary';
            case 'church_leader': return 'secondary';
            case 'civil_admin': return 'success';
            case 'super_admin': return 'error';
            default: return 'default';
        }
    };

    const handleEditUser = (userData) => {
        setSelectedUser(userData);
        setEditForm({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            userType: userData.userType,
            isActive: userData.isActive,
        });
        setEditDialogOpen(true);
    };

    const handleCreateUser = () => {
        setCreateDialogOpen(true);
    };

    const handleCreateSubmit = () => {
        createUserMutation.mutate(createForm);
    };

    const handleUpdateUser = () => {
        if (selectedUser) {
            updateUserMutation.mutate({
                userId: selectedUser.id,
                userData: editForm,
            });
        }
    };

    const handleDeleteUser = (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            deleteUserMutation.mutate(userId);
        }
    };

    const handleToggleUserStatus = (userId, currentStatus) => {
        toggleUserStatusMutation.mutate({
            userId,
            isActive: !currentStatus,
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
                        Failed to load users: {error.message}
                    </Alert>
                </Container>
            </Box>
        );
    }

    if (user?.userType !== 'civil_admin' && user?.userType !== 'super_admin') {
        return (
            <Box sx={{ py: 4 }}>
                <Container maxWidth="lg">
                    <Alert severity="error">
                        You do not have permission to access this page.
                    </Alert>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ py: 4 }}>
            <Container maxWidth="lg">
                <DashboardHeader
                    title="User Management"
                    subtitle="Manage user accounts, roles, and permissions"
                    actionButton={
                        <Button
                            variant="contained"
                            startIcon={<AddUserIcon />}
                            onClick={handleCreateUser}
                        >
                            Add User
                        </Button>
                    }
                />

                {users && users.length > 0 ? (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Username</TableCell>
                                    <TableCell>Role</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Last Login</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.map((userData) => (
                                    <TableRow key={userData.id}>
                                        <TableCell>
                                            {userData.firstName} {userData.lastName}
                                        </TableCell>
                                        <TableCell>{userData.email}</TableCell>
                                        <TableCell>{userData.username}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={userData.userType.replace('_', ' ')}
                                                color={getUserTypeColor(userData.userType)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={userData.isActive ? 'Active' : 'Inactive'}
                                                color={userData.isActive ? 'success' : 'error'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {userData.lastLogin
                                                ? new Date(userData.lastLogin).toLocaleDateString()
                                                : 'Never'
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="Edit User">
                                                <IconButton
                                                    onClick={() => handleEditUser(userData)}
                                                    color="primary"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={userData.isActive ? 'Deactivate' : 'Activate'}>
                                                <IconButton
                                                    onClick={() => handleToggleUserStatus(userData.id, userData.isActive)}
                                                    color={userData.isActive ? 'warning' : 'success'}
                                                >
                                                    {userData.isActive ? <BlockIcon /> : <ActivateIcon />}
                                                </IconButton>
                                            </Tooltip>
                                            {userData.id !== user.id && (
                                                <Tooltip title="Delete User">
                                                    <IconButton
                                                        onClick={() => handleDeleteUser(userData.id)}
                                                        color="error"
                                                    >
                                                        <DeleteIcon />
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
                                No Users Found
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                There are no users to display.
                            </Typography>
                        </CardContent>
                    </Card>
                )}

                {/* Edit User Dialog */}
                <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                            <TextField
                                label="First Name"
                                value={editForm.firstName}
                                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                fullWidth
                            />
                            <TextField
                                label="Last Name"
                                value={editForm.lastName}
                                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                fullWidth
                            />
                            <TextField
                                label="Email"
                                value={editForm.email}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                fullWidth
                            />
                            <FormControl fullWidth>
                                <InputLabel>User Type</InputLabel>
                                <Select
                                    value={editForm.userType}
                                    onChange={(e) => setEditForm({ ...editForm, userType: e.target.value })}
                                    label="User Type"
                                >
                                    <MenuItem value="couple">Couple</MenuItem>
                                    <MenuItem value="church_leader">Church Leader</MenuItem>
                                    <MenuItem value="civil_admin">Civil Administrator</MenuItem>
                                    <MenuItem value="super_admin">Super Administrator</MenuItem>
                                </Select>
                            </FormControl>
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
                            onClick={handleUpdateUser}
                            variant="contained"
                            disabled={updateUserMutation.isLoading}
                        >
                            {updateUserMutation.isLoading ? 'Updating...' : 'Update'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Create User Dialog */}
                <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogContent>
                        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        label="First Name"
                                        value={createForm.firstName}
                                        onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Last Name"
                                        value={createForm.lastName}
                                        onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                            </Grid>
                            <TextField
                                label="Email"
                                type="email"
                                value={createForm.email}
                                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                fullWidth
                                required
                            />
                            <TextField
                                label="Username"
                                value={createForm.username}
                                onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                                fullWidth
                                required
                            />
                            <TextField
                                label="Password"
                                type="password"
                                value={createForm.password}
                                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                                fullWidth
                                required
                            />
                            <TextField
                                label="Phone"
                                value={createForm.phone}
                                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                                fullWidth
                            />
                            <FormControl fullWidth>
                                <InputLabel>User Type</InputLabel>
                                <Select
                                    value={createForm.userType}
                                    onChange={(e) => setCreateForm({ ...createForm, userType: e.target.value })}
                                    label="User Type"
                                >
                                    <MenuItem value="couple">Couple</MenuItem>
                                    <MenuItem value="church_leader">Church Leader</MenuItem>
                                    <MenuItem value="civil_admin">Civil Administrator</MenuItem>
                                    <MenuItem value="super_admin">Super Administrator</MenuItem>
                                </Select>
                            </FormControl>
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
                            disabled={createUserMutation.isLoading}
                        >
                            {createUserMutation.isLoading ? 'Creating...' : 'Create User'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default UserManagement;
