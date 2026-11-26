import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { router } from "./routes/routes";
import { getAccessToken } from "./apis/apiClient";
import { fetchCurrentUser } from "./apis/thunks/authThunks";
import { clearAuth } from "./apis/slices/authSlice";
import { fetchHealthStatus } from "./apis/thunks/dashboardThunks";

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchHealthStatus());
    if (getAccessToken()) {
      dispatch(fetchCurrentUser());
    }

    const handleAuthExpired = () => {
      dispatch(clearAuth());
    };
    window.addEventListener("jv:auth-expired", handleAuthExpired);
    return () => {
      window.removeEventListener("jv:auth-expired", handleAuthExpired);
    };
  }, [dispatch]);

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={2000}
        limit={3}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}
