import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import dashboardReducer from "./slices/dashboardSlice";
import jobsReducer from "./slices/jobsSlice";
import vaultsReducer from "./slices/vaultsSlice";
import screenshotsReducer from "./slices/screenshotsSlice";
import settingsReducer from "./slices/settingsSlice";
import activityReducer from "./slices/activitySlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    jobs: jobsReducer,
    vaults: vaultsReducer,
    screenshots: screenshotsReducer,
    settings: settingsReducer,
    activity: activityReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
