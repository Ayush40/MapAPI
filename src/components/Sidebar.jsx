import React, { useState } from 'react';
import '../styles/Sidebar.css';
import NearbyPlaces from './NearbyPlaces';

const Sidebar = ({
  isOpen,
  onToggle,
  favorites,
  onSelectFavorite,
  onClearHistory,
  onDeleteFavorite,
  darkMode,
  onToggleDarkMode,
  recentSearches,
  onSelectRecent,
  collapsed,
  onToggleCollapse,
  mapCenter,
  onSelectPlace,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState('favorites');

  const tabs = [
    { id: 'favorites', icon: '⭐', label: 'Favorites', badge: favorites.length > 0 ? favorites.length : null },
    { id: 'nearby', icon: '📍', label: 'Nearby', badge: null },
    { id: 'recent', icon: '🕐', label: 'Recent', badge: recentSearches.length > 0 ? recentSearches.length : null },
    { id: 'settings', icon: '⚙️', label: 'Settings', badge: null },
    { id: 'about', icon: 'ℹ️', label: 'About', badge: null },
  ];

  return (
    <>
      <div className={`sidebar ${collapsed ? 'collapsed' : ''} ${isOpen ? 'mobile-open' : ''}`}>

        {/* ── Header ── */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">🗺️</div>
            <span className="sidebar-logo-text">Map Explorer</span>
          </div>
          <button
            className="sidebar-collapse-btn"
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        {/* ── Nav ── */}
        <nav className="sidebar-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              title={collapsed ? tab.label : ''}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
              {tab.badge !== null && <span className="nav-badge">{tab.badge}</span>}
            </button>
          ))}
        </nav>

        {/* ── Content ── */}
        <div className="sidebar-content">

          {/* FAVORITES */}
          {activeTab === 'favorites' && (
            <div className="tab-panel">
              <div className="panel-title">Saved Locations</div>
              {favorites.length > 0 ? (
                <>
                  <div className="favorites-list">
                    {favorites.map((fav, idx) => (
                      <div
                        key={idx}
                        className="favorite-item"
                        onClick={() => { onSelectFavorite(fav); onToggle(); }}
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                        <span className="fav-icon">📍</span>
                        <div className="fav-info">
                          <div className="fav-name">{fav.name}</div>
                          <div className="fav-coords">
                            {fav.lat.toFixed(3)}, {fav.lng.toFixed(3)}
                          </div>
                        </div>
                        <button
                          className="fav-delete-btn"
                          onClick={e => { e.stopPropagation(); onDeleteFavorite(idx); }}
                          title="Remove"
                        >✕</button>
                      </div>
                    ))}
                  </div>
                  <button className="clear-btn" onClick={onClearHistory}>
                    🗑️ Clear All Favorites
                  </button>
                </>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">⭐</div>
                  <p>No favorites yet.</p>
                  <p>Search a location and tap ☆ to save it.</p>
                </div>
              )}
            </div>
          )}

          {/* NEARBY */}
          {activeTab === 'nearby' && (
            <div className="tab-panel">
              <div className="panel-title">Nearby Places</div>
              <NearbyPlaces
                center={mapCenter}
                onSelectPlace={place => {
                  onSelectPlace(place);
                  onToggle();
                }}
                onToast={onToast}
              />
            </div>
          )}

          {/* RECENT */}
          {activeTab === 'recent' && (
            <div className="tab-panel">
              <div className="panel-title">Recent Searches</div>
              {recentSearches.length > 0 ? (
                <div className="recent-list">
                  {recentSearches.map((r, idx) => (
                    <div
                      key={idx}
                      className="recent-item"
                      onClick={() => { onSelectRecent(r); onToggle(); }}
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <span className="recent-icon">🕐</span>
                      <span className="recent-name">{r.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">🕐</div>
                  <p>No recent searches.</p>
                </div>
              )}
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === 'settings' && (
            <div className="tab-panel">
              <div className="panel-title">Preferences</div>
              <div className="settings-list">
                <div className="setting-item">
                  <div className="setting-info">
                    <span className="setting-icon">{darkMode ? '🌙' : '☀️'}</span>
                    <span className="setting-label">Dark Mode</span>
                  </div>
                  <button
                    className={`toggle-switch ${darkMode ? 'on' : ''}`}
                    onClick={onToggleDarkMode}
                    aria-label="Toggle dark mode"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ABOUT */}
          {activeTab === 'about' && (
            <div className="tab-panel">
              <div className="about-card">
                <h4>🗺️ Map Explorer</h4>
                <p>An interactive map with real-time geocoding, nearby places, weather, and location tools.</p>
                <ul className="about-features">
                  <li>Search any location</li>
                  <li>Save &amp; manage favorites</li>
                  <li>Nearby places search</li>
                  <li>Distance calculator</li>
                  <li>Multiple map styles</li>
                  <li>Live weather info</li>
                  <li>Dark mode support</li>
                </ul>
              </div>
              <div className="about-card">
                <h4>🛠️ Technology</h4>
                <div className="tech-badges">
                  {['React', 'Leaflet', 'Vite', 'GraphHopper', 'OpenStreetMap', 'Overpass API', 'Open-Meteo'].map(t => (
                    <span key={t} className="tech-badge">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Mobile overlay backdrop */}
      <div
        className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
        onClick={onToggle}
      />
    </>
  );
};

export default Sidebar;
