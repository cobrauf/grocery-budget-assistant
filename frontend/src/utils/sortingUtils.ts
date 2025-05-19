import { Product } from "../types/product";
import { SortField, SortDirection } from "../types/sort";

// Sorts a product array using a specified field and direction.
// Employs JavaScript's built-in Array.prototype.sort() method for sorting.
// Creates a copy of the original array to prevent modification.
// Provides a custom comparison function for any two products a and b.
// Comparison logic handles sorting by price, store, or category data.
// Adjusts the comparison result to achieve ascending or descending order.
// The sort method internally manages looping and item reordering.

export const sortProducts = (
  products: Product[],
  field: SortField,
  direction: SortDirection
): Product[] => {
  if (!products) return [];

  // Create a new array to avoid mutating the original, since we are reording this array in place
  const sortedProducts = [...products];

  sortedProducts.sort((a, b) => {
    //using built in Array.sort() method
    let comparison = 0; //initialize comparison to 0, meaning don't sort if same

    // Access price directly
    const aPrice = a.price ?? 0;
    const bPrice = b.price ?? 0;

    // Handle potentially null or undefined retailer_name and category
    const aRetailerName = a.retailer_name?.toLowerCase() || "";
    const bRetailerName = b.retailer_name?.toLowerCase() || "";
    const aCategory = a.category?.toLowerCase() || "";
    const bCategory = b.category?.toLowerCase() || "";

    switch (field) {
      case "price":
        comparison = aPrice - bPrice;
        break;
      case "store":
        if (aRetailerName < bRetailerName) comparison = -1;
        if (aRetailerName > bRetailerName) comparison = 1;
        break;
      case "category":
        if (aCategory < bCategory) comparison = -1;
        if (aCategory > bCategory) comparison = 1;
        break;
      default:
        return 0;
    }

    return direction === "asc" ? comparison : comparison * -1;
  });

  return sortedProducts;
};
