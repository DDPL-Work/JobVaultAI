import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../apiClient";

export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchDashboardStats",
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiClient.get("/api/stats/");
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch dashboard stats");
    }
  }
);

export const fetchRecentJobs = createAsyncThunk(
  "dashboard/fetchRecentJobs",
  async (limit = 8, { rejectWithValue }) => {
    try {
      const data = await apiClient.get(`/api/jobs/?limit=${limit}`);
      const items = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.results)
        ? data.results
        : [];
      return items;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch recent jobs");
    }
  }
);

export const fetchHealthStatus = createAsyncThunk(
  "dashboard/fetchHealthStatus",
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiClient.get("/api/health/", {
        requiresAuth: false,
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Server health check failed");
    }
  }
);
