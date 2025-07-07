import { useQuery } from "@tanstack/react-query";
import { api } from "../../config/api";

export const GetDrivers = () => {
    return useQuery({
        queryKey: ["drivers"],
        queryFn: async () => { 
            const res = await api.get("/Drivers");
            return res.data;
        }
    });
};
