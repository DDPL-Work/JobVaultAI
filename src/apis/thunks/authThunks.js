import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient, { setAuthSession, clearAuthSession } from "../apiClient";

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

      const access = data.access || data.token || data.tokens?.access;
      const refresh = data.refresh || data.tokens?.refresh;
      const user = data.user || {
        email: data.email || (isEmail ? cleanUser : ""),
        username: data.username || cleanUser.split("@")[0],
        role: data.role || "ADMIN",
      };

      if (access) {
        setAuthSession({ access, refresh, user });
      }

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
      const userData = data?.user || data;
      if (userData && typeof userData === "object") {
        setAuthSession({ user: userData });
      }
      return userData;
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
