import { api } from "./api";
import { Product } from "../types/product";
import { ChatMessage } from "../types/chatMessage";
import {
  loadFromLocalStorage,
  LS_AI_CHAT_HISTORY,
} from "../utils/localStorageUtils";
import axios from "axios";

interface AIServiceResponse {
  query_type: string;
  llm_message: string | null;
  query: string;
  results_count: number;
  products: Product[];
}

function formatChatHistory(
  messages: ChatMessage[],
  maxMessages: number = 8
): string {
  if (!messages || messages.length === 0) {
    return "";
  }

  // Get the last N messages, excluding the current user message being sent
  const recentMessages = messages.slice(-maxMessages);

  return recentMessages
    .map((msg) => {
      let messageContent = msg.text;

      // For AI messages with products, extract only the conversational part
      // by removing the product summary that starts with the product listing
      if (
        msg.sender === "ai" &&
        msg.associatedProductList &&
        msg.associatedProductList.length > 0
      ) {
        // Look for product summary markers and extract only the conversational part
        const productMarkers = [
          "\n\n", // Simple marker for where product summary starts
          "(and more...)", // Our specific marker
        ];

        for (const marker of productMarkers) {
          const markerIndex = messageContent.indexOf(marker);
          if (markerIndex > 0) {
            messageContent = messageContent.substring(0, markerIndex).trim();
            break;
          }
        }

        // Fallback: if message is still very long, truncate it
        if (messageContent.length > 150) {
          messageContent = messageContent.substring(0, 150) + "...";
        }
      }

      return `${msg.sender.toUpperCase()}: ${messageContent}`;
    })
    .join("\n");
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
    // Retrieve and format recent chat history
    const chatMessages = loadFromLocalStorage<ChatMessage[]>(
      LS_AI_CHAT_HISTORY,
      []
    );
    const chatHistoryString = formatChatHistory(chatMessages, 20);
    console.log("----------chatHistoryString", chatHistoryString);

    const response = await api.post<AIServiceResponse>(
      "/data/test_similarity_query",
      {
        query: userMessage,
        chat_history: chatHistoryString || undefined,
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
        const topProductsWithDetails = products.slice(0, 3).map((p) => {
          const price = p.price;
          const unit = p.unit ? `/${p.unit.toLowerCase()}` : "";
          const retailer = p.retailer_name ? `, @${p.retailer_name}` : "";
          const truncatedName =
            p.name.length > 25 ? p.name.substring(0, 25) + "..." : p.name;
          return `${truncatedName}\n ⇨ $${price}${unit}${retailer}`;
        });

        const productSummary = `\n\n${topProductsWithDetails.join(
          "\n"
          // const productSummary = `\n\nYou might be interested in:\n\n${topProductsWithDetails.join(
          //   "\n"
        )}\n(and more...)\n\n`;

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
