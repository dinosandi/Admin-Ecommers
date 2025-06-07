import { useMutation } from "@tanstack/react-query";
import { api } from "../../config/api";
import { FormCreateLogin } from "../../Types";

export const CreateLogin = () => {
    return useMutation({
        mutationFn: async (form: FormCreateLogin) => {
            const response = await api.post("Auth/login", form);
            return response.data;
        },
    });
}   