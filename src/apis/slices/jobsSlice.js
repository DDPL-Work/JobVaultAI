import { createSlice } from "@reduxjs/toolkit";
import {
  fetchJobs,
  fetchReviewJobs,
  updateJob,
  approveJob,
  rejectJob,
  restoreJob,
} from "../thunks/jobsThunks";

const initialState = {
  items: [],
  total: 0,
  reviewItems: [],
  loadingReview: false,
  loaded: false,
  reviewLoaded: false,
  selectedJob: null,
  loading: false,
  error: null,
  reviewError: null,
};

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    setSelectedJob: (state, action) => {
      state.selectedJob = action.payload;
    },
    localUpdateJobStatus: (state, action) => {
      const { jobId, newStatus } = action.payload;
      state.items = state.items.map((j) =>
        j.id === jobId ? { ...j, status: newStatus } : j
      );
      if (state.selectedJob?.id === jobId) {
        state.selectedJob.status = newStatus;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchJobs
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.loaded = true;
        state.error = null;
        const payload = action.payload;
        if (Array.isArray(payload)) {
          state.items = payload;
          state.total = payload.length;
        } else if (Array.isArray(payload?.items)) {
          state.items = payload.items;
          state.total = payload.count || payload.total || payload.items.length;
        } else if (Array.isArray(payload?.results)) {
          state.items = payload.results;
          state.total = payload.count || payload.results.length;
        }
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // updateJob
      .addCase(updateJob.fulfilled, (state, action) => {
        const updated = action.payload;
        if (updated?.id) {
          state.items = state.items.map((j) =>
            j.id === updated.id ? { ...j, ...updated } : j
          );
          if (state.selectedJob?.id === updated.id) {
            state.selectedJob = { ...state.selectedJob, ...updated };
          }
        }
      })
      // fetchReviewJobs
      .addCase(fetchReviewJobs.pending, (state) => {
        state.loadingReview = true;
        state.reviewError = null;
      })
      .addCase(fetchReviewJobs.fulfilled, (state, action) => {
        state.loadingReview = false;
        state.reviewLoaded = true;
        state.reviewError = null;
        const payload = action.payload;
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.items)
          ? payload.items
          : Array.isArray(payload?.results)
          ? payload.results
          : [];
        state.reviewItems = list;
      })
      .addCase(fetchReviewJobs.rejected, (state, action) => {
        state.loadingReview = false;
        state.reviewError = action.payload;
      })
      // approveJob
      .addCase(approveJob.fulfilled, (state, action) => {
        const { jobId } = action.payload;
        state.items = state.items.map((j) =>
          j.id === jobId ? { ...j, status: "synced" } : j
        );
        state.reviewItems = state.reviewItems.filter((j) => j.id !== jobId);
        if (state.selectedJob?.id === jobId) {
          state.selectedJob.status = "synced";
        }
      })
      // rejectJob
      .addCase(rejectJob.fulfilled, (state, action) => {
        const { jobId } = action.payload;
        state.items = state.items.map((j) =>
          j.id === jobId ? { ...j, status: "rejected" } : j
        );
        state.reviewItems = state.reviewItems.filter((j) => j.id !== jobId);
        if (state.selectedJob?.id === jobId) {
          state.selectedJob.status = "rejected";
        }
      })
      // restoreJob
      .addCase(restoreJob.fulfilled, (state, action) => {
        const { jobId, data } = action.payload;
        const nextStatus = data?.status || "review";
        state.items = state.items.map((j) =>
          j.id === jobId ? { ...j, ...(data || {}), status: nextStatus } : j
        );
        if (state.selectedJob?.id === jobId) {
          state.selectedJob = {
            ...state.selectedJob,
            ...(data || {}),
            status: nextStatus,
          };
        }
      });
  },
});

export const { setSelectedJob, localUpdateJobStatus } = jobsSlice.actions;
export default jobsSlice.reducer;
