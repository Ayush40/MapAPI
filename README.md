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
