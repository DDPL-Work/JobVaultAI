import { createSlice } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../apiClient";
import {
  fetchScreenshots,
  uploadScreenshots,
  deleteScreenshot,
  retryScreenshot,
} from "../thunks/screenshotsThunks";

function formatScreenshotDate(rawDate) {
  if (!rawDate) return "";
  try {
    const normalized = String(rawDate).includes("T")
      ? rawDate
      : String(rawDate).replace(" ", "T");
    const d = new Date(normalized);
    if (Number.isNaN(d.getTime())) return String(rawDate);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(rawDate);
  }
}

function formatOrigin(origin) {
  if (!origin) return "Uploaded";
  const lower = String(origin).toLowerCase();
  if (lower === "upload") return "Uploaded";
  if (lower === "paste") return "Pasted";
  return origin;
}

function normalizeScreenshot(raw) {
  if (!raw || typeof raw !== "object") return raw;
  let imageUrl = raw.image || "";
  if (imageUrl && imageUrl.startsWith("/")) {
    imageUrl = `${API_BASE_URL}${imageUrl}`;
  }

  return {
    ...raw,
    id: raw.id,
    filename: raw.filename || raw.original_name || "",
    originalName: raw.original_name || raw.originalName || raw.filename || "",
    dateFormatted:
      raw.dateFormatted || formatScreenshotDate(raw.created_at),
    origin: formatOrigin(raw.origin),
    sourceApp: raw.source_app || raw.sourceApp || "",
    stage: raw.stage || "received",
    error: raw.error || null,
    image: imageUrl,
    isCombined: Boolean(raw.is_combined || raw.isCombined),
    partsCount: raw.parts_count || raw.partsCount,
    isPdf: Boolean(
      raw.is_pdf ||
        raw.isPdf ||
        String(raw.filename || raw.original_name || "")
          .toLowerCase()
          .endsWith(".pdf")
    ),
    pageNumber: raw.page_number || raw.pageNumber,
    jobs: Array.isArray(raw.jobs) ? raw.jobs : [],
  };
}

const initialState = {
  items: [],
  queue: { queued: 0, running: 0 },
  loading: false,
  uploading: false,
  error: null,
};

const screenshotsSlice = createSlice({
  name: "screenshots",
  initialState,
  reducers: {
    updateScreenshotJobStatus: (state, action) => {
      const { jobId, newStatus } = action.payload;
      state.items = state.items.map((s) => ({
        ...s,
        jobs: Array.isArray(s.jobs)
          ? s.jobs.map((j) =>
              j.id === jobId ? { ...j, status: newStatus } : j
            )
          : s.jobs,
      }));
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchScreenshots
      .addCase(fetchScreenshots.pending, (state) => {
        if (state.items.length === 0) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchScreenshots.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.items)
          ? payload.items
          : Array.isArray(payload?.results)
          ? payload.results
          : [];
        state.items = list.map(normalizeScreenshot);
        if (payload?.queue && typeof payload.queue === "object") {
          state.queue = {
            queued: Number(payload.queue.queued || 0),
            running: Number(payload.queue.running || 0),
          };
        }
      })
      .addCase(fetchScreenshots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // uploadScreenshots
      .addCase(uploadScreenshots.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadScreenshots.fulfilled, (state) => {
        state.uploading = false;
      })
      .addCase(uploadScreenshots.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
      })
      // deleteScreenshot
      .addCase(deleteScreenshot.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.items = state.items.filter((s) => s.id !== deletedId);
      })
      // retryScreenshot
      .addCase(retryScreenshot.fulfilled, (state, action) => {
        const { id } = action.payload;
        state.items = state.items.map((s) =>
          s.id === id ? { ...s, stage: "received", error: null } : s
        );
      });
  },
});

export const { updateScreenshotJobStatus } = screenshotsSlice.actions;
export default screenshotsSlice.reducer;
