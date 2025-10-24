import React from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    TextField,
    Button,
    Alert,
} from '@mui/material';
import { Send as SendIcon, LocationOn, Phone, Email } from '@mui/icons-material';

const Contact = () => {
    return (
        <Box sx={{ py: 8 }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Typography variant="h2" component="h1" gutterBottom>
                        Contact Us
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Get in touch with us for any questions or support
                    </Typography>
                </Box>

                <Grid container spacing={6}>
                    <Grid item xs={12} md={6}>
                        <Card sx={{ p: 4, height: '100%' }}>
                            <Typography variant="h5" gutterBottom>
                                Send us a Message
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Fill out the form below and we'll get back to you as soon as possible.
                            </Typography>

                            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    variant="outlined"
                                />
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    type="email"
                                    variant="outlined"
                                />
                                <TextField
                                    fullWidth
                                    label="Subject"
                                    variant="outlined"
                                />
                                <TextField
                                    fullWidth
                                    label="Message"
                                    multiline
                                    rows={4}
                                    variant="outlined"
                                />
                                <Button
                                    variant="contained"
                                    startIcon={<SendIcon />}
                                    size="large"
                                    sx={{ alignSelf: 'flex-start' }}
                                >
                                    Send Message
                                </Button>
                            </Box>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card sx={{ p: 4, height: '100%' }}>
                            <Typography variant="h5" gutterBottom>
                                Contact Information
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Reach out to us through any of the following channels.
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <LocationOn color="primary" sx={{ mr: 2, fontSize: 24 }} />
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="medium">
                                            Address
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            123 Government Building<br />
                                            Kigali, Rwanda
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Phone color="primary" sx={{ mr: 2, fontSize: 24 }} />
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="medium">
                                            Phone
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            +250 788 123 456
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Email color="primary" sx={{ mr: 2, fontSize: 24 }} />
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight="medium">
                                            Email
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            info@dmcs-mis.gov.rw
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            <Alert severity="info" sx={{ mt: 3 }}>
                                <Typography variant="body2">
                                    <strong>Business Hours:</strong><br />
                                    Monday - Friday: 8:00 AM - 5:00 PM<br />
                                    Saturday: 9:00 AM - 1:00 PM<br />
                                    Sunday: Closed
                                </Typography>
                            </Alert>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Contact;
