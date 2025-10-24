import React from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Button,
} from '@mui/material';
import { LocationOn, Phone, Email } from '@mui/icons-material';

const Churches = () => {
    // Mock data - in real app, this would come from API
    const churches = [
        {
            id: 1,
            name: 'St. Mary\'s Cathedral',
            denomination: 'Catholic',
            location: 'Downtown District',
            phone: '+1 (555) 123-4567',
            email: 'info@stmarys.org',
            capacity: 500,
            facilities: ['Parking', 'Accessibility', 'Sound System'],
            image: '/images/hotel/showcase-3.webp',
        },
        {
            id: 2,
            name: 'Grace Community Church',
            denomination: 'Protestant',
            location: 'Suburban Area',
            phone: '+1 (555) 234-5678',
            email: 'contact@gracechurch.org',
            capacity: 300,
            facilities: ['Parking', 'Childcare', 'Coffee Shop'],
            image: '/images/hotel/showcase-7.webp',
        },
        {
            id: 3,
            name: 'Holy Trinity Orthodox',
            denomination: 'Orthodox',
            location: 'Historic District',
            phone: '+1 (555) 345-6789',
            email: 'office@holytrinity.org',
            capacity: 200,
            facilities: ['Parking', 'Accessibility'],
            image: '/images/hotel/showcase-8.webp',
        },
    ];

    return (
        <Box sx={{ py: 8 }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Typography variant="h2" component="h1" gutterBottom>
                        Partner Churches
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Discover our network of partner churches available for your marriage ceremony
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {churches.map((church) => (
                        <Grid item xs={12} md={6} lg={4} key={church.id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={church.image}
                                    alt={church.name}
                                />
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="h5" component="h3" gutterBottom>
                                        {church.name}
                                    </Typography>

                                    <Chip
                                        label={church.denomination}
                                        color="primary"
                                        size="small"
                                        sx={{ mb: 2 }}
                                    />

                                    <Box sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <LocationOn color="action" sx={{ mr: 1, fontSize: 20 }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {church.location}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <Phone color="action" sx={{ mr: 1, fontSize: 20 }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {church.phone}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <Email color="action" sx={{ mr: 1, fontSize: 20 }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {church.email}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        Capacity: {church.capacity} people
                                    </Typography>

                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Facilities:
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {church.facilities.map((facility, index) => (
                                                <Chip
                                                    key={index}
                                                    label={facility}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            ))}
                                        </Box>
                                    </Box>

                                    <Button
                                        variant="contained"
                                        fullWidth
                                        sx={{ mt: 'auto' }}
                                    >
                                        Contact Church
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default Churches;
