import { useMutation } from "@tanstack/react-query";
import { api1 } from "../../config/api";

export const CreateBundle = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api1.post("/Bundle", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
  });
};

