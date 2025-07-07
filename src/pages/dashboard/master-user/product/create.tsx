import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  // DialogContentText, // Removed this import, will use Typography instead for consistency
  DialogActions,
  CircularProgress, // Added CircularProgress for button loading state
  Card, // Added Card for the main form container
  CardContent, // Added CardContent
  IconButton, // Added IconButton for image removal
} from '@mui/material';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { CreateProducts } from '../../../../hooks/useMutation/PostProduct';
import { FormCreateProducts } from '../../../../Types';
import DashboardLayout from '../../../../component/template/DashboardLayout';

// Image imports from the previous example
import placeholderImage from '../../../../assets/product.jpg'; // Re-using for left side illustration
import successImage from '../../../../assets/bundlepassed.jpg'; // For success dialog
import errorImage from '../../../../assets/bundleallert.png'; // For error/validation dialog

import { ArrowBack } from '@mui/icons-material'; // Import ArrowBack icon

export const Route = createFileRoute('/dashboard/master-user/product/create')({
  component: RouteComponent,
});

function RouteComponent() {
  // State untuk form product create
  const [formData, setFormData] = useState<FormCreateProducts>({
    name: '',
    description: '',
    price: null,
    stock: null,
    imageFile: null,
  });

  // State for image preview URL, managed by style requirements
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // State untuk dialog success - RENAMED to openDialog and dialogContent to match style requirement
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState<{
    title: string;
    message: string;
    image: string;
  } | null>(null);

  const createProduct = CreateProducts();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProduct.mutate(formData, {
      onSuccess: () => {
        // Renamed from setOpenSuccessDialog(true)
        setDialogContent({
          title: 'Success!',
          message: 'Product has been created successfully.',
          image: successImage,
        });
        setOpenDialog(true);
        // Reset form after successful submission
        setFormData({
          name: '',
          description: '',
          price: null,
          stock: null,
          imageFile: null,
        });
        setImagePreviewUrl(null); // Reset image preview
      },
      onError: (error: any) => { // Added onError to show error dialog matching style
        const errorMessage = error?.response?.data?.errors?.ImageFile?.[0] ||
                             error?.response?.data?.errors?.Description?.[0] ||
                             error?.response?.data?.title ||
                             error.message || 'Unknown error occurred.';
        setDialogContent({
          title: 'Error!',
          message: errorMessage,
          image: errorImage,
        });
        setOpenDialog(true);
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        imageFile: file,
      });
      // Set image preview URL for display
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData({ // Clear imageFile if no file selected
        ...formData,
        imageFile: null,
      });
      setImagePreviewUrl(null); // Clear image preview
    }
  };

  const removeImage = () => { // New function to remove image based on style requirements
    setFormData((prev) => ({ ...prev, imageFile: null }));
    setImagePreviewUrl(null);
  };

  // Renamed from handleCloseSuccessDialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogContent(null); // Clear dialog content on close
  };

  return (
    <DashboardLayout>
      <Box p={4} sx={{ backgroundColor: '#fff', minHeight: '100vh' }}>
        <Box sx={{ mb: 3 }}>
          <Button
            component={Link}
            to="/dashboard/master-user/product" // Assuming this is the product list page
            startIcon={<ArrowBack />}
            sx={{ color: '#000', textTransform: 'none', fontWeight: 'bold' }}
          >
            Back
          </Button>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" fontWeight="bold" sx={{ color: 'text.primary' }}>
            <Box component="span" sx={{ borderLeft: '15px solid #FFD100', pl: 1, mr: 1 }}></Box>
            Create New Product
          </Typography>
          <Typography variant="subtitle1" sx={{ ml: 2.5, color: 'text.secondary' }}>
            Input Product Details
          </Typography>
        </Box>

        <Box display="flex" gap={4} alignItems="flex-start">
          {/* Left section with placeholder image */}
          <Box sx={{ flexShrink: 0, width: '40%', display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
            <img
              src={placeholderImage} // Use your desired placeholder image for product creation
              alt="Decorative illustration"
              style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
            />
          </Box>

          {/* Right section with the Card form */}
          <Card sx={{ flexGrow: 1, width: '70%', borderRadius: '30px', boxShadow: '0 8px 12px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ mb: 6, fontWeight: 'bold' }}>
                Buat Produk Baru
              </Typography>
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                <Box display="flex" flexDirection="column" gap={2}>
                  <TextField
                    label="Product Name"
                    variant="outlined" // Applied style
                    fullWidth
                    margin="normal" // Retained original margin prop
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    sx={{ '.MuiOutlinedInput-notchedOutline': { borderColor: '#FFD100' }, mb: 2 }} // Applied style, added mb
                  />
                  <TextField
                    label="Description"
                    variant="outlined" // Applied style
                    fullWidth
                    margin="normal" // Retained original margin prop
                    multiline
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    sx={{ '.MuiOutlinedInput-notchedOutline': { borderColor: '#FFD100' }, mb: 2 }} // Applied style, added mb
                  />
                  <TextField
                    label="Price"
                    variant="outlined" // Applied style
                    fullWidth
                    margin="normal" // Retained original margin prop
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    required
                    sx={{ '.MuiOutlinedInput-notchedOutline': { borderColor: '#FFD100' }, mb: 2 }} // Applied style, added mb
                  />
                  <TextField
                    label="Stock"
                    variant="outlined" // Applied style
                    fullWidth
                    margin="normal" // Retained original margin prop
                    type="number"
                    value={formData.stock || ''}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    required
                    sx={{ '.MuiOutlinedInput-notchedOutline': { borderColor: '#FFD100' }, mb: 2 }} // Applied style, added mb
                  />

                  {/* Image Upload Section - Styled to match */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                    <Button variant="outlined" component="label" sx={{
                      bgcolor: '#FFD100',
                      color: '#000',
                      '&:hover': { bgcolor: '#e6bb00' },
                      border: '1px solid #FFD100'
                    }}>
                      Upload Image
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </Button>
                    {imagePreviewUrl && ( // Changed from formData.imageFile directly to imagePreviewUrl
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <img
                          src={imagePreviewUrl}
                          alt="Preview"
                          style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <Typography variant="body2">{formData.imageFile?.name}</Typography>
                        <IconButton size="small" onClick={removeImage} color="error">
                          X
                        </IconButton>
                      </Box>
                    )}
                     {!imagePreviewUrl && !formData.imageFile && ( // Display 'No image selected' if no file and no preview
                       <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                         No image selected
                       </Typography>
                     )}
                  </Box>

                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={createProduct.isPending}
                    sx={{
                      mt: 3,
                      p: 1.5,
                      bgcolor: '#ffD500', // Primary button color
                      color: '#fff',
                      borderRadius: '8px',
                      '&:hover': { bgcolor: '#e6bb00' }, // Darker yellow on hover
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Subtle shadow
                    }}
                  >
                    {createProduct.isPending ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Create Product' // Original text, keeping as logic
                    )}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Material-UI Alert Dialog with Image - Styled to match */}
        <Dialog
          open={openDialog} // Changed from openSuccessDialog
          onClose={handleCloseDialog} // Changed from handleCloseSuccessDialog
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          {dialogContent && ( // Display content based on dialogContent state
            <>
              <DialogTitle id="alert-dialog-title" sx={{ textAlign: 'center', pt: 4, pb: 2, fontWeight: 'bold' }}>
                {dialogContent.title}
              </DialogTitle>
              <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
                <img
                  src={dialogContent.image}
                  alt="Dialog Illustration"
                  style={{ maxWidth: '250px', height: 'auto', marginBottom: '20px' }}
                />
                <Typography id="alert-dialog-description" variant="body1" align="center">
                  {dialogContent.message}
                </Typography>
              </DialogContent>
              <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button onClick={handleCloseDialog} autoFocus sx={{ // Changed from handleCloseSuccessDialog
                  bgcolor: '#FFD500',
                  color: '#fff',
                  borderRadius: '8px',
                  px: 3,
                  py: 1,
                  '&:hover': { bgcolor: '#FFD200' }
                }}>
                  OK
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </DashboardLayout>
  );
}