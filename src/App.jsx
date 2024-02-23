import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import "leaflet/dist/leaflet.css";

const App = () => {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    // Function to fetch user's geolocation
    const fetchLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const response = await axios.get(
                `https://graphhopper.com/api/1/geocode?reverse=true&point=${latitude},${longitude}&key=8a78a848-c3bb-4dd8-92a5-bb5eee5190df`
              );
              setLocation(response.data);
            } catch (error) {
              console.error('Error fetching location:', error);
            }
          },
          (error) => {
            console.error('Error getting geolocation:', error);
          }
        );
      } else {
        console.error('Geolocation is not supported by this browser.');
      }
    };

    fetchLocation();
  },
    []);
  console.log(location);
  return (
    <div className="container">
      <h1>Geolocation OpenSourec API</h1>
      {location && (
        <div className="map-container">
          <h2>Your Location:</h2>
          <p>Latitude: {location.hits[0].point.lat}</p>
          <p>Longitude: {location.hits[0].point.lng}</p>
          <p>Address: {location.hits[0].name}</p>
          <p>Country: {location.hits[0].country} </p>
          <p>City: {location.hits[0].city} </p>
        </div>
      )}
      <div style={{ height: '200px', width: '300px' }}>
        {location && (
          <MapContainer center={[location.hits[0].point.lat, location.hits[0].point.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[location.hits[0].point.lat, location.hits[0].point.lng]}>
              <Popup>
                Your location: {location.hits[0].name}
              </Popup>
            </Marker>
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default App;
