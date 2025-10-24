import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// Context
import { AuthProvider } from './contexts/AuthContext';
import { MemberAuthProvider } from './contexts/MemberAuthContext';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import MemberProtectedRoute from './components/MemberProtectedRoute';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MarriageRegistration from './pages/MarriageRegistration';
import Churches from './pages/Churches';
import Services from './pages/Services';
import Certificates from './pages/Certificates';
import Gallery from './pages/Gallery';
import Events from './pages/Events';
import Contact from './pages/Contact';
import About from './pages/About';

// Dashboard Pages
import Dashboard from './pages/dashboard/Dashboard';
import Applications from './pages/dashboard/Applications';
import ApplicationReview from './pages/dashboard/ApplicationReview';
import ChurchManagement from './pages/dashboard/ChurchManagement';
import SectorManagement from './pages/dashboard/SectorManagement';
import CertificateRequest from './pages/dashboard/CertificateRequest';
import CertificateRequestDetails from './pages/dashboard/CertificateRequestDetails';
import CertificateManagement from './pages/dashboard/CertificateManagement';
import UserManagement from './pages/dashboard/UserManagement';
import Reports from './pages/dashboard/Reports';
import Messages from './pages/dashboard/Messages';
import Notifications from './pages/dashboard/Notifications';
import Profile from './pages/dashboard/Profile';
import Documents from './pages/dashboard/Documents';
import ChurchServices from './pages/dashboard/ChurchServices';
import ChurchMembers from './pages/dashboard/ChurchMembers';
import AddChurchService from './pages/dashboard/AddChurchService';
import AddChurchMember from './pages/dashboard/AddChurchMember';

// Member Pages
import MemberLogin from './pages/MemberLogin';
import MemberDashboard from './pages/MemberDashboard';

// Create React Query client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

// Create Material-UI theme
const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
            light: '#42a5f5',
            dark: '#1565c0',
        },
        secondary: {
            main: '#dc004e',
        },
        background: {
            default: '#f5f5f5',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontSize: '2.5rem',
            fontWeight: 600,
        },
        h2: {
            fontSize: '2rem',
            fontWeight: 600,
        },
        h3: {
            fontSize: '1.75rem',
            fontWeight: 500,
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 8,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                },
            },
        },
    },
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <AuthProvider>
                        <MemberAuthProvider>
                            <Router>
                                <div className="App">
                                    <Routes>
                                        {/* Public Routes */}
                                        <Route path="/" element={<Layout><Home /></Layout>} />
                                        <Route path="/login" element={<Login />} />
                                        <Route path="/register" element={<Register />} />
                                        <Route path="/about" element={<Layout><About /></Layout>} />
                                        <Route path="/churches" element={<Layout><Churches /></Layout>} />
                                        <Route path="/services" element={<Layout><Services /></Layout>} />
                                        <Route path="/certificates" element={<Layout><Certificates /></Layout>} />
                                        <Route path="/gallery" element={<Layout><Gallery /></Layout>} />
                                        <Route path="/events" element={<Layout><Events /></Layout>} />
                                        <Route path="/contact" element={<Layout><Contact /></Layout>} />

                                        {/* Member Routes */}
                                        <Route path="/member-login" element={<MemberLogin />} />
                                        <Route path="/member-dashboard" element={
                                            <MemberProtectedRoute>
                                                <MemberDashboard />
                                            </MemberProtectedRoute>
                                        } />

                                        {/* Protected Routes */}
                                        <Route path="/marriage-registration" element={
                                            <ProtectedRoute>
                                                <Layout><MarriageRegistration /></Layout>
                                            </ProtectedRoute>
                                        } />

                                        {/* Dashboard Routes */}
                                        <Route path="/dashboard" element={
                                            <ProtectedRoute>
                                                <Dashboard />
                                            </ProtectedRoute>
                                        } />
                                        <Route path="/dashboard/applications" element={
                                            <ProtectedRoute>
                                                <Applications />
                                            </ProtectedRoute>
                                        } />
                                        <Route path="/dashboard/applications/:id" element={
                                            <ProtectedRoute>
                                                <ApplicationReview />
                                            </ProtectedRoute>
                                        } />
                                        <Route path="/dashboard/churches" element={
                                            <ProtectedRoute allowedRoles={['church_leader', 'civil_admin', 'super_admin']}>
                                                <ChurchManagement />
                                            </ProtectedRoute>
                                        } />
                                        <Route path="/dashboard/sectors" element={
                                            <ProtectedRoute allowedRoles={['civil_admin', 'super_admin']}>
                                                <SectorManagement />
                                            </ProtectedRoute>
                                        } />
                                        <Route path="/dashboard/users" element={
                                            <ProtectedRoute allowedRoles={['civil_admin', 'super_admin']}>
                                                <UserManagement />
                                            </ProtectedRoute>
                                        } />
                                        <Route path="/dashboard/reports" element={
                                            <ProtectedRoute allowedRoles={['civil_admin', 'super_admin']}>
                                                <Reports />
                                            </ProtectedRoute>
                                        } />
                                        <Route path="/dashboard/certificate-requests" element={
                                            <ProtectedRoute>
                                                <CertificateRequest />
                                            </ProtectedRoute>
                                        } />
                                        <Route path="/dashboard/certificate-requests/:id" element={
                                            <ProtectedRoute>
                                                <CertificateRequestDetails />
                                            </ProtectedRoute>
                                        } />
                                        <Route path="/dashboard/certificate-management" element={
                                            <ProtectedRoute allowedRoles={['civil_admin', 'super_admin']}>
                                                <CertificateManagement />
                                            </ProtectedRoute>
                                        } />
                                        <Route path="/dashboard/messages" element={
                                            <ProtectedRoute>
                                                <Messages />
                                            </ProtectedRoute>
                                        } />
                                        <Route path="/dashboard/notifications" element={
                                            <ProtectedRoute>
                                                <Notifications />
                                            </ProtectedRoute>
                                        } />
                                        <Route path="/dashboard/profile" element={
                                            <ProtectedRoute>
                                                <Profile />
                                            </ProtectedRoute>
                                        } />
                                        <Route path="/dashboard/documents" element={
                                            <ProtectedRoute>
                                                <Documents />
                                            </ProtectedRoute>
                                        } />
                                        <Route path="/dashboard/church-services" element={
                                            <ProtectedRoute allowedRoles={['church_leader', 'super_admin']}>
                                                <ChurchServices />
                                            </ProtectedRoute>
                                        } />
                                        <Route path="/dashboard/church-members" element={
                                            <ProtectedRoute allowedRoles={['church_leader', 'super_admin']}>
                                                <ChurchMembers />
                                            </ProtectedRoute>
                                        } />
                                        <Route path="/dashboard/church-services/new" element={
                                            <ProtectedRoute allowedRoles={['church_leader', 'super_admin']}>
                                                <AddChurchService />
                                            </ProtectedRoute>
                                        } />
                                        <Route path="/dashboard/church-members/new" element={
                                            <ProtectedRoute allowedRoles={['church_leader', 'super_admin']}>
                                                <AddChurchMember />
                                            </ProtectedRoute>
                                        } />
                                        <Route path="/dashboard/church-services/:id/edit" element={
                                            <ProtectedRoute allowedRoles={['church_leader', 'super_admin']}>
                                                <AddChurchService />
                                            </ProtectedRoute>
                                        } />
                                        <Route path="/dashboard/church-members/:id/edit" element={
                                            <ProtectedRoute allowedRoles={['church_leader', 'super_admin']}>
                                                <AddChurchMember />
                                            </ProtectedRoute>
                                        } />

                                        {/* Catch all route */}
                                        <Route path="*" element={<Navigate to="/" replace />} />
                                    </Routes>

                                    {/* Toast notifications */}
                                    <Toaster
                                        position="top-right"
                                        toastOptions={{
                                            duration: 4000,
                                            style: {
                                                background: '#363636',
                                                color: '#fff',
                                            },
                                            success: {
                                                duration: 3000,
                                                iconTheme: {
                                                    primary: '#4caf50',
                                                    secondary: '#fff',
                                                },
                                            },
                                            error: {
                                                duration: 5000,
                                                iconTheme: {
                                                    primary: '#f44336',
                                                    secondary: '#fff',
                                                },
                                            },
                                        }}
                                    />
                                </div>
                            </Router>
                        </MemberAuthProvider>
                    </AuthProvider>
                </LocalizationProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}

export default App;
