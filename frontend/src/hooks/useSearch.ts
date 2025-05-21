import { useState, useCallback } from "react";
import { api } from "../services/api";
import { Product } from "../types/product";
import {
  saveToLocalStorage,
  loadFromLocalStorage,
  removeFromLocalStorage,
  LS_LAST_SEARCH_QUERY,
  LS_LAST_SEARCH_RESULTS,
  LS_SEARCH_HISTORY,
} from "../utils/localStorageUtils";

export const useSearch = () => {
  const [searchQuery, setSearchQuery] = useState<string>(() => {
    return loadFromLocalStorage<string>(LS_LAST_SEARCH_QUERY, "");
  });
  const [searchResults, setSearchResults] = useState<Product[]>(() => {
    return loadFromLocalStorage<Product[]>(LS_LAST_SEARCH_RESULTS, []);
  });
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    return loadFromLocalStorage<string[]>(LS_SEARCH_HISTORY, []);
  });
  const [totalResults, setTotalResults] = useState<number>(() => {
    // Initialize based on cached results if they exist
    const cachedResults = loadFromLocalStorage<Product[]>(
      LS_LAST_SEARCH_RESULTS,
      []
    );
    return cachedResults.length;
  });
  const [isLoadingSearch, setIsLoadingSearch] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMoreResults, setHasMoreResults] = useState<boolean>(() => {
    // If results are from cache, assume it's the complete set for that query (no more pages)
    const cachedResults = loadFromLocalStorage<Product[]>(
      LS_LAST_SEARCH_RESULTS,
      []
    );
    return cachedResults.length > 0 ? false : false; // False if cached, false if no cache initially
  });

  const resetSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setTotalResults(0);
    setCurrentPage(1);
    setHasMoreResults(false);
    setSearchError(null);
    // Clear from local storage
    removeFromLocalStorage(LS_LAST_SEARCH_QUERY);
    removeFromLocalStorage(LS_LAST_SEARCH_RESULTS);
  }, []); // Empty dependency array as setters are stable

  // Function to add search query to history
  const addToSearchHistory = useCallback((query: string) => {
    // Only add non-empty queries
    if (!query.trim()) return;

    setSearchHistory((prevHistory) => {
      // Create new history with the current query at the front
      // and remove any previous instances of the same query
      const updatedHistory = [
        query,
        ...prevHistory.filter(
          (item) => item.toLowerCase() !== query.toLowerCase()
        ),
      ].slice(0, 30); // Keep only the 10 most recent searches

      // Save to local storage
      saveToLocalStorage(LS_SEARCH_HISTORY, updatedHistory);

      return updatedHistory;
    });
  }, []);

  // Function to remove a search item from history
  const removeFromSearchHistory = useCallback((query: string) => {
    setSearchHistory((prevHistory) => {
      // Filter out the query to remove
      const updatedHistory = prevHistory.filter((item) => item !== query);

      // Save to local storage
      saveToLocalStorage(LS_SEARCH_HISTORY, updatedHistory);

      return updatedHistory;
    });
  }, []);

  const performSearch = async (query: string, page: number = 1) => {
    if (!query.trim()) return;

    setIsLoadingSearch(true);
    setSearchError(null);

    // Reset results only if it's a new search (page 1)
    if (page === 1) {
      setSearchResults([]);
      setTotalResults(0);
      setSearchQuery(query); // Update query state only on new search

      // Add to search history only for new searches
      addToSearchHistory(query);
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

      // Save last search query and results to local storage
      if (page === 1) {
        // Only save if it's a new search initiating query
        saveToLocalStorage(LS_LAST_SEARCH_QUERY, query);
        saveToLocalStorage(LS_LAST_SEARCH_RESULTS, products);
      } else {
        // If loading more, append to existing cached results for the same query
        // This assumes products is the new page, and we want to save the full list
        const currentFullResults = [...searchResults, ...products];
        saveToLocalStorage(LS_LAST_SEARCH_RESULTS, currentFullResults);
        // LS_LAST_SEARCH_QUERY would already be set from page 1
      }

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
    searchResults,
    searchHistory,
    totalResults,
    isLoadingSearch,
    searchError,
    hasMoreResults,
    performSearch,
    loadMoreResults,
    currentPage, // Expose current page if needed
    resetSearch, // Expose the reset function
    removeFromSearchHistory, // Expose the remove function
  };
};
