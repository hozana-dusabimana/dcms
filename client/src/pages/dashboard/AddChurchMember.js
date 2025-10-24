import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    TextField,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Save as SaveIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import api from '../../config/axios';
import toast from 'react-hot-toast';
import DashboardHeader from '../../components/DashboardHeader';
import { useNavigate, useParams } from 'react-router-dom';

const AddChurchMember = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const queryClient = useQueryClient();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        membershipDate: new Date().toISOString().split('T')[0],
        membershipStatus: 'active',
        baptismDate: '',
        confirmationDate: '',
        maritalStatus: '',
        occupation: '',
        emergencyContact: '',
        emergencyPhone: '',
        notes: ''
    });

    const [errors, setErrors] = useState({});

    // Fetch existing member data for edit mode
    const { data: existingMember, isLoading: isLoadingMember } = useQuery(
        ['church-member', id],
        () => api.get(`/church-members/${id}`).then(res => res.data),
        {
            enabled: isEditMode,
            onSuccess: (data) => {
                if (data) {
                    setFormData({
                        firstName: data.firstName || '',
                        lastName: data.lastName || '',
                        email: data.email || '',
                        phone: data.phone || '',
                        dateOfBirth: data.dateOfBirth || '',
                        gender: data.gender || '',
                        address: data.address || '',
                        membershipNumber: data.membershipNumber || '',
                        membershipDate: data.membershipDate || '',
                        membershipStatus: data.membershipStatus || 'active',
                        baptismDate: data.baptismDate || '',
                        confirmationDate: data.confirmationDate || '',
                        maritalStatus: data.maritalStatus || '',
                        occupation: data.occupation || '',
                        emergencyContact: data.emergencyContact || '',
                        emergencyPhone: data.emergencyPhone || '',
                        notes: data.notes || ''
                    });
                }
            }
        }
    );

    // Create member mutation
    const createMutation = useMutation(
        (memberData) => api.post('/church-members', memberData),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('church-members');
                toast.success('Church member added successfully');
                navigate('/dashboard/church-members');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to add church member');
            },
        }
    );

    // Update member mutation
    const updateMutation = useMutation(
        (memberData) => api.put(`/church-members/${id}`, memberData),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('church-members');
                queryClient.invalidateQueries(['church-member', id]);
                toast.success('Church member updated successfully');
                navigate('/dashboard/church-members');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to update church member');
            },
        }
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        if (!formData.gender) {
            newErrors.gender = 'Gender is required';
        }

        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (isEditMode) {
            updateMutation.mutate(formData);
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleBack = () => {
        navigate('/dashboard/church-members');
    };

    // Show loading state when fetching member data in edit mode
    if (isEditMode && isLoadingMember) {
        return (
            <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ py: 4 }}>
            <Container maxWidth="md">
                <DashboardHeader
                    title={isEditMode ? "Edit Church Member" : "Add New Church Member"}
                    subtitle={isEditMode ? "Update member details" : "Enter member information to add them to your church"}
                    actionButton={
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBackIcon />}
                            onClick={handleBack}
                        >
                            Back to Members
                        </Button>
                    }
                />

                <Card>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={3}>
                                {/* Personal Information */}
                                <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom>
                                        Personal Information
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="First Name"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        error={!!errors.firstName}
                                        helperText={errors.firstName}
                                        required
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Last Name"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        error={!!errors.lastName}
                                        helperText={errors.lastName}
                                        required
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        error={!!errors.email}
                                        helperText={errors.email}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Date of Birth"
                                        name="dateOfBirth"
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={handleInputChange}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth required error={!!errors.gender}>
                                        <InputLabel>Gender</InputLabel>
                                        <Select
                                            name="gender"
                                            value={formData.gender}
                                            label="Gender"
                                            onChange={handleInputChange}
                                        >
                                            <MenuItem value="male">Male</MenuItem>
                                            <MenuItem value="female">Female</MenuItem>
                                            <MenuItem value="other">Other</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Address"
                                        name="address"
                                        multiline
                                        rows={3}
                                        value={formData.address}
                                        onChange={handleInputChange}
                                    />
                                </Grid>

                                {/* Membership Information */}
                                <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                        Membership Information
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Membership Date"
                                        name="membershipDate"
                                        type="date"
                                        value={formData.membershipDate}
                                        onChange={handleInputChange}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Membership Status</InputLabel>
                                        <Select
                                            name="membershipStatus"
                                            value={formData.membershipStatus}
                                            label="Membership Status"
                                            onChange={handleInputChange}
                                        >
                                            <MenuItem value="active">Active</MenuItem>
                                            <MenuItem value="inactive">Inactive</MenuItem>
                                            <MenuItem value="suspended">Suspended</MenuItem>
                                            <MenuItem value="transferred">Transferred</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Baptism Date"
                                        name="baptismDate"
                                        type="date"
                                        value={formData.baptismDate}
                                        onChange={handleInputChange}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Confirmation Date"
                                        name="confirmationDate"
                                        type="date"
                                        value={formData.confirmationDate}
                                        onChange={handleInputChange}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Marital Status</InputLabel>
                                        <Select
                                            name="maritalStatus"
                                            value={formData.maritalStatus}
                                            label="Marital Status"
                                            onChange={handleInputChange}
                                        >
                                            <MenuItem value="single">Single</MenuItem>
                                            <MenuItem value="married">Married</MenuItem>
                                            <MenuItem value="divorced">Divorced</MenuItem>
                                            <MenuItem value="widowed">Widowed</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Occupation"
                                        name="occupation"
                                        value={formData.occupation}
                                        onChange={handleInputChange}
                                    />
                                </Grid>

                                {/* Emergency Contact */}
                                <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                        Emergency Contact
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Emergency Contact Name"
                                        name="emergencyContact"
                                        value={formData.emergencyContact}
                                        onChange={handleInputChange}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Emergency Contact Phone"
                                        name="emergencyPhone"
                                        value={formData.emergencyPhone}
                                        onChange={handleInputChange}
                                    />
                                </Grid>

                                {/* Notes */}
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Notes"
                                        name="notes"
                                        multiline
                                        rows={4}
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        placeholder="Any additional notes about this member..."
                                    />
                                </Grid>

                                {/* Submit Button */}
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                        <Button
                                            variant="outlined"
                                            onClick={handleBack}
                                            disabled={createMutation.isLoading}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            startIcon={(createMutation.isLoading || updateMutation.isLoading) ? <CircularProgress size={20} /> : <SaveIcon />}
                                            disabled={createMutation.isLoading || updateMutation.isLoading}
                                        >
                                            {(createMutation.isLoading || updateMutation.isLoading) ?
                                                (isEditMode ? 'Updating Member...' : 'Adding Member...') :
                                                (isEditMode ? 'Update Member' : 'Add Member')
                                            }
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </form>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};

export default AddChurchMember;
