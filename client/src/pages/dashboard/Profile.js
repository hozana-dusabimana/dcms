import React from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
} from '@mui/material';
import DashboardHeader from '../../components/DashboardHeader';

const Profile = () => {
    return (
        <Box sx={{ py: 4 }}>
            <Container maxWidth="lg">
                <DashboardHeader
                    title="Profile Settings"
                    subtitle="Manage your account settings and preferences"
                />

                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Profile Settings
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Profile management functionality will be implemented here.
                        </Typography>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};

export default Profile;