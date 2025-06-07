import { createFileRoute } from '@tanstack/react-router';
import { Box, Button, TextField, Typography, Paper} from '@mui/material';
import { useState } from 'react';
import { CreateProducts } from '../../../../hooks/useMutation/PostProduct';
import { FormCreateProducts } from '../../../../Types';
import DashboardLayout from '../../../../component/template/DashboardLayout';

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

  const createProduct = CreateProducts();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProduct.mutate(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        imageFile: e.target.files[0],
      });
    }
  };
        return (
          <DashboardLayout>
          <Paper sx={{ p: 3, mt: 2 }}>
            <Typography variant="h5" gutterBottom>
              Create New Product
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Product Name"
                margin="normal"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Description"
                margin="normal"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <TextField
                fullWidth
                label="Price"
                margin="normal"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                required
              />
              <TextField
                fullWidth
                label="Stock"
                margin="normal"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                required
              />
              <Button variant="contained" component="label" sx={{ mt: 2, mb: 2 }}>
                Upload Image
                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
              </Button>
              {formData.imageFile && (
                <Typography variant="body2" sx={{ ml: 2 }}>
                  Selected file: {formData.imageFile.name}
                </Typography>
              )}
              <Box sx={{ mt: 3 }}>
                <Button variant="contained" type="submit" disabled={createProduct.isPending}>
                  {createProduct.isPending ? 'Creating...' : 'Create Product'}
                </Button>
              </Box>
            </Box>
          </Paper>
          </DashboardLayout>
    );
}
