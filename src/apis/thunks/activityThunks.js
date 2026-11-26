import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../apiClient";

export const fetchActivityLogs = createAsyncThunk(
  "activity/fetchActivityLogs",
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiClient.get("/api/activity/");
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch activity log");
    }
  }
);
