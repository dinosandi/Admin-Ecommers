// src/hooks/useQuery/GetCustomerById.ts (contoh)
import { useQuery } from "@tanstack/react-query";
import { api } from "../../config/api";

type Customer = {
    Id: string;
    UserId: string;
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
}

export const useGetCustomer = (id: string) => {
  return useQuery<Customer>({
    queryKey: ["customer", id],
    queryFn: async () => {
      const res = await api.get(`/Customer/profile/${id}`); // Asumsi endpoint untuk satu customer
      return res.data;
    },
    enabled: !!id,
  });
};