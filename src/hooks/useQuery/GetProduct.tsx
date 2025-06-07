import { useQuery } from "@tanstack/react-query";
import { api } from "../../config/api";

export const GetProduct = () => {
    return useQuery({
        queryKey: ["products"],
        queryFn: async () => { 
            const res = await api.get("/Products");
            return res.data;
        }
    });
};
