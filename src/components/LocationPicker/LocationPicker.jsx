import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder";

import { useState, useEffect } from "react";

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// ✅ Component that adds a search bar to the map
function SearchControl({ onSelect }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const geocoder = L.Control.Geocoder.nominatim();

    const control = L.Control.geocoder({
      query: "",
      placeholder: "Search location...",
      defaultMarkGeocode: false,
      geocoder,
    })
      .on("markgeocode", function (e) {
        const { center } = e.geocode;
        map.setView(center, 15); // zoom to result
        onSelect(center); // pass lat/lng back
      })
      .addTo(map);

    return () => map.removeControl(control);
  }, [map, onSelect]);

  return null;
}

function LocationMarker({ onSelect }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onSelect(e.latlng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function LocationPicker({ onLocationSelect }) {
  return (
    <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-300 shadow-sm">
      <MapContainer
        center={[20.5937, 78.9629]} // default India center
        zoom={5}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/">OSM</a>'
        />
        <SearchControl onSelect={onLocationSelect} />
        <LocationMarker onSelect={onLocationSelect} />
      </MapContainer>
    </div>
  );
}
