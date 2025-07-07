import { useMutation } from "@tanstack/react-query";
import { api } from "../../config/api";
import { FormCreateProducts } from "../../Types";

export const CreateProducts = () => {
  return useMutation({
    mutationFn: async (form: FormCreateProducts) => {
      const token = localStorage.getItem("token"); // Ambil token dari localStorage

      if (!token) {
        throw new Error("Unauthorized: Token tidak ditemukan.");
      }

      const formData = new FormData();
      formData.append("Name", form.name); 
      formData.append("Description", form.description ?? "");
      formData.append("Price", form.price?.toString() ?? "0"); // ⛔ hindari null
      formData.append("Stock", form.stock?.toString() ?? "0");
      if (form.imageFile) {
        formData.append("ImageFile", form.imageFile);
      }

      const response = await api.post("/Products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`, // <-- penting
        },
      });

      return response.data;
    },
  });
};
