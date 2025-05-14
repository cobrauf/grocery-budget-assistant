import { useState, useCallback } from "react";

export type AppView = "retailerLogos" | "searchResults" | "retailerProducts"; // Add other views as needed

export interface ViewState {
  type: AppView;
  searchQuery?: string;
  retailerId?: number;
}

const INITIAL_VIEW_STATE: ViewState = { type: "retailerLogos" };

export const useAppView = () => {
  const [currentViewState, setCurrentViewState] =
    useState<ViewState>(INITIAL_VIEW_STATE);

  const navigateToView = useCallback((viewState: ViewState) => {
    setCurrentViewState(viewState);
  }, []);

  const goHome = useCallback(() => {
    setCurrentViewState(INITIAL_VIEW_STATE);
  }, []);

  return { currentViewState, navigateToView, goHome };
};
