import { useState } from "react";
import { api } from "../services/api";
import { Product } from "../types/product";

export const useSearch = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [isLoadingSearch, setIsLoadingSearch] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMoreResults, setHasMoreResults] = useState<boolean>(false); // Keep track if more results are available

  const performSearch = async (query: string, page: number = 1) => {
    if (!query.trim()) return;

    setIsLoadingSearch(true);
    setSearchError(null);

    // Reset results only if it's a new search (page 1)
    if (page === 1) {
      setSearchResults([]);
      setTotalResults(0);
      setSearchQuery(query); // Update query state only on new search
    }
    setCurrentPage(page);

    try {
      // TODO: Update backend API call to support pagination (page, limit)
      // For now, it fetches all results matching the query
      const response = await api.get<Product[]>(
        `/products/search?q=${encodeURIComponent(query)}`
        // Potential future pagination: `&page=${page}&limit=20`
      );
      const products = response.data;

      // TODO: When backend supports pagination, update logic:
      // const total = response.headers['x-total-count']; // Example header
      // setTotalResults(Number(total));
      // setHasMoreResults(page * 20 < Number(total)); // Example check

      setSearchResults((prevResults) =>
        page === 1 ? products : [...prevResults, ...products]
      );

      // Mock total results and pagination for now
      setTotalResults(products.length); // Since we fetch all, length is total
      setHasMoreResults(false); // Assume no more pages as we fetch all
    } catch (error: any) {
      console.error("Error fetching search results:", error);
      setSearchError(error.message || "Failed to fetch search results.");
      setSearchResults([]); // Clear results on error
      setTotalResults(0);
      setHasMoreResults(false);
    } finally {
      setIsLoadingSearch(false);
    }
  };

  // Function to load more results (for infinite scroll or button)
  const loadMoreResults = () => {
    if (!isLoadingSearch && hasMoreResults) {
      performSearch(searchQuery, currentPage + 1);
    }
  };

  return {
    searchQuery,
    setSearchQuery, // Expose setSearchQuery if direct setting is needed, e.g., clearing search
    searchResults,
    totalResults,
    isLoadingSearch,
    searchError,
    hasMoreResults,
    performSearch,
    loadMoreResults,
    currentPage, // Expose current page if needed
  };
};
