import { api } from "./api";
import { Product } from "../types/product";
import axios from "axios";

interface AIServiceResponse {
  query_type: string;
  llm_message: string | null;
  query: string;
  results_count: number;
  products: Product[];
}

export async function processUserQueryWithSemanticSearch(
  userMessage: string,
  signal: AbortSignal
): Promise<{
  type: "chat" | "search";
  message: string | null;
  products: Product[];
} | null> {
  try {
    const response = await api.post<AIServiceResponse>(
      "/data/test_similarity_query",
      {
        query: userMessage,
        limit: 20,
        similarity_threshold: 0.5,
      },
      { signal }
    );

    console.log("API Response:", response.data);

    if (response.data.query_type === "CHAT_RESPONSE") {
      return {
        type: "chat",
        message: response.data.llm_message,
        products: [],
      };
    }

    if (response.data.query_type === "SEARCH_RESULT") {
      const products = response.data.products;
      let fullMessage =
        response.data.llm_message || "I found some relevant products for you!";

      // Add formatted product summary if there are products
      if (products && products.length > 0) {
        const topProductsWithDetails = products.slice(0, 5).map((p) => {
          const price = p.price;
          const unit = p.unit ? `/${p.unit.toLowerCase()}` : "";
          const retailer = p.retailer_name ? `, @${p.retailer_name}` : "";
          const truncatedName =
            p.name.length > 25 ? p.name.substring(0, 25) + "..." : p.name;
          return `${truncatedName}\n ⇨ $${price}${unit}${retailer}`;
        });

        const productSummary = `\n\nYou might be interested in:\n\n${topProductsWithDetails.join(
          "\n"
        )}\n(and more...)\n`;

        fullMessage += productSummary;
      } else {
        fullMessage += "\n\nI couldn't find any related items.";
      }

      return {
        type: "search",
        message: fullMessage,
        products: response.data.products,
      };
    }

    // Fallback for any other query types - treat as search
    return {
      type: "search",
      message: response.data.llm_message || "I found some information for you!",
      products: response.data.products,
    };
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log("Request canceled by user.");
      return null;
    }
    console.error("Error during semantic search:", error);
    return {
      type: "chat",
      message: "Sorry, I had trouble searching for products right now.",
      products: [],
    };
  }
}
