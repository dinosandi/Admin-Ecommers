import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../config/api';

interface Product {
  Id: string;
  Name: string;
  Description: string;
  Price: number;
  Stock: number;
  IsActive: boolean;
  ImageFile?: File;
}

export const UpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updatedProduct: Product) => {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('Name', updatedProduct.Name);
      formData.append('Description', updatedProduct.Description);
      formData.append('Price', updatedProduct.Price.toString());
      formData.append('Stock', updatedProduct.Stock.toString());
      formData.append('IsActive', updatedProduct.IsActive.toString());

      if (updatedProduct.ImageFile) {
        formData.append('ImageFile', updatedProduct.ImageFile);
      }

      const res = await api.put(`/Products/${updatedProduct.Id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },

    onError: (err: any) => {
      console.error('❌ Update failed:', err?.response?.data || err.message);
    },
  });
};
