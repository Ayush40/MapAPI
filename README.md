<<<<<<< HEAD
# 🗺️ Map Explorer

A modern, interactive map application built with **React** and **Leaflet**. Search any location, explore nearby places, check live weather, calculate distances, and switch between map styles — all in a clean, dark-mode-ready UI.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Location Search** | Debounced autocomplete powered by GraphHopper Geocoding API |
| **Nearby Places** | Find restaurants, cafes, hospitals, ATMs, parks & more via Overpass API (10 categories, selectable radius) |
| **Live Weather** | Current temperature, wind speed & condition via Open-Meteo API |
| **My Location** | One-click GPS recentre with reverse geocoding to update the info panel |
| **Distance Calculator** | Set Point A, then search a second location to get Haversine distance |
| **Map Styles** | Street, Satellite (Esri), and Terrain layer switcher |
| **Favorites** | Save, browse, and delete favourite locations (persisted in localStorage) |
| **Recent Searches** | Last 10 searches auto-saved and accessible from the sidebar |
| **Dark Mode** | Full dark/light theme toggle, persisted across sessions |
| **Share Location** | Copies an OpenStreetMap link to clipboard |
| **Toast Notifications** | Non-blocking success / info / error feedback |
| **Fly-to Animation** | Smooth animated map transitions on location change |

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛠️ Tech Stack

- **React 18** — UI framework
- **Vite** — build tool & dev server
- **Leaflet / react-leaflet** — interactive maps
- **Axios** — HTTP client
- **GraphHopper API** — geocoding & reverse geocoding
- **Overpass API** — nearby places (OSM data, free)
- **Open-Meteo API** — weather data (free, no key needed)
- **OpenStreetMap** — map tiles (Street & Terrain)
- **Esri World Imagery** — satellite tiles

---

## 📁 Project Structure

```
src/
├── App.jsx              # Root component, state & map logic
├── App.css              # Global design system & layout
├── components/
│   ├── Sidebar.jsx      # Nav tabs: Favorites, Nearby, Recent, Settings, About
│   ├── SearchBar.jsx    # Autocomplete search input
│   ├── LocationInfo.jsx # Location card with weather, distance, actions
│   └── NearbyPlaces.jsx # Nearby category search & results
└── styles/
    ├── Sidebar.css
    ├── SearchBar.css
    ├── LocationInfo.css
    └── NearbyPlaces.css
```

---

## 🔑 API Keys

The GraphHopper API key is currently hardcoded. For production move it to an environment variable:

```env
# .env
VITE_GRAPHHOPPER_KEY=your_key_here
```

Then reference it as `import.meta.env.VITE_GRAPHHOPPER_KEY`.

---

## 📄 License

MIT © 2026 Map Explorer
=======
# MapAPI

MapAPI is a simple and easy-to-use service for developers who need to check APIs that provide geographic location data. This project is designed to help you fetch and validate information from location-based APIs in your applications.

## Features

- Fetch location data using an API endpoint
- Validate API responses for location accuracy
- Supports integration with multiple mapping services
- Built with modular and clean code for easy customization

## Getting Started

### Prerequisites

- Node.js (v14 or higher) [or Python 3.x, adjust based on your project's language]
- npm, yarn, or your preferred package manager

### Installation

Clone this repository:

```bash
git clone https://github.com/yourusername/MapAPI.git
cd MapAPI
```

Install dependencies:

```bash
npm install
```
_or_
```bash
pip install -r requirements.txt
```

## API Reference

| Function        | Description                                       |
|-----------------|---------------------------------------------------|
| getLocation     | Returns location coordinates for a given address  |
| validateAPI     | Checks the validity of the location API response  |


## Contributing

Contributions are welcome! Please open issues and submit pull requests for improvements or bug fixes.
>>>>>>> 148f7dcc01797dff2a7ab5a764b3cd5ef1141ad3
