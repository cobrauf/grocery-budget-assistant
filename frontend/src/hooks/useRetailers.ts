import { useState, useEffect, useCallback } from "react";
import { Product } from "../types/product";
import { Retailer } from "../types/retailer";
import { fetchRetailers, fetchProductsByRetailer } from "../services/api";

// Define the known retailers list here
const PREDEFINED_RETAILERS: Retailer[] = [
  { id: 1, name: "Tokyo Central", logo_url: null },
  { id: 2, name: "Albertsons", logo_url: null },
  { id: 3, name: "Food4Less", logo_url: null },
  { id: 4, name: "Vons", logo_url: null },
  { id: 5, name: "Ralphs", logo_url: null },
  { id: 6, name: "Trader Joe's", logo_url: null },
  { id: 7, name: "Aldi", logo_url: null },
  { id: 8, name: "Sprouts", logo_url: null },
  { id: 9, name: "Jons", logo_url: null },
  { id: 10, name: "Costco", logo_url: null },
  { id: 11, name: "Sam's Club", logo_url: null },
  { id: 12, name: "99 Ranch", logo_url: null },
  { id: 13, name: "Mitsuwa", logo_url: null },
  { id: 14, name: "Superior", logo_url: null },
  { id: 15, name: "H-mart", logo_url: null },
  { id: 16, name: "Hannam Chain", logo_url: null },
  { id: 17, name: "Northgate", logo_url: null },
  { id: 18, name: "Vallarta", logo_url: null },
];

export const useRetailers = (isSearchActive: boolean) => {
  const [rawRetailers, setRawRetailers] =
    useState<Retailer[]>(PREDEFINED_RETAILERS);
  const [verifiedRetailers, setVerifiedRetailers] = useState<Retailer[]>([]);
  const [selectedRetailerProducts, setSelectedRetailerProducts] = useState<
    Product[]
  >([]);
  const [isLoadingApiRetailers, setIsLoadingApiRetailers] =
    useState<boolean>(false);
  const [isLoadingLogoVerification, setIsLoadingLogoVerification] =
    useState<boolean>(false);
  const [isLoadingRetailerProducts, setIsLoadingRetailerProducts] =
    useState<boolean>(false);
  const [retailerApiError, setRetailerApiError] = useState<string | null>(null);

  const getLogoPath = useCallback((retailerName: string): string => {
    const imageName =
      retailerName.toLowerCase().replace(/\s+/g, "").replace(/&/g, "and") +
      ".png";
    // Ensure the path starts from the public directory correctly
    // Assuming the build process places assets at the root level accessible via '/'
    return `public/assets/logos/${imageName}`;
  }, []);

  // Effect to fetch initial retailers list
  useEffect(() => {
    // Set raw retailers from the predefined list on initial component mount
    // The API call is bypassed for initial load but kept for potential future use.
    setRawRetailers(PREDEFINED_RETAILERS);
    setIsLoadingApiRetailers(false); // No API call, so set loading to false.
    setRetailerApiError(null); // No API call, so clear any potential errors.

    // The original API fetching logic is commented out below but preserved
    // in case it's needed in the future, e.g., for a manual refresh.
    /*
    const loadInitialRetailers = async () => {
      setIsLoadingApiRetailers(true);
      setRetailerApiError(null);
      try {
        const fetchedRetailers = await fetchRetailers();
        setRawRetailers(fetchedRetailers);
      } catch (error) {
        console.error("Error fetching retailers from API:", error);
        setRetailerApiError("Failed to load retailers list.");
        setRawRetailers([]);
      } finally {
        setIsLoadingApiRetailers(false);
      }
    };

    // Load retailers only if search is not active and no retailer products are selected
    if (!isSearchActive && selectedRetailerProducts.length === 0) {
      // loadInitialRetailers(); // Original call commented out
    }
    */
  }, [isSearchActive, selectedRetailerProducts.length]);

  // Effect to verify logos once raw retailers are fetched
  useEffect(() => {
    if (rawRetailers.length === 0) {
      setVerifiedRetailers([]);
      setIsLoadingLogoVerification(false);
      return;
    }

    setIsLoadingLogoVerification(true);
    const verifyLogosAndSetRetailers = async () => {
      const promises = rawRetailers.map((retailer) => {
        return new Promise<Retailer | null>((resolve) => {
          const img = new Image();
          const logoPath = getLogoPath(retailer.name);
          img.onload = () => resolve(retailer);
          img.onerror = () => {
            // console.warn(
            //   `Logo verification failed for: ${retailer.name}, path: ${logoPath}`
            // );
            resolve(null);
          };
          img.src = logoPath;
        });
      });

      try {
        const results = await Promise.all(promises);
        setVerifiedRetailers(results.filter((r): r is Retailer => r !== null));
      } catch (error) {
        console.error("Error during bulk logo verification:", error);
        setVerifiedRetailers([]);
      } finally {
        setIsLoadingLogoVerification(false);
      }
    };

    verifyLogosAndSetRetailers();
  }, [rawRetailers, getLogoPath]); // Depends only on rawRetailers changing and getLogoPath

  // Function to handle fetching products for a selected retailer
  const handleRetailerClick = useCallback(async (retailerId: number) => {
    setIsLoadingRetailerProducts(true);
    setRetailerApiError(null);
    setSelectedRetailerProducts([]); // Clear previous products
    try {
      // Assuming 'current' is a valid parameter for fetching products. Adjust if needed.
      const products = await fetchProductsByRetailer(retailerId, "current");
      setSelectedRetailerProducts(products);
    } catch (error) {
      console.error("Error fetching products for retailer:", error);
      setRetailerApiError("Failed to load products for this retailer.");
      setSelectedRetailerProducts([]);
    } finally {
      setIsLoadingRetailerProducts(false);
    }
  }, []);

  // Function to clear selected retailer products, e.g., when going back or starting a search
  const clearSelectedRetailer = useCallback(() => {
    setSelectedRetailerProducts([]);
    setRetailerApiError(null); // Also clear any related errors
  }, []);

  return {
    rawRetailers,
    verifiedRetailers,
    selectedRetailerProducts,
    isLoadingApiRetailers,
    isLoadingLogoVerification,
    isLoadingRetailerProducts,
    retailerApiError,
    handleRetailerClick,
    getLogoPath, // Expose getLogoPath if needed directly in the component
    clearSelectedRetailer, // Expose function to clear selection
  };
};
