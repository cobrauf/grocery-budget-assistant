import axios from "axios";

// Get the API URL from environment variables
// In development, it will default to localhost:8000 if not set
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Create an axios instance with the base URL
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
