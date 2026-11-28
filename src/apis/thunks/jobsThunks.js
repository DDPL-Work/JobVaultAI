import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../apiClient";
import {
  appendPaginationQuery,
  DEFAULT_PAGE_SIZE,
  DEFAULT_REVIEW_PAGE_SIZE,
} from "../../utils/pagination";

export const fetchJobs = createAsyncThunk(
  "jobs/fetchJobs",
  async (params = {}, { rejectWithValue }) => {
    try {
      const searchParams = new URLSearchParams();
      if (params.vault && params.vault !== "all") searchParams.set("vault", params.vault);
      if (params.source && params.source !== "all") searchParams.set("source", params.source);
      if (params.status && params.status !== "all") searchParams.set("status", params.status);
      const q = (params.q ?? params.search ?? "").trim();
      if (q) {
        searchParams.set("q", q);
        searchParams.set("search", q);
      }
      appendPaginationQuery(searchParams, params, DEFAULT_PAGE_SIZE);

      const qs = searchParams.toString();
      const endpoint = qs ? `/api/jobs/?${qs}` : "/api/jobs/";
      const data = await apiClient.get(endpoint);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch jobs");
    }
  }
);

export const fetchReviewJobs = createAsyncThunk(
  "jobs/fetchReviewJobs",
  async (params = {}, { rejectWithValue }) => {
    try {
      const searchParams = new URLSearchParams({ status: "review" });
      appendPaginationQuery(searchParams, params, DEFAULT_REVIEW_PAGE_SIZE);
      const data = await apiClient.get(`/api/jobs/?${searchParams.toString()}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch review queue");
    }
  }
);

export const updateJob = createAsyncThunk(
  "jobs/updateJob",
  async ({ jobId, id, updates }, { rejectWithValue }) => {
    try {
      const targetId = jobId ?? id;
      const data = await apiClient.put(`/api/jobs/${targetId}/`, updates);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to update job");
    }
  }
);

export const approveJob = createAsyncThunk(
  "jobs/approveJob",
  async (arg, { rejectWithValue }) => {
    try {
      const isObj = arg && typeof arg === "object";
      const jobId = isObj ? arg.jobId ?? arg.id : arg;
      const updates = isObj ? arg.updates : null;

      if (updates) {
        await apiClient.put(`/api/jobs/${jobId}/`, updates);
      }
      const data = await apiClient.post(
        `/api/jobs/${jobId}/approve/`,
        updates || {}
      );
      return { jobId, data };
    } catch (err) {
      return rejectWithValue(err.message || "Failed to approve job");
    }
  }
);

export const rejectJob = createAsyncThunk(
  "jobs/rejectJob",
  async (jobId, { rejectWithValue }) => {
    try {
      const data = await apiClient.post(`/api/jobs/${jobId}/reject/`);
      return { jobId, data };
    } catch (err) {
      return rejectWithValue(err.message || "Failed to reject job");
    }
  }
);

export const restoreJob = createAsyncThunk(
  "jobs/restoreJob",
  async (jobId, { rejectWithValue }) => {
    try {
      const data = await apiClient.post(`/api/jobs/${jobId}/restore/`);
      return { jobId, data };
    } catch (err) {
      return rejectWithValue(err.message || "Failed to move job to review");
    }
  }
);

export const generateJobContent = createAsyncThunk(
  "jobs/generateJobContent",
  async ({ jobId, platform = "all" }, { rejectWithValue }) => {
    try {
      const data = await apiClient.post(
        `/api/jobs/${jobId}/generate-content/`,
        { platform }
      );
      return { jobId, data };
    } catch (err) {
      return rejectWithValue(
        err.message || "Failed to generate social content"
      );
    }
  }
);
