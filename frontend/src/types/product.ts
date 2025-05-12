export interface Product {
  id: string;
  emoji?: string | null;
  name: string;
  price: number;
  original_price?: number;
  unit: string;
  description?: string;
  category?: string;
  promotion_details?: string | null;
  promotion_from?: string | null;
  promotion_to?: string | null;
  retailer?: string;
  retailer_id: number;
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
  query_echo?: string;
}
