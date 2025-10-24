import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
} from '@mui/material';
import {
    Assessment as ReportIcon,
    Download as DownloadIcon,
    TrendingUp as TrendingUpIcon,
    People as PeopleIcon,
    Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from 'react-query';
import api from '../../config/axios';
import toast from 'react-hot-toast';
import DashboardHeader from '../../components/DashboardHeader';

const Reports = () => {
    const { user } = useAuth();
    const [selectedReport, setSelectedReport] = useState('applications');
    const [dateRange, setDateRange] = useState('30');

    // Fetch report data
    const { data: reportData, isLoading, error } = useQuery(
        ['reports', selectedReport, dateRange],
        () => api.get(`/reports/${selectedReport}?days=${dateRange}`).then(res => res.data),
        {
            enabled: user?.userType === 'civil_admin' || user?.userType === 'super_admin',
        }
    );

    const reportTypes = [
        { value: 'applications', label: 'Marriage Applications', icon: <AssignmentIcon /> },
        { value: 'users', label: 'User Statistics', icon: <PeopleIcon /> },
        { value: 'churches', label: 'Church Activities', icon: <ReportIcon /> },
    ];

    const dateRanges = [
        { value: '7', label: 'Last 7 days' },
        { value: '30', label: 'Last 30 days' },
        { value: '90', label: 'Last 90 days' },
        { value: '365', label: 'Last year' },
    ];

    const handleDownloadReport = () => {
        if (!reportData) {
            toast.error('No data available to download');
            return;
        }

        try {
            // Create CSV content
            let csvContent = '';

            if (selectedReport === 'applications') {
                csvContent = 'Application ID,Date,Groom Name,Bride Name,Status,Church Name\n';
                reportData.details?.forEach(app => {
                    csvContent += `${app.id},${new Date(app.date).toLocaleDateString()},${app.groomName},${app.brideName},${app.status},${app.churchName}\n`;
                });
            } else if (selectedReport === 'users') {
                csvContent = 'User ID,Date,Name,Email,User Type,Status\n';
                reportData.details?.forEach(user => {
                    csvContent += `${user.id},${new Date(user.date).toLocaleDateString()},${user.name},${user.email},${user.userType},${user.isActive ? 'Active' : 'Inactive'}\n`;
                });
            } else if (selectedReport === 'churches') {
                csvContent = 'Church ID,Name,Denomination,Location,Status\n';
                reportData.details?.forEach(church => {
                    csvContent += `${church.id},${church.name},${church.denomination},${church.location},${church.isActive ? 'Active' : 'Inactive'}\n`;
                });
            }

            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${selectedReport}_report_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success('Report downloaded successfully');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download report');
        }
    };

    if (user?.userType !== 'civil_admin' && user?.userType !== 'super_admin') {
        return (
            <Box sx={{ py: 4 }}>
                <Container maxWidth="lg">
                    <Alert severity="error">
                        You do not have permission to access this page.
                    </Alert>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ py: 4 }}>
            <Container maxWidth="lg">
                <DashboardHeader
                    title="Reports & Analytics"
                    subtitle="Generate comprehensive reports and view analytics for your sector"
                />

                {/* Report Controls */}
                <Card sx={{ mb: 4 }}>
                    <CardContent>
                        <Grid container spacing={3} alignItems="center">
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth>
                                    <InputLabel>Report Type</InputLabel>
                                    <Select
                                        value={selectedReport}
                                        onChange={(e) => setSelectedReport(e.target.value)}
                                        label="Report Type"
                                    >
                                        {reportTypes.map((type) => (
                                            <MenuItem key={type.value} value={type.value}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {type.icon}
                                                    {type.label}
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth>
                                    <InputLabel>Date Range</InputLabel>
                                    <Select
                                        value={dateRange}
                                        onChange={(e) => setDateRange(e.target.value)}
                                        label="Date Range"
                                    >
                                        {dateRanges.map((range) => (
                                            <MenuItem key={range.value} value={range.value}>
                                                {range.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Button
                                    variant="contained"
                                    startIcon={<DownloadIcon />}
                                    onClick={handleDownloadReport}
                                    fullWidth
                                    sx={{ height: '56px' }}
                                >
                                    Download Report
                                </Button>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Report Content */}
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error">
                        Failed to load report data: {error.message}
                    </Alert>
                ) : (
                    <Grid container spacing={3}>
                        {/* Summary Cards */}
                        <Grid item xs={12} md={3}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                                    <Typography variant="h4" component="div">
                                        {reportData?.totalApplications || 0}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Applications
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <AssignmentIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                                    <Typography variant="h4" component="div">
                                        {reportData?.approvedApplications || 0}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Approved
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <PeopleIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                                    <Typography variant="h4" component="div">
                                        {reportData?.pendingApplications || 0}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Pending
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Card>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <ReportIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                                    <Typography variant="h4" component="div">
                                        {reportData?.rejectedApplications || 0}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Rejected
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Detailed Report Table */}
                        <Grid item xs={12}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {reportTypes.find(t => t.value === selectedReport)?.label} Report
                                    </Typography>
                                    {reportData?.details && reportData.details.length > 0 ? (
                                        <TableContainer component={Paper}>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Date</TableCell>
                                                        <TableCell>Application ID</TableCell>
                                                        <TableCell>Couple Names</TableCell>
                                                        <TableCell>Status</TableCell>
                                                        <TableCell>Church</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {reportData.details.map((item, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>
                                                                {new Date(item.date).toLocaleDateString()}
                                                            </TableCell>
                                                            <TableCell>#{item.id}</TableCell>
                                                            <TableCell>
                                                                {item.groomName} & {item.brideName}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={item.status}
                                                                    color={
                                                                        item.status === 'approved' ? 'success' :
                                                                            item.status === 'pending' ? 'warning' : 'error'
                                                                    }
                                                                    size="small"
                                                                />
                                                            </TableCell>
                                                            <TableCell>{item.churchName || 'N/A'}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    ) : (
                                        <Alert severity="info">
                                            No data available for the selected report type and date range.
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}
            </Container>
        </Box>
    );
};

export default Reports;
