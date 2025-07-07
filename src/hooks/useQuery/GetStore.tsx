import { useQuery } from "@tanstack/react-query";
import { api } from "../../config/api";

export const GetStore = () => {
    return useQuery({
        queryKey: ["store"],
        queryFn: async () => { 
            const res = await api.get("/Store");
            return res.data;
        }
    });
};
