import React from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Chip,
} from '@mui/material';
import {
    Assignment as AssignmentIcon,
    Church as ChurchIcon,
    People as PeopleIcon,
    Security as SecurityIcon,
} from '@mui/icons-material';

const Services = () => {
    const services = [
        {
            id: 1,
            title: 'Marriage Registration',
            description: 'Complete digital marriage registration process',
            icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
            features: [
                'Online application submission',
                'Document verification',
                'Civil and religious coordination',
                'Digital certificate generation',
            ],
            type: 'registration',
        },
        {
            id: 2,
            title: 'Church Services',
            description: 'Comprehensive church service management',
            icon: <ChurchIcon sx={{ fontSize: 40 }} />,
            features: [
                'Wedding ceremony planning',
                'Baptism arrangements',
                'Confirmation services',
                'Religious event coordination',
            ],
            type: 'religious',
        },
        {
            id: 3,
            title: 'Member Management',
            description: 'Church member information and records',
            icon: <PeopleIcon sx={{ fontSize: 40 }} />,
            features: [
                'Member registration',
                'Family records management',
                'Service attendance tracking',
                'Communication tools',
            ],
            type: 'management',
        },
        {
            id: 4,
            title: 'Security & Verification',
            description: 'Advanced security and verification features',
            icon: <SecurityIcon sx={{ fontSize: 40 }} />,
            features: [
                'Certificate verification',
                'Document authentication',
                'Secure data storage',
                'Audit trail maintenance',
            ],
            type: 'security',
        },
    ];

    const getServiceTypeColor = (type) => {
        switch (type) {
            case 'registration':
                return 'primary';
            case 'religious':
                return 'secondary';
            case 'management':
                return 'success';
            case 'security':
                return 'warning';
            default:
                return 'default';
        }
    };

    return (
        <Box sx={{ py: 8 }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                    <Typography variant="h2" component="h1" gutterBottom>
                        Our Services
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
                        Comprehensive digital solutions for marriage registration and church service management
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {services.map((service) => (
                        <Grid item xs={12} md={6} key={service.id}>
                            <Card sx={{ height: '100%', p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <Box
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: '50%',
                                            bgcolor: `${getServiceTypeColor(service.type)}.light`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mr: 3,
                                            color: `${getServiceTypeColor(service.type)}.main`,
                                        }}
                                    >
                                        {service.icon}
                                    </Box>
                                    <Box>
                                        <Typography variant="h5" component="h3" gutterBottom>
                                            {service.title}
                                        </Typography>
                                        <Chip
                                            label={service.type}
                                            color={getServiceTypeColor(service.type)}
                                            size="small"
                                        />
                                    </Box>
                                </Box>

                                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                    {service.description}
                                </Typography>

                                <Typography variant="h6" gutterBottom>
                                    Key Features:
                                </Typography>
                                <List dense>
                                    {service.features.map((feature, index) => (
                                        <ListItem key={index} sx={{ px: 0 }}>
                                            <ListItemIcon sx={{ minWidth: 36 }}>
                                                <Box
                                                    sx={{
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: '50%',
                                                        bgcolor: `${getServiceTypeColor(service.type)}.main`,
                                                    }}
                                                />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={feature}
                                                primaryTypographyProps={{ variant: 'body2' }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default Services;
