import { useEffect, useRef, RefObject } from "react";
import { AppTab } from "./useAppTab";

interface SwipeNavigationProps {
  targetRef: RefObject<HTMLElement>;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

const TABS_ORDER: AppTab[] = ["browse", "search", "favorites", "ai"];
const MIN_SWIPE_DISTANCE = 100;

export const useSwipeNavigation = ({
  targetRef,
  onSwipeLeft,
  onSwipeRight,
  activeTab,
  setActiveTab,
}: SwipeNavigationProps) => {
  const touchStartX = useRef<number>(0);
  const touchCurrentX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchCurrentY = useRef<number>(0);
  const isSwiping = useRef<boolean>(false);

  useEffect(() => {
    const targetElement = targetRef.current;
    if (!targetElement) return;

    const handleTouchStart = (event: TouchEvent) => {
      touchStartX.current = event.touches[0].clientX;
      touchStartY.current = event.touches[0].clientY;
      isSwiping.current = true;
      console.log(
        "[SwipeDebug] Touch Start:",
        touchStartX.current,
        touchStartY.current
      );
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (isSwiping.current) {
        touchCurrentX.current = event.touches[0].clientX;
        touchCurrentY.current = event.touches[0].clientY;
        console.log(
          "[SwipeDebug] Touch Move:",
          touchCurrentX.current,
          touchCurrentY.current
        );
      }
    };

    const handleTouchEnd = () => {
      if (isSwiping.current) {
        const deltaX = touchCurrentX.current - touchStartX.current;
        const deltaY = touchCurrentY.current - touchStartY.current;
        console.log(
          "[SwipeDebug] Touch End. DeltaX:",
          deltaX,
          "DeltaY:",
          deltaY
        );

        if (Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
          if (Math.abs(deltaX) > MIN_SWIPE_DISTANCE) {
            if (deltaX < 0) {
              const currentIndex = TABS_ORDER.indexOf(activeTab);
              const nextTabIndex = (currentIndex + 1) % TABS_ORDER.length;
              setActiveTab(TABS_ORDER[nextTabIndex]);
            } else {
              const currentIndex = TABS_ORDER.indexOf(activeTab);
              const prevTabIndex =
                (currentIndex - 1 + TABS_ORDER.length) % TABS_ORDER.length;
              setActiveTab(TABS_ORDER[prevTabIndex]);
            }
          }
        }

        isSwiping.current = false;
        touchStartX.current = 0;
        touchCurrentX.current = 0;
        touchStartY.current = 0;
        touchCurrentY.current = 0;
      }
    };

    targetElement.addEventListener("touchstart", handleTouchStart);
    targetElement.addEventListener("touchmove", handleTouchMove);
    targetElement.addEventListener("touchend", handleTouchEnd);

    return () => {
      targetElement.removeEventListener("touchstart", handleTouchStart);
      targetElement.removeEventListener("touchmove", handleTouchMove);
      targetElement.removeEventListener("touchend", handleTouchEnd);
    };
  }, [targetRef, onSwipeLeft, onSwipeRight, activeTab, setActiveTab]);
};
