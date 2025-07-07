import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../config/api';

export const DeleteProduct = () => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/Products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err: any) => {
      console.error('Delete failed:', err?.response?.data || err.message);
    }
  });
};
