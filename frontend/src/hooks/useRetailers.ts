import { useState, useEffect, useCallback } from "react";
import { Retailer } from "../types/retailer";
import { fetchRetailers } from "../services/api";
import {
  loadFromLocalStorage,
  saveToLocalStorage,
  LS_RETAILERS_CACHE,
} from "../utils/localStorageUtils";

export const useRetailers = (isSearchActive: boolean) => {
  const [rawRetailers, setRawRetailers] = useState<Retailer[]>(() => {
    return loadFromLocalStorage<Retailer[]>(LS_RETAILERS_CACHE, []);
  });
  const [verifiedRetailers, setVerifiedRetailers] = useState<
    (Retailer & { logoPath: string })[]
  >([]);
  const [isLoadingApiRetailers, setIsLoadingApiRetailers] =
    useState<boolean>(false);
  const [isLoadingLogoVerification, setIsLoadingLogoVerification] =
    useState<boolean>(false);
  const [retailerApiError, setRetailerApiError] = useState<string | null>(null);

  const getLogoPath = useCallback((retailerName: string): string => {
    const imageName =
      retailerName.replace(/\s+/g, "").replace(/&/g, "and") + ".png";
    // console.log(`---/assets/logos/${imageName}`);
    return `/assets/logos/${imageName}`; // Assuming public folder is root for assets
  }, []);

  useEffect(() => {
    const fetchAndCompareRetailers = async () => {
      if (rawRetailers.length === 0) {
        setIsLoadingApiRetailers(true);
      }
      setRetailerApiError(null); // Clear previous errors

      try {
        const fetchedRetailers = await fetchRetailers();

        // --- Comparison Logic ---
        const currentRawRetailersSnapshot = rawRetailers;

        let areDifferent = false;
        if (fetchedRetailers.length !== currentRawRetailersSnapshot.length) {
          areDifferent = true;
        } else {
          // If lengths are the same, check if content is different.
          // Sort by ID for consistent comparison
          const sortedFetched = [...fetchedRetailers].sort(
            (a, b) => a.id - b.id
          );
          const sortedCurrent = [...currentRawRetailersSnapshot].sort(
            (a, b) => a.id - b.id
          );

          for (let i = 0; i < sortedFetched.length; i++) {
            if (
              sortedFetched[i].id !== sortedCurrent[i].id ||
              sortedFetched[i].name !== sortedCurrent[i].name
            ) {
              areDifferent = true;
              break;
            }
          }
        }

        if (areDifferent) {
          console.log("Fetched retailers are different from cache. Updating.");
          setRawRetailers(fetchedRetailers); // This will trigger the logo verification useEffect
          saveToLocalStorage(LS_RETAILERS_CACHE, fetchedRetailers);
        } else {
          console.log(
            "Fetched retailers are the same as cache. No update to rawRetailers needed."
          );
        }
      } catch (error) {
        console.error("Error fetching retailers from API:", error);
        if (rawRetailers.length === 0) {
          // Only set error if cache was also empty
          setRetailerApiError("Failed to load retailers list.");
        } else {
          console.warn("API fetch failed, but using cached retailers.");
        }
      } finally {
        setIsLoadingApiRetailers(false);
      }
    };

    if (!isSearchActive) {
      fetchAndCompareRetailers();
    } else {
      if (rawRetailers.length === 0) {
        setIsLoadingApiRetailers(false);
      }
    }
  }, [isSearchActive]);

  useEffect(() => {
    if (rawRetailers.length === 0) {
      setVerifiedRetailers([]);
      setIsLoadingLogoVerification(false);
      return;
    }

    setIsLoadingLogoVerification(true);
    const verifyLogosAndSetRetailers = async () => {
      const promises = rawRetailers.map((retailer) => {
        return new Promise<(Retailer & { logoPath: string }) | null>(
          (resolve) => {
            const img = new Image();
            const logoPath = getLogoPath(retailer.name);
            img.onload = () => resolve({ ...retailer, logoPath });
            img.onerror = () => {
              // console.warn(`Logo not found for ${retailer.name} at ${logoPath}`);
              resolve(null);
            };
            img.src = logoPath;
          }
        );
      });

      try {
        const results = await Promise.all(promises);
        setVerifiedRetailers(
          results.filter(
            (r): r is Retailer & { logoPath: string } => r !== null
          )
        );
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
