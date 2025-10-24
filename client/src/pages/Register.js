import React, { useState } from 'react';
import {
    Box,
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Link,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Grid,
    CircularProgress,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from 'react-query';
import api from '../config/axios';

const Register = () => {
    const [loading, setLoading] = useState(false);
    const { register: registerUser, error, clearError } = useAuth();
    const navigate = useNavigate();

    const {
        control,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm({
        defaultValues: {
            userType: 'couple',
            firstName: '',
            lastName: '',
            username: '',
            email: '',
            phone: '',
            password: '',
            church: '',
            sector: '',
        },
    });

    const userType = watch('userType');

    // Fetch churches and sectors for couples, church leaders and civil admins
    const { data: churches } = useQuery('churches', () =>
        api.get('/churches').then(res => res.data || []),
        { enabled: userType === 'couple' || userType === 'church_leader' }
    );

    const { data: sectors } = useQuery('sectors', () =>
        api.get('/sectors').then(res => res.data || []),
        { enabled: userType === 'couple' || userType === 'civil_admin' }
    );

    const onSubmit = async (data) => {
        setLoading(true);
        clearError();

        // Clean up the data - remove empty strings for optional fields
        const cleanedData = {
            ...data,
            phone: data.phone || null,
            church: data.church && data.church !== '' ? data.church : null,
            sector: data.sector && data.sector !== '' ? data.sector : null
        };

        console.log('Submitting registration data:', cleanedData);

        const result = await registerUser(cleanedData);

        if (result.success) {
            navigate('/dashboard');
        }

        setLoading(false);
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                py: 4,
            }}
        >
            <Container maxWidth="md">
                <Paper
                    elevation={24}
                    sx={{
                        p: 4,
                        borderRadius: 3,
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                    }}
                >
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                            Create Account
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Join DMCS MIS to manage your marriage registration and church services
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Controller
                                    name="userType"
                                    control={control}
                                    rules={{ required: 'User type is required' }}
                                    render={({ field }) => (
                                        <FormControl fullWidth error={!!errors.userType}>
                                            <InputLabel>Account Type</InputLabel>
                                            <Select {...field} label="Account Type">
                                                <MenuItem value="couple">Couple</MenuItem>
                                                <MenuItem value="church_leader">Church Leader</MenuItem>
                                                <MenuItem value="civil_admin">Civil Administrator</MenuItem>
                                            </Select>
                                        </FormControl>
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="firstName"
                                    control={control}
                                    rules={{ required: 'First name is required' }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="First Name"
                                            error={!!errors.firstName}
                                            helperText={errors.firstName?.message}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="lastName"
                                    control={control}
                                    rules={{ required: 'Last name is required' }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Last Name"
                                            error={!!errors.lastName}
                                            helperText={errors.lastName?.message}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="username"
                                    control={control}
                                    rules={{
                                        required: 'Username is required',
                                        minLength: { value: 3, message: 'Username must be at least 3 characters' }
                                    }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Username"
                                            error={!!errors.username}
                                            helperText={errors.username?.message}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="email"
                                    control={control}
                                    rules={{
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Invalid email address',
                                        },
                                    }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Email Address"
                                            type="email"
                                            error={!!errors.email}
                                            helperText={errors.email?.message}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="phone"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Phone Number"
                                            error={!!errors.phone}
                                            helperText={errors.phone?.message}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Controller
                                    name="password"
                                    control={control}
                                    rules={{
                                        required: 'Password is required',
                                        minLength: { value: 6, message: 'Password must be at least 6 characters' }
                                    }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            label="Password"
                                            type="password"
                                            error={!!errors.password}
                                            helperText={errors.password?.message}
                                        />
                                    )}
                                />
                            </Grid>

                            {/* Church selection for couples and church leaders */}
                            {(userType === 'couple' || userType === 'church_leader') && (
                                <Grid item xs={12} sm={6}>
                                    <Controller
                                        name="church"
                                        control={control}
                                        rules={{ required: 'Church selection is required' }}
                                        render={({ field }) => (
                                            <FormControl fullWidth error={!!errors.church}>
                                                <InputLabel>Church</InputLabel>
                                                <Select {...field} label="Church">
                                                    {churches && Array.isArray(churches) && churches.map((church) => (
                                                        <MenuItem key={church.id} value={church.id}>
                                                            {church.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                {errors.church && (
                                                    <FormHelperText error>{errors.church.message}</FormHelperText>
                                                )}
                                            </FormControl>
                                        )}
                                    />
                                </Grid>
                            )}

                            {/* Sector selection for couples and civil admins */}
                            {(userType === 'couple' || userType === 'civil_admin') && (
                                <Grid item xs={12} sm={6}>
                                    <Controller
                                        name="sector"
                                        control={control}
                                        rules={{ required: 'Civil sector selection is required' }}
                                        render={({ field }) => (
                                            <FormControl fullWidth error={!!errors.sector}>
                                                <InputLabel>Civil Sector</InputLabel>
                                                <Select {...field} label="Civil Sector">
                                                    {sectors && Array.isArray(sectors) && sectors.map((sector) => (
                                                        <MenuItem key={sector.id} value={sector.id}>
                                                            {sector.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                {errors.sector && (
                                                    <FormHelperText error>{errors.sector.message}</FormHelperText>
                                                )}
                                            </FormControl>
                                        )}
                                    />
                                </Grid>
                            )}
                        </Grid>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{
                                mt: 3,
                                mb: 2,
                                py: 1.5,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontSize: '1.1rem',
                            }}
                        >
                            {loading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Create Account'
                            )}
                        </Button>

                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Already have an account?{' '}
                                <Link
                                    component={RouterLink}
                                    to="/login"
                                    variant="body2"
                                    sx={{ fontWeight: 'medium', textDecoration: 'none' }}
                                >
                                    Sign in here
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Register;
