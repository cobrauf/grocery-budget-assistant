import { useState, useCallback, useEffect } from "react";

export type AppView = "defaultBrowse" | "searchResults" | "retailerProducts";

export interface ViewState {
  type: AppView;
  searchQuery?: string;
  retailerId?: number;
}

const INITIAL_VIEW_STATE: ViewState = { type: "defaultBrowse" };

export const useAppView = () => {
  const [currentViewState, setCurrentViewState] =
    useState<ViewState>(INITIAL_VIEW_STATE);

  // Log view changes
  useEffect(() => {
    console.log("[useAppView] View changed to:", currentViewState);
  }, [currentViewState]);

  const navigateToView = useCallback((viewState: ViewState) => {
    setCurrentViewState(viewState);
  }, []);

  const goHome = useCallback(() => {
    setCurrentViewState(INITIAL_VIEW_STATE);
  }, []);

  return { currentViewState, navigateToView, goHome };
};
