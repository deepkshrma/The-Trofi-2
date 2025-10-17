import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import { MAP_TOKEN } from "../../config/Config";

// 🟠 Custom orange marker icon
const orangeIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="48" viewBox="0 0 384 512">
        <path fill="#F9832B" d="M168 0C75.1 0 0 75.1 0 168c0 87 141.3 309.4 152.2 327.1a24 24 0 0 0 39.6 0C210.7 477.4 352 255 352 168 352 75.1 276.9 0 184 0zM184 256a88 88 0 1 1 88-88 88 88 0 0 1-88 88z"/>
      </svg>
    `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41],
});

// 🧭 Mapbox-powered search (business + place autocomplete)
function MapboxSearch({ mapboxToken, onSelect, setMarkerPosition }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const searchDiv = L.DomUtil.create("div", "mapbox-search-control");
    const input = L.DomUtil.create("input", "", searchDiv);
    const resultsDiv = L.DomUtil.create("div", "search-results", searchDiv);

    input.type = "text";
    input.placeholder = "Search business, restaurant, or address...";
    input.style.cssText =
      "position:absolute; top:10px; left:50px; z-index:1000; width:280px; padding:8px 10px; border:1px solid #ccc; border-radius:8px; box-shadow:0 2px 6px rgba(0,0,0,0.1); background:white; font-size:14px;";
    resultsDiv.style.cssText =
      "position:absolute; top:45px; left:50px; z-index:1001; width:280px; background:white; border:1px solid #ddd; border-radius:6px; box-shadow:0 2px 8px rgba(0,0,0,0.15); max-height:200px; overflow-y:auto; display:none;";

    L.DomEvent.disableClickPropagation(searchDiv);
    L.DomEvent.disableScrollPropagation(searchDiv);
    map.getContainer().appendChild(searchDiv);

    // 🔍 Handle input
    const handleInput = async () => {
      const query = input.value.trim();
      if (!query) {
        resultsDiv.style.display = "none";
        resultsDiv.innerHTML = "";
        return;
      }

      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query
      )}.json?access_token=${mapboxToken}&autocomplete=true&limit=7&types=poi,place,address,locality&country=in`;

      try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.features?.length > 0) {
          resultsDiv.style.display = "block";
          resultsDiv.innerHTML = "";

          data.features.forEach((f) => {
            const item = document.createElement("div");
            item.textContent = f.place_name;
            item.style.cssText =
              "padding:8px 10px; cursor:pointer; border-bottom:1px solid #eee; font-size:13px; line-height:1.4;";
            item.addEventListener("mouseover", () => (item.style.background = "#f5f5f5"));
            item.addEventListener("mouseout", () => (item.style.background = "white"));
            item.addEventListener("click", () => {
              const [lng, lat] = f.center;
              map.setView([lat, lng], 15);
              setMarkerPosition({ lat, lng }); // ✅ Update marker globally
              onSelect({ lat, lng, name: f.place_name });
              input.value = f.place_name;
              resultsDiv.style.display = "none";
            });
            resultsDiv.appendChild(item);
          });
        } else {
          resultsDiv.style.display = "none";
        }
      } catch (err) {
        console.error("Mapbox autocomplete error:", err);
      }
    };

    input.addEventListener("input", handleInput);
    input.addEventListener("focus", handleInput);
    input.addEventListener("blur", () => {
      setTimeout(() => (resultsDiv.style.display = "none"), 200);
    });

    return () => {
      input.removeEventListener("input", handleInput);
      map.getContainer().removeChild(searchDiv);
    };
  }, [map, mapboxToken, onSelect, setMarkerPosition]);

  return null;
}

// 📍 Marker on map click
function LocationMarker({ icon, onSelect, setMarkerPosition }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setMarkerPosition({ lat, lng }); // ✅ Update marker globally
      onSelect(e.latlng);
    },
  });

  return null;
}

// 🌍 Main map
export default function LocationPicker({ onLocationSelect }) {
  const mapboxToken =
    "pk.eyJ1IjoiYWoxODE4MTgiLCJhIjoiY21mb3owOXRiMGJ1MTJrc2Z4dHVpdGNneSJ9.MhXMnGKgPp_NuRrksweolw";

  const [markerPosition, setMarkerPosition] = useState(null);

  return (
    <div className="h-100 w-full rounded-lg overflow-hidden border border-gray-300 shadow-sm relative">
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/">OSM</a>'
        />
        <MapboxSearch
          mapboxToken={mapboxToken}
          onSelect={onLocationSelect}
          setMarkerPosition={setMarkerPosition}
        />
        <LocationMarker
          icon={orangeIcon}
          onSelect={onLocationSelect}
          setMarkerPosition={setMarkerPosition}
        />
        {markerPosition && <Marker position={markerPosition} icon={orangeIcon} />}
      </MapContainer>
    </div>
  );
}
