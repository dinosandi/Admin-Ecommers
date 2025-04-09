import { QueryClient } from "@tanstack/react-query";
import { createRouter, ErrorComponent, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  defaultComponent: () => <div>Loading...</div>,
  defaultErrorComponent: ({ error }) => <ErrorComponent error={error} />,
  context: {
    queryClient,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function Router() {
  return <RouterProvider router={router} />;
}
