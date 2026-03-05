import Routes from "./app-routes";
import {
  QueryClientProvider,
  QueryClient,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useSnackbar } from "react-snackify";
import "react-snackify/styles/snack-bar.css";
import { useMemo } from "react";
import { UserProvider } from "./contexts/user/user";

const App = () => {
  const { showSnackbar } = useSnackbar();

  const queryClient = useMemo(() => {
    const handleError = (error: Error) => {
      const axiosError = error as AxiosError;
      const message =
        (axiosError?.response?.data as any)?.message ??
        axiosError?.message ??
        "Something went wrong";

      if (
        message === "Profile not found" ||
        message?.toLowerCase().includes("profile not found")
      ) {
        return;
      }

      showSnackbar({
        message,
        variant: "error",
        classname: "text-white",
      });
    };

    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 10 * 60 * 1000, // 10 minutes — prevents unnecessary refetches
          retry: false, // Don't auto-retry failed requests
          refetchOnWindowFocus: false,
        },
      },
      queryCache: new QueryCache({
        onError: (error: Error) => handleError(error),
      }),
      mutationCache: new MutationCache({
        onError: (error: Error) => handleError(error),
      }),
    });
  }, [showSnackbar]);

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <Routes />
      </UserProvider>
    </QueryClientProvider>
  );
};

export default App;
