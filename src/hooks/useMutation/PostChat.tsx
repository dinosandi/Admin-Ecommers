import { useMutation } from "@tanstack/react-query";
import { api } from "../../config/api";

type ChatPayload = {
  SenderId: string;
  ReceiverId: string;
  Message: string;
};

export const usePostChat = () => {
  return useMutation({
    mutationFn: async (data: ChatPayload) => {
      const res = await api.post("/Chat", data);
      return res.data;
    },
  });
};
