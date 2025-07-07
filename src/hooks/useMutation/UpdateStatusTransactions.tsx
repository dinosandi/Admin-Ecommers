import { useMutation } from "@tanstack/react-query";
import { api } from "../../config/api";

export const UpdateTransactions = () => {
  return useMutation({
    mutationFn: async ({ id, status, token }: { id: string; status: string; token: string }) => {
      const response = await api.put(
        `/Transactions/${id}/status`,
        JSON.stringify(status), 
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
  });
};
