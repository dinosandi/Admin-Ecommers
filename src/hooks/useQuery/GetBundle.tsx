import { useQuery } from "@tanstack/react-query";
import { api } from "../../config/api";

export const GetBundle = () => {
    return useQuery({
        queryKey: ["bundle"],
        queryFn: async () => { 
            const res = await api.get("/Bundle");
            return res.data;
        }
    });
};
