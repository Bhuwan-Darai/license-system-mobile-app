import axios from "axios";
import { API_URL } from "@/constants";
import { Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
    baseURL: `${API_URL}/api/v1`,
    timeout: 10000,
    // On web the browser stores the httpOnly auth cookie and must send it
    // itself, otherwise the session is lost on every reload.
    withCredentials: Platform.OS === "web",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// REQUEST INTERCEPTOR
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem("auth_token");

        // Browsers forbid setting the Cookie header; they send the cookie themselves.
        if (token && Platform.OS !== "web") {
            config.headers = config.headers || {};
            config.headers["Cookie"] = `auth_token=${token}`;
        }

        console.log("Request:", config.url);
        console.log("Has auth cookie:", !!token);

        return config;
    },
    (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
    async (response) => {
        const setCookie = response.headers["set-cookie"];

        if (setCookie) {
            const cookieString = Array.isArray(setCookie)
                ? setCookie[0]
                : setCookie;

            const match = cookieString.match(
                /auth_token=([^;]+)/
            );

            if (match?.[1]) {
                await AsyncStorage.setItem(
                    "auth_token",
                    match[1]
                );

                console.log("Auth cookie saved");
            }
        }

        return response.data;
    },

    async (error) => {
        if (!error.response) {
            Alert.alert(
                "Network error",
                "Unable to connect to the server. Please check your internet connection."
            );

            return Promise.reject(error);
        }

        const { status, data, config } = error.response;

        const url = config?.url || "";

        console.log("API Error:", {
            status,
            url,
            data,
        });

        // Backend response:
        // {
        //   success: false,
        //   message: "This login is only available for user accounts"
        // }

        const message =
            data?.message ?? "Something went wrong. Please try again.";

        // 401 - Unauthorized
        if (status === 401) {
            const isAuthRequest =
                url === "/auth/mobile/login" ||
                url === "/auth/login" ||
                url === "/auth/me";

            // Not being signed in on app start is expected, so /auth/me stays silent.
            if (url === "/auth/me") {
                // nothing to show
            } else if (!isAuthRequest) {
                await AsyncStorage.removeItem("auth_token");

                Alert.alert(
                    "Session expired",
                    message || "Please login again."
                );
            } else {
                Alert.alert(
                    "Authentication failed",
                    message
                );
            }
        }

        // 403 - Forbidden
        else if (status === 403) {
            Alert.alert(
                "Access denied",
                message
            );
        }

        // 404 - Not found
        else if (status === 404) {
            Alert.alert(
                "Not found",
                message
            );
        }

        // 422 - Validation
        else if (status === 422) {
            Alert.alert(
                "Validation error",
                message
            );
        }

        // 429 - Rate limit
        else if (status === 429) {
            Alert.alert(
                "Too many requests",
                message || "Please wait and try again later."
            );
        }

        // 500+
        else if (status >= 500) {
            Alert.alert(
                "Server error",
                "Something went wrong on the server. Please try again later."
            );
        }

        // Other errors
        else {
            Alert.alert(
                "Request failed",
                message
            );
        }

        return Promise.reject(error);
    }
);

export default api;