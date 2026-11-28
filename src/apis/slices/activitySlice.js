import { createSlice } from "@reduxjs/toolkit";
import { fetchActivityLogs } from "../thunks/activityThunks";
import {
  createDefaultPagination,
  DEFAULT_PAGE_SIZE,
  normalizePaginatedPayload,
} from "../../utils/pagination";

const initialState = {
  items: [],
  pagination: createDefaultPagination(DEFAULT_PAGE_SIZE),
  loading: false,
  loaded: false,
  error: null,
};

const activitySlice = createSlice({
  name: "activity",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivityLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivityLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.loaded = true;
        state.error = null;
        const reqArgs = action.meta?.arg || {};
        const { items, pagination } = normalizePaginatedPayload(action.payload, {
          defaultPage: reqArgs.page || 1,
          defaultPageSize: reqArgs.page_size || DEFAULT_PAGE_SIZE,
        });
        state.items = items;
        state.pagination = pagination;
      })
      .addCase(fetchActivityLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default activitySlice.reducer;
