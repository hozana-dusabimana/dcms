import React from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    useTheme,
} from '@mui/material';
import {
    Assignment as AssignmentIcon,
    People as PeopleIcon,
    Church as ChurchIcon,
    Notifications as NotificationsIcon,
    Business as BusinessIcon,
    Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../components/DashboardHeader';

const Dashboard = () => {
    const theme = useTheme();
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleButtonClick = (action, userType) => {
        switch (action) {
            case 'View Applications':
                navigate('/dashboard/applications');
                break;
            case 'Review Applications':
                navigate('/dashboard/applications');
                break;
            case 'Manage Documents':
                navigate('/dashboard/profile');
                break;
            case 'View Notifications':
                navigate('/dashboard/notifications');
                break;
            case 'Manage Services':
                navigate('/dashboard/church-services');
                break;
            case 'View Members':
                navigate('/dashboard/church-members');
                break;
            case 'Manage Users':
                navigate('/dashboard/users');
                break;
            case 'Manage Sectors':
                navigate('/dashboard/sectors');
                break;
            case 'Manage Churches':
                navigate('/dashboard/churches');
                break;
            case 'Manage Sector':
                navigate('/dashboard/users');
                break;
            case 'View Reports':
                navigate('/dashboard/reports');
                break;
            case 'Request Certificate':
                navigate('/dashboard/certificate-requests');
                break;
            case 'Manage Certificates':
                navigate('/dashboard/certificate-management');
                break;
            default:
                console.log('Action not implemented:', action);
        }
    };

    const getDashboardContent = () => {
        switch (user?.userType) {
            case 'couple':
                return {
                    title: 'Your Marriage Application Dashboard',
                    description: 'Track your marriage registration progress and manage your application.',
                    cards: [
                        {
                            title: 'My Applications',
                            description: 'View and track your marriage applications',
                            icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
                            color: theme.palette.primary.main,
                            action: 'View Applications',
                        },
                        {
                            title: 'Certificate Requests',
                            description: 'Request and manage wedding certificates',
                            icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
                            color: theme.palette.secondary.main,
                            action: 'Request Certificate',
                        },
                        {
                            title: 'Notifications',
                            description: 'View important updates and messages',
                            icon: <NotificationsIcon sx={{ fontSize: 40 }} />,
                            color: theme.palette.success.main,
                            action: 'View Notifications',
                        },
                    ],
                };
            case 'church_leader':
                return {
                    title: 'Church Management Dashboard',
                    description: 'Manage your church services and review marriage applications.',
                    cards: [
                        {
                            title: 'Applications to Review',
                            description: 'Review marriage applications for religious ceremonies',
                            icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
                            color: theme.palette.primary.main,
                            action: 'Review Applications',
                        },
                        {
                            title: 'Church Services',
                            description: 'Manage scheduled ceremonies and services',
                            icon: <ChurchIcon sx={{ fontSize: 40 }} />,
                            color: theme.palette.secondary.main,
                            action: 'Manage Services',
                        },
                        {
                            title: 'Church Members',
                            description: 'View and manage church member information',
                            icon: <PeopleIcon sx={{ fontSize: 40 }} />,
                            color: theme.palette.success.main,
                            action: 'View Members',
                        },
                    ],
                };
            case 'civil_admin':
                return {
                    title: 'Civil Administration Dashboard',
                    description: 'Manage civil marriage registrations and sector operations.',
                    cards: [
                        {
                            title: 'Applications to Review',
                            description: 'Review civil marriage applications',
                            icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
                            color: theme.palette.primary.main,
                            action: 'Review Applications',
                        },
                        {
                            title: 'User Management',
                            description: 'Manage user accounts and permissions',
                            icon: <PeopleIcon sx={{ fontSize: 40 }} />,
                            color: theme.palette.secondary.main,
                            action: 'Manage Users',
                        },
                        {
                            title: 'Sector Management',
                            description: 'Manage civil sectors and administrative areas',
                            icon: <BusinessIcon sx={{ fontSize: 40 }} />,
                            color: theme.palette.info.main,
                            action: 'Manage Sectors',
                        },
                        {
                            title: 'Church Management',
                            description: 'Manage registered churches and institutions',
                            icon: <ChurchIcon sx={{ fontSize: 40 }} />,
                            color: theme.palette.warning.main,
                            action: 'Manage Churches',
                        },
                        {
                            title: 'Reports',
                            description: 'Generate reports and view analytics',
                            icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
                            color: theme.palette.success.main,
                            action: 'View Reports',
                        },
                        {
                            title: 'Certificate Management',
                            description: 'Manage wedding certificate requests',
                            icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
                            color: theme.palette.info.main,
                            action: 'Manage Certificates',
                        },
                    ],
                };
            case 'super_admin':
                return {
                    title: 'Super Administrator Dashboard',
                    description: 'Full system administration and management capabilities.',
                    cards: [
                        {
                            title: 'Applications to Review',
                            description: 'Review civil marriage applications',
                            icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
                            color: theme.palette.primary.main,
                            action: 'Review Applications',
                        },
                        {
                            title: 'User Management',
                            description: 'Manage user accounts and permissions',
                            icon: <PeopleIcon sx={{ fontSize: 40 }} />,
                            color: theme.palette.secondary.main,
                            action: 'Manage Users',
                        },
                        {
                            title: 'Sector Management',
                            description: 'Manage civil sectors and administrative areas',
                            icon: <BusinessIcon sx={{ fontSize: 40 }} />,
                            color: theme.palette.info.main,
                            action: 'Manage Sectors',
                        },
                        {
                            title: 'Church Management',
                            description: 'Manage registered churches and institutions',
                            icon: <ChurchIcon sx={{ fontSize: 40 }} />,
                            color: theme.palette.warning.main,
                            action: 'Manage Churches',
                        },
                        {
                            title: 'Reports',
                            description: 'Generate reports and view analytics',
                            icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
                            color: theme.palette.success.main,
                            action: 'View Reports',
                        },
                        {
                            title: 'Certificate Management',
                            description: 'Manage wedding certificate requests',
                            icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
                            color: theme.palette.info.main,
                            action: 'Manage Certificates',
                        },
                    ],
                };
            default:
                return {
                    title: 'Dashboard',
                    description: 'Welcome to your DMCS MIS dashboard.',
                    cards: [],
                };
        }
    };

    const dashboardContent = getDashboardContent();

    return (
        <Box sx={{ py: 4 }}>
            <Container maxWidth="lg">
                <DashboardHeader
                    title={dashboardContent.title}
                    subtitle={dashboardContent.description}
                    showBackButton={false}
                />

                <Grid container spacing={3}>
                    {dashboardContent.cards.map((card, index) => (
                        <Grid item xs={12} md={4} key={index}>
                            <Card sx={{ height: '100%', p: 3 }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Box
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: '50%',
                                            bgcolor: `${card.color}20`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mx: 'auto',
                                            mb: 2,
                                            color: card.color,
                                        }}
                                    >
                                        {card.icon}
                                    </Box>
                                    <Typography variant="h6" component="h3" gutterBottom>
                                        {card.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                        {card.description}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        sx={{ bgcolor: card.color }}
                                        onClick={() => handleButtonClick(card.action, user?.userType)}
                                    >
                                        {card.action}
                                    </Button>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default Dashboard;
