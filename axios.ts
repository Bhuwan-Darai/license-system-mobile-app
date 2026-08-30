import axios from "axios";
import {API_URL} from "@/constants";
import {Alert} from "react-native";


const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true
});

// Request Interceptor
api.interceptors.request.use(
    (config) => {
      // No need to attach token manually anymore (handled by cookie)
      return config;
    },
    (error) => Promise.reject(error),
);

// Response Interceptor
api.interceptors.response.use(
    (response) => response?.data,
    (error) => {
      if (error.response) {
        const status = error.response.status;
        const url = error.response.config.url;

        if (status === 401) {
          // Ignore auth check failures
          if (url !== "/auth/me" && url !== "/auth/login") {
            Alert.alert("Session expired. Please login again.");

            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
            Alert.alert("Session expired. Please login again.");
          }
        } else if (status === 403) {
          Alert.alert(error.response.data?.message || "Access denied");
        } else if (status === 404) {
          Alert.alert("Resource not found");
        } else if (status >= 500) {
          Alert.alert("Server error. Please try again later.");
        }
      } else if (error.request) {
        Alert.alert("No response from server. Please check your connection.");
      } else {
        Alert.alert(error.message || "An error occurred");
      }

      return Promise.reject(error);
    },
);


export default api;