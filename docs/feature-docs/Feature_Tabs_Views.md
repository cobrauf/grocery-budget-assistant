Product Requirements Document: Enhanced Tab-Based Navigation & Filtering

1. Introduction
   This document outlines the requirements for enhancing the Smart Grocery Budget Shopping Assistant with a clear tab-based navigation system (Browse, Search, AI) accessible via a bottom navigation bar, and advanced filtering capabilities within the Browse tab. The goal is to provide users with distinct, intuitive, and persistent experiences for browsing deals and searching for specific items.
2. Goals
   User Goal: Provide a clear and intuitive way to switch between primary app functionalities (Browsing deals, Searching items, AI assistance) using a bottom navigation bar.
   User Goal: Allow users to maintain their context (viewed data, selections) within each tab when switching between them.
   User Goal (Browse): Enable users to discover products by selecting multiple retailers and/or categories simultaneously, using visual toggles (logos/icons) and filter initiator buttons, then applying these selections to view results.
   Project Goal: Refactor the frontend architecture to support independent tab states and dedicated views, improving code organization and scalability.
   Project Goal: Implement robust state management for caching and restoring tab-specific data.
3. Target Audience
   (As per existing PRD: Budget-conscious individuals or families who regularly shop for groceries and are interested in maximizing savings through weekly ads.) This enhancement aims to improve their efficiency in exploring deals.
4. Key Features
   4.1. Tab-Based Navigation (Bottom Bar)
   Persistent Tabs: The application will feature three main tabs in a bottom navigation bar: "Browse", "Search", and "AI (WIP)".
   Independent State: Each tab will maintain its own state (current view, fetched data, filter selections). Switching between tabs will preserve the state of the inactive tabs.
   Tab Management Hook: A central hook (e.g., useAppTab) will manage the active tab and facilitate state preservation.
   4.2. Global Header & Search Bar
   Main Header: A top header will persist, containing the hamburger menu for the sidebar, the application title ("Grocery-Assistant"), and a secondary icon (e.g., favorites/heart).
   Global Search Bar: A search input field will be consistently visible below the main header but above the tab-specific content.
   Initiating a search from this bar will always navigate the user to the "Search" tab and display results there, regardless of the previously active tab.

4.3. Browse Tab Functionality
Default App Tab: The "Browse" tab will be the default tab upon application launch.
Default Browse View (DefaultBrowseView.tsx):
Displays a "Filters:" section with initiator buttons: + Add store Filter and + Add Category Filter. Clicking these opens respective selection modals.
Displays horizontally scrollable rows of retailer logos and product category icons below the filter initiator buttons.
Retailer logos and category icons act as toggles for multi-selection, with clear visual feedback (e.g., border, highlight) for selected items.
A "Show Items" button (as per mock-up) at the bottom of this view triggers the display of products matching all selected/toggled retailers and categories.

Browse Results View (BrowseResultsView.tsx):
A dedicated view within the Browse tab to display products based on single or multiple selected retailers and/or categories after the "Show Items" button is pressed.
Supports displaying a consolidated list of products matching the active filter criteria.

Filtering Mechanism:
Stores Filter: Allows selection of one or more retailers via logo toggles or the "Store Filter" modal.
Categories Filter: Allows selection of one or more product categories via icon toggles or the "Category Filter" modal.
Selections made via logo/icon toggles are synchronized with modal selections.
Filter state is maintained within the Browse tab.

4.4. Search Tab Functionality
Default Search View (DefaultSearchView.tsx):
A simple view displayed when the Search tab is active and no search has been performed (e.g., displays "Search for items...").

Search Results View (SearchResultsView.tsx):
Dedicated exclusively to displaying results from a user-initiated search (triggered by the global search bar) within the Search tab.
Functionality remains similar to current search results display (infinite scroll, product cards).

Search State: Search query and results are maintained within the Search tab.
4.5. Data Caching and Persistence
Product lists fetched for the Browse tab (based on filters) will be cached separately from product lists fetched for the Search tab.
This ensures that when a user switches from Search back to Browse, their previously filtered browse results (and selections) are still visible, and vice-versa. 5. Technical Considerations
State Management: Robust state management strategy will be crucial.
Component Reusability vs. Specificity: Views will be specific to tabs (BrowseResultsView vs. SearchResultsView).
UI Components:
New BottomNav.tsx.
New DefaultSearchView.tsx.
New BrowseResultsView.tsx.
Modal components for Store and Category filters.
Horizontally scrollable UI for logos/icons with selection state visuals.
Filter initiator buttons (+ Add store Filter, + Add Category Filter).
"Show Items" button in DefaultBrowseView.tsx.

Hooks:
Rename useAppView to useAppTab.
Potentially new hooks for managing browse filter state.

API Interactions: Backend API for fetching products might need to support fetching by multiple retailer IDs and/or multiple categories simultaneously. 6. Success Metrics
Smooth and intuitive switching between Browse and Search tabs using the bottom navigation.
User's context (viewed products, selected filters) is successfully preserved when switching tabs.
Users can successfully filter and view products from multiple retailers/categories in the Browse tab using the new UI.
The global search bar consistently directs users to the Search tab with results. 7. Future Considerations
Implementation of the "AI" tab.
Displaying active filter counts or selected filter items more explicitly in the "Filters:" row if needed.
Saving user filter preferences.
