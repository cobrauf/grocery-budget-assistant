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
  timeout: 10000,
});

// Import Product and Retailer types
import { Product } from "../types/product";
import { Retailer } from "../types/retailer";

// API functions
export const fetchRetailers = async (): Promise<Retailer[]> => {
  console.log("retailers url: ", API_URL + "/retailers/");
  const response = await api.get<Retailer[]>("/retailers/");
  return response.data;
};

export const searchProducts = async (
  query: string,
  adPeriod: string = "current"
): Promise<Product[]> => {
  const params = new URLSearchParams();
  params.append("q", query);
  params.append("ad_period", adPeriod);

  const response = await api.get<Product[]>(
    `/products/search/?${params.toString()}`
  );
  return response.data;
};

export const fetchProductsByFilter = async (
  storeIds: string[],
  categories: string[],
  adPeriod: string = "current",
  isFrontPageOnly: boolean = false
): Promise<Product[]> => {
  const params = new URLSearchParams();
  if (storeIds.length > 0) {
    params.append("store_ids", storeIds.join(","));
  }

  if (isFrontPageOnly) {
    params.append("is_frontpage_only", "true");
    // Categories are intentionally not appended if isFrontPageOnly is true
  } else {
    if (categories.length > 0) {
      params.append("categories", categories.join(","));
    }
  }
  params.append("ad_period", adPeriod);

  const response = await api.get<Product[]>(
    `/products/filter/?${params.toString()}`
  );
  return response.data;
};
