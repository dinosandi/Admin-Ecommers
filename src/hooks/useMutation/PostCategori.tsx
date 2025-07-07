import { useMutation } from "@tanstack/react-query";
import { api } from "../../config/api";

export const AssignProductToCategory = () => {
  return useMutation({
    mutationFn: async ({ categoryId, productId }: { categoryId: string; productId: string }) => {
      const token = localStorage.getItem("token");

      const response = await api.post(
        `/Categories/${categoryId}/products/${productId}`,
        null, 
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    },
  });
};
