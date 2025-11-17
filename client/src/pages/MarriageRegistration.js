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
    Chip,
    IconButton,
    LinearProgress,
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    AttachFile as AttachFileIcon,
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
import { getValidationRules } from '../utils/validations';

const steps = [
    'Personal Information',
    'Marriage Details',
    'Document Upload',
    'Review & Submit',
];

// Document Upload Field Component
const DocumentUploadField = ({ label, category, files, onUpload, onRemove, required = false }) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = React.useRef(null);
    const existingFile = files.find(f => f.category === category);

    const handleFileSelect = (file) => {
        if (file) {
            onUpload(file, category);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    return (
        <Box>
            <Typography variant="body2" gutterBottom sx={{ fontWeight: 500 }}>
                {label} {required && <span style={{ color: 'red' }}>*</span>}
            </Typography>
            <Box
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                sx={{
                    border: `2px dashed ${isDragging ? 'primary.main' : 'grey.300'}`,
                    borderRadius: 2,
                    p: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    bgcolor: isDragging ? 'action.hover' : 'background.paper',
                    transition: 'all 0.3s',
                    '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover',
                    },
                }}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    style={{ display: 'none' }}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                />
                {existingFile ? (
                    <Box>
                        <AttachFileIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                        <Typography variant="body2" color="success.main">
                            {existingFile.originalName}
                        </Typography>
                        <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove(existingFile);
                            }}
                            sx={{ mt: 1 }}
                        >
                            Remove
                        </Button>
                    </Box>
                ) : (
                    <Box>
                        <CloudUploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                            Click to upload or drag and drop
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            PDF, JPG, PNG, DOC, DOCX (Max 10MB)
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

const MarriageRegistration = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);

    const { user } = useAuth();
    const queryClient = useQueryClient();

    const {
        control,
        handleSubmit,
        formState: { errors },
        trigger,
        getValues,
        reset,
        watch,
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
            ceremonyType: 'religious',
            church: '',
        },
    });

    // Watch for changes in date of birth to re-validate ID numbers
    const groomDateOfBirth = watch('groomDateOfBirth');
    const brideDateOfBirth = watch('brideDateOfBirth');

    // Re-validate ID numbers when date of birth changes
    useEffect(() => {
        if (groomDateOfBirth) {
            trigger('groomIdNumber');
        }
    }, [groomDateOfBirth, trigger]);

    useEffect(() => {
        if (brideDateOfBirth) {
            trigger('brideIdNumber');
        }
    }, [brideDateOfBirth, trigger]);

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
            ceremonyType: 'religious',
            church: '',
        });
        setUploadedFiles([]);
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

    // Fetch churches
    const { data: churches, isLoading: churchesLoading, error: churchesError } = useQuery('churches', () =>
        api.get('/churches').then(res => res.data || [])
    );


    // Submit application mutation
    const submitApplication = useMutation(
        (data) => api.post('/applications', data),
        {
            onSuccess: () => {
                toast.success('Marriage application submitted successfully!');
                queryClient.invalidateQueries('applications');
                setUploadedFiles([]); // Clear uploaded files after successful submission
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

    const handleFileUpload = async (file, category) => {
        if (!file) return;

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB');
            return;
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Invalid file type. Please upload PDF, JPG, PNG, DOC, or DOCX files');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const uploadedFile = {
                ...response.data.file,
                category: category,
                originalName: file.name,
            };

            setUploadedFiles((prev) => [...prev, uploadedFile]);
            toast.success('File uploaded successfully');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.message || 'Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    const handleFileRemove = (fileToRemove) => {
        setUploadedFiles((prev) => prev.filter((file) => file !== fileToRemove));
        toast.success('File removed');
    };

    const getFieldsForStep = (step) => {
        switch (step) {
            case 0:
                return ['groomFirstName', 'groomLastName', 'groomIdNumber', 'groomDateOfBirth', 'groomPhone', 'groomEmail', 'brideFirstName', 'brideLastName', 'brideIdNumber', 'brideDateOfBirth', 'bridePhone', 'brideEmail'];
            case 1:
                return ['marriageDate', 'church'];
            case 2:
                // Validate that at least marriage certificate is uploaded
                if (uploadedFiles.filter(f => f.category === 'marriage_certificate').length === 0) {
                    return ['documents'];
                }
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
                ceremonyType: 'religious',
                churchId: data.church || null,

                // Application metadata
                userId: user.id,
                status: 'pending',
                civilStatus: 'pending',
                churchStatus: 'pending',
                // Include uploaded files
                uploadedFiles: uploadedFiles.map(file => ({
                    filename: file.filename,
                    originalName: file.originalName,
                    path: file.path,
                    size: file.size,
                    category: file.category
                }))
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

            if (!data.church) {
                console.error('Missing required church');
                toast.error('Please select a church');
                return;
            }

            // Validate that civil marriage certificate is uploaded
            const marriageCert = uploadedFiles.find(f => f.category === 'marriage_certificate');
            if (!marriageCert) {
                toast.error('Please upload your civil marriage certificate (Restation de Marriage)');
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
                                rules={getValidationRules.idNumberWithBirthYear(groomDateOfBirth)}
                                render={({ field }) => (
                                    <TextField
                                        name={field.name}
                                        value={field.value || ''}
                                        onChange={(e) => {
                                            // Only allow digits
                                            const value = e.target.value.replace(/\D/g, '');
                                            field.onChange(value);
                                        }}
                                        onBlur={field.onBlur}
                                        fullWidth
                                        label="ID Number"
                                        placeholder="Enter 16-digit ID number (positions 2-5 = birth year)"
                                        error={!!errors.groomIdNumber}
                                        helperText={errors.groomIdNumber?.message}
                                        inputProps={{ maxLength: 16 }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="groomDateOfBirth"
                                control={control}
                                rules={getValidationRules.dateOfBirth()}
                                render={({ field }) => (
                                    <DatePicker
                                        {...field}
                                        label="Date of Birth"
                                        value={field.value ? dayjs(field.value) : null}
                                        onChange={(date) => field.onChange(date?.toISOString())}
                                        maxDate={dayjs().subtract(18, 'year')}
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
                                rules={getValidationRules.phone()}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Phone Number"
                                        placeholder="Enter 10 or 13 digit phone number"
                                        error={!!errors.groomPhone}
                                        helperText={errors.groomPhone?.message}
                                        onChange={(e) => {
                                            // Only allow digits
                                            const value = e.target.value.replace(/\D/g, '');
                                            field.onChange(value);
                                        }}
                                        inputProps={{ maxLength: 13 }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Controller
                                name="groomEmail"
                                control={control}
                                rules={getValidationRules.email()}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Email Address"
                                        type="email"
                                        placeholder="Enter valid email address"
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
                                rules={getValidationRules.idNumberWithBirthYear(brideDateOfBirth)}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        value={field.value || ''}
                                        onChange={(e) => {
                                            // Only allow digits
                                            const value = e.target.value.replace(/\D/g, '');
                                            field.onChange(value);
                                        }}
                                        fullWidth
                                        label="ID Number"
                                        placeholder="Enter 16-digit ID number (positions 2-5 = birth year)"
                                        error={!!errors.brideIdNumber}
                                        helperText={errors.brideIdNumber?.message}
                                        inputProps={{ maxLength: 16 }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="brideDateOfBirth"
                                control={control}
                                rules={getValidationRules.dateOfBirth()}
                                render={({ field }) => (
                                    <DatePicker
                                        {...field}
                                        label="Date of Birth"
                                        value={field.value ? dayjs(field.value) : null}
                                        onChange={(date) => field.onChange(date?.toISOString())}
                                        maxDate={dayjs().subtract(18, 'year')}
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
                                rules={getValidationRules.phone()}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Phone Number"
                                        placeholder="Enter 10 or 13 digit phone number"
                                        error={!!errors.bridePhone}
                                        helperText={errors.bridePhone?.message}
                                        onChange={(e) => {
                                            // Only allow digits
                                            const value = e.target.value.replace(/\D/g, '');
                                            field.onChange(value);
                                        }}
                                        inputProps={{ maxLength: 13 }}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Controller
                                name="brideEmail"
                                control={control}
                                rules={getValidationRules.email()}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Email Address"
                                        type="email"
                                        placeholder="Enter valid email address"
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
                                rules={getValidationRules.marriageDate()}
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
                                name="church"
                                control={control}
                                rules={{ required: 'Church selection is required' }}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.church}>
                                        <InputLabel>Church</InputLabel>
                                        <Select
                                            {...field}
                                            label="Church"
                                            disabled={churchesLoading}
                                        >
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
                                        {errors.church && (
                                            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                                                {errors.church.message}
                                            </Typography>
                                        )}
                                    </FormControl>
                                )}
                            />
                        </Grid>
                    </Grid>
                );

            case 2:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                            Upload Civil Marriage Certificate
                        </Typography>
                        <Alert severity="info" sx={{ mb: 3 }}>
                            Please upload your civil marriage certificate (Restation de Marriage). Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
                        </Alert>

                        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                            <DocumentUploadField
                                label="Civil Marriage Certificate (Restation de Marriage)"
                                category="marriage_certificate"
                                files={uploadedFiles}
                                onUpload={handleFileUpload}
                                onRemove={handleFileRemove}
                                required
                            />
                        </Box>

                        {uploading && (
                            <Box sx={{ mt: 3, maxWidth: 600, mx: 'auto' }}>
                                <LinearProgress />
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                                    Uploading file...
                                </Typography>
                            </Box>
                        )}

                        {uploadedFiles.length > 0 && (
                            <Box sx={{ mt: 3, maxWidth: 600, mx: 'auto' }}>
                                <Alert severity="success" sx={{ mb: 2 }}>
                                    Civil marriage certificate uploaded successfully!
                                </Alert>
                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                    {uploadedFiles.map((file, index) => (
                                        <Chip
                                            key={index}
                                            icon={<AttachFileIcon />}
                                            label={file.originalName}
                                            onDelete={() => handleFileRemove(file)}
                                            color="success"
                                            variant="outlined"
                                        />
                                    ))}
                                </Box>
                            </Box>
                        )}
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
                                disabled={loading || uploading}
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
