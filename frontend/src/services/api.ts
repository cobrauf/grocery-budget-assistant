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

  // Add these debug logs:
  console.log("Current API_URL value:", API_URL);
  console.log("Axios instance baseURL:", api.defaults.baseURL);
  console.log("window.location.hostname:", window.location.hostname);
  console.log("VITE_API_URL env var:", import.meta.env.VITE_API_URL);

  console.log(
    "search products url:",
    API_URL + "/products/search?" + params.toString()
  );
  const response = await api.get<Product[]>(
    `/products/search?${params.toString()}`
  );
  return response.data;
};

export const fetchProductsByFilter = async (
  storeIds: string[],
  categories: string[],
  adPeriod: string = "current"
): Promise<Product[]> => {
  const params = new URLSearchParams();
  if (storeIds.length > 0) {
    params.append("store_ids", storeIds.join(","));
  }
  if (categories.length > 0) {
    params.append("categories", categories.join(","));
  }
  params.append("ad_period", adPeriod);
  // console.log(
  //   "fetch products by filter url: ",
  //   API_URL + "/products/filter?" + params.toString()
  // );
  // const response = await api.get<Product[]>(
  //   `/products/filter?${params.toString()}`
  // );
  console.log(
    "test url: ",
    "https://grocery-buddy-t7aeu.ondigitalocean.app/grocery-budget-assistant-backend/products/filter/?store_ids=9&ad_period=current"
  );
  const response = await api.get<Product[]>(
    "https://grocery-buddy-t7aeu.ondigitalocean.app/grocery-budget-assistant-backend/products/filter/?store_ids=9&ad_period=current"
  );
  return response.data;
};
