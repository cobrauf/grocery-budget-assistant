import axios from "axios";

// Get the API URL from environment variables
// In development, default to a URL that works across network devices
const DEFAULT_API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8000" // When testing on the PC
    : `http://${window.location.hostname}:8000`; // When testing from mobile (uses same hostname)

const API_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;

// Create an axios instance with the base URL
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
