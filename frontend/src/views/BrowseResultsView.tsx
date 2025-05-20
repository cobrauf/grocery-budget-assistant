import React from "react";
import { Product } from "../types/product";
import ResultsView from "../components/common/ResultsView";

interface BrowseResultsViewProps {
  items: Product[];
  totalResults?: number;
  isLoading: boolean;
  error: string | null;
  hasMore?: boolean;
  loadMore?: () => void;
  onScrollUpdate?: (scrollY: number) => void;
}

const BrowseResultsView: React.FC<BrowseResultsViewProps> = ({
  items,
  totalResults,
  isLoading,
  error,
  hasMore = false,
  loadMore = () => {},
  onScrollUpdate,
}) => {
  return (
    <ResultsView
      items={items}
      isLoading={isLoading}
      error={error}
      hasMore={hasMore}
      loadMore={loadMore}
      scrollableId="browseScrollableDiv"
      totalResults={totalResults}
      renderInitialLoaderFullPage={true} // Browse view has specific full page initial loader
      viewType="browse"
      onScrollUpdate={onScrollUpdate}
    />
  );
};

export default BrowseResultsView;
