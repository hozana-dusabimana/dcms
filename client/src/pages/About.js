import React from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Avatar,
    useTheme,
} from '@mui/material';
import {
    People as PeopleIcon,
    Church as ChurchIcon,
    Assignment as AssignmentIcon,
    Security as SecurityIcon,
} from '@mui/icons-material';

const About = () => {
    const theme = useTheme();

    const features = [
        {
            icon: <PeopleIcon sx={{ fontSize: 40 }} />,
            title: 'Digital Marriage Registration',
            description: 'Streamline the marriage registration process with our integrated digital platform that connects civil and religious authorities.',
        },
        {
            icon: <ChurchIcon sx={{ fontSize: 40 }} />,
            title: 'Church Service Management',
            description: 'Manage religious ceremonies, baptisms, confirmations, and other church services efficiently.',
        },
        {
            icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
            title: 'Certificate Generation',
            description: 'Generate secure digital marriage certificates with advanced verification features.',
        },
        {
            icon: <SecurityIcon sx={{ fontSize: 40 }} />,
            title: 'Secure & Reliable',
            description: 'Built with enterprise-grade security to protect sensitive personal and religious data.',
        },
    ];

    return (
        <Box sx={{ py: 8 }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                    <Typography variant="h2" component="h1" gutterBottom>
                        About DMCS MIS
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
                        The Digital Marriage and Church Service Management Information System is a comprehensive platform
                        designed to modernize and streamline marriage registration and church service management processes.
                    </Typography>
                </Box>

                <Grid container spacing={4} sx={{ mb: 8 }}>
                    {features.map((feature, index) => (
                        <Grid item xs={12} md={6} key={index}>
                            <Card sx={{ height: '100%', p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar
                                        sx={{
                                            bgcolor: theme.palette.primary.main,
                                            mr: 2,
                                            width: 60,
                                            height: 60,
                                        }}
                                    >
                                        {feature.icon}
                                    </Avatar>
                                    <Typography variant="h5" component="h3">
                                        {feature.title}
                                    </Typography>
                                </Box>
                                <Typography variant="body1" color="text.secondary">
                                    {feature.description}
                                </Typography>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" gutterBottom>
                        Our Mission
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                        To provide a secure, efficient, and user-friendly digital platform that bridges the gap between
                        civil registration offices and religious institutions, ensuring seamless marriage registration
                        and church service management for all users.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default About;
