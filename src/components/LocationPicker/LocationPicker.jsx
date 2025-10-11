import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

// ✅ Mapbox token
mapboxgl.accessToken =
  "pk.eyJ1IjoiYWoxODE4MTgiLCJhIjoiY21mb3owOXRiMGJ1MTJrc2Z4dHVpdGNneSJ9.MhXMnGKgPp_NuRrksweolw";

export default function LocationPicker({ onLocationSelect }) {
  const mapContainerRef = useRef(null);
  const [marker, setMarker] = useState(null);

  useEffect(() => {
    // Initialize map
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [78.9629, 20.5937], // Default India
      zoom: 4.5,
    });

    // Add navigation (+/-) controls (top-right)
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add search/geocoder control (top-left)
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      marker: false,
      placeholder: "Search location...",
    });

    map.addControl(geocoder, "top-left");

    // Handle result from search box
    geocoder.on("result", (e) => {
      const [lng, lat] = e.result.center;

      // Remove old marker if any
      if (marker) marker.remove();

      // Add new marker at searched location
      const newMarker = new mapboxgl.Marker({ color: "#F9832B" })
        .setLngLat([lng, lat])
        .addTo(map);

      setMarker(newMarker);

      // Smoothly fly to the new position
      map.flyTo({
        center: [lng, lat],
        zoom: 15,
        essential: true,
      });

      // Send lat/lng to parent
      onLocationSelect({ lat, lng });
    });

    // Handle user clicking on the map
    map.on("click", (e) => {
      const { lng, lat } = e.lngLat;

      // Remove old marker
      if (marker) marker.remove();

      // Add new marker at click position
      const newMarker = new mapboxgl.Marker({ color: "#F9832B" })
        .setLngLat([lng, lat])
        .addTo(map);

      setMarker(newMarker);

      // Fly to the clicked position
      map.flyTo({
        center: [lng, lat],
        zoom: 15,
        essential: true,
      });

      // Send lat/lng to parent
      onLocationSelect({ lat, lng });
    });

    // Cleanup on unmount
    return () => map.remove();
  }, [onLocationSelect]);

  return (
    <div
      ref={mapContainerRef}
      className="h-96 w-full rounded-lg overflow-hidden border border-gray-300 shadow-sm relative"
    />
  );
}
