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
    CircularProgress,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { getValidationRules } from '../utils/validations';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const { login, error, clearError } = useAuth();
    const navigate = useNavigate();

    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data) => {
        setLoading(true);
        clearError();

        const result = await login(data.email, data.password);

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
            <Container maxWidth="sm">
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
                            Welcome Back
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Sign in to your DMCS MIS account
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Controller
                            name="email"
                            control={control}
                            rules={getValidationRules.email()}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    label="Email Address"
                                    type="email"
                                    placeholder="Enter valid email address"
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                />
                            )}
                        />

                        <Controller
                            name="password"
                            control={control}
                            rules={getValidationRules.password()}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    label="Password"
                                    type="password"
                                    placeholder="Enter your password"
                                    error={!!errors.password}
                                    helperText={errors.password?.message}
                                />
                            )}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{
                                py: 1.5,
                                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                                },
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                        </Button>

                        <Box sx={{ textAlign: 'center', mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                <Link component={RouterLink} to="/forgot-password" sx={{ fontWeight: 'medium' }}>
                                    Forgot your password?
                                </Link>
                            </Typography>
                        </Box>

                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Don't have an account?{' '}
                                <Link component={RouterLink} to="/register" sx={{ fontWeight: 'medium' }}>
                                    Sign up here
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Login;
