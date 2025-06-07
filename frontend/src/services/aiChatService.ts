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

    if (!products || products.length === 0) {
      return {
        summary: "I couldn't find any related items.",
        products: [],
      };
    }

    const productNames = products.slice(0, 5).map((p) => p.name);
    const summary = `I've found the following items for you: ${productNames.join(
      ", "
    )} (and more...)`;

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
