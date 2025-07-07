// src/hooks/useGetCustomers.ts (buat file baru ini)
import { useQuery } from "@tanstack/react-query";
import { api } from "../../config/api";

type Customer = {
  Id: string;
  UserId: string; // Ini mungkin ID yang akan digunakan untuk chat
  FullName: string;
  Email: string;
  PhoneNumber: string;
  Address: string;
  ImageUrl: string;
  ImageFile: string | null;
  LicenseNumber: string | null;
  VehicleInfo: string | null;
  Role: number;
  DriverId: string | null;
};

export const useGetCustomers = () => {
  return useQuery<Customer[]>({ // Mengembalikan array Customer
    queryKey: ["allCustomers"],
    queryFn: async () => {
      const res = await api.get(`/Customer/profile`); // Asumsi ada endpoint /Customers yang mengembalikan semua
      return res.data;
    },
  });
};