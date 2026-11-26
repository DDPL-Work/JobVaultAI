import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient, {
  setAuthSession,
  clearAuthSession,
  getUser,
} from "../apiClient";

function extractUserProfile(raw) {
  if (!raw || typeof raw !== "object") return null;
  const candidates = [
    raw.user,
    raw.data?.user,
    raw.data,
    raw.admin,
    raw.profile,
    raw,
  ];
  const found = candidates.find(
    (c) =>
      c &&
      typeof c === "object" &&
      !Array.isArray(c) &&
      (c.username || c.email || c.name || c.full_name)
  );
  if (!found) return null;
  return {
    ...found,
    username: found.username || found.name || found.full_name || "",
    email: found.email || "",
    role: found.role || "ADMIN",
  };
}

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ username, email, password }, { rejectWithValue }) => {
    try {
      const cleanUser = (username || email || "").trim();
      const isEmail = cleanUser.includes("@");
      const payload = {
        password,
        ...(isEmail ? { email: cleanUser } : { username: cleanUser }),
      };

      const data = await apiClient.post("/api/auth/login/", payload, {
        requiresAuth: false,
      });

      const access =
        data?.access ||
        data?.access_token ||
        data?.token ||
        data?.jwt ||
        data?.key ||
        data?.tokens?.access ||
        data?.tokens?.access_token ||
        data?.data?.access ||
        data?.data?.access_token ||
        data?.data?.token ||
        data?.data?.tokens?.access ||
        "";
      const refresh =
        data?.refresh ||
        data?.refresh_token ||
        data?.tokens?.refresh ||
        data?.tokens?.refresh_token ||
        data?.data?.refresh ||
        data?.data?.tokens?.refresh ||
        "";
      const parsedUser = extractUserProfile(data);
      const user = parsedUser || {
        email: data?.email || (isEmail ? cleanUser : ""),
        username: data?.username || cleanUser.split("@")[0],
        role: data?.role || "ADMIN",
      };

      setAuthSession({ access, refresh, user });

      return { access, refresh, user, raw: data };
    } catch (err) {
      return rejectWithValue(
        err.message || "Login failed. Please check your credentials."
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.post("/api/auth/logout/", {}, { requiresAuth: true });
    } catch {
      // Ignore network errors on logout
    } finally {
      clearAuthSession();
    }
    return true;
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiClient.get("/api/auth/me/");
      const parsed = extractUserProfile(data);
      const cached = getUser();
      if (parsed) {
        const merged = { ...(cached || {}), ...parsed };
        setAuthSession({ user: merged });
        return merged;
      }
      return cached;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch user profile");
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const data = await apiClient.post(
        "/api/auth/forgot-password/",
        { email: email.trim() },
        { requiresAuth: false }
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to send verification code.");
    }
  }
);

export const verifyResetOtp = createAsyncThunk(
  "auth/verifyResetOtp",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const data = await apiClient.post(
        "/api/auth/verify-reset-token/",
        {
          email: email.trim(),
          otp: String(otp).trim(),
        },
        { requiresAuth: false }
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Invalid or expired verification code.");
    }
  }
);

export const resetUserPassword = createAsyncThunk(
  "auth/resetUserPassword",
  async ({ email, otp, newPassword, confirmPassword }, { rejectWithValue }) => {
    try {
      const data = await apiClient.post(
        "/api/auth/reset-password/",
        {
          email: email.trim(),
          otp: String(otp).trim(),
          new_password: newPassword,
          confirm_new_password: confirmPassword,
        },
        { requiresAuth: false }
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to reset password.");
    }
  }
);
