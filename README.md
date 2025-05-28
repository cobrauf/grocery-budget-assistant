# Grocery Buddy 🛒💰

**Your smart companion for tracking grocery deals and managing your shopping budget!**

## Overview

The Grocery Budget Assistant is a full-stack web application designed to help users discover the best grocery deals from various retailers. Users can browse promotions, filter by store or category, save their favorite items, and get an overview of when deals expire. The goal is to make grocery shopping more efficient and budget-friendly.

This application features a React frontend for a dynamic user experience and a Python (FastAPI) backend to manage data, process PDF flyers, and serve information to the client.

## Key Features ✨

- **--Frontend--**
- **Browse Deals:** View a comprehensive list of current grocery promotions.
- **Filter & Sort:** Filter by retailers/categories; sort by price, etc.
- **Favorites:** Save your favorite deals for quick access.
- **Search:** Search for specific products across all retailers.
- **Dynamic UI:** Responsive and interactive user interface built with React.
- **Themeable:** Light/dark mode and font selection for user preference.

- **--Backend--**
- **PDF Processing:** (Backend) Extracts deal information from uploaded PDF flyers.
  - The backend receives uploaded PDF grocery flyers.
  - An LLM (Large Language Model) extracts the PDF content into a structured JSON format.
  - JSON extraction undergoes an enhancement process to improve data quality and consistency.
  - The enhanced deal information is uploaded to a Supabase (PostgreSQL) database as a microservice.

## Tech Stack 🛠️

This project leverages a modern tech stack:

- **Frontend:**
  - **React:**
  - **TypeScript:**
  - **Vite:**
- **Backend:**
  - **Python:**
  - **FastAPI:**
  - **SQLAlchemy:**
  - **Pydantic:**
  - **Large Language Models (LLMs):**
- **Database & BaaS:**
  - **Supabase (PostgreSQL):**
- **Version Control:**
  - **Git & GitHub:**

## Screenshots 📸

**Main Deal Browsing Interface:**
![Browsing Deals](./docs/media/1.jpg)

**Favorites Management View:**
![Favorites View](./docs/media/2.jpg)

**Filtering Options (Example):**
![Filtering Example](./docs/media/3.jpg)

**Dark Mode Theme:**
![Dark Mode](./docs/media/4.jpg)

**Mobile/Responsive View (Example):**
![Mobile View](./docs/media/5.jpg)
