import { useMutation } from "@tanstack/react-query";
import { api } from "../../config/api";
import { FormCreateLogin } from "../../Types";

export const CreateLogim = () => {
    return useMutation({
        mutationFn: async (form: FormCreateLogin) => {
            const response = await api.post("/login", form);
            return response.data;
        },
    });
}   