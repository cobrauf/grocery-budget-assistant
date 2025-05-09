export interface Product {
  id: string;
  emoji?: string | null;
  name: string; // The main description, e.g., "Great Value Cage Free Large White Eggs"
  price: number;
  unit: string; // e.g., "12 count", "Each", "per lb"
  promotion_details?: string | null; // e.g., "SNAP eligible", "2 for $5"
  retailer?: string; // e.g., "Walmart", "Aldi"
  // Potentially add more fields like image_url, brand, category etc. later
}

export interface SearchResponse {
  total_results: number;
  items: Product[];
  page: number;
  limit: number;
  has_more: boolean;
  query_echo?: string; // The search term echoed back
}
