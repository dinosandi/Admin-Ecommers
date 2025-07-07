import { useQuery } from "@tanstack/react-query";
import { api } from "../../config/api";

export const GetCategory = () => {
    return useQuery({
        queryKey: ["category"],
        queryFn: async () => { 
            const res = await api.get("/Categories");
            return res.data;
        }
    });
};
