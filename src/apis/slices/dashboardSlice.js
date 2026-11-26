import { createSlice } from "@reduxjs/toolkit";
import {
  fetchDashboardStats,
  fetchRecentJobs,
  fetchHealthStatus,
} from "../thunks/dashboardThunks";

// Generate empty 14-day placeholder timeline ending today while loading
function buildEmptyLast14Days() {
  const days = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    days.push({
      date: dd,
      fullDate: `${yyyy}-${mm}-${dd}`,
      count: 0,
    });
  }
  return days;
}

const DEFAULT_STATS = {
  screenshotsWeek: 0,
  screenshots: 0,
  inSheet: 0,
  addedToday: 0,
  review: 0,
  duplicates: 0,
  failed: 0,
  threshold: 80,
  byVault: {},
  bySource: [],
  days: buildEmptyLast14Days(),
};

const initialState = {
  stats: DEFAULT_STATS,
  recentJobs: [],
  health: {
    ok: null,
    provider: "",
    authRequired: false,
    loading: false,
    lastChecked: null,
    error: null,
  },
  loadingStats: false,
  loadingJobs: false,
  statsLoaded: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    updateRecentJobStatus: (state, action) => {
      const { jobId, newStatus } = action.payload;
      state.recentJobs = state.recentJobs.map((j) =>
        j.id === jobId ? { ...j, status: newStatus } : j
      );
    },
    updateRecentJob: (state, action) => {
      const updated = action.payload;
      state.recentJobs = state.recentJobs.map((j) =>
        j.id === updated.id ? updated : j
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchDashboardStats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loadingStats = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loadingStats = false;
        state.statsLoaded = true;
        state.error = null;
        if (action.payload && typeof action.payload === "object") {
          const raw = action.payload;
          // Normalize bySource formatting (supports 'count' or 'n')
          const normalizedSource = Array.isArray(raw.bySource)
            ? raw.bySource.map((s) => ({
                source: s.source || s.name || "Other",
                count: Number(s.count ?? s.n ?? 0),
              }))
            : state.stats.bySource;

          // Normalize 14-day series formatting (supports { date, count } or { d: 'YYYY-MM-DD', n })
          const normalizedDays =
            Array.isArray(raw.days) && raw.days.length > 0
              ? raw.days.map((item) => {
                  const rawDate = String(item.date || item.d || "");
                  const dayNum = rawDate.includes("-")
                    ? rawDate.split("-").pop()
                    : rawDate;
                  return {
                    date: dayNum,
                    fullDate: rawDate,
                    count: Number(item.count ?? item.n ?? 0),
                  };
                })
              : state.stats.days;

          state.stats = {
            ...state.stats,
            ...raw,
            bySource: normalizedSource,
            byVault: raw.byVault || state.stats.byVault,
            days: normalizedDays,
          };

          // Also populate recentJobs from stats.recent if jobs endpoint hasn't populated yet
          if (Array.isArray(raw.recent) && state.recentJobs.length === 0) {
            state.recentJobs = raw.recent;
          }
        }
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loadingStats = false;
        state.error = action.payload;
      })
      // fetchRecentJobs
      .addCase(fetchRecentJobs.pending, (state) => {
        state.loadingJobs = true;
      })
      .addCase(fetchRecentJobs.fulfilled, (state, action) => {
        state.loadingJobs = false;
        if (Array.isArray(action.payload)) {
          state.recentJobs = action.payload;
        }
      })
      .addCase(fetchRecentJobs.rejected, (state, action) => {
        state.loadingJobs = false;
        state.error = action.payload;
      })
      // fetchHealthStatus
      .addCase(fetchHealthStatus.pending, (state) => {
        state.health.loading = true;
        state.health.error = null;
      })
      .addCase(fetchHealthStatus.fulfilled, (state, action) => {
        const payload = action.payload || {};
        state.health = {
          ok: Boolean(payload.ok),
          provider: payload.provider || "",
          authRequired: Boolean(payload.authRequired),
          loading: false,
          lastChecked: new Date().toISOString(),
          error: null,
        };
      })
      .addCase(fetchHealthStatus.rejected, (state, action) => {
        state.health = {
          ...state.health,
          ok: false,
          loading: false,
          lastChecked: new Date().toISOString(),
          error: action.payload || "Server unreachable",
        };
      });
  },
});

export const { updateRecentJobStatus, updateRecentJob } = dashboardSlice.actions;
export default dashboardSlice.reducer;
