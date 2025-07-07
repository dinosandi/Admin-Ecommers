import { useMutation } from "@tanstack/react-query";
import { api } from "../../config/api";

export const DeleteTransactions = () => {
  return useMutation({
    mutationFn: async ({ id, token }: { id: string; token: string }) => {
      const response = await api.delete(`/Transactions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
  });
};
