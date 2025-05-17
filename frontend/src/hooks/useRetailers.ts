import { useState, useEffect, useCallback } from "react";
import { Retailer } from "../types/retailer";
import { fetchRetailers } from "../services/api";

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
  const [rawRetailers, setRawRetailers] = useState<Retailer[]>([]);
  const [verifiedRetailers, setVerifiedRetailers] = useState<Retailer[]>([]);
  const [isLoadingApiRetailers, setIsLoadingApiRetailers] =
    useState<boolean>(false);
  const [isLoadingLogoVerification, setIsLoadingLogoVerification] =
    useState<boolean>(false);
  const [retailerApiError, setRetailerApiError] = useState<string | null>(null);

  const getLogoPath = useCallback((retailerName: string): string => {
    const imageName =
      retailerName.toLowerCase().replace(/\s+/g, "").replace(/&/g, "and") +
      ".png";
    console.log(`---public/assets/logos/${imageName}`);
    return `public/assets/logos/${imageName}`; // Assuming public folder is root for assets
  }, []);

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
        setRawRetailers([]);
      } finally {
        setIsLoadingApiRetailers(false);
      }
    };

    if (!isSearchActive && rawRetailers.length === 0) {
      loadInitialRetailers();
    }
  }, [isSearchActive, rawRetailers.length]);

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
            // console.warn(`Logo not found for ${retailer.name} at ${logoPath}`);
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
        setVerifiedRetailers([]); // Fallback to empty or predefined if error
      } finally {
        setIsLoadingLogoVerification(false);
      }
    };

    verifyLogosAndSetRetailers();
  }, [rawRetailers, getLogoPath]);

  return {
    rawRetailers,
    verifiedRetailers,
    isLoadingApiRetailers,
    isLoadingLogoVerification,
    retailerApiError,
    getLogoPath,
  };
};
