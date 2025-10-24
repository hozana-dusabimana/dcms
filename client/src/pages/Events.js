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
import { CalendarToday, LocationOn, AccessTime } from '@mui/icons-material';

const Events = () => {
    // Mock data - in real app, this would come from API
    const events = [
        {
            id: 1,
            title: 'Marriage Preparation Workshop',
            date: '2024-02-15',
            time: '10:00 AM',
            location: 'Community Center',
            description: 'A comprehensive workshop for couples preparing for marriage.',
            type: 'workshop',
            image: '/images/hotel/event-1.webp',
        },
        {
            id: 2,
            title: 'Church Service Planning Session',
            date: '2024-02-20',
            time: '2:00 PM',
            location: 'St. Mary\'s Cathedral',
            description: 'Learn about planning your church wedding ceremony.',
            type: 'planning',
            image: '/images/hotel/event-2.webp',
        },
        {
            id: 3,
            title: 'Marriage Registration Information Session',
            date: '2024-02-25',
            time: '6:00 PM',
            location: 'Government Building',
            description: 'Information session about the marriage registration process.',
            type: 'information',
            image: '/images/hotel/event-4.webp',
        },
    ];

    const getEventTypeColor = (type) => {
        switch (type) {
            case 'workshop':
                return 'primary';
            case 'planning':
                return 'secondary';
            case 'information':
                return 'success';
            default:
                return 'default';
        }
    };

    return (
        <Box sx={{ py: 8 }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Typography variant="h2" component="h1" gutterBottom>
                        Upcoming Events
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Join our events and workshops to learn more about marriage registration and church services
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {events.map((event) => (
                        <Grid item xs={12} md={6} lg={4} key={event.id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={event.image}
                                    alt={event.title}
                                />
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Typography variant="h5" component="h3">
                                            {event.title}
                                        </Typography>
                                        <Chip
                                            label={event.type}
                                            color={getEventTypeColor(event.type)}
                                            size="small"
                                        />
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <CalendarToday color="action" sx={{ mr: 1, fontSize: 20 }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {new Date(event.date).toLocaleDateString()}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <AccessTime color="action" sx={{ mr: 1, fontSize: 20 }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {event.time}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <LocationOn color="action" sx={{ mr: 1, fontSize: 20 }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {event.location}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                        {event.description}
                                    </Typography>

                                    <Button
                                        variant="contained"
                                        fullWidth
                                        sx={{ mt: 'auto' }}
                                    >
                                        Register for Event
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

export default Events;
