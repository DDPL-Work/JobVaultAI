import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../apiClient";

export const fetchScreenshots = createAsyncThunk(
  "screenshots/fetchScreenshots",
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiClient.get("/api/screenshots/");
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch screenshots");
    }
  }
);

export const uploadScreenshots = createAsyncThunk(
  "screenshots/uploadScreenshots",
  async ({ files, combine = false }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      const fileList = Array.from(files || []);
      fileList.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("combine", combine ? "true" : "false");

      const data = await apiClient.post("/api/screenshots/", formData);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to upload screenshots");
    }
  }
);

export const deleteScreenshot = createAsyncThunk(
  "screenshots/deleteScreenshot",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/api/screenshots/${id}/`);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to delete screenshot");
    }
  }
);

export const retryScreenshot = createAsyncThunk(
  "screenshots/retryScreenshot",
  async (id, { rejectWithValue }) => {
    try {
      const data = await apiClient.post(`/api/screenshots/${id}/retry/`);
      return { id, data };
    } catch (err) {
      return rejectWithValue(err.message || "Failed to retry screenshot");
    }
  }
);

export const fetchScreenshotJobDetail = createAsyncThunk(
  "screenshots/fetchJobDetail",
  async (jobId, { rejectWithValue }) => {
    try {
      const data = await apiClient.get(`/api/jobs/${jobId}/`);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to load job details");
    }
  }
);
