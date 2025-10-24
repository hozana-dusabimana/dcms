import React from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardMedia,
    CardContent,
} from '@mui/material';

const Gallery = () => {
    // Mock data - in real app, this would come from API
    const galleryImages = [
        {
            id: 1,
            title: 'Wedding Ceremony',
            image: '/images/hotel/gallery-1.webp',
            category: 'ceremony',
        },
        {
            id: 2,
            title: 'Church Interior',
            image: '/images/hotel/gallery-3.webp',
            category: 'venue',
        },
        {
            id: 3,
            title: 'Marriage Registration',
            image: '/images/hotel/gallery-5.webp',
            category: 'registration',
        },
        {
            id: 4,
            title: 'Certificate Ceremony',
            image: '/images/hotel/gallery-7.webp',
            category: 'ceremony',
        },
        {
            id: 5,
            title: 'Church Exterior',
            image: '/images/hotel/gallery-8.webp',
            category: 'venue',
        },
        {
            id: 6,
            title: 'Family Celebration',
            image: '/images/hotel/gallery-12.webp',
            category: 'celebration',
        },
        {
            id: 7,
            title: 'Wedding Reception',
            image: '/images/hotel/gallery-15.webp',
            category: 'celebration',
        },
        {
            id: 8,
            title: 'Religious Ceremony',
            image: '/images/hotel/gallery-18.webp',
            category: 'ceremony',
        },
    ];

    return (
        <Box sx={{ py: 8 }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Typography variant="h2" component="h1" gutterBottom>
                        Gallery
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Explore our collection of wedding ceremonies, church venues, and marriage registration moments
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {galleryImages.map((item) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                            <Card sx={{ height: '100%' }}>
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={item.image}
                                    alt={item.title}
                                    sx={{
                                        objectFit: 'cover',
                                        transition: 'transform 0.3s ease-in-out',
                                        '&:hover': {
                                            transform: 'scale(1.05)',
                                        },
                                    }}
                                />
                                <CardContent>
                                    <Typography variant="h6" component="h3" gutterBottom>
                                        {item.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                                        {item.category}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default Gallery;
