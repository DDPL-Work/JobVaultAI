import { createSlice } from "@reduxjs/toolkit";
import {
  fetchVaults,
  createVault,
  updateVault,
  deleteVault,
} from "../thunks/vaultsThunks";
import {
  loadVaultConfigs,
  saveVaultConfigs,
} from "../../components/vaults/vaultsData";

function normalizeVault(v) {
  return {
    id: v.id || v.name,
    name: v.name,
    desc: v.desc || v.description || "",
    description: v.description || v.desc || "",
    min_exp: v.min_exp,
    max_exp: v.max_exp,
    type: v.type,
    is_active: v.is_active !== undefined ? v.is_active : true,
    count: v.count,
  };
}

const initialState = {
  vaults: loadVaultConfigs(),
  loading: false,
  loaded: false,
  error: null,
};

const vaultsSlice = createSlice({
  name: "vaults",
  initialState,
  reducers: {
    setLocalVaults: (state, action) => {
      state.vaults = action.payload;
      saveVaultConfigs(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchVaults
      .addCase(fetchVaults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVaults.fulfilled, (state, action) => {
        state.loading = false;
        state.loaded = true;
        state.error = null;
        const payload = action.payload;
        const items = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.vaults)
          ? payload.vaults
          : null;
        if (items) {
          const normalized = items.map(normalizeVault);
          state.vaults = normalized;
          saveVaultConfigs(normalized);
        }
      })
      .addCase(fetchVaults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // createVault
      .addCase(createVault.fulfilled, (state, action) => {
        const payload = action.payload;
        if (Array.isArray(payload?.vaults)) {
          state.vaults = payload.vaults.map(normalizeVault);
          saveVaultConfigs(state.vaults);
        } else {
          const created = payload?.vault || payload;
          if (created?.name) {
            state.vaults.push(normalizeVault(created));
            saveVaultConfigs(state.vaults);
          }
        }
      })
      // updateVault
      .addCase(updateVault.fulfilled, (state, action) => {
        const { originalName, data: payload } = action.payload || {};
        if (Array.isArray(payload?.vaults)) {
          state.vaults = payload.vaults.map(normalizeVault);
          saveVaultConfigs(state.vaults);
        } else {
          const updated = payload?.vault || payload;
          if (updated?.name) {
            const norm = normalizeVault(updated);
            state.vaults = state.vaults.map((v) =>
              v.name === originalName || v.id === updated.id || v.name === updated.name
                ? norm
                : v
            );
            saveVaultConfigs(state.vaults);
          }
        }
      })
      // deleteVault
      .addCase(deleteVault.fulfilled, (state, action) => {
        const { name: deletedName, data: payload } = action.payload || {};
        if (Array.isArray(payload?.vaults)) {
          state.vaults = payload.vaults.map(normalizeVault);
          saveVaultConfigs(state.vaults);
        } else if (deletedName) {
          state.vaults = state.vaults.filter((v) => v.name !== deletedName);
          saveVaultConfigs(state.vaults);
        }
      });
  },
});

export const { setLocalVaults } = vaultsSlice.actions;
export default vaultsSlice.reducer;
