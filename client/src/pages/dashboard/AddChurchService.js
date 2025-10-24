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

const AddChurchService = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const queryClient = useQueryClient();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        serviceType: '',
        scheduledDate: '',
        startTime: '',
        endTime: '',
        location: '',
        officiantId: '',
        status: 'scheduled',
        maxAttendees: '',
        notes: '',
        isPublic: true
    });

    const [errors, setErrors] = useState({});

    // Fetch existing service data for edit mode
    const { data: existingService, isLoading: isLoadingService } = useQuery(
        ['church-service', id],
        () => api.get(`/church-services/${id}`).then(res => res.data),
        {
            enabled: isEditMode,
            onSuccess: (data) => {
                if (data) {
                    setFormData({
                        title: data.title || '',
                        description: data.description || '',
                        serviceType: data.serviceType || '',
                        scheduledDate: data.scheduledDate ? data.scheduledDate.split('T')[0] : '',
                        startTime: data.startTime || '',
                        endTime: data.endTime || '',
                        location: data.location || '',
                        officiantId: data.officiantId || '',
                        status: data.status || 'scheduled',
                        maxAttendees: data.maxAttendees || '',
                        notes: data.notes || '',
                        isPublic: data.isPublic !== false
                    });
                }
            }
        }
    );

    // Create service mutation
    const createMutation = useMutation(
        (serviceData) => api.post('/church-services', serviceData),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('church-services');
                toast.success('Church service scheduled successfully');
                navigate('/dashboard/church-services');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to schedule church service');
            },
        }
    );

    // Update service mutation
    const updateMutation = useMutation(
        (serviceData) => api.put(`/church-services/${id}`, serviceData),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('church-services');
                queryClient.invalidateQueries(['church-service', id]);
                toast.success('Church service updated successfully');
                navigate('/dashboard/church-services');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to update church service');
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

        if (!formData.title.trim()) {
            newErrors.title = 'Service title is required';
        }

        if (!formData.serviceType) {
            newErrors.serviceType = 'Service type is required';
        }

        if (!formData.scheduledDate) {
            newErrors.scheduledDate = 'Scheduled date is required';
        }

        if (!formData.startTime) {
            newErrors.startTime = 'Start time is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Clean up form data - remove empty strings and convert to proper types
        const cleanedData = {
            ...formData,
            maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null,
            officiantId: formData.officiantId && formData.officiantId.trim() !== '' ? parseInt(formData.officiantId) : null
        };

        // Remove empty officiantId from the data
        if (!cleanedData.officiantId) {
            delete cleanedData.officiantId;
        }

        if (isEditMode) {
            updateMutation.mutate(cleanedData);
        } else {
            createMutation.mutate(cleanedData);
        }
    };

    const handleBack = () => {
        navigate('/dashboard/church-services');
    };

    // Show loading state when fetching service data in edit mode
    if (isEditMode && isLoadingService) {
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
                    title={isEditMode ? "Edit Church Service" : "Schedule New Church Service"}
                    subtitle={isEditMode ? "Update service details" : "Enter service details to schedule a new church service"}
                    actionButton={
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBackIcon />}
                            onClick={handleBack}
                        >
                            Back to Services
                        </Button>
                    }
                />

                <Card>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={3}>
                                {/* Service Information */}
                                <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom>
                                        Service Information
                                    </Typography>
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Service Title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        error={!!errors.title}
                                        helperText={errors.title}
                                        required
                                        placeholder="e.g., Sunday Morning Service, Wedding Ceremony"
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Description"
                                        name="description"
                                        multiline
                                        rows={3}
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Brief description of the service..."
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth required error={!!errors.serviceType}>
                                        <InputLabel>Service Type</InputLabel>
                                        <Select
                                            name="serviceType"
                                            value={formData.serviceType}
                                            label="Service Type"
                                            onChange={handleInputChange}
                                        >
                                            <MenuItem value="marriage">Marriage</MenuItem>
                                            <MenuItem value="baptism">Baptism</MenuItem>
                                            <MenuItem value="funeral">Funeral</MenuItem>
                                            <MenuItem value="communion">Communion</MenuItem>
                                            <MenuItem value="prayer_meeting">Prayer Meeting</MenuItem>
                                            <MenuItem value="bible_study">Bible Study</MenuItem>
                                            <MenuItem value="youth_service">Youth Service</MenuItem>
                                            <MenuItem value="other">Other</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            name="status"
                                            value={formData.status}
                                            label="Status"
                                            onChange={handleInputChange}
                                        >
                                            <MenuItem value="scheduled">Scheduled</MenuItem>
                                            <MenuItem value="in_progress">In Progress</MenuItem>
                                            <MenuItem value="completed">Completed</MenuItem>
                                            <MenuItem value="cancelled">Cancelled</MenuItem>
                                            <MenuItem value="postponed">Postponed</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Date and Time */}
                                <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                        Date and Time
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Scheduled Date"
                                        name="scheduledDate"
                                        type="date"
                                        value={formData.scheduledDate}
                                        onChange={handleInputChange}
                                        error={!!errors.scheduledDate}
                                        helperText={errors.scheduledDate}
                                        required
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={3}>
                                    <TextField
                                        fullWidth
                                        label="Start Time"
                                        name="startTime"
                                        type="time"
                                        value={formData.startTime}
                                        onChange={handleInputChange}
                                        error={!!errors.startTime}
                                        helperText={errors.startTime}
                                        required
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={3}>
                                    <TextField
                                        fullWidth
                                        label="End Time"
                                        name="endTime"
                                        type="time"
                                        value={formData.endTime}
                                        onChange={handleInputChange}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                </Grid>

                                {/* Location and Details */}
                                <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                        Location and Details
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Location"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Main Hall, Chapel, Outdoor Garden"
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Max Attendees"
                                        name="maxAttendees"
                                        type="number"
                                        value={formData.maxAttendees}
                                        onChange={handleInputChange}
                                        placeholder="Leave empty for no limit"
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Notes"
                                        name="notes"
                                        multiline
                                        rows={4}
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        placeholder="Additional notes about the service..."
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
                                                (isEditMode ? 'Updating...' : 'Scheduling...') :
                                                (isEditMode ? 'Update Service' : 'Schedule Service')
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

export default AddChurchService;
