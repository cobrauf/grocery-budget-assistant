export interface Product {
  id: string;
  emoji?: string | null;
  name: string; // The main description, e.g., "Great Value Cage Free Large White Eggs"
  price: number;
  original_price?: number;
  unit: string; // e.g., "12 count", "Each", "per lb"
  description?: string;
  category?: string;
  promotion_details?: string | null; // e.g., "SNAP eligible", "2 for $5"
  promotion_from?: string | null;
  promotion_to?: string | null;
  retailer?: string; // e.g., "Walmart", "Aldi"
  retailer_id?: string;
  retailer_name?: string;
  weekly_ad_id?: string;
  weekly_ad_valid_from?: string;
  weekly_ad_valid_to?: string;
  weekly_ad_ad_period?: string;
}

export interface SearchResponse {
  total_results: number;
  items: Product[];
  page: number;
  limit: number;
  has_more: boolean;
  query_echo?: string; // The search term echoed back
}
