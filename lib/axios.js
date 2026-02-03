import axios from "axios";

// Determine the API base URL based on environment
const getBaseURL = () => {
  // Always use the API URL from environment variable
  return process.env.NEXT_PUBLIC_API_URL || "https://app.fittbot.com";
};

// Create axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000, // 30 seconds
  withCredentials: true, // Important: enables sending cookies with requests
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true", // Required for ngrok tunnels
  },
});

let isRefreshing = false;
let refreshPromise = null;

const clearTokens = () => {
  if (typeof window !== "undefined") {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
};

const refreshToken = async () => {
  try {
    // Backend reads refresh token from httpOnly cookie and returns new access token
    // Backend also sets new access token in httpOnly cookie

    // ✅ FIXED: Use /admin/auth/refresh-cookie instead of /auth/refresh
    // The /auth/refresh endpoint expects {id: int, user_type: str} in body but doesn't set cookies
    // The /admin/auth/refresh-cookie endpoint reads from cookies and properly sets new cookies

    const refreshResponse = await axios.post(
      `${getBaseURL()}/admin/auth/refresh-cookie`,
      {},  // Empty body - reads from cookies
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    if (refreshResponse?.status === 200) {
      // Backend has set the new access token in httpOnly cookie
      return true;
    } else {
      throw new Error("Failed to refresh token");
    }
  } catch (error) {
    console.error("Token refresh failed:", error);
    clearTokens();

    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      window.location.href = "/";
    }

    return null;
  }
};

const verifyToken = async () => {
  try {
    // Backend reads admin_id and access token from httpOnly cookies

    const verifyResponse = await axios.get(`${getBaseURL()}/auth/verify`, {
      params: { device: "web" },
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (verifyResponse?.status === 200) {
      return verifyResponse.data;
    } else {
      throw new Error("Token verification failed");
    }
  } catch (error) {
    console.error("Token verification error:", error);

    // If verification fails due to 401 (invalid/expired token), try to refresh
    if (error.response?.status === 401) {
      try {
        const refreshSuccess = await refreshToken();
        if (refreshSuccess) {
          // Retry verification with new token
          const retryResponse = await axios.get(`${getBaseURL()}/auth/verify`, {
            params: { device: "web" },
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          });
          if (retryResponse?.status === 200) {
            return retryResponse.data;
          }
        }
      } catch (refreshError) {
        console.error(
          "Token refresh failed during verification",
          refreshError
        );
      }
    }

    throw error;
  }
};

// Request interceptor - cookies are sent automatically due to withCredentials: true
axiosInstance.interceptors.request.use(
  (config) => {
    // HttpOnly cookies (access_token, refresh_token) are automatically sent
    // No need to manually add Authorization header for cookie-based auth
    // The browser handles this automatically with withCredentials: true

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally with automatic token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;

    // Handle network errors
    if (!error.response) {
      console.error("Network error:", error.message);
      return Promise.reject({
        message: "Network error. Please check your connection.",
        originalError: error,
      });
    }

    // Bail immediately on non-401 errors
    if (status !== 401) {
      return Promise.reject(error);
    }

    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Skip retry for auth endpoints to avoid infinite loops
    const url = originalRequest.url;
    const isAuthEndpoint =
      url?.includes("/auth/refresh") ||
      url?.includes("/auth/verify") ||
      url?.includes("/auth/otp-verification");

    if (isAuthEndpoint) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        window.location.href = "/";
      }
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshToken();
    }

    try {
      const refreshSuccess = await refreshPromise;

      if (refreshSuccess) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return axiosInstance(originalRequest);
      }

      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        window.location.href = "/";
      }
    } catch (refreshError) {
      console.error("Token refresh failed in interceptor", refreshError);
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        window.location.href = "/";
      }
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }

    return Promise.reject(error);
  }
);

export { verifyToken };
export default axiosInstance;
