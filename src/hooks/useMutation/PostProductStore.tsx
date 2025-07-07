import { useMutation } from "@tanstack/react-query";
import { api } from "../../config/api";

interface AddProductToStorePayload {
  storeId: string;
  productId: string;
}

export const AddProductToStore = () => {
  return useMutation({
    mutationFn: async ({ storeId, productId }: AddProductToStorePayload) => {
      const response = await api.post(`/Store/${storeId}/products/${productId}`);
      return response.data;
    },
  });
};
