import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Accept both /auth and /auth/ without redirecting: the static prerender
    // requests URLs with a trailing slash and would otherwise loop.
    trailingSlash: "preserve",
  });

  return router;
};
