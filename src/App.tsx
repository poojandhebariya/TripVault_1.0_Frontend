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
import { useMemo, useEffect } from "react";
import { UserProvider } from "./contexts/user/user";
import { App as CapacitorApp } from "@capacitor/app";
import { useNavigate, useLocation } from "react-router-dom";
import { ROUTES } from "./utils/constants";

const App = () => {
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleBackButton = async () => {
      if (
        location.pathname === "/" ||
        location.pathname === ROUTES.AUTH.SIGN_IN
      ) {
        CapacitorApp.exitApp();
      } else {
        navigate(-1);
      }
    };

    const registration = CapacitorApp.addListener("backButton", (data) => {
      // If data.canGoBack is false, it means we're at the root of the history stack
      if (!data.canGoBack) {
        CapacitorApp.exitApp();
      } else {
        handleBackButton();
      }
    });

    return () => {
      registration.then((r) => r.remove());
    };
  }, [location.pathname, navigate]);

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
