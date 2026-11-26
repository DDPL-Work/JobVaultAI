import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../apiClient";

function buildVaultPayload(vaultData) {
  return {
    name: vaultData.name,
    description: vaultData.description ?? vaultData.desc ?? "",
    desc: vaultData.desc ?? vaultData.description ?? "",
    min_exp: vaultData.min_exp ?? null,
    max_exp: vaultData.max_exp ?? null,
    below: vaultData.max_exp ?? vaultData.below ?? null,
    is_active: vaultData.is_active !== undefined ? vaultData.is_active : true,
  };
}

export const fetchVaults = createAsyncThunk(
  "vaults/fetchVaults",
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiClient.get("/api/vaults/");
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch vaults");
    }
  }
);

export const createVault = createAsyncThunk(
  "vaults/createVault",
  async (vaultData, { rejectWithValue }) => {
    try {
      const data = await apiClient.post(
        "/api/vaults/",
        buildVaultPayload(vaultData)
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to create vault");
    }
  }
);

export const updateVault = createAsyncThunk(
  "vaults/updateVault",
  async ({ originalName, name, updates }, { rejectWithValue }) => {
    try {
      const targetName = originalName || name;
      const data = await apiClient.put(
        `/api/vaults/${encodeURIComponent(targetName)}/`,
        buildVaultPayload(updates || {})
      );
      return { originalName: targetName, data };
    } catch (err) {
      return rejectWithValue(err.message || "Failed to update vault");
    }
  }
);

export const deleteVault = createAsyncThunk(
  "vaults/deleteVault",
  async (name, { rejectWithValue }) => {
    try {
      const data = await apiClient.delete(
        `/api/vaults/${encodeURIComponent(name)}/`
      );
      return { name, data };
    } catch (err) {
      return rejectWithValue(err.message || "Failed to delete vault");
    }
  }
);
