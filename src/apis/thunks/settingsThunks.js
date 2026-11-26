import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../apiClient";

export const fetchSettings = createAsyncThunk(
  "settings/fetchSettings",
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiClient.get("/api/settings/");
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch settings");
    }
  }
);

export const fetchIntegrations = createAsyncThunk(
  "settings/fetchIntegrations",
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiClient.get("/api/integrations/");
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch integrations");
    }
  }
);

export const saveVaultRules = createAsyncThunk(
  "settings/saveVaultRules",
  async ({ homeCountry, remoteVault, globalVault, tiers }, { rejectWithValue }) => {
    try {
      const cleanTiers = (tiers || []).map((t, index, arr) => ({
        name: String(t.name || "").trim(),
        below:
          index === arr.length - 1 || t.below === "" || t.below === null || t.below === undefined
            ? null
            : Number(t.below),
      }));

      const payload = {
        homeCountry: String(homeCountry || "").trim(),
        remoteVault: String(remoteVault || "").trim(),
        globalVault: String(globalVault || "").trim(),
        tiers: cleanTiers,
      };

      const data = await apiClient.put("/api/settings/rules/", payload);
      return { payload, data };
    } catch (err) {
      return rejectWithValue(err.message || "Failed to save vault rules");
    }
  }
);

export const testVaultRule = createAsyncThunk(
  "settings/testVaultRule",
  async (
    { country, work_mode, exp_min, homeCountry, remoteVault, globalVault, tiers },
    { rejectWithValue }
  ) => {
    try {
      const parsedExp =
        exp_min === "" || exp_min === null || exp_min === undefined
          ? null
          : Number(exp_min);

      const data = await apiClient.post("/api/rules/test/", {
        country: country ?? "",
        work_mode: work_mode ?? "Onsite",
        exp_min: Number.isNaN(parsedExp) ? null : parsedExp,
        rules: {
          homeCountry,
          remoteVault,
          globalVault,
          tiers,
        },
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to test rule");
    }
  }
);

export const saveSheetColumns = createAsyncThunk(
  "settings/saveSheetColumns",
  async (columns, { rejectWithValue }) => {
    try {
      const cleanColumns = (columns || []).map((col) => ({
        key: col.key,
        label: String(col.label || "").trim() || col.key,
        required: Boolean(col.required),
        enabled: col.required ? true : Boolean(col.enabled),
      }));

      const data = await apiClient.put("/api/settings/columns/", {
        columns: cleanColumns,
      });
      return { columns: cleanColumns, data };
    } catch (err) {
      return rejectWithValue(err.message || "Failed to save sheet columns");
    }
  }
);

export const saveAiSettings = createAsyncThunk(
  "settings/saveAiSettings",
  async (aiSettings, { rejectWithValue }) => {
    try {
      const payload = {
        provider: aiSettings.provider || "openai",
        threshold: Number(aiSettings.threshold) || 80,
        strict: Boolean(aiSettings.strict),
        dedupe: Boolean(aiSettings.dedupe),
        dedupeDays: Math.max(1, Number(aiSettings.dedupeDays) || 30),
        extraInstructions: aiSettings.extraInstructions ?? "",
      };

      const data = await apiClient.put("/api/settings/ai/", payload);
      return { payload, data };
    } catch (err) {
      return rejectWithValue(err.message || "Failed to save AI settings");
    }
  }
);
