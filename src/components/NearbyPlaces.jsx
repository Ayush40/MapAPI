import React, { useState } from 'react';
import '../styles/NearbyPlaces.css';

const CATEGORIES = [
    { id: 'restaurant', label: 'Restaurants', icon: '🍽️', query: 'amenity=restaurant' },
    { id: 'cafe', label: 'Cafes', icon: '☕', query: 'amenity=cafe' },
    { id: 'hospital', label: 'Hospitals', icon: '🏥', query: 'amenity=hospital' },
    { id: 'pharmacy', label: 'Pharmacy', icon: '💊', query: 'amenity=pharmacy' },
    { id: 'school', label: 'Schools', icon: '🏫', query: 'amenity=school' },
    { id: 'bank', label: 'Banks', icon: '🏦', query: 'amenity=bank' },
    { id: 'fuel', label: 'Fuel', icon: '⛽', query: 'amenity=fuel' },
    { id: 'park', label: 'Parks', icon: '🌳', query: 'leisure=park' },
    { id: 'atm', label: 'ATMs', icon: '🏧', query: 'amenity=atm' },
    { id: 'supermarket', label: 'Markets', icon: '🛒', query: 'shop=supermarket' },
];

const RADIUS_OPTIONS = [500, 1000, 2000, 5000];

const haversineDistance = (a, b) => {
    const R = 6371000;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const sq =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(sq), Math.sqrt(1 - sq));
};

const formatDistance = (d) => d >= 1000 ? `${(d / 1000).toFixed(1)} km` : `${Math.round(d)} m`;

const NearbyPlaces = ({ center, onSelectPlace, onToast }) => {
    const [activeCategory, setActiveCategory] = useState(null);
    const [radius, setRadius] = useState(1000);
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(false);

    const searchNearby = async (cat) => {
        if (!center) { onToast('No location selected', 'error'); return; }
        setActiveCategory(cat.id);
        setLoading(true);
        setPlaces([]);

        try {
            const [key, val] = cat.query.split('=');
            const query = `
        [out:json][timeout:10];
        node["${key}"="${val}"](around:${radius},${center[0]},${center[1]});
        out body 20;
      `;
            const res = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                body: query,
            });
            const data = await res.json();
            const results = (data.elements || [])
                .filter(e => e.lat && e.lon)
                .map(e => ({
                    id: e.id,
                    name: e.tags?.name || cat.label,
                    lat: e.lat,
                    lng: e.lon,
                    dist: haversineDistance({ lat: center[0], lng: center[1] }, { lat: e.lat, lng: e.lon }),
                    tags: e.tags || {},
                }))
                .sort((a, b) => a.dist - b.dist)
                .slice(0, 15);
            setPlaces(results);
            if (results.length === 0) onToast(`No ${cat.label.toLowerCase()} found within ${formatDistance(radius)}`, 'info');
        } catch {
            onToast('Failed to fetch nearby places', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="nearby-container">
            {/* Radius picker */}
            <div className="radius-row">
                <span className="nearby-label">Radius</span>
                <div className="radius-btns">
                    {RADIUS_OPTIONS.map(r => (
                        <button
                            key={r}
                            className={`radius-btn ${radius === r ? 'active' : ''}`}
                            onClick={() => setRadius(r)}
                        >
                            {formatDistance(r)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Category Grid */}
            <div className="category-grid">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                        onClick={() => searchNearby(cat)}
                    >
                        <span className="cat-icon">{cat.icon}</span>
                        <span className="cat-label">{cat.label}</span>
                    </button>
                ))}
            </div>

            {/* Results */}
            {loading && (
                <div className="nearby-loading">
                    <div className="nearby-spinner" />
                    <span>Searching nearby...</span>
                </div>
            )}

            {!loading && places.length > 0 && (
                <div className="places-list">
                    <div className="places-count">{places.length} results</div>
                    {places.map((place, idx) => (
                        <div
                            key={place.id}
                            className="place-item"
                            onClick={() => onSelectPlace(place)}
                            style={{ animationDelay: `${idx * 0.04}s` }}
                        >
                            <div className="place-icon">
                                {CATEGORIES.find(c => c.id === activeCategory)?.icon || '📍'}
                            </div>
                            <div className="place-info">
                                <div className="place-name">{place.name}</div>
                                {place.tags.opening_hours && (
                                    <div className="place-meta">⏰ {place.tags.opening_hours}</div>
                                )}
                            </div>
                            <div className="place-dist">{formatDistance(place.dist)}</div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && places.length === 0 && activeCategory && (
                <div className="nearby-empty">
                    <span>🔍</span>
                    <p>No results found</p>
                </div>
            )}
        </div>
    );
};

export default NearbyPlaces;
