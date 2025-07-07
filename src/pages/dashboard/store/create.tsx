import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useState } from 'react';
import { AddProductToStore } from '../../../hooks/useMutation/PostProductStore';
import { AddBundlesToStore } from '../../../hooks/useMutation/PostBundleStore';
import { GetProduct } from '../../../hooks/useQuery/GetProduct';
import { GetBundle } from '../../../hooks/useQuery/GetBundle';
import { GetStore } from '../../../hooks/useQuery/GetStore';
import DashboardLayout from '../../../component/template/DashboardLayout';

import storeCreationImage from '../../../assets/bgstore.jpg';
import successImage from '../../../assets/passeditems.jpg';
import errorImage from '../../../assets/delete.jpg';

import { ArrowBack } from '@mui/icons-material';

export const Route = createFileRoute('/dashboard/store/create')({
  component: RouteComponent,
});

function RouteComponent() {
  const [storeIdForProduct, setStoreIdForProduct] = useState('');
  const [productId, setProductId] = useState('');

  const [storeIdForBundle, setStoreIdForBundle] = useState('');
  const [bundleId, setBundleId] = useState('');

  const { mutateAsync: addProduct, isPending: productPending, error: productErrMsg } = AddProductToStore();
  const { mutateAsync: addBundle, isPending: bundlePending, error: bundleErrMsg } = AddBundlesToStore();

  const { data: stores, isLoading: isLoadingStores } = GetStore();
  const { data: products, isLoading: isLoadingProducts } = GetProduct();
  const { data: bundles, isLoading: isLoadingBundles } = GetBundle();

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState<{
    title: string;
    message: string;
    image: string;
  } | null>(null);

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!storeIdForProduct || !productId) {
      setDialogContent({
        title: 'Input Required!',
        message: 'Mohon pilih Store dan Produk terlebih dahulu.',
        image: errorImage,
      });
      setOpenDialog(true);
      return;
    }

    try {
      await addProduct({ storeId: storeIdForProduct, productId });
      setDialogContent({
        title: 'Success!',
        message: 'Produk berhasil ditambahkan ke toko!',
        image: successImage,
      });
      setStoreIdForProduct('');
      setProductId('');
    } catch (error: any) {
      setDialogContent({
        title: 'Error!',
        message: `Gagal menambahkan produk: ${productErrMsg?.message || error.message || 'Unknown error'}`,
        image: errorImage,
      });
    } finally {
      setOpenDialog(true);
    }
  };

  const handleBundleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!storeIdForBundle || !bundleId) {
      setDialogContent({
        title: 'Input Required!',
        message: 'Mohon pilih Store dan Bundle terlebih dahulu.',
        image: errorImage,
      });
      setOpenDialog(true);
      return;
    }

    try {
      await addBundle({ storeId: storeIdForBundle, bundleId });
      setDialogContent({
        title: 'Success!',
        message: 'Bundle berhasil ditambahkan ke toko!',
        image: successImage,
      });
      setStoreIdForBundle('');
      setBundleId('');
    } catch (error: any) {
      setDialogContent({
        title: 'Error!',
        message: `Gagal menambahkan bundle: ${bundleErrMsg?.message || error.message || 'Unknown error'}`,
        image: errorImage,
      });
    } finally {
      setOpenDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogContent(null);
  };

  return (
    <DashboardLayout>
      <Box p={4} sx={{ backgroundColor: '#fff', minHeight: '100vh' }}>
        <Box sx={{ mb: 3 }}>
          <Button
            component={Link}
            to="/dashboard/store"
            startIcon={<ArrowBack />}
            sx={{ color: '#000', textTransform: 'none', fontWeight: 'bold' }}
          >
            Back
          </Button>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" fontWeight="bold" sx={{ color: 'text.primary' }}>
            <Box component="span" sx={{ borderLeft: '15px solid #FFD100', pl: 1, mr: 1 }}></Box>
            Manage Store Items
          </Typography>
          <Typography variant="subtitle1" sx={{ ml: 2.5, color: 'text.secondary' }}>
            Add Products and Bundles to Your Stores
          </Typography>
        </Box>

        <Box display="flex" gap={4} alignItems="flex-start">
          <Box sx={{ flexShrink: 0, width: '35%', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', pt: 2 }}>
            <img
              src={storeCreationImage}
              alt="Store Management Illustration"
              style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
            />
          </Box>

          <Paper elevation={3} sx={{ flexGrow: 1, width: '65%', p: 4, borderRadius: '30px', boxShadow: '0 8px 12px rgba(0,0,0,0.1)' }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
              Tambah Produk ke Toko
            </Typography>
            <Box component="form" onSubmit={handleProductSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth required disabled={isLoadingStores}>
                <InputLabel>Pilih Store</InputLabel>
                <Select value={storeIdForProduct} label="Pilih Store" onChange={(e) => setStoreIdForProduct(e.target.value)}>
                  {stores?.map((store: any) => (
                    <MenuItem key={store.Id} value={store.Id}>
                      {store.Name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth required disabled={isLoadingProducts}>
                <InputLabel>Pilih Produk</InputLabel>
                <Select value={productId} label="Pilih Produk" onChange={(e) => setProductId(e.target.value)}>
                  {products?.map((product: any) => (
                    <MenuItem key={product.Id} value={product.Id}>
                      {product.Name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                type="submit"
                variant="contained"
                disabled={productPending || !storeIdForProduct || !productId}
                sx={{
                  mt: 1,
                  p: 1.5,
                  bgcolor: '#ffD500',
                  color: '#fff',
                  borderRadius: '8px',
                  '&:hover': { bgcolor: '#e6bb00' },
                }}
              >
                {productPending ? <CircularProgress size={24} color="inherit" /> : 'Tambah Produk'}
              </Button>
            </Box>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>
              Tambah Bundle ke Toko
            </Typography>
            <Box component="form" onSubmit={handleBundleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth required disabled={isLoadingStores}>
                <InputLabel>Pilih Store</InputLabel>
                <Select value={storeIdForBundle} label="Pilih Store" onChange={(e) => setStoreIdForBundle(e.target.value)}>
                  {stores?.map((store: any) => (
                    <MenuItem key={store.Id} value={store.Id}>
                      {store.Name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth required disabled={isLoadingBundles}>
                <InputLabel>Pilih Bundle</InputLabel>
                <Select value={bundleId} label="Pilih Bundle" onChange={(e) => setBundleId(e.target.value)}>
                  {bundles?.map((bundle: any) => (
                    <MenuItem key={bundle.Id} value={bundle.Id}>
                      {bundle.Name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                type="submit"
                variant="contained"
                disabled={bundlePending || !storeIdForBundle || !bundleId}
                sx={{
                  mt: 1,
                  p: 1.5,
                  bgcolor: '#ffD500',
                  color: '#fff',
                  borderRadius: '8px',
                  '&:hover': { bgcolor: '#e6bb00' },
                }}
              >
                {bundlePending ? <CircularProgress size={24} color="inherit" /> : 'Tambah Bundle'}
              </Button>
            </Box>
          </Paper>
        </Box>

        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          {dialogContent && (
            <>
              <DialogTitle id="alert-dialog-title" sx={{ textAlign: 'center', pt: 4 }}>
                {dialogContent.title}
              </DialogTitle>
              <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', px: 16, pb: 4 }}>
                <img
                  src={dialogContent.image}
                  alt="Dialog Illustration"
                  style={{ maxWidth: '300px', height: 'auto', marginBottom: '10px' }}
                />
                <Typography id="alert-dialog-description" variant="body1" align="center">
                  {dialogContent.message}
                </Typography>
              </DialogContent>
              <DialogActions sx={{ justifyContent: 'center', pb: 4 }}>
                <Button
                  onClick={handleCloseDialog}
                  autoFocus
                  variant="contained"
                  sx={{
                    bgcolor: '#FFD100',
                    color: '#000',
                    '&:hover': { bgcolor: '#e6bb00' },
                    borderRadius: '8px',
                    px: 3,
                    py: 1,
                  }}
                >
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