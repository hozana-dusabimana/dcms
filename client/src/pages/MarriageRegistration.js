import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Stepper,
    Step,
    StepLabel,
    Button,
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    RadioGroup,
    Radio,
    Alert,
    CircularProgress,
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../config/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const steps = [
    'Personal Information',
    'Marriage Details',
    'Document Upload',
    'Review & Submit',
];

const MarriageRegistration = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);

    const { user } = useAuth();
    const queryClient = useQueryClient();

    const {
        control,
        handleSubmit,
        formState: { errors },
        trigger,
        getValues,
        reset,
    } = useForm({
        mode: 'onChange',
        key: 'marriage-registration-form', // Add a key to ensure form stability
        defaultValues: {
            // Groom information - using explicit field names
            groomFirstName: '',
            groomLastName: '',
            groomDateOfBirth: null,
            groomIdNumber: '',
            groomPhone: '',
            groomEmail: '',
            groomAddress: '',
            // Bride information - using explicit field names
            brideFirstName: '',
            brideLastName: '',
            brideDateOfBirth: null,
            brideIdNumber: '',
            bridePhone: '',
            brideEmail: '',
            brideAddress: '',
            // Marriage details
            marriageDate: dayjs().add(30, 'day'),
            ceremonyType: 'both',
            church: '',
            sector: '',
        },
    });

    // Reset form to ensure clean state
    useEffect(() => {
        reset({
            // Groom information - using explicit field names
            groomFirstName: '',
            groomLastName: '',
            groomDateOfBirth: null,
            groomIdNumber: '',
            groomPhone: '',
            groomEmail: '',
            groomAddress: '',
            // Bride information - using explicit field names
            brideFirstName: '',
            brideLastName: '',
            brideDateOfBirth: null,
            brideIdNumber: '',
            bridePhone: '',
            brideEmail: '',
            brideAddress: '',
            // Marriage details
            marriageDate: dayjs().add(30, 'day'),
            ceremonyType: 'both',
            church: '',
            sector: '',
        });
    }, [reset]);

    // Debug: Log form values when step changes
    useEffect(() => {
        console.log('Step changed to:', activeStep);
        const currentValues = getValues();
        console.log('Current form values:', currentValues);
        console.log('Sector value:', currentValues.sector);
        console.log('Church value:', currentValues.church);
        console.log('Groom lastName value:', currentValues.groomLastName);
        console.log('Groom idNumber value:', currentValues.groomIdNumber);
    }, [activeStep, getValues]);

    // Fetch churches and sectors
    const { data: churches, isLoading: churchesLoading, error: churchesError } = useQuery('churches', () =>
        api.get('/churches').then(res => res.data || [])
    );

    const { data: sectors, isLoading: sectorsLoading, error: sectorsError } = useQuery('sectors', () =>
        api.get('/sectors').then(res => res.data || [])
    );


    // Submit application mutation
    const submitApplication = useMutation(
        (data) => api.post('/applications', data),
        {
            onSuccess: () => {
                toast.success('Marriage application submitted successfully!');
                queryClient.invalidateQueries('applications');
                setActiveStep(3);
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to submit application');
            },
        }
    );

    const handleNext = async () => {
        const fieldsToValidate = getFieldsForStep(activeStep);
        console.log('Validating fields for step:', activeStep, fieldsToValidate);
        const isValid = await trigger(fieldsToValidate);
        console.log('Validation result:', isValid);

        if (isValid) {
            setActiveStep((prevStep) => {
                console.log('Moving from step', prevStep, 'to step', prevStep + 1);
                return prevStep + 1;
            });
        }
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const getFieldsForStep = (step) => {
        switch (step) {
            case 0:
                return ['groomFirstName', 'groomLastName', 'groomIdNumber', 'groomDateOfBirth', 'groomPhone', 'groomEmail', 'brideFirstName', 'brideLastName', 'brideIdNumber', 'brideDateOfBirth', 'bridePhone', 'brideEmail'];
            case 1:
                return ['marriageDate', 'ceremonyType', 'church', 'sector'];
            case 2:
                return [];
            default:
                return [];
        }
    };

    const onSubmit = async (data) => {
        // Only allow submission from the final step
        if (activeStep !== 2) {
            console.log('Form submission blocked - not on final step. Current step:', activeStep);
            console.log('Form submission blocked - expected step: 2');
            toast.error('Please complete all steps before submitting');
            return;
        }

        setLoading(true);
        try {
            // Debug: Log the form data and current step
            console.log('Form submitted from step:', activeStep);
            console.log('Form data received:', data);
            console.log('Groom data:', {
                firstName: data.groomFirstName,
                lastName: data.groomLastName,
                idNumber: data.groomIdNumber,
                dateOfBirth: data.groomDateOfBirth,
                phone: data.groomPhone,
                email: data.groomEmail
            });
            console.log('Bride data:', {
                firstName: data.brideFirstName,
                lastName: data.brideLastName,
                idNumber: data.brideIdNumber,
                dateOfBirth: data.brideDateOfBirth,
                phone: data.bridePhone,
                email: data.brideEmail
            });
            console.log('Sector data:', data.sector);
            console.log('Ceremony type:', data.ceremonyType);
            console.log('Marriage date:', data.marriageDate);
            console.log('All form field names:', Object.keys(data));
            console.log('Form step validation - activeStep:', activeStep);
            console.log('Form step validation - should be 2 for submission');

            // Data is already in flat structure, just format it for backend
            const applicationData = {
                // Application number will be generated by backend
                applicationNumber: `APP-${Date.now()}`,

                // Groom information - already flat
                groomFirstName: data.groomFirstName,
                groomLastName: data.groomLastName,
                groomDateOfBirth: data.groomDateOfBirth,
                groomIdNumber: data.groomIdNumber,
                groomPhone: data.groomPhone,
                groomEmail: data.groomEmail,
                groomAddress: data.groomAddress || '',

                // Bride information - already flat
                brideFirstName: data.brideFirstName,
                brideLastName: data.brideLastName,
                brideDateOfBirth: data.brideDateOfBirth,
                brideIdNumber: data.brideIdNumber,
                bridePhone: data.bridePhone,
                brideEmail: data.brideEmail,
                brideAddress: data.brideAddress || '',

                // Marriage details
                marriageDate: data.marriageDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
                ceremonyType: data.ceremonyType,
                sectorId: data.sector,
                churchId: data.church || null,

                // Application metadata
                userId: user.id,
                status: 'pending',
                civilStatus: 'pending',
                churchStatus: 'pending'
            };

            // Debug: Log the application data being sent
            console.log('Application data being sent:', applicationData);

            // Validate that all required fields are present in the original form data
            if (!data.groomFirstName || !data.groomLastName || !data.groomIdNumber) {
                console.error('Missing required groom fields:', {
                    groomFirstName: data.groomFirstName,
                    groomLastName: data.groomLastName,
                    groomIdNumber: data.groomIdNumber
                });
                toast.error('Please fill in all required groom information');
                return;
            }

            if (!data.brideFirstName || !data.brideLastName || !data.brideIdNumber) {
                console.error('Missing required bride fields:', {
                    brideFirstName: data.brideFirstName,
                    brideLastName: data.brideLastName,
                    brideIdNumber: data.brideIdNumber
                });
                toast.error('Please fill in all required bride information');
                return;
            }

            if (!data.sector) {
                console.error('Missing required sector');
                toast.error('Please select a civil sector');
                return;
            }

            await submitApplication.mutateAsync(applicationData);
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>
                                Groom Information
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="groomFirstName"
                                control={control}
                                rules={{ required: 'First name is required' }}
                                render={({ field }) => (
                                    <TextField
                                        name={field.name}
                                        value={field.value || ''}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        fullWidth
                                        label="First Name"
                                        error={!!errors.groomFirstName}
                                        helperText={errors.groomFirstName?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="groomLastName"
                                control={control}
                                rules={{ required: 'Last name is required' }}
                                render={({ field }) => (
                                    <TextField
                                        name={field.name}
                                        value={field.value || ''}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        fullWidth
                                        label="Last Name"
                                        error={!!errors.groomLastName}
                                        helperText={errors.groomLastName?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="groomIdNumber"
                                control={control}
                                rules={{ required: 'ID number is required' }}
                                render={({ field }) => (
                                    <TextField
                                        name={field.name}
                                        value={field.value || ''}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        fullWidth
                                        label="ID Number"
                                        error={!!errors.groomIdNumber}
                                        helperText={errors.groomIdNumber?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="groomDateOfBirth"
                                control={control}
                                rules={{ required: 'Date of birth is required' }}
                                render={({ field }) => (
                                    <DatePicker
                                        {...field}
                                        label="Date of Birth"
                                        value={field.value ? dayjs(field.value) : null}
                                        onChange={(date) => field.onChange(date?.toISOString())}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                error: !!errors.groomDateOfBirth,
                                                helperText: errors.groomDateOfBirth?.message,
                                            },
                                        }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="groomPhone"
                                control={control}
                                rules={{ required: 'Phone number is required' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Phone Number"
                                        error={!!errors.groomPhone}
                                        helperText={errors.groomPhone?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Controller
                                name="groomEmail"
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
                                        error={!!errors.groomEmail}
                                        helperText={errors.groomEmail?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                                Bride Information
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="brideFirstName"
                                control={control}
                                rules={{ required: 'First name is required' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        value={field.value || ''}
                                        fullWidth
                                        label="First Name"
                                        error={!!errors.brideFirstName}
                                        helperText={errors.brideFirstName?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="brideLastName"
                                control={control}
                                rules={{ required: 'Last name is required' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        value={field.value || ''}
                                        fullWidth
                                        label="Last Name"
                                        error={!!errors.brideLastName}
                                        helperText={errors.brideLastName?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="brideIdNumber"
                                control={control}
                                rules={{ required: 'ID number is required' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        value={field.value || ''}
                                        fullWidth
                                        label="ID Number"
                                        error={!!errors.brideIdNumber}
                                        helperText={errors.brideIdNumber?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="brideDateOfBirth"
                                control={control}
                                rules={{ required: 'Date of birth is required' }}
                                render={({ field }) => (
                                    <DatePicker
                                        {...field}
                                        label="Date of Birth"
                                        value={field.value ? dayjs(field.value) : null}
                                        onChange={(date) => field.onChange(date?.toISOString())}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                error: !!errors.brideDateOfBirth,
                                                helperText: errors.brideDateOfBirth?.message,
                                            },
                                        }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="bridePhone"
                                control={control}
                                rules={{ required: 'Phone number is required' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Phone Number"
                                        error={!!errors.bridePhone}
                                        helperText={errors.bridePhone?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Controller
                                name="brideEmail"
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
                                        error={!!errors.brideEmail}
                                        helperText={errors.brideEmail?.message}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                );

            case 1:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Controller
                                name="marriageDate"
                                control={control}
                                rules={{ required: 'Marriage date is required' }}
                                render={({ field }) => (
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            {...field}
                                            label="Marriage Date"
                                            minDate={dayjs().add(1, 'day')}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    error: !!errors.marriageDate,
                                                    helperText: errors.marriageDate?.message,
                                                },
                                            }}
                                        />
                                    </LocalizationProvider>
                                )}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Controller
                                name="ceremonyType"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Ceremony Type
                                        </Typography>
                                        <RadioGroup {...field}>
                                            <FormControlLabel
                                                value="civil"
                                                control={<Radio />}
                                                label="Civil Ceremony Only"
                                            />
                                            <FormControlLabel
                                                value="religious"
                                                control={<Radio />}
                                                label="Religious Ceremony Only"
                                            />
                                            <FormControlLabel
                                                value="both"
                                                control={<Radio />}
                                                label="Both Civil and Religious"
                                            />
                                        </RadioGroup>
                                    </FormControl>
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="sector"
                                control={control}
                                rules={{ required: 'Civil sector is required' }}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.sector}>
                                        <InputLabel>Civil Sector</InputLabel>
                                        <Select
                                            {...field}
                                            label="Civil Sector"
                                            disabled={sectorsLoading}
                                        >
                                            {sectorsLoading ? (
                                                <MenuItem disabled>Loading sectors...</MenuItem>
                                            ) : sectorsError ? (
                                                <MenuItem disabled>Error loading sectors</MenuItem>
                                            ) : sectors && Array.isArray(sectors) ? (
                                                sectors.map((sector) => (
                                                    <MenuItem key={sector.id} value={sector.id}>
                                                        {sector.name}
                                                    </MenuItem>
                                                ))
                                            ) : (
                                                <MenuItem disabled>No sectors available</MenuItem>
                                            )}
                                        </Select>
                                    </FormControl>
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="church"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth>
                                        <InputLabel>Church (Optional)</InputLabel>
                                        <Select
                                            {...field}
                                            label="Church (Optional)"
                                            disabled={churchesLoading}
                                        >
                                            <MenuItem value="">
                                                <em>None</em>
                                            </MenuItem>
                                            {churchesLoading ? (
                                                <MenuItem disabled>Loading churches...</MenuItem>
                                            ) : churchesError ? (
                                                <MenuItem disabled>Error loading churches</MenuItem>
                                            ) : churches && Array.isArray(churches) ? (
                                                churches.map((church) => (
                                                    <MenuItem key={church.id} value={church.id}>
                                                        {church.name}
                                                    </MenuItem>
                                                ))
                                            ) : (
                                                <MenuItem disabled>No churches available</MenuItem>
                                            )}
                                        </Select>
                                    </FormControl>
                                )}
                            />
                        </Grid>
                    </Grid>
                );

            case 2:
                return (
                    <Box>
                        <Alert severity="info" sx={{ mb: 3 }}>
                            Document upload functionality will be implemented in the next step.
                            You can upload required documents after submitting your application.
                        </Alert>
                        <Typography variant="body1" color="text.secondary">
                            Required documents may include:
                        </Typography>
                        <ul>
                            <li>Birth certificates</li>
                            <li>National ID cards</li>
                            <li>Baptism certificates (for religious ceremonies)</li>
                            <li>Divorce certificates (if applicable)</li>
                            <li>Death certificates of previous spouse (if applicable)</li>
                        </ul>
                    </Box>
                );

            case 3:
                return (
                    <Box sx={{ textAlign: 'center' }}>
                        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                        <Typography variant="h5" gutterBottom>
                            Application Submitted Successfully!
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            Your marriage application has been submitted and is now under review.
                            You will receive notifications about the status of your application.
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => window.location.href = '/dashboard'}
                        >
                            Go to Dashboard
                        </Button>
                    </Box>
                );

            default:
                return null;
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    Marriage Registration
                </Typography>
                <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
                    Complete the form below to register your marriage
                </Typography>

                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((label, index) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Box
                    key={`form-step-${activeStep}`}
                    component="form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (activeStep === 2) {
                            handleSubmit(onSubmit)(e);
                        } else {
                            console.log('Form submission prevented - not on final step. Current step:', activeStep);
                            toast.error('Please complete all steps before submitting');
                        }
                    }}
                >
                    {renderStepContent(activeStep)}

                    {activeStep < 3 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                            <Button
                                disabled={activeStep === 0}
                                onClick={handleBack}
                                variant="outlined"
                            >
                                Back
                            </Button>
                            <Button
                                variant="contained"
                                onClick={activeStep === 2 ? handleSubmit(onSubmit) : handleNext}
                                disabled={loading}
                            >
                                {loading ? (
                                    <CircularProgress size={24} />
                                ) : activeStep === 2 ? (
                                    'Submit Application'
                                ) : (
                                    'Next'
                                )}
                            </Button>
                        </Box>
                    )}
                </Box>
            </Paper>
        </Container>
    );
};

export default MarriageRegistration;
