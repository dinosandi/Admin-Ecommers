import { useMutation } from "@tanstack/react-query";
import { api } from "../../config/api";
import { FormCreaCategory } from "../../Types"; 

export const CreateCategory = () => {
  return useMutation({
    mutationFn: async (form: FormCreaCategory) => {
      const token = localStorage.getItem("token");

      const response = await api.post("/Categories", JSON.stringify(form), {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    },
    onSuccess: (data) => {
      console.log("Category created successfully:", data);
      alert("Kategori berhasil dibuat!");
    },
    onError: (error) => {
      console.error("Failed to create category:", error);
      alert("Gagal membuat kategori");
    },
  });
};
