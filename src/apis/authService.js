/**
 * Authentication Service for JobVault AI
 * Interacts with Python backend JWT & Security suite
 */

import apiClient, {
  setAuthSession,
  clearAuthSession,
  getAccessToken,
  getUser,
} from "./apiClient";

export const authService = {
  /**
   * Authenticates user with email/username and password
   * Endpoint: POST /api/auth/login/
   */
  async login(emailOrUsername, password) {
    const cleanUser = (emailOrUsername || "").trim();
    const isEmail = cleanUser.includes("@");
    const payload = {
      password,
      ...(isEmail ? { email: cleanUser } : { username: cleanUser }),
    };

    const data = await apiClient.post("/api/auth/login/", payload, {
      requiresAuth: false,
    });

    // Handle token format (supports either data.access / data.refresh or data.tokens or data.token)
    const access = data.access || data.token || data.tokens?.access;
    const refresh = data.refresh || data.tokens?.refresh;
    const user = data.user || {
      email: data.email || (isEmail ? cleanUser : ""),
      name: data.username || cleanUser.split("@")[0],
      username: data.username || cleanUser.split("@")[0],
      role: data.role || "Admin",
    };

    if (access) {
      setAuthSession({ access, refresh, user });
    }

    return { access, refresh, user, raw: data };
  },

  /**
   * Clears tokens and logs out user
   */
  async logout() {
    try {
      await apiClient.post("/api/auth/logout/", {}, { requiresAuth: true });
    } catch {
      // Ignore network errors on logout
    } finally {
      clearAuthSession();
    }
  },

  /**
   * Fetches currently logged in user profile
   * Endpoint: GET /api/auth/me/
   */
  async getCurrentUser() {
    return await apiClient.get("/api/auth/me/");
  },

  /**
   * Sends 6-digit OTP to user's email
   * Endpoint: POST /api/auth/forgot-password/
   */
  async forgotPassword(email) {
    return await apiClient.post(
      "/api/auth/forgot-password/",
      { email: email.trim() },
      { requiresAuth: false }
    );
  },

  /**
   * Verifies 6-digit OTP
   * Endpoint: POST /api/auth/verify-reset-token/
   */
  async verifyResetToken(email, otp) {
    return await apiClient.post(
      "/api/auth/verify-reset-token/",
      {
        email: email.trim(),
        otp: String(otp).trim(),
      },
      { requiresAuth: false }
    );
  },

  /**
   * Sets new password
   * Endpoint: POST /api/auth/reset-password/
   */
  async resetPassword(email, otp, newPassword, confirmNewPassword) {
    return await apiClient.post(
      "/api/auth/reset-password/",
      {
        email: email.trim(),
        otp: String(otp).trim(),
        new_password: newPassword,
        confirm_new_password: confirmNewPassword || newPassword,
      },
      { requiresAuth: false }
    );
  },

  /**
   * Quick check if user is authenticated
   */
  isAuthenticated() {
    return Boolean(getAccessToken());
  },

  /**
   * Returns cached user object
   */
  getUser() {
    return getUser();
  },
};

export default authService;
