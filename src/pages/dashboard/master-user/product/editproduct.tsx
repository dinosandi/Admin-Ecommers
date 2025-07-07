import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { api } from '../../../../config/api';
import { UpdateProduct } from '../../../../hooks/useMutation/UpdateProduct';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DashboardLayout from '../../../../component/template/DashboardLayout';
import { Link } from '@tanstack/react-router';

// Material-UI Imports for Styling
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
} from '@mui/material';

import { ArrowBack } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';

// Placeholder images
import placeholderImage from '../../../../assets/edit.jpg';
import successImage from '../../../../assets/bundlepassed.jpg';
import errorImage from '../../../../assets/bundleallert.png';

export const Route = createFileRoute('/dashboard/master-user/product/editproduct')({
  component: EditProductPage,
  validateSearch: z.object({
    id: z.string(),
  }),
});

interface ProductFormValues {
  Id: string;
  Name: string;
  Description: string;
  Price: number;
  Stock: number;
  IsActive: boolean;
  ImageFile?: FileList;
}

function EditProductPage() {
  const { id } = Route.useSearch();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProductFormValues>();
  const [loading, setLoading] = useState(true);
  const { mutate, isPending } = UpdateProduct();
  const navigate = useNavigate();

  // State for image preview and existing image URL
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [newImagePreviewUrl, setNewImagePreviewUrl] = useState<string | null>(null);

  // Original dialog state from the provided code
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Authentication token not found. Please log in.');
          setLoading(false);
          return;
        }
        const res = await api.get(`/Products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const product = res.data;
        setValue('Id', product.Id);
        setValue('Name', product.Name);
        setValue('Description', product.Description);
        setValue('Price', product.Price);
        setValue('Stock', product.Stock);
        setValue('IsActive', product.IsActive);
        setCurrentImageUrl(product.ImageUrl || null); // Set existing image URL
        setLoading(false);
      } catch (err) {
        toast.error('Failed to fetch product details.');
        console.error('❌ Failed to fetch product:', err);
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id, setValue]);

  const onSubmit = (data: ProductFormValues) => {
    const formPayload = {
      ...data,
      ImageFile: data.ImageFile?.[0], // Logic remains unchanged
    };

    mutate(formPayload, {
      onSuccess: () => {
        toast.success('Product updated successfully!');
        setOpenSuccessDialog(true); // Keep original success dialog logic
        // navigate({ to: '/dashboard/master-user/product' }); // Navigation happens after dialog closes if desired
      },
      onError: (error) => {
        toast.error(`Failed to update product: ${error.message || 'An unknown error occurred.'}`);
        console.error('❌ Failed to update product:', error);
        // If you want to show an error dialog matching the style, you would
        // modify the onError to set a separate error dialog state and content.
        // For now, adhering strictly to "jangan merubah logic" for dialogs,
        // it only shows a toast for error.
      },
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setValue('ImageFile', e.target.files); // Update react-hook-form value
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreviewUrl(reader.result as string); // Set new image preview
      };
      reader.readAsDataURL(file);
    } else {
      setValue('ImageFile', undefined); // Clear react-hook-form value
      setNewImagePreviewUrl(null); // Clear new image preview
    }
  };

  const removeNewImage = () => {
    setValue('ImageFile', undefined); // Clear the file input in react-hook-form
    setNewImagePreviewUrl(null); // Clear the preview
  };

  const handleCloseSuccessDialog = () => {
    setOpenSuccessDialog(false);
    navigate({ to: '/dashboard/master-user/product' }); // Navigate after dialog closes
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '80vh', // Adjust as needed
            backgroundColor: '#f5f5f5', // Light gray background
          }}
        >
          <CircularProgress color="primary" />
          <Typography variant="h6" sx={{ ml: 2, color: 'text.secondary' }}>
            Loading product details...
          </Typography>
        </Box>
      </DashboardLayout>
    );
  }

  const watchedImageFile = watch('ImageFile'); // Watch for changes in ImageFile

  return (
    <DashboardLayout>
      <Box p={4} sx={{ backgroundColor: '#fff', minHeight: '100vh' }}>
        <Box sx={{ mb: 3 }}>
          <Button
            component={Link}
            to="/dashboard/master-user/product"
            startIcon={<ArrowBack />}
            sx={{ color: '#000', textTransform: 'none', fontWeight: 'bold' }}
          >
            Back
          </Button>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" fontWeight="bold" sx={{ color: 'text.primary' }}>
            <Box component="span" sx={{ borderLeft: '15px solid #FFD100', pl: 1, mr: 1 }}></Box>
            Edit Product
          </Typography>
          <Typography variant="subtitle1" sx={{ ml: 2.5, color: 'text.secondary' }}>
            Update Product Details
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

          <Card sx={{ flexGrow: 1, width: '70%', borderRadius: '30px', boxShadow: '0 8px 12px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ mb: 6, fontWeight: 'bold' }}>
                Edit Product Details
              </Typography>

              <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
                <input type="hidden" {...register('Id')} />

                <Box display="flex" flexDirection="column" gap={2}>
                  <TextField
                    label="Name"
                    variant="outlined"
                    fullWidth
                    {...register('Name', { required: 'Name is required' })}
                    error={!!errors.Name}
                    helperText={errors.Name?.message}
                    sx={{ '.MuiOutlinedInput-notchedOutline': { borderColor: '#FFD100' } }}
                  />

                  <TextField
                    label="Description"
                    variant="outlined"
                    fullWidth
                    multiline
                    minRows={3}
                    {...register('Description')}
                    sx={{ '.MuiOutlinedInput-notchedOutline': { borderColor: '#FFD100' } }}
                  />

                  <TextField
                    label="Price"
                    variant="outlined"
                    fullWidth
                    type="number"
                    step="0.01"
                    {...register('Price', {
                      required: 'Price is required',
                      min: { value: 0, message: 'Price cannot be negative' },
                    })}
                    error={!!errors.Price}
                    helperText={errors.Price?.message}
                    sx={{ '.MuiOutlinedInput-notchedOutline': { borderColor: '#FFD100' } }}
                  />

                  <TextField
                    label="Stock"
                    variant="outlined"
                    fullWidth
                    type="number"
                    step="1"
                    {...register('Stock', {
                      required: 'Stock is required',
                      min: { value: 0, message: 'Stock cannot be negative' },
                    })}
                    error={!!errors.Stock}
                    helperText={errors.Stock?.message}
                    sx={{ '.MuiOutlinedInput-notchedOutline': { borderColor: '#FFD100' } }}
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        {...register('IsActive')}
                        sx={{
                          color: '#FFD100', // Unchecked color
                          '&.Mui-checked': {
                            color: '#FFD100', // Checked color
                          },
                        }}
                      />
                    }
                    label={
                      <Typography variant="body1" sx={{ color: 'text.primary' }}>
                        Is Active
                      </Typography>
                    }
                    sx={{ alignSelf: 'flex-start', mt: 1 }}
                  />

                  {/* Image Upload Section - Styled to match */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}> {/* This Box was previously missing its closing tag */}
                    <Button variant="outlined" component="label" sx={{
                      bgcolor: '#FFD100',
                      color: '#000',
                      '&:hover': { bgcolor: '#e6bb00' },
                      border: '1px solid #FFD100'
                    }}>
                      Upload New Image (Optional)
                      <input
                        id="imageFile"
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </Button>
                    {newImagePreviewUrl ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <img
                          src={newImagePreviewUrl}
                          alt="New Image Preview"
                          style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <Typography variant="body2">{watchedImageFile?.[0]?.name || 'New image selected'}</Typography>
                        <IconButton size="small" onClick={removeNewImage} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ) : currentImageUrl ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                         <Typography variant="body2" sx={{ mr: 1, color: 'text.secondary' }}>
                            Current Image:
                         </Typography>
                         <img
                           src={currentImageUrl}
                           alt="Current Product Image"
                           style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '4px' }}
                         />
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        No new image selected
                      </Typography>
                    )}
                  </Box> {/* This is the added closing tag */}


                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isPending}
                    sx={{
                      mt: 3,
                      p: 1.5,
                      bgcolor: '#ffD500',
                      color: '#fff',
                      borderRadius: '8px',
                      '&:hover': { bgcolor: '#e6bb00' },
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    {isPending ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Update Product'
                    )}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Success Dialog - Styled to match, but original logic for opening is retained */}
        <Dialog
          open={openSuccessDialog}
          onClose={handleCloseSuccessDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <>
            <DialogTitle id="alert-dialog-title" sx={{ textAlign: 'center', pt: 4, pb: 2, fontWeight: 'bold' }}>
              Success!
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
              <img
                src={successImage}
                alt="Success Illustration"
                style={{ maxWidth: '200px', height: 'auto', marginBottom: '20px' }}
              />
              <Typography id="alert-dialog-description" variant="body1" align="center">
                Product has been updated successfully.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
              <Button onClick={handleCloseSuccessDialog} autoFocus sx={{
                bgcolor: '#FFD500',
                color: '#fff',
                borderRadius: '8px',
                px: 3,
                py: 1,
                '&:hover': { bgcolor: '#FFd100' }
              }}>
                OK
              </Button>
            </DialogActions>
          </>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
}