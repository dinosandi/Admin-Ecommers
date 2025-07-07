import { useQuery } from "@tanstack/react-query";
import { api } from "../../config/api";

export const GetChat = (userId: string) => {
  return useQuery({
    queryKey: ["chat", userId],
    queryFn: async () => {
      const res = await api.get(`/Chat/messages`, {
        params: { userId }
      });
      return res.data;
    },
    enabled: !!userId,
  });
};
