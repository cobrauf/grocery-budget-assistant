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

// Import Product and Retailer types
import { Product } from "../types/product";
import { Retailer } from "../types/retailer";

// API functions
export const fetchRetailers = async (): Promise<Retailer[]> => {
  const response = await api.get<Retailer[]>("/retailers");
  return response.data;
};

export const fetchProductsByRetailer = async (
  retailerId: number,
  adPeriod: string = "current"
): Promise<Product[]> => {
  const response = await api.get<Product[]>(
    `/products/retailer/${retailerId}?ad_period=${adPeriod}`
  );
  return response.data;
};

// export const searchProducts = async (query: string): Promise<Product[]> => {
//   const response = await api.get<Product[]>(
//     `/products/search?q=${encodeURIComponent(query)}`
//   );
//   return response.data;
// };

export const fetchProductsByFilter = async (
  storeIds: string[],
  categories: string[]
): Promise<Product[]> => {
  const params = new URLSearchParams();
  if (storeIds.length > 0) {
    params.append("store_ids", storeIds.join(","));
  }
  if (categories.length > 0) {
    params.append("categories", categories.join(","));
  }

  const response = await api.get<Product[]>(
    `/products/filter?${params.toString()}`
  );
  return response.data;
};
