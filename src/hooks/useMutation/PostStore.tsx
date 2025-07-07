import { useMutation } from "@tanstack/react-query";
import { api } from "../../config/api";
import { FormCreateStore } from "../../Types";


export const CreateStore = () => {
    return useMutation({
      mutationFn: async (formData: FormCreateStore) => {
        const response = await api.post("/Store", formData, {
        });
        return response.data;
      },
    });
  };
  