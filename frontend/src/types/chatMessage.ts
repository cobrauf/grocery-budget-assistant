import { Product } from "./product";

export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: number;
  searchQueryPerformed?: string;
  associatedProductList?: Product[];
  isProductFocused?: boolean;
}
