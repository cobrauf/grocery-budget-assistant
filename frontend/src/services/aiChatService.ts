import { api } from "./api";
import { Product } from "../types/product";
import axios from "axios";

interface SimilarityQueryResponse {
  query: string;
  results_count: number;
  products: Product[];
}

export async function processUserQueryWithSemanticSearch(
  userMessage: string,
  signal: AbortSignal
): Promise<{ summary: string; products: Product[] } | null> {
  try {
    const response = await api.post<SimilarityQueryResponse>(
      "/data/test_similarity_query",
      {
        query: userMessage,
        limit: 20,
        similarity_threshold: 0.5,
      },
      { signal }
    );

    const products = response.data.products;

    // Check for the special chat response signal
    if (products && products.length === 1 && String(products[0].id) === "-1") {
      return {
        summary: products[0].name, // The chat message is in the 'name' field
        products: [],
      };
    }

    if (!products || products.length === 0) {
      return {
        summary: "I couldn't find any related items.",
        products: [],
      };
    }

    const topProductsWithDetails = products.slice(0, 5).map((p) => {
      const price = p.price;
      const unit = p.unit ? `/${p.unit.toLowerCase()}` : "";
      const retailer = p.retailer_name ? `, @${p.retailer_name}` : "";
      const truncatedName =
        p.name.length > 25 ? p.name.substring(0, 25) + "..." : p.name;
      return `${truncatedName}\n>> $${price}${unit}${retailer}`;
    });

    const summary = `You might be interested in:\n\n${topProductsWithDetails.join(
      "\n"
    )}\n(and more...)\n`;

    return { summary, products };
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log("Request canceled by user.");
      return null;
    }
    console.error("Error during semantic search:", error);
    return {
      summary: "Sorry, I had trouble searching for products right now.",
      products: [],
    };
  }
}
