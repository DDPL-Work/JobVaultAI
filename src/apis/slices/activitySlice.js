import { createSlice } from "@reduxjs/toolkit";
import { fetchActivityLogs } from "../thunks/activityThunks";

const initialState = {
  items: [],
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
        const payload = action.payload;
        if (Array.isArray(payload)) {
          state.items = payload;
        } else if (Array.isArray(payload?.items)) {
          state.items = payload.items;
        } else {
          state.items = [];
        }
      })
      .addCase(fetchActivityLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default activitySlice.reducer;
