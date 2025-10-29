import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    CircularProgress,
    Alert,
    Fab,
    Tooltip,
    Menu,
    MenuItem as MenuItemComponent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    LinearProgress
} from '@mui/material';
import {
    CloudUpload as CloudUploadIcon,
    Download as DownloadIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    MoreVert as MoreVertIcon,
    Description as DescriptionIcon,
    Image as ImageIcon,
    PictureAsPdf as PdfIcon,
    InsertDriveFile as FileIcon,
    Add as AddIcon,
    Search as SearchIcon,
    FilterList as FilterIcon
} from '@mui/icons-material';
import api from '../../config/axios';
import toast from 'react-hot-toast';

const Documents = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const [uploadData, setUploadData] = useState({
        file: null,
        category: '',
        description: '',
        isPublic: false
    });

    const [editData, setEditData] = useState({
        category: '',
        description: '',
        isPublic: false
    });

    useEffect(() => {
        fetchDocuments();
        fetchCategories();
    }, [page, rowsPerPage, selectedCategory]);

    const fetchDocuments = async () => {
        try {
            const params = new URLSearchParams({
                page: (page + 1).toString(),
                limit: rowsPerPage.toString()
            });

            if (selectedCategory) {
                params.append('category', selectedCategory);
            }

            const response = await api.get(`/documents?${params}`);
            setDocuments(response.data.documents || []);
            setTotalCount(response.data.totalCount || 0);
        } catch (error) {
            console.error('Error fetching documents:', error);
            toast.error('Failed to load documents');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/documents/categories');
            setCategories(response.data.categories || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Check file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                toast.error('File size must be less than 10MB');
                return;
            }
            setUploadData(prev => ({ ...prev, file }));
        }
    };

    const handleUpload = async () => {
        if (!uploadData.file) {
            toast.error('Please select a file');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('file', uploadData.file);
            formData.append('category', uploadData.category);
            formData.append('description', uploadData.description);
            formData.append('isPublic', uploadData.isPublic.toString());

            const response = await api.post('/documents/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                },
            });

            toast.success('File uploaded successfully');
            setUploadDialogOpen(false);
            setUploadData({ file: null, category: '', description: '', isPublic: false });
            fetchDocuments();
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload file');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDownload = async (document) => {
        try {
            const response = await api.get(`/documents/${document.id}/download`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', document.originalName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('File downloaded successfully');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download file');
        }
    };

    const handleDelete = async (documentId) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            try {
                await api.delete(`/documents/${documentId}`);
                toast.success('Document deleted successfully');
                fetchDocuments();
            } catch (error) {
                console.error('Delete error:', error);
                toast.error('Failed to delete document');
            }
        }
    };

    const handleEdit = (document) => {
        setSelectedDocument(document);
        setEditData({
            category: document.category,
            description: document.description || '',
            isPublic: document.isPublic
        });
        setEditDialogOpen(true);
    };

    const handleUpdateDocument = async () => {
        try {
            await api.put(`/documents/${selectedDocument.id}`, editData);
            toast.success('Document updated successfully');
            setEditDialogOpen(false);
            fetchDocuments();
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Failed to update document');
        }
    };

    const getFileIcon = (mimeType) => {
        if (mimeType.startsWith('image/')) {
            return <ImageIcon />;
        } else if (mimeType === 'application/pdf') {
            return <PdfIcon />;
        } else {
            return <FileIcon />;
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getCategoryLabel = (category) => {
        const categoryObj = categories.find(cat => cat.value === category);
        return categoryObj ? categoryObj.label : category;
    };

    const handleMenuOpen = (event, document) => {
        setAnchorEl(event.currentTarget);
        setSelectedDocument(document);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedDocument(null);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    if (loading) {
        return (
            <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ py: 4 }}>
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" component="h1">
                        Documents
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<CloudUploadIcon />}
                        onClick={() => setUploadDialogOpen(true)}
                    >
                        Upload Document
                    </Button>
                </Box>

                {/* Filters */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    label="Search documents"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <FormControl fullWidth>
                                    <InputLabel>Category</InputLabel>
                                    <Select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        label="Category"
                                    >
                                        <MenuItem value="">All Categories</MenuItem>
                                        {categories.map((category) => (
                                            <MenuItem key={category.value} value={category.value}>
                                                {category.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Documents Table */}
                <Card>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Size</TableCell>
                                    <TableCell>Uploaded</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {documents.map((document) => (
                                    <TableRow key={document.id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {getFileIcon(document.mimeType)}
                                                <Box>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {document.originalName}
                                                    </Typography>
                                                    {document.description && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            {document.description}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={getCategoryLabel(document.category)}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {formatFileSize(document.fileSize)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {formatDate(document.createdAt)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={document.isPublic ? 'Public' : 'Private'}
                                                size="small"
                                                color={document.isPublic ? 'success' : 'default'}
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                onClick={() => handleDownload(document)}
                                                size="small"
                                                title="Download"
                                            >
                                                <DownloadIcon />
                                            </IconButton>
                                            <IconButton
                                                onClick={(e) => handleMenuOpen(e, document)}
                                                size="small"
                                            >
                                                <MoreVertIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={totalCount}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Card>

                {/* Upload Dialog */}
                <Dialog
                    open={uploadDialogOpen}
                    onClose={() => setUploadDialogOpen(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>Upload Document</DialogTitle>
                    <DialogContent>
                        <Box sx={{ mt: 2 }}>
                            <input
                                accept="image/*,.pdf,.doc,.docx,.txt"
                                style={{ display: 'none' }}
                                id="file-upload"
                                type="file"
                                onChange={handleFileSelect}
                            />
                            <label htmlFor="file-upload">
                                <Button
                                    variant="outlined"
                                    component="span"
                                    startIcon={<CloudUploadIcon />}
                                    fullWidth
                                    sx={{ mb: 2 }}
                                >
                                    Choose File
                                </Button>
                            </label>

                            {uploadData.file && (
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    Selected: {uploadData.file.name} ({formatFileSize(uploadData.file.size)})
                                </Alert>
                            )}

                            {uploading && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" gutterBottom>
                                        Uploading... {uploadProgress}%
                                    </Typography>
                                    <LinearProgress variant="determinate" value={uploadProgress} />
                                </Box>
                            )}

                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={uploadData.category}
                                    onChange={(e) => setUploadData(prev => ({ ...prev, category: e.target.value }))}
                                    label="Category"
                                >
                                    {categories.map((category) => (
                                        <MenuItem key={category.value} value={category.value}>
                                            {category.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField
                                fullWidth
                                label="Description (Optional)"
                                multiline
                                rows={3}
                                value={uploadData.description}
                                onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                                sx={{ mb: 2 }}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleUpload}
                            variant="contained"
                            disabled={uploading || !uploadData.file}
                        >
                            Upload
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Edit Dialog */}
                <Dialog
                    open={editDialogOpen}
                    onClose={() => setEditDialogOpen(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>Edit Document</DialogTitle>
                    <DialogContent>
                        <Box sx={{ mt: 2 }}>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={editData.category}
                                    onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
                                    label="Category"
                                >
                                    {categories.map((category) => (
                                        <MenuItem key={category.value} value={category.value}>
                                            {category.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField
                                fullWidth
                                label="Description"
                                multiline
                                rows={3}
                                value={editData.description}
                                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                                sx={{ mb: 2 }}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleUpdateDocument}
                            variant="contained"
                        >
                            Update
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Context Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    <MenuItemComponent onClick={() => {
                        handleEdit(selectedDocument);
                        handleMenuClose();
                    }}>
                        <EditIcon sx={{ mr: 1 }} />
                        Edit
                    </MenuItemComponent>
                    <MenuItemComponent onClick={() => {
                        handleDelete(selectedDocument.id);
                        handleMenuClose();
                    }}>
                        <DeleteIcon sx={{ mr: 1 }} />
                        Delete
                    </MenuItemComponent>
                </Menu>
            </Container>
        </Box>
    );
};

export default Documents;








