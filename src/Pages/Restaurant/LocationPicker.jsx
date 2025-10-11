import React, { useState, useEffect } from "react";
import Map, { Marker } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxGL from "mapbox-gl";

// Set your Mapbox access token
MapboxGL.accessToken =
  "pk.eyJ1IjoiYWoxODE4MTgiLCJhIjoiY21mb3owOXRiMGJ1MTJrc2Z4dHVpdGNneSJ9.MhXMnGKgPp_NuRrksweolw";

export default function LocationPicker({ address, onLocationSelect }) {
  // Default position (Delhi)
  const [position, setPosition] = useState({ lat: 28.6139, lng: 77.209 });

  // Fetch coordinates when address changes
  useEffect(() => {
    if (address) {
      fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          address
        )}.json?access_token=${MapboxGL.accessToken}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.features && data.features.length > 0) {
            const [lng, lat] = data.features[0].center;
            setPosition({ lat, lng });
            if (onLocationSelect) onLocationSelect({ lat, lng });
          }
        })
        .catch((err) => console.error("Geocoding error:", err));
    }
  }, [address]);

  // Update parent on marker drag
  const handleDragEnd = (evt) => {
    const { lngLat } = evt;
    setPosition({ lat: lngLat.lat, lng: lngLat.lng });
    if (onLocationSelect) onLocationSelect({ lat: lngLat.lat, lng: lngLat.lng });
  };

  return (
    <div style={{ height: "300px", width: "100%" }}>
      <Map
        initialViewState={{
          longitude: position.lng,
          latitude: position.lat,
          zoom: 13,
        }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={MapboxGL.accessToken}
      >
        <Marker
          longitude={position.lng}
          latitude={position.lat}
          draggable
          onDragEnd={handleDragEnd}
        />
      </Map>
    </div>
  );
}
