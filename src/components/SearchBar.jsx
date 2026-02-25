import React, { useState, useRef } from 'react';
import axios from 'axios';
import '../styles/SearchBar.css';

const API_KEY = '8a78a848-c3bb-4dd8-92a5-bb5eee5190df';

const SearchBar = ({ onSearch, isLoading }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const debounceRef = useRef(null);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        clearTimeout(debounceRef.current);
        if (value.length > 2) {
            debounceRef.current = setTimeout(async () => {
                try {
                    const response = await axios.get(
                        `https://graphhopper.com/api/1/geocode?q=${encodeURIComponent(value)}&key=${API_KEY}&limit=6`
                    );
                    setSuggestions(response.data.hits || []);
                    setShowSuggestions(true);
                } catch {
                    setSuggestions([]);
                }
            }, 280);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchQuery(suggestion.name);
        setShowSuggestions(false);
        onSearch({ hits: [suggestion], query: suggestion.name });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const query = searchQuery.trim();
        if (!query) return;

        setShowSuggestions(false);
        clearTimeout(debounceRef.current);

        // Use cached suggestions if available
        if (suggestions.length > 0) {
            handleSuggestionClick(suggestions[0]);
            return;
        }

        // Otherwise fetch directly
        try {
            const response = await axios.get(
                `https://graphhopper.com/api/1/geocode?q=${encodeURIComponent(query)}&key=${API_KEY}&limit=6`
            );
            const hits = response.data.hits || [];
            if (hits.length > 0) {
                setSuggestions(hits);
                setSearchQuery(hits[0].name);
                onSearch({ hits, query });
            } else {
                setShowSuggestions(true);
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    const handleClear = () => {
        setSearchQuery('');
        setSuggestions([]);
        setShowSuggestions(false);
    };

    return (
        <div className="search-bar-container">
            <form className="search-bar" onSubmit={handleSubmit}>
                {/* Search icon — pure CSS, no emoji */}
                <span className="search-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                </span>

                <input
                    type="text"
                    className="search-input"
                    placeholder="Search cities, addresses, landmarks..."
                    value={searchQuery}
                    onChange={handleInputChange}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    disabled={isLoading}
                    autoComplete="off"
                />

                {searchQuery && (
                    <button type="button" className="search-clear-btn" onClick={handleClear} tabIndex={-1} aria-label="Clear">
                        {/* X icon — no emoji */}
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                )}

                <button type="submit" className="search-btn" disabled={isLoading} aria-label="Search">
                    {isLoading ? (
                        <span className="search-btn-spinner" />
                    ) : (
                        /* Arrow icon + text — no emoji */
                        <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            Search
                        </>
                    )}
                </button>
            </form>

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="suggestions-dropdown">
                    {suggestions.map((suggestion, idx) => (
                        <div
                            key={idx}
                            className="suggestion-item"
                            onMouseDown={() => handleSuggestionClick(suggestion)}
                        >
                            {/* Pin icon — SVG, no emoji */}
                            <div className="suggestion-item-icon">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                            </div>
                            <div className="suggestion-text">
                                <div className="suggestion-name">{suggestion.name}</div>
                                <div className="suggestion-details">
                                    {suggestion.city && <span>{suggestion.city}</span>}
                                    {suggestion.state && <span>{suggestion.state}</span>}
                                    {suggestion.country && <span>{suggestion.country}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* No results */}
            {showSuggestions && suggestions.length === 0 && searchQuery.length > 2 && (
                <div className="suggestions-dropdown no-results">
                    <div className="suggestion-item">
                        No locations found for &ldquo;{searchQuery}&rdquo;
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchBar;
