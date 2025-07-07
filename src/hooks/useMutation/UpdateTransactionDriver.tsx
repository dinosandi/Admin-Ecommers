import { useMutation } from "@tanstack/react-query";
import { api } from "../../config/api"; // ENSURE THIS PATH IS CORRECT

// Interface for the payload sent to the API
interface AssignDriverPayload {
  transactionId: string;
  driverId: string; // The ID of the driver to assign
  token: string;
}

export const useAssignDriverMutation = () => {
  return useMutation<any, Error, AssignDriverPayload>({ // Define types for success, error, and variables
    mutationFn: async ({ transactionId, driverId, token }: AssignDriverPayload) => {
      const response = await api.put(
        "/Transactions/assign-driver", // Your API endpoint
        {
          TransactionId: transactionId, // Ensure casing matches backend expectation (e.g., PascalCase)
          DriverId: driverId,           // Ensure casing matches backend expectation (e.g., PascalCase)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
  });
};