# Scroll-Based Navigation Implementation Plan

## Overview

Implement a "hide on scroll down, show on scroll up" behavior for the main Header and BottomNav components in the React application. The components should hide/show based on scroll direction and position within scrollable content areas.

## Current Implementation Analysis

### Header Component

- Currently implemented as a sticky header with CSS positioning
- Uses inline styles for basic positioning
- No existing scroll-based behavior

### BottomNav Component

- Fixed positioning at bottom of viewport
- Already has CSS transitions for color changes
- No existing scroll-based behavior

## Implementation Plan

### 1. State Management Updates (App.tsx)

Add new state variables and handlers in App.tsx:

```typescript
// New state variables
const [areNavBarsVisible, setAreNavBarsVisible] = useState(true);
const [lastScrollY, setLastScrollY] = useState(0);

// New scroll handler
const handleScrollUpdate = useCallback(
  (currentScrollY: number) => {
    const scrollingDown = currentScrollY > lastScrollY;
    const scrollThreshold = window.innerHeight / 3;
    const delta = Math.abs(currentScrollY - lastScrollY);

    // Ignore tiny scroll amounts
    if (delta < 10) return;

    // Show navbars if near top
    if (currentScrollY <= 50) {
      setAreNavBarsVisible(true);
    }
    // Hide when scrolling down past threshold
    else if (scrollingDown && currentScrollY > scrollThreshold) {
      setAreNavBarsVisible(false);
    }
    // Show when scrolling up
    else if (!scrollingDown) {
      setAreNavBarsVisible(true);
    }

    setLastScrollY(currentScrollY);
  },
  [lastScrollY]
);
```

### 2. Component Props Updates

#### Header.tsx

```typescript
interface HeaderProps {
  // ... existing props
  areNavBarsVisible: boolean;
}
```

#### BottomNav.tsx

```typescript
interface BottomNavProps {
  // ... existing props
  areNavBarsVisible: boolean;
}
```

### 3. Scroll Event Implementation (ResultsView.tsx)

Add scroll event handling to ResultsView:

```typescript
interface ResultsViewProps {
  // ... existing props
  onScrollUpdate?: (scrollY: number) => void;
}

// Inside component:
useEffect(() => {
  const scrollableElement = scrollableDivRef.current;
  if (!scrollableElement || !props.onScrollUpdate) return;

  const handleScroll = () => {
    props.onScrollUpdate?.(scrollableElement.scrollTop);
  };

  scrollableElement.addEventListener("scroll", handleScroll);
  return () => scrollableElement.removeEventListener("scroll", handleScroll);
}, [scrollableDivRef, props.onScrollUpdate]);
```

### 4. CSS Updates

#### New App.css Classes

```css
/* Base styles for header transitions */
.app-header {
  transform: translateY(0);
  transition: transform 0.3s ease-in-out;
}

.app-header-hidden {
  transform: translateY(-100%);
}
```

#### Update BottomNav.css

```css
/* Base styles for bottom nav transitions */
.bottom-nav {
  transform: translateY(0);
  transition: transform 0.3s ease-in-out;
}

.bottom-nav-hidden {
  transform: translateY(100%);
}
```

### 5. Component Updates

Update the components to use the new CSS classes based on the areNavBarsVisible prop:

#### Header.tsx

```typescript
<header
  className={`app-header ${
    !areNavBarsVisible ? "app-header-hidden" : ""
  }`.trim()}
  style={headerStyle}
>
  {/* ... existing content ... */}
</header>
```

#### BottomNav.tsx

```typescript
<nav
  className={`bottom-nav ${
    !areNavBarsVisible ? "bottom-nav-hidden" : ""
  }`.trim()}
>
  {/* ... existing content ... */}
</nav>
```

## Implementation Order

1. Create new CSS classes for transitions
2. Add state management in App.tsx
3. Update component interfaces with new props
4. Implement scroll handling in ResultsView
5. Update Header and BottomNav components with animation classes
6. Test scroll behavior in different scenarios

## Testing Considerations

1. Verify smooth transitions in both directions (up/down scrolling)
2. Test threshold behavior (1/3 viewport height)
3. Ensure navbars remain visible when near top of content
4. Verify behavior in both SearchResultsView and BrowseResultsView
5. Test performance impact of scroll event handling
6. Verify no conflicts with existing header shrinking behavior

## Browser Support

The implementation uses standard CSS transforms and transitions, which have broad browser support. No special polyfills needed.
