import React from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    TextField,
    Button,
    Alert,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

const Certificates = () => {
    return (
        <Box sx={{ py: 8 }}>
            <Container maxWidth="md">
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Typography variant="h2" component="h1" gutterBottom>
                        Certificate Verification
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Verify the authenticity of marriage certificates issued through our system
                    </Typography>
                </Box>

                <Card sx={{ p: 4 }}>
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            Certificate Verification
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Enter the certificate number to verify its authenticity and view details.
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                            <TextField
                                fullWidth
                                label="Certificate Number"
                                placeholder="Enter certificate number"
                                variant="outlined"
                            />
                            <Button
                                variant="contained"
                                startIcon={<SearchIcon />}
                                sx={{ minWidth: 120 }}
                            >
                                Verify
                            </Button>
                        </Box>

                        <Alert severity="info">
                            Certificate verification feature will be available soon. This will allow you to verify
                            the authenticity of marriage certificates issued through the DMCS MIS system.
                        </Alert>
                    </Box>
                </Card>
            </Container>
        </Box>
    );
};

export default Certificates;
