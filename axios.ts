import axios from "axios";
import { API_URL } from "@/constants";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
    baseURL: `${API_URL}/api/v1`,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// REQUEST INTERCEPTOR
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem("auth_token");

        if (token) {
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
        if (error.response) {
            const status = error.response.status;
            const url = error.response.config?.url;

            if (status === 401) {
                if (
                    url !== "/auth/me" &&
                    url !== "/auth/login/mobile"
                ) {
                    await AsyncStorage.removeItem("auth_token");

                    Alert.alert(
                        "Session expired",
                        "Please login again."
                    );
                }
            }

            if (status === 403) {
                Alert.alert(
                    error.response.data?.message ||
                    "Access denied"
                );
            }

            if (status === 404) {
                Alert.alert("Resource not found");
            }

            if (status >= 500) {
                Alert.alert(
                    "Server error",
                    "Please try again later."
                );
            }
        }

        return Promise.reject(error);
    }
);

export default api;