import Constants from "expo-constants";

const ENV = Constants.expoConfig?.extra?.env || "development";

// Local backend
const LOCAL_BACKEND_IP = "192.168.1.67";
const LOCAL_BACKEND_PORT = "3030";

const LOCAL_BACKEND_URL = `http://${LOCAL_BACKEND_IP}:${LOCAL_BACKEND_PORT}`;

console.log("🔧 Environment:", ENV);
console.log("🔧 Backend URL:", LOCAL_BACKEND_URL);

export const API_URL = LOCAL_BACKEND_URL;
export const GRAPHQL_URL = `${LOCAL_BACKEND_URL}/graphql`;

export const IS_DEVELOPMENT = ENV === "development";
export const IS_PRODUCTION = ENV === "production";
export const IS_STAGING = ENV === "staging";