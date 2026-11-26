import { createSlice } from "@reduxjs/toolkit";
import {
  fetchSettings,
  fetchIntegrations,
  saveVaultRules,
  testVaultRule,
  saveSheetColumns,
  saveAiSettings,
} from "../thunks/settingsThunks";

function parseVaultsList(data) {
  if (Array.isArray(data?.vaults) && data.vaults.length > 0) {
    return data.vaults;
  }
  if (typeof data?.vault === "string" && data.vault.trim()) {
    return data.vault
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return null;
}

const initialState = {
  rules: {
    homeCountry: "",
    remoteVault: "",
    globalVault: "",
    tiers: [],
  },
  ai: null,
  columns: [],
  providers: null,
  vaults: [],
  prompt: "",
  integrations: null,
  loading: false,
  loaded: false,
  loadingIntegrations: false,
  loadedIntegrations: false,
  savingRules: false,
  savingColumns: false,
  savingAi: false,
  testingRule: false,
  testResultVaults: null,
  error: null,
  integrationsError: null,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    clearTestResult: (state) => {
      state.testResultVaults = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchSettings
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.loaded = true;
        state.error = null;
        const data = action.payload || {};
        if (data.rules) {
          state.rules = {
            homeCountry: data.rules.homeCountry || "",
            remoteVault: data.rules.remoteVault || "",
            globalVault: data.rules.globalVault || "",
            tiers: Array.isArray(data.rules.tiers) ? data.rules.tiers : [],
          };
        }
        if (data.ai) state.ai = data.ai;
        if (Array.isArray(data.columns)) state.columns = data.columns;
        if (data.providers) state.providers = data.providers;
        if (Array.isArray(data.vaults)) state.vaults = data.vaults;
        if (typeof data.prompt === "string") state.prompt = data.prompt;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // saveVaultRules
      .addCase(saveVaultRules.pending, (state) => {
        state.savingRules = true;
        state.error = null;
      })
      .addCase(saveVaultRules.fulfilled, (state, action) => {
        state.savingRules = false;
        const { payload, data } = action.payload || {};
        if (data?.rules) {
          state.rules = data.rules;
        } else if (payload) {
          state.rules = payload;
        }
      })
      .addCase(saveVaultRules.rejected, (state, action) => {
        state.savingRules = false;
        state.error = action.payload;
      })
      // testVaultRule
      .addCase(testVaultRule.pending, (state) => {
        state.testingRule = true;
      })
      .addCase(testVaultRule.fulfilled, (state, action) => {
        state.testingRule = false;
        const parsed = parseVaultsList(action.payload);
        if (parsed) {
          state.testResultVaults = parsed;
        }
      })
      .addCase(testVaultRule.rejected, (state) => {
        state.testingRule = false;
      })
      // saveSheetColumns
      .addCase(saveSheetColumns.pending, (state) => {
        state.savingColumns = true;
        state.error = null;
      })
      .addCase(saveSheetColumns.fulfilled, (state, action) => {
        state.savingColumns = false;
        const { columns, data } = action.payload || {};
        if (Array.isArray(data?.columns)) {
          state.columns = data.columns;
        } else if (Array.isArray(columns)) {
          state.columns = columns;
        }
      })
      .addCase(saveSheetColumns.rejected, (state, action) => {
        state.savingColumns = false;
        state.error = action.payload;
      })
      // saveAiSettings
      .addCase(saveAiSettings.pending, (state) => {
        state.savingAi = true;
        state.error = null;
      })
      .addCase(saveAiSettings.fulfilled, (state, action) => {
        state.savingAi = false;
        const { payload, data } = action.payload || {};
        if (data && typeof data === "object" && data.provider) {
          state.ai = data;
        } else if (data?.ai) {
          state.ai = data.ai;
        } else if (payload) {
          state.ai = payload;
        }
      })
      .addCase(saveAiSettings.rejected, (state, action) => {
        state.savingAi = false;
        state.error = action.payload;
      })
      // fetchIntegrations
      .addCase(fetchIntegrations.pending, (state) => {
        state.loadingIntegrations = true;
        state.integrationsError = null;
      })
      .addCase(fetchIntegrations.fulfilled, (state, action) => {
        state.loadingIntegrations = false;
        state.loadedIntegrations = true;
        state.integrationsError = null;
        state.integrations = action.payload || null;
      })
      .addCase(fetchIntegrations.rejected, (state, action) => {
        state.loadingIntegrations = false;
        state.integrationsError = action.payload;
      });
  },
});

export const { clearTestResult } = settingsSlice.actions;
export default settingsSlice.reducer;
