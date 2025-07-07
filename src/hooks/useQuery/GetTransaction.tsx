import { useQuery } from "@tanstack/react-query";
import { api } from "../../config/api";

export const GetTransactions = () => {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const token = localStorage.getItem("token"); // ambil token dari localStorage

      const res = await api.get("/Transactions", {
        headers: {
          Authorization: `Bearer ${token}`, // kirim token ke backend
        },
      });

      return res.data;
    },
  });
};
