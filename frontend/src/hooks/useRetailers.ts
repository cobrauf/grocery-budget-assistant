import { useState, useEffect, useCallback } from "react";
import { Product } from "../types/product";
import { Retailer } from "../types/retailer";
import { fetchRetailers, fetchProductsByRetailer } from "../services/api";

// Define the known retailers list here - this can be used for reference or typing if needed
// but the actual data with correct IDs will come from the API.
const PREDEFINED_RETAILER_NAMES: Omit<Retailer, "id" | "logo_url">[] = [
  { name: "Tokyo Central" },
  { name: "Albertsons" },
  { name: "Food4Less" },
  { name: "Vons" },
  { name: "Ralphs" },
  { name: "Trader Joe's" },
  { name: "Aldi" },
  { name: "Sprouts" },
  { name: "Jons" },
  { name: "Costco" },
  { name: "Sam's Club" },
  { name: "99 Ranch" },
  { name: "Mitsuwa" },
  { name: "Superior" },
  { name: "H-mart" },
  { name: "Hannam Chain" },
  { name: "Northgate" },
  { name: "Vallarta" },
];

export const useRetailers = (isSearchActive: boolean) => {
  const [rawRetailers, setRawRetailers] = useState<Retailer[]>([]); // Initialize with empty array
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
    console.log(`---public/assets/logos/${imageName}.png`);
    return `public/assets/logos/${imageName}`;
  }, []);

  // Effect to fetch initial retailers list
  useEffect(() => {
    const loadInitialRetailers = async () => {
      setIsLoadingApiRetailers(true);
      setRetailerApiError(null);
      try {
        const fetchedRetailers = await fetchRetailers();
        setRawRetailers(fetchedRetailers);
      } catch (error) {
        console.error("Error fetching retailers from API:", error);
        setRetailerApiError("Failed to load retailers list.");
        setRawRetailers([]); // Set to empty array on error
      } finally {
        setIsLoadingApiRetailers(false);
      }
    };

    // Load retailers if search is not active and no retailer products are selected, or if rawRetailers is empty.
    if (
      (!isSearchActive && selectedRetailerProducts.length === 0) ||
      rawRetailers.length === 0
    ) {
      loadInitialRetailers();
    }
  }, [isSearchActive, selectedRetailerProducts.length, rawRetailers.length]); // Added rawRetailers.length to dependencies

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
