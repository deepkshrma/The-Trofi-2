import { MapContainer, TileLayer, Marker,Popup, useMapEvents, useMap } from "react-leaflet";
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
      "position:absolute; top:12px; left:12px; right:12px; z-index:1000; padding:12px 14px; border:1px solid #ccc; border-radius:10px; box-shadow:0 2px 6px rgba(0,0,0,0.15); background:white; font-size:15px; outline:none; transition:0.2s;";


    input.addEventListener("focus", () => {
      input.style.borderColor = "#F9832B";
      input.style.boxShadow = "0 0 4px #F9832B";
    });

    input.addEventListener("blur", () => {
      input.style.borderColor = "#ccc";
      input.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
    });

    resultsDiv.style.cssText =
      "position:absolute; top:58px; left:12px; right:12px; z-index:1001; background:white; border:1px solid #ddd; border-radius:10px; box-shadow:0 3px 10px rgba(0,0,0,0.18); max-height:260px; overflow-y:auto; display:none;";



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
              onSelect({ lat, lng, address: f.place_name });
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

// 📍 Marker on map click with reverse geocoding
function LocationMarker({ icon, onSelect, setMarkerPosition, mapboxToken }) {
  // Helper function to extract address components
  const parseAddressComponents = (features) => {
    if (!features || features.length === 0) return null;

    let city = "";
    let state = "";
    let postalCode = "";
    let fullAddress = features[0]?.place_name || "";

    // Parse context array for address components
    features[0]?.context?.forEach((item) => {
      if (item.id.includes("postcode")) {
        postalCode = item.text;
      } else if (item.id.includes("place")) {
        city = item.text;
      } else if (item.id.includes("region")) {
        state = item.text;
      }
    });

    // If city not found in context, check if the feature itself is a place
    if (!city && features[0]?.place_type?.includes("place")) {
      city = features[0]?.text;
    }

    // Extract street address (first part before the first comma)
    const addressParts = fullAddress.split(",");
    const streetAddress = addressParts[0]?.trim() || fullAddress;

    return {
      fullAddress,
      streetAddress,
      city,
      state,
      postalCode,
    };
  };

  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      setMarkerPosition({ lat, lng });

      // Perform reverse geocoding to get address
      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}`;
        const res = await fetch(url);
        const data = await res.json();

        const addressData = parseAddressComponents(data.features);

        if (addressData) {
          onSelect({
            lat,
            lng,
            address: addressData.fullAddress,
            streetAddress: addressData.streetAddress,
            city: addressData.city,
            state: addressData.state,
            postalCode: addressData.postalCode,
          });
        } else {
          onSelect({ lat, lng, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` });
        }
      } catch (err) {
        console.error("Reverse geocoding error:", err);
        onSelect({ lat, lng, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` });
      }
    },
  });

  return null;
}

// 🌍 Main map
export default function LocationPicker({ onLocationSelect, defaultLocation, defaultAddress }) {
  const mapboxToken = MAP_TOKEN;
  const [markerPosition, setMarkerPosition] = useState(defaultLocation || null);
  const [currentAddress, setCurrentAddress] = useState(defaultAddress || "");

  // Reverse geocode on mount if defaultLocation exists but no defaultAddress
  useEffect(() => {
    const fetchInitialAddress = async () => {
      if (defaultLocation && !defaultAddress) {
        try {
          const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${defaultLocation.lng},${defaultLocation.lat}.json?access_token=${mapboxToken}&types=poi,place,address,locality`;
          const res = await fetch(url);
          const data = await res.json();
          const address = data.features?.[0]?.place_name || "";
          setCurrentAddress(address);
          onLocationSelect({ ...defaultLocation, address });
        } catch (err) {
          console.error("Initial reverse geocoding error:", err);
        }
      }
    };

    fetchInitialAddress();
  }, [defaultLocation, defaultAddress, mapboxToken, onLocationSelect]);

  const handleLocationSelect = (locationData) => {
    setCurrentAddress(locationData.address || "");
    onLocationSelect(locationData);
  };

  return (
    <div className="h-100 w-full rounded-lg overflow-hidden border border-gray-300 shadow-sm relative">
      <MapContainer
        center={defaultLocation ? [defaultLocation.lat, defaultLocation.lng] : [20.5937, 78.9629]}
        zoom={defaultLocation ? 15 : 5}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/">OSM</a>'
        />
        <MapboxSearch
          mapboxToken={mapboxToken}
          onSelect={handleLocationSelect}
          setMarkerPosition={setMarkerPosition}
        />
        <LocationMarker
          icon={orangeIcon}
          onSelect={handleLocationSelect}
          setMarkerPosition={setMarkerPosition}
          mapboxToken={mapboxToken}
        />
        {markerPosition && (
          <Marker position={markerPosition} icon={orangeIcon}>
            <Popup>
              {currentAddress || "Address not available"}
            </Popup>
          </Marker>
        )}

      </MapContainer>
    </div>
  );
}