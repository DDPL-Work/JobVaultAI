import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../apiClient";
import { appendPaginationQuery, DEFAULT_PAGE_SIZE } from "../../utils/pagination";

export const fetchActivityLogs = createAsyncThunk(
  "activity/fetchActivityLogs",
  async (params = {}, { rejectWithValue }) => {
    try {
      const searchParams = appendPaginationQuery(
        new URLSearchParams(),
        params,
        DEFAULT_PAGE_SIZE
      );
      const data = await apiClient.get(`/api/activity/?${searchParams.toString()}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch activity log");
    }
  }
);
