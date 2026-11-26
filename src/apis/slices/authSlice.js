import { createSlice } from "@reduxjs/toolkit";
import { getUser, getAccessToken, clearAuthSession } from "../apiClient";
import { loginUser, logoutUser, fetchCurrentUser } from "../thunks/authThunks";

const initialUser = getUser();
const initialToken = getAccessToken();

const initialState = {
  user: initialUser,
  token: initialToken,
  isAuthenticated: Boolean(initialToken),
  loading: false,
  checkingUser: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.access;
      state.isAuthenticated = Boolean(action.payload.access);
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      clearAuthSession();
    },
  },
  extraReducers: (builder) => {
    builder
      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.access;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // logoutUser
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
      })
      // fetchCurrentUser
      .addCase(fetchCurrentUser.pending, (state) => {
        state.checkingUser = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.checkingUser = false;
        state.user = action.payload;
        state.isAuthenticated = Boolean(getAccessToken() || state.token);
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.checkingUser = false;
        if (!getAccessToken()) {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
        }
      });
  },
});

export const { setCredentials, clearAuth } = authSlice.actions;
export default authSlice.reducer;
