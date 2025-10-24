import React from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Avatar,
    Chip,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    People as PeopleIcon,
    Church as ChurchIcon,
    Assignment as AssignmentIcon,
    Security as SecurityIcon,
    Star as StarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const features = [
        {
            icon: <PeopleIcon sx={{ fontSize: 40 }} />,
            title: 'Marriage Registration',
            description: 'Digitally register your marriage with both civil and religious authorities seamlessly.',
            color: theme.palette.primary.main,
        },
        {
            icon: <ChurchIcon sx={{ fontSize: 40 }} />,
            title: 'Church Services',
            description: 'Manage and schedule religious ceremonies, baptisms, and other church services.',
            color: theme.palette.secondary.main,
        },
        {
            icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
            title: 'Digital Certificates',
            description: 'Generate and verify marriage certificates with advanced security features.',
            color: theme.palette.success.main,
        },
    ];

    const stats = [
        { number: '500+', label: 'Marriages Registered' },
        { number: '25+', label: 'Partner Churches' },
        { number: '12+', label: 'Civil Sectors' },
        { number: '99%', label: 'User Satisfaction' },
    ];

    return (
        <Box>
            {/* Hero Section */}
            <Box
                sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: 'white',
                    py: 8,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <Container maxWidth="lg">
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Typography
                                variant="h1"
                                component="h1"
                                gutterBottom
                                sx={{
                                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                                    fontWeight: 700,
                                    lineHeight: 1.2,
                                }}
                            >
                                Digital Marriage & Church Service Management
                            </Typography>
                            <Typography
                                variant="h5"
                                component="p"
                                sx={{
                                    mb: 4,
                                    opacity: 0.9,
                                    lineHeight: 1.6,
                                }}
                            >
                                Streamline your marriage registration and church service management with our integrated digital platform. Connect civil registration offices with religious institutions for seamless, transparent processes.
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={() => navigate('/marriage-registration')}
                                    sx={{
                                        bgcolor: 'white',
                                        color: theme.palette.primary.main,
                                        '&:hover': {
                                            bgcolor: 'grey.100',
                                        },
                                    }}
                                >
                                    Register Marriage
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    onClick={() => navigate('/about')}
                                    sx={{
                                        borderColor: 'white',
                                        color: 'white',
                                        '&:hover': {
                                            borderColor: 'white',
                                            bgcolor: 'rgba(255,255,255,0.1)',
                                        },
                                    }}
                                >
                                    Learn More
                                </Button>
                            </Box>

                            {/* Feature Chips */}
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {features.map((feature, index) => (
                                    <Chip
                                        key={index}
                                        icon={feature.icon}
                                        label={feature.title}
                                        variant="outlined"
                                        sx={{
                                            borderColor: 'white',
                                            color: 'white',
                                            '& .MuiChip-icon': {
                                                color: 'white',
                                            },
                                        }}
                                    />
                                ))}
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Box sx={{ position: 'relative' }}>
                                <Card
                                    sx={{
                                        maxWidth: 400,
                                        mx: 'auto',
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                    }}
                                >
                                    <CardMedia
                                        component="img"
                                        height="300"
                                        image="/images/hotel/showcase-1.webp"
                                        alt="DMCS MIS System"
                                    />
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <SecurityIcon color="primary" sx={{ mr: 1 }} />
                                            <Typography variant="h6" component="h3">
                                                Secure & Reliable
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            "The DMCS MIS system has streamlined our marriage registration process. It's efficient, secure, and user-friendly."
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Avatar
                                                src="/images/person/person-f-3.webp"
                                                alt="Pastor Maria"
                                                sx={{ width: 32, height: 32, mr: 1 }}
                                            />
                                            <Typography variant="body2" fontWeight="medium">
                                                Pastor Maria
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Stats Section */}
            <Box sx={{ py: 6, bgcolor: 'background.paper' }}>
                <Container maxWidth="lg">
                    <Grid container spacing={4}>
                        {stats.map((stat, index) => (
                            <Grid item xs={6} md={3} key={index}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography
                                        variant="h3"
                                        component="div"
                                        sx={{
                                            fontWeight: 700,
                                            color: theme.palette.primary.main,
                                            mb: 1,
                                        }}
                                    >
                                        {stat.number}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        {stat.label}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Features Section */}
            <Box sx={{ py: 8, bgcolor: 'grey.50' }}>
                <Container maxWidth="lg">
                    <Typography
                        variant="h2"
                        component="h2"
                        textAlign="center"
                        gutterBottom
                        sx={{ mb: 6 }}
                    >
                        Why Choose DMCS MIS?
                    </Typography>

                    <Grid container spacing={4}>
                        {features.map((feature, index) => (
                            <Grid item xs={12} md={4} key={index}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        textAlign: 'center',
                                        p: 3,
                                        transition: 'transform 0.3s ease-in-out',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: '50%',
                                            bgcolor: `${feature.color}20`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mx: 'auto',
                                            mb: 3,
                                            color: feature.color,
                                        }}
                                    >
                                        {feature.icon}
                                    </Box>
                                    <Typography variant="h5" component="h3" gutterBottom>
                                        {feature.title}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        {feature.description}
                                    </Typography>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* CTA Section */}
            <Box
                sx={{
                    py: 8,
                    background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                    color: 'white',
                }}
            >
                <Container maxWidth="md">
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" component="h2" gutterBottom>
                            Ready to Get Started?
                        </Typography>
                        <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                            Join thousands of couples who have successfully registered their marriages through our platform.
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate(isAuthenticated ? '/marriage-registration' : '/register')}
                            sx={{
                                bgcolor: 'white',
                                color: theme.palette.secondary.main,
                                px: 4,
                                py: 1.5,
                                '&:hover': {
                                    bgcolor: 'grey.100',
                                },
                            }}
                        >
                            {isAuthenticated ? 'Register Marriage' : 'Get Started'}
                        </Button>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
};

export default Home;
