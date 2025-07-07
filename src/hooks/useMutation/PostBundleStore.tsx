import { useMutation } from "@tanstack/react-query";
import { api } from "../../config/api";

interface AddbundlesToStorePayload {
  storeId: string;
  bundleId: string;
}

export const AddBundlesToStore = () => {
  return useMutation({
    mutationFn: async ({ storeId, bundleId }: AddbundlesToStorePayload) => {
      const response = await api.post(`/Store/${storeId}/bundles/${bundleId}`);
      return response.data;
    },
  });
};
