import React, { useState, useEffect } from 'react';
import '../styles/LocationInfo.css';

const LocationInfo = ({ location, onFavorite, isFavorited, onCopyToast, onDistanceSet, distancePoint }) => {
    const [weather, setWeather] = useState(null);

    if (!location || !location.hits || location.hits.length === 0) return null;

    const hit = location.hits[0];

    // Fetch weather from open-meteo (free, no key needed)
    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const res = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${hit.point.lat}&longitude=${hit.point.lng}&current_weather=true&temperature_unit=celsius`
                );
                const data = await res.json();
                if (data.current_weather) {
                    setWeather(data.current_weather);
                }
            } catch {
                setWeather(null);
            }
        };
        fetchWeather();
    }, [hit.point.lat, hit.point.lng]);

    const getWeatherEmoji = (code) => {
        if (!code && code !== 0) return '🌡️';
        if (code === 0) return '☀️';
        if ([1, 2, 3].includes(code)) return '⛅';
        if ([45, 48].includes(code)) return '🌫️';
        if ([51, 53, 55, 61, 63, 65].includes(code)) return '🌧️';
        if ([71, 73, 75, 77].includes(code)) return '❄️';
        if ([80, 81, 82].includes(code)) return '🌦️';
        if ([95, 96, 99].includes(code)) return '⛈️';
        return '🌡️';
    };

    const handleShare = () => {
        const url = `https://www.openstreetmap.org/?mlat=${hit.point.lat}&mlon=${hit.point.lng}&zoom=13`;
        navigator.clipboard.writeText(url);
        onCopyToast('Location link copied to clipboard!', 'success');
    };

    const handleCopyCoords = () => {
        navigator.clipboard.writeText(`${hit.point.lat.toFixed(6)}, ${hit.point.lng.toFixed(6)}`);
        onCopyToast('Coordinates copied!', 'success');
    };

    const handleSetDistancePoint = () => {
        onDistanceSet({ lat: hit.point.lat, lng: hit.point.lng, name: hit.name });
        onCopyToast('Point A set. Search another location to measure distance.', 'info');
    };

    // Calculate distance between two points (Haversine)
    const haversineDistance = (a, b) => {
        const R = 6371;
        const dLat = ((b.lat - a.lat) * Math.PI) / 180;
        const dLng = ((b.lng - a.lng) * Math.PI) / 180;
        const sq =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(sq), Math.sqrt(1 - sq));
    };

    const distance =
        distancePoint &&
            (distancePoint.lat !== hit.point.lat || distancePoint.lng !== hit.point.lng)
            ? haversineDistance(distancePoint, { lat: hit.point.lat, lng: hit.point.lng })
            : null;

    return (
        <div className="location-info-card">
            {/* Header */}
            <div className="location-header">
                <div className="location-header-top">
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h2 className="location-name">{hit.name}</h2>
                        {hit.country && (
                            <span className="location-country-badge">🌍 {hit.country}</span>
                        )}
                    </div>
                    <button
                        className={`favorite-btn ${isFavorited ? 'favorited' : ''}`}
                        onClick={onFavorite}
                        title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                    >
                        {isFavorited ? '⭐' : '☆'}
                    </button>
                </div>

                <div className="coords-bar">
                    <span className="coord-text">
                        {hit.point.lat.toFixed(5)}°N, {hit.point.lng.toFixed(5)}°E
                    </span>
                </div>
            </div>

            {/* Details */}
            <div className="location-details">
                {/* Weather */}
                {weather && (
                    <div className="weather-badge">
                        <span className="weather-icon">{getWeatherEmoji(weather.weathercode)}</span>
                        <div className="weather-info">
                            <div className="weather-temp">{Math.round(weather.temperature)}°C</div>
                            <div className="weather-desc">
                                Wind {weather.windspeed} km/h &middot; WMO {weather.weathercode}
                            </div>
                        </div>
                    </div>
                )}

                {hit.address && (
                    <div className="detail-item">
                        <span className="detail-icon">🏠</span>
                        <div className="detail-content">
                            <div className="detail-label">Address</div>
                            <div className="detail-value">{hit.address}</div>
                        </div>
                    </div>
                )}

                {hit.city && (
                    <div className="detail-item">
                        <span className="detail-icon">🏙️</span>
                        <div className="detail-content">
                            <div className="detail-label">City</div>
                            <div className="detail-value">{hit.city}</div>
                        </div>
                    </div>
                )}

                {hit.state && (
                    <div className="detail-item">
                        <span className="detail-icon">🗾</span>
                        <div className="detail-content">
                            <div className="detail-label">State / Region</div>
                            <div className="detail-value">{hit.state}</div>
                        </div>
                    </div>
                )}

                {hit.postcode && (
                    <div className="detail-item">
                        <span className="detail-icon">📬</span>
                        <div className="detail-content">
                            <div className="detail-label">Postal Code</div>
                            <div className="detail-value">{hit.postcode}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Distance section */}
            <div className="distance-section">
                <div className="distance-section-title">📏 Distance Calculator</div>
                <div className="distance-input-row">
                    <button
                        className={`distance-target-btn ${distancePoint ? 'has-point' : ''}`}
                        onClick={handleSetDistancePoint}
                    >
                        {distancePoint
                            ? `✓ From: ${distancePoint.name.substring(0, 20)}...`
                            : '📍 Set as Point A'}
                    </button>
                </div>
                {distance !== null && (
                    <div className="distance-result-row">
                        <span className="dist-icon">📐</span>
                        <div className="dist-labels">
                            <div className="dist-value">
                                {distance >= 1 ? `${distance.toFixed(1)} km` : `${(distance * 1000).toFixed(0)} m`}
                            </div>
                            <div className="dist-sub">from {distancePoint.name}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="location-footer">
                <button className="action-btn action-btn-primary" onClick={handleCopyCoords}>
                    📋 Copy Coords
                </button>
                <button className="action-btn action-btn-secondary" onClick={handleShare}>
                    🔗 Share
                </button>
            </div>
        </div>
    );
};

export default LocationInfo;
