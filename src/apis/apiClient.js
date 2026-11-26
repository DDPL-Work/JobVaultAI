/**
 * Centralized API Client for JobVault AI
 * Connects frontend to Python backend with JWT auto-attachment and refresh
 */

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://jobvault.drdesigntech.com"
).replace(/\/+$/, "");

export const TOKEN_KEYS = {
  ACCESS: "jv_access_token",
  REFRESH: "jv_refresh_token",
  USER: "jv_user",
};

export function getAccessToken() {
  return sessionStorage.getItem(TOKEN_KEYS.ACCESS);
}

export function getRefreshToken() {
  return sessionStorage.getItem(TOKEN_KEYS.REFRESH);
}

export function getUser() {
  try {
    const raw = sessionStorage.getItem(TOKEN_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAuthSession({ access, refresh, user }) {
  if (access) sessionStorage.setItem(TOKEN_KEYS.ACCESS, access);
  if (refresh) sessionStorage.setItem(TOKEN_KEYS.REFRESH, refresh);
  if (user) sessionStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(user));

  // Ensure legacy localStorage auth keys are cleaned up
  try {
    localStorage.removeItem(TOKEN_KEYS.ACCESS);
    localStorage.removeItem(TOKEN_KEYS.REFRESH);
    localStorage.removeItem(TOKEN_KEYS.USER);
    localStorage.removeItem("jobvault_auth");
    localStorage.removeItem("jv_token");
  } catch {
    // ignore
  }
}

export function clearAuthSession() {
  sessionStorage.removeItem(TOKEN_KEYS.ACCESS);
  sessionStorage.removeItem(TOKEN_KEYS.REFRESH);
  sessionStorage.removeItem(TOKEN_KEYS.USER);
  sessionStorage.removeItem("jobvault_auth");
  sessionStorage.removeItem("jv_token");

  try {
    localStorage.removeItem(TOKEN_KEYS.ACCESS);
    localStorage.removeItem(TOKEN_KEYS.REFRESH);
    localStorage.removeItem(TOKEN_KEYS.USER);
    localStorage.removeItem("jobvault_auth");
    localStorage.removeItem("jv_token");
  } catch {
    // ignore
  }
}

// Queue for pending requests while a refresh token call is in flight
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Attempts to refresh the JWT access token using the refresh token
 */
async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) {
    throw new Error("No refresh token available");
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!response.ok) {
    clearAuthSession();
    throw new Error("Session expired. Please log in again.");
  }

  const data = await response.json();
  const newAccess = data.access || data.token;
  if (newAccess) {
    sessionStorage.setItem(TOKEN_KEYS.ACCESS, newAccess);
    if (data.refresh) {
      sessionStorage.setItem(TOKEN_KEYS.REFRESH, data.refresh);
    }
    return newAccess;
  }
  throw new Error("Invalid token refresh response");
}

/**
 * Core API Request Method
 */
export async function apiClient(endpoint, options = {}) {
  const {
    method = "GET",
    headers = {},
    body = null,
    requiresAuth = true,
    ...rest
  } = options;

  // Build clean absolute URL
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  // Request Headers
  const requestHeaders = new Headers(headers);

  // If body is NOT FormData, set JSON Content-Type by default
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  if (!isFormData && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  // Attach Authorization header if auth token exists
  if (requiresAuth && !requestHeaders.has("Authorization")) {
    const token = getAccessToken();
    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  const config = {
    method,
    headers: requestHeaders,
    body: isFormData || typeof body === "string" || body === null ? body : JSON.stringify(body),
    ...rest,
  };

  try {
    let res = await fetch(url, config);

    // If 401 Unauthorized and not an auth login/refresh endpoint, attempt refresh
    if (
      res.status === 401 &&
      requiresAuth &&
      !cleanEndpoint.includes("/api/auth/login") &&
      !cleanEndpoint.includes("/api/auth/token/refresh")
    ) {
      if (isRefreshing) {
        // Wait for current refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          requestHeaders.set("Authorization", `Bearer ${newToken}`);
          return fetch(url, { ...config, headers: requestHeaders }).then(handleResponse);
        });
      }

      isRefreshing = true;

      try {
        const newAccessToken = await refreshAccessToken();
        processQueue(null, newAccessToken);
        requestHeaders.set("Authorization", `Bearer ${newAccessToken}`);
        return fetch(url, { ...config, headers: requestHeaders }).then(handleResponse);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        window.dispatchEvent(new CustomEvent("jv:auth-expired"));
        throw refreshErr;
      } finally {
        isRefreshing = false;
      }
    }

    return await handleResponse(res);
  } catch (error) {
    console.error(`API Error [${method} ${cleanEndpoint}]:`, error);
    throw error;
  }
}

/**
 * Parses response JSON or text and throws formatted error if !res.ok
 */
async function handleResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  let data = null;

  if (contentType.includes("application/json")) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    try {
      data = await res.text();
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    let errorMessage = `Request failed with status ${res.status}`;
    if (data && typeof data === "object") {
      const firstFieldError = Object.values(data).find(
        (v) => Array.isArray(v) && typeof v[0] === "string"
      )?.[0];
      errorMessage =
        data.detail ||
        data.message ||
        data.error ||
        (Array.isArray(data.non_field_errors) ? data.non_field_errors.join(", ") : null) ||
        firstFieldError ||
        JSON.stringify(data);
    } else if (typeof data === "string" && data.length < 200) {
      errorMessage = data;
    }

    const err = new Error(errorMessage);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

// Convenience methods
apiClient.get = (url, options = {}) => apiClient(url, { ...options, method: "GET" });
apiClient.post = (url, body, options = {}) => apiClient(url, { ...options, method: "POST", body });
apiClient.put = (url, body, options = {}) => apiClient(url, { ...options, method: "PUT", body });
apiClient.patch = (url, body, options = {}) => apiClient(url, { ...options, method: "PATCH", body });
apiClient.delete = (url, options = {}) => apiClient(url, { ...options, method: "DELETE" });

export default apiClient;
