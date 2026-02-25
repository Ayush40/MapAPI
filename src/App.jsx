import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import './App.css';
import Sidebar from './components/Sidebar';
import SearchBar from './components/SearchBar';
import LocationInfo from './components/LocationInfo';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map layer definitions
const MAP_LAYERS = {
  street: {
    label: '🗺️ Street',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  satellite: {
    label: '🛰️ Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri',
  },
  terrain: {
    label: '⛰️ Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© OpenTopoMap',
  },
};

// Fly-to helper
function FlyToLocation({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 13, { duration: 1.2 });
  }, [center]);
  return null;
}

// Fixes Leaflet not knowing its real dimensions when inside a flex container.
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      map.invalidateSize({ animate: false });
    });
    return () => cancelAnimationFrame(id);
  }, [map]);
  return null;
}

// Exposes the map instance so the locate button (outside MapContainer) can call flyTo
function MapCapture({ mapRef }) {
  const map = useMap();
  useEffect(() => { mapRef.current = map; }, [map]);
  return null;
}

// Toast Manager
function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span className="toast-icon">
            {t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  );
}

let toastId = 0;

const App = () => {
  const [location, setLocation] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);     // mobile only
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // desktop

  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mapfavorites')) || []; } catch { return []; }
  });
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem('maprecentSearches')) || []; } catch { return []; }
  });
  const [darkMode, setDarkMode] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mapdarkMode')) || false; } catch { return false; }
  });
  const [activeLayer, setActiveLayer] = useState('street');
  const [distancePoint, setDistancePoint] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [locating, setLocating] = useState(false);
  const mapRef = useRef(null); // set by MapCapture inside the MapContainer

  // Apply dark mode to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('mapdarkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Persist favorites
  useEffect(() => {
    localStorage.setItem('mapfavorites', JSON.stringify(favorites));
  }, [favorites]);

  // Persist recent searches
  useEffect(() => {
    localStorage.setItem('maprecentSearches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  // Toast system
  const showToast = useCallback((message, type = 'success') => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  // Geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async ({ coords: { latitude, longitude } }) => {
          try {
            const res = await axios.get(
              `https://graphhopper.com/api/1/geocode?reverse=true&point=${latitude},${longitude}&key=8a78a848-c3bb-4dd8-92a5-bb5eee5190df`
            );
            setLocation(res.data);
            setSearchResults(res.data);
          } catch { }
        },
        () => { }
      );
    }
  }, []);

  const handleSelectPlace = (place) => {
    // Convert an Overpass place into the data shape the rest of the app expects
    setSearchResults({
      hits: [{
        name: place.name,
        point: { lat: place.lat, lng: place.lng },
        country: place.tags?.['addr:country'] || '',
        city: place.tags?.['addr:city'] || '',
        state: place.tags?.['addr:state'] || '',
        address: place.tags?.['addr:street'] || '',
        postcode: place.tags?.['addr:postcode'] || '',
      }],
    });
  };

  const handleSearch = (results) => {
    setSearchResults(results);
    setSidebarOpen(false);
    // Add to recent searches
    if (results.hits && results.hits[0]) {
      const hit = results.hits[0];
      const entry = { name: hit.name, lat: hit.point.lat, lng: hit.point.lng };
      setRecentSearches(prev => {
        const filtered = prev.filter(r => r.name !== entry.name);
        return [entry, ...filtered].slice(0, 10);
      });
    }
  };

  const toggleFavorite = () => {
    const hit = displayLocation?.hits?.[0];
    if (!hit) return;
    const isFav = favorites.some(f => f.lat === hit.point.lat && f.lng === hit.point.lng);
    if (isFav) {
      setFavorites(prev => prev.filter(f => !(f.lat === hit.point.lat && f.lng === hit.point.lng)));
      showToast('Removed from favorites', 'info');
    } else {
      setFavorites(prev => [
        ...prev,
        { name: hit.name, lat: hit.point.lat, lng: hit.point.lng, country: hit.country },
      ]);
      showToast('Added to favorites ⭐', 'success');
    }
  };

  const deleteFavorite = (idx) => {
    setFavorites(prev => prev.filter((_, i) => i !== idx));
    showToast('Favorite removed', 'info');
  };

  const handleSelectFavorite = async (fav) => {
    try {
      const res = await axios.get(
        `https://graphhopper.com/api/1/geocode?reverse=true&point=${fav.lat},${fav.lng}&key=8a78a848-c3bb-4dd8-92a5-bb5eee5190df`
      );
      setSearchResults(res.data);
    } catch { }
  };

  const handleSelectRecent = async (r) => {
    try {
      const res = await axios.get(
        `https://graphhopper.com/api/1/geocode?reverse=true&point=${r.lat},${r.lng}&key=8a78a848-c3bb-4dd8-92a5-bb5eee5190df`
      );
      setSearchResults(res.data);
    } catch { }
  };

  const handleClearHistory = () => {
    setFavorites([]);
    showToast('All favorites cleared', 'info');
  };

  const handleLocate = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation not supported', 'error');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        // 1. Fly the map immediately (if map is rendered)
        if (mapRef.current) {
          mapRef.current.flyTo([latitude, longitude], 15, { duration: 1.5 });
        }

        // 2. Reverse geocode to get full location data so info panel updates
        try {
          const res = await axios.get(
            `https://graphhopper.com/api/1/geocode?reverse=true&point=${latitude},${longitude}&key=8a78a848-c3bb-4dd8-92a5-bb5eee5190df`
          );
          if (res.data?.hits?.length > 0) {
            // Make sure the hit has the correct point coordinates
            const hit = { ...res.data.hits[0], point: { lat: latitude, lng: longitude } };
            setLocation({ hits: [hit] });
            setSearchResults(null); // clear any search override
          }
        } catch {
          // Reverse geocode failed — still show on map, just synthesize a minimal location
          setLocation({
            hits: [{
              name: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              point: { lat: latitude, lng: longitude },
              country: '', city: '', state: '', address: '', postcode: '',
            }],
          });
          setSearchResults(null);
        }

        showToast('Centred to your current location', 'success');
        setLocating(false);
      },
      (err) => {
        const msg = err.code === 1 ? 'Location permission denied' : 'Could not get your location';
        showToast(msg, 'error');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const displayLocation = searchResults || location;
  const isFavorited =
    displayLocation?.hits?.[0] &&
    favorites.some(
      f => f.lat === displayLocation.hits[0].point.lat && f.lng === displayLocation.hits[0].point.lng
    );

  const mapCenter = displayLocation?.hits?.[0]
    ? [displayLocation.hits[0].point.lat, displayLocation.hits[0].point.lng]
    : null;

  const layer = MAP_LAYERS[activeLayer];

  return (
    <div className="app-container">
      {/* Permanent Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(prev => !prev)}
        favorites={favorites}
        onSelectFavorite={handleSelectFavorite}
        onClearHistory={handleClearHistory}
        onDeleteFavorite={deleteFavorite}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(d => !d)}
        recentSearches={recentSearches}
        onSelectRecent={handleSelectRecent}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(c => !c)}
        mapCenter={mapCenter}
        onSelectPlace={handleSelectPlace}
        onToast={showToast}
      />

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="app-header">
          {/* Mobile hamburger — shown via CSS on small screens */}
          <button
            id="mobile-menu-btn"
            className="menu-toggle-btn"
            onClick={() => setSidebarOpen(prev => !prev)}
            title="Open menu"
          >
            ☰
          </button>
          <div className="header-brand">
            <div className="header-logo">🗺️</div>
            <h1 className="app-title">Map Explorer</h1>
          </div>
          <div className="header-actions">
            <button
              className="header-btn"
              onClick={() => setDarkMode(d => !d)}
              title={darkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="search-container">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Content */}
        <div className="content-wrapper">
          {/* Info Panel */}
          <div className="info-panel">
            {displayLocation ? (
              <LocationInfo
                location={displayLocation}
                onFavorite={toggleFavorite}
                isFavorited={isFavorited}
                onCopyToast={showToast}
                onDistanceSet={setDistancePoint}
                distancePoint={distancePoint}
              />
            ) : (
              <div className="loading-state">
                <div className="spinner" />
                <p>Getting your location...</p>
              </div>
            )}
          </div>

          {/* Map */}
          <div className="map-wrapper">
            {mapCenter ? (
              <>
                <MapContainer
                  center={mapCenter}
                  zoom={13}
                  className="map-container"
                  zoomControl={true}
                >
                  <TileLayer url={layer.url} attribution={layer.attribution} />
                  <MapCapture mapRef={mapRef} />
                  <MapResizer />
                  <FlyToLocation center={mapCenter} />
                  <Marker position={mapCenter}>
                    <Popup>
                      <strong>{displayLocation.hits[0].name}</strong>
                      <br />
                      {mapCenter[0].toFixed(4)}, {mapCenter[1].toFixed(4)}
                    </Popup>
                  </Marker>
                  {distancePoint && (
                    <Marker
                      position={[distancePoint.lat, distancePoint.lng]}
                      icon={L.divIcon({
                        className: '',
                        html: '<div style="background:#10b981;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>',
                        iconSize: [14, 14],
                        iconAnchor: [7, 7],
                      })}
                    >
                      <Popup>Point A: {distancePoint.name}</Popup>
                    </Marker>
                  )}
                </MapContainer>

                {/* Map Layer Controls + Locate Button */}
                <div className="map-controls">
                  <button
                    className="map-control-btn locate-btn"
                    onClick={handleLocate}
                    title="Go to my location"
                    disabled={locating}
                  >
                    {locating ? 'Locating...' : 'My Location'}
                  </button>
                  <div className="map-controls-divider" />
                  {Object.entries(MAP_LAYERS).map(([key, l]) => (
                    <button
                      key={key}
                      className={`map-control-btn ${activeLayer === key ? 'active' : ''}`}
                      onClick={() => setActiveLayer(key)}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="map-loading">
                <div className="spinner" />
              </div>
            )}
          </div>
        </div>

        {/* ── Footer — inside main-content (flex column), spans full width ── */}
        <footer className="app-footer">
          <span>© {new Date().getFullYear()} Map Explorer. All rights reserved.</span>
          <span className="footer-divider">·</span>
          <span>Powered by <a href="https://www.openstreetmap.org" target="_blank" rel="noreferrer">OpenStreetMap</a></span>
          <span className="footer-divider">·</span>
          <span>Built with React &amp; Leaflet</span>
        </footer>
      </div>

      {/* Toast Container — fixed, outside all layout */}
      <ToastContainer toasts={toasts} />
    </div>
  );
};

export default App;
