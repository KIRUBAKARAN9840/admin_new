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
  console.log("🔄 [REFRESH TOKEN] Starting token refresh process...");
  console.log("⏰ [REFRESH TOKEN] Timestamp:", new Date().toISOString());
  console.log("🌐 [REFRESH TOKEN] Base URL:", getBaseURL());

  try {
    // Backend reads refresh token from httpOnly cookie and returns new access token
    // Backend also sets new access token in httpOnly cookie
    console.log("📤 [REFRESH TOKEN] Sending POST to /auth/refresh");
    console.log("📤 [REFRESH TOKEN] Request body:", { role: "admin", device: "web" });

    const refreshResponse = await axios.post(
      `${getBaseURL()}/auth/refresh`,
      { role: "admin", device: "web" },
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    console.log("📥 [REFRESH TOKEN] Refresh response received");
    console.log("📥 [REFRESH TOKEN] Status:", refreshResponse?.status);
    console.log("📥 [REFRESH TOKEN] Data:", refreshResponse?.data);
    console.log("🍪 [REFRESH TOKEN] Set-Cookie headers:", refreshResponse?.headers?.['set-cookie']);

    if (refreshResponse?.status === 200) {
      console.log("✅ [REFRESH TOKEN] Token refresh successful!");
      // Backend has set the new access token in httpOnly cookie

      return true;
    } else {
      console.error("❌ [REFRESH TOKEN] Unexpected status code:", refreshResponse?.status);
      throw new Error("Failed to refresh token");
    }
  } catch (error) {
    console.error("❌❌❌ [REFRESH TOKEN] TOKEN REFRESH FAILED ❌❌❌");
    console.error("❌ [REFRESH TOKEN] Error:", error);
    console.error("❌ [REFRESH TOKEN] Error response:", error?.response);
    console.error("❌ [REFRESH TOKEN] Error status:", error?.response?.status);
    console.error("❌ [REFRESH TOKEN] Error data:", error?.response?.data);

    clearTokens();

    if (typeof window !== "undefined") {
      console.warn("⚠️ [REFRESH TOKEN] Redirecting to login due to token refresh failure");
      localStorage.removeItem("user");
      window.location.href = "/";
    }

    return null;
  }
};

const verifyToken = async () => {
  console.log("🔍 [VERIFY TOKEN] Starting token verification...");
  console.log("⏰ [VERIFY TOKEN] Timestamp:", new Date().toISOString());
  console.log("🌐 [VERIFY TOKEN] Base URL:", getBaseURL());

  try {
    // Backend reads admin_id and access token from httpOnly cookies
    console.log("📤 [VERIFY TOKEN] Sending GET to /auth/verify");
    console.log("📤 [VERIFY TOKEN] Params: device=web");

    const verifyResponse = await axios.get(`${getBaseURL()}/auth/verify`, {
      params: { device: "web" },
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    });

    console.log("📥 [VERIFY TOKEN] Verification response received");
    console.log("📥 [VERIFY TOKEN] Status:", verifyResponse?.status);
    console.log("📥 [VERIFY TOKEN] Data:", verifyResponse?.data);

    if (verifyResponse?.status === 200) {
      console.log("✅ [VERIFY TOKEN] Token verification successful!");
      return verifyResponse.data;
    } else {
      console.error("❌ [VERIFY TOKEN] Unexpected status code:", verifyResponse?.status);
      throw new Error("Token verification failed");
    }
  } catch (error) {
    console.error("❌ [VERIFY TOKEN] Token verification error:", error);
    console.error("❌ [VERIFY TOKEN] Error status:", error?.response?.status);
    console.error("❌ [VERIFY TOKEN] Error data:", error?.response?.data);

    // If verification fails due to 401 (invalid/expired token), try to refresh
    if (error.response?.status === 401) {
      console.log("🔄 [VERIFY TOKEN] 401 received, attempting token refresh...");
      try {
        const refreshSuccess = await refreshToken();
        console.log("🔄 [VERIFY TOKEN] Refresh success:", refreshSuccess);
        if (refreshSuccess) {
          console.log("🔄 [VERIFY TOKEN] Retrying verification with new token...");
          // Retry verification with new token
          const retryResponse = await axios.get(`${getBaseURL()}/auth/verify`, {
            params: { device: "web" },
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          });
          console.log("📥 [VERIFY TOKEN] Retry verification response:", retryResponse?.status);
          if (retryResponse?.status === 200) {
            console.log("✅ [VERIFY TOKEN] Retry verification successful!");
            return retryResponse.data;
          }
        }
      } catch (refreshError) {
        console.error(
          "❌ [VERIFY TOKEN] Token refresh failed during verification",
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

    console.log("📤 [AXIOS REQUEST]", config.method?.toUpperCase(), config.url);
    console.log("📤 [AXIOS REQUEST] Full URL:", config.baseURL + config.url);
    console.log("📤 [AXIOS REQUEST] Headers:", JSON.stringify(config.headers, null, 2));
    console.log("📤 [AXIOS REQUEST] withCredentials:", config.withCredentials);
    console.log("📤 [AXIOS REQUEST] Request timestamp:", new Date().toISOString());

    return config;
  },
  (error) => {
    console.error("❌ [AXIOS REQUEST ERROR]", error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally with automatic token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("✅ [AXIOS RESPONSE]", response.config?.method?.toUpperCase(), response.config?.url);
    console.log("✅ [AXIOS RESPONSE] Status:", response.status);
    console.log("✅ [AXIOS RESPONSE] Response timestamp:", new Date().toISOString());
    console.log("✅ [AXIOS RESPONSE] Response headers:", JSON.stringify(response.headers, null, 2));

    // Check for set-cookie headers
    const setCookieHeaders = response.headers?.['set-cookie'];
    if (setCookieHeaders) {
      console.log("🍪 [AXIOS RESPONSE] Set-Cookie headers detected:", setCookieHeaders);
    } else {
      console.log("⚠️ [AXIOS RESPONSE] No Set-Cookie headers in response");
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;

    console.error("❌ [AXIOS ERROR]", originalRequest?.method?.toUpperCase(), originalRequest?.url);
    console.error("❌ [AXIOS ERROR] Status:", status);
    console.error("❌ [AXIOS ERROR] Error timestamp:", new Date().toISOString());
    console.error("❌ [AXIOS ERROR] Error detail:", error?.response?.data);
    console.error("❌ [AXIOS ERROR] Error headers:", JSON.stringify(error?.response?.headers, null, 2));

    // Handle network errors
    if (!error.response) {
      console.error("❌ [AXIOS ERROR] Network error detected:", error.message);
      console.error("❌ [AXIOS ERROR] Full error object:", error);
      return Promise.reject({
        message: "Network error. Please check your connection.",
        originalError: error,
      });
    }

    // Bail immediately on non-401 errors
    if (status !== 401) {
      console.error("❌ [AXIOS ERROR] Non-401 error, rejecting immediately");
      return Promise.reject(error);
    }

    console.log("🔄 [AXIOS ERROR] 401 detected - checking token refresh flow");

    if (!originalRequest || originalRequest._retry) {
      console.warn("⚠️ [AXIOS ERROR] Request already retried (_retry flag set), aborting");
      return Promise.reject(error);
    }

    // Skip retry for auth endpoints to avoid infinite loops
    const url = originalRequest.url;
    const isAuthEndpoint =
      url?.includes("/auth/refresh") ||
      url?.includes("/auth/verify") ||
      url?.includes("/auth/otp-verification");

    if (isAuthEndpoint) {
      console.log("🚫 [AXIOS ERROR] Auth endpoint failed, skipping retry:", url);
      console.log("🚫 [AXIOS ERROR] Clearing localStorage and redirecting to login");
      if (typeof window !== "undefined") {
        console.log("🗑️ [AXIOS ERROR] localStorage.user before clear:", localStorage.getItem("user"));
        localStorage.removeItem("user");
        console.log("🗑️ [AXIOS ERROR] localStorage.user after clear:", localStorage.getItem("user"));
        window.location.href = "/";
      }
      return Promise.reject(error);
    }

    console.log("🔄 [AXIOS ERROR] Starting token refresh flow");
    console.log("🔄 [AXIOS ERROR] Original request URL:", originalRequest.url);
    console.log("🔄 [AXIOS ERROR] isRefreshing flag:", isRefreshing);

    originalRequest._retry = true;
    console.log("🔄 [AXIOS ERROR] Set _retry flag on original request");

    if (!isRefreshing) {
      console.log("🔄 [AXIOS ERROR] Initiating new token refresh");
      isRefreshing = true;
      console.log("🔄 [AXIOS ERROR] Set isRefreshing = true");
      refreshPromise = refreshToken();
      console.log("🔄 [AXIOS ERROR] Created refresh promise");
    } else {
      console.log("⏳ [AXIOS ERROR] Token refresh already in progress, waiting for existing promise");
    }

    try {
      console.log("⏳ [AXIOS ERROR] Waiting for refresh promise...");
      const refreshSuccess = await refreshPromise;
      console.log("✅ [AXIOS ERROR] Refresh promise resolved, success:", refreshSuccess);

      if (refreshSuccess) {
        console.log("✅ [AXIOS ERROR] Token refresh successful, retrying original request");
        console.log("⏳ [AXIOS ERROR] Waiting 100ms before retry...");
        await new Promise((resolve) => setTimeout(resolve, 100));
        console.log("🔄 [AXIOS ERROR] Retrying original request:", originalRequest.url);
        return axiosInstance(originalRequest);
      }

      console.warn("⚠️ [AXIOS ERROR] Token refresh unsuccessful, redirecting to login");
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        window.location.href = "/";
      }
    } catch (refreshError) {
      console.error("❌ [AXIOS ERROR] Token refresh failed in interceptor");
      console.error("❌ [AXIOS ERROR] Refresh error:", refreshError);
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        window.location.href = "/";
      }
    } finally {
      console.log("🧹 [AXIOS ERROR] Cleaning up token refresh state");
      isRefreshing = false;
      refreshPromise = null;
      console.log("🧹 [AXIOS ERROR] Reset isRefreshing and refreshPromise");
    }

    return Promise.reject(error);
  }
);

export { verifyToken };
export default axiosInstance;
