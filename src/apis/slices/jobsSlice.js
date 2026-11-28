import { createSlice } from "@reduxjs/toolkit";
import {
  fetchJobs,
  fetchReviewJobs,
  updateJob,
  approveJob,
  rejectJob,
  restoreJob,
} from "../thunks/jobsThunks";
import {
  createDefaultPagination,
  DEFAULT_PAGE_SIZE,
  DEFAULT_REVIEW_PAGE_SIZE,
  normalizePaginatedPayload,
} from "../../utils/pagination";

const initialState = {
  items: [],
  total: 0,
  pagination: createDefaultPagination(DEFAULT_PAGE_SIZE),
  reviewItems: [],
  reviewPagination: createDefaultPagination(DEFAULT_REVIEW_PAGE_SIZE),
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
        const reqArgs = action.meta?.arg || {};
        const { items, pagination } = normalizePaginatedPayload(action.payload, {
          defaultPage: reqArgs.page || 1,
          defaultPageSize: reqArgs.page_size || DEFAULT_PAGE_SIZE,
        });
        state.items = items;
        state.total = pagination.total;
        state.pagination = pagination;
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
        const reqArgs = action.meta?.arg || {};
        const { items, pagination } = normalizePaginatedPayload(action.payload, {
          defaultPage: reqArgs.page || 1,
          defaultPageSize: reqArgs.page_size || DEFAULT_REVIEW_PAGE_SIZE,
        });
        state.reviewItems = items;
        state.reviewPagination = pagination;
      })
      .addCase(fetchReviewJobs.rejected, (state, action) => {
        state.loadingReview = false;
        state.reviewError = action.payload;
      })
      // approveJob
      .addCase(approveJob.fulfilled, (state, action) => {
        const { jobId } = action.payload;
        const wasInReview = state.reviewItems.some((j) => j.id === jobId);
        state.items = state.items.map((j) =>
          j.id === jobId ? { ...j, status: "synced" } : j
        );
        state.reviewItems = state.reviewItems.filter((j) => j.id !== jobId);
        if (wasInReview && state.reviewPagination) {
          state.reviewPagination.total = Math.max(
            0,
            Number(state.reviewPagination.total || 0) - 1
          );
        }
        if (state.selectedJob?.id === jobId) {
          state.selectedJob.status = "synced";
        }
      })
      // rejectJob
      .addCase(rejectJob.fulfilled, (state, action) => {
        const { jobId } = action.payload;
        const wasInReview = state.reviewItems.some((j) => j.id === jobId);
        state.items = state.items.map((j) =>
          j.id === jobId ? { ...j, status: "rejected" } : j
        );
        state.reviewItems = state.reviewItems.filter((j) => j.id !== jobId);
        if (wasInReview && state.reviewPagination) {
          state.reviewPagination.total = Math.max(
            0,
            Number(state.reviewPagination.total || 0) - 1
          );
        }
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
        if (
          nextStatus === "review" &&
          state.reviewPagination &&
          !state.reviewItems.some((j) => j.id === jobId)
        ) {
          state.reviewPagination.total =
            Number(state.reviewPagination.total || 0) + 1;
        }
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
