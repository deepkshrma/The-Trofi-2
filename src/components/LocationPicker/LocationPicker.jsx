import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import { MAP_TOKEN } from "../../config/Config";

// 🎨 Custom orange marker icon
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

// 🧭 Google Places Autocomplete + Text Search (No CORS issues!)
function GooglePlacesSearch({ googleApiKey, onSelect, setMarkerPosition, isGoogleLoaded }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !isGoogleLoaded) return;

    const searchDiv = L.DomUtil.create("div", "google-search-control");
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
      "position:absolute; top:58px; left:12px; right:12px; z-index:1001; background:white; border:1px solid #ddd; border-radius:10px; box-shadow:0 3px 10px rgba(0,0,0,0.18); max-height:320px; overflow-y:auto; display:none;";

    L.DomEvent.disableClickPropagation(searchDiv);
    L.DomEvent.disableScrollPropagation(searchDiv);
    map.getContainer().appendChild(searchDiv);

    let searchTimeout = null;

    // Initialize Google Places services
    const autocompleteService = new window.google.maps.places.AutocompleteService();
    const placesService = new window.google.maps.places.PlacesService(
      document.createElement('div')
    );

    // 🔍 Handle input with Google Places Autocomplete + Text Search
    const handleInput = () => {
      const query = input.value.trim();
      if (!query) {
        resultsDiv.style.display = "none";
        resultsDiv.innerHTML = "";
        return;
      }

      // Clear previous timeout
      if (searchTimeout) clearTimeout(searchTimeout);

      // Show loading
      resultsDiv.style.display = "block";
      resultsDiv.innerHTML = '<div style="padding:12px; text-align:center; color:#999;">🔍 Searching...</div>';

      // Debounce search
      searchTimeout = setTimeout(() => {
        const center = map.getCenter();

        // Use Autocomplete for suggestions
        autocompleteService.getPlacePredictions(
          {
            input: query,
            componentRestrictions: { country: 'in' },
            location: new window.google.maps.LatLng(center.lat, center.lng),
            radius: 50000,
            types: ['establishment', 'geocode'] // Include businesses and addresses
          },
          (predictions, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
              resultsDiv.innerHTML = "";

              predictions.forEach((prediction) => {
                const item = document.createElement("div");

                // Create place info with icon
                const iconSpan = document.createElement("span");
                iconSpan.textContent = "📍 ";
                iconSpan.style.marginRight = "8px";

                const textDiv = document.createElement("div");
                textDiv.style.flex = "1";

                const nameDiv = document.createElement("div");
                nameDiv.textContent = prediction.structured_formatting.main_text;
                nameDiv.style.fontWeight = "500";
                nameDiv.style.fontSize = "14px";

                const addressDiv = document.createElement("div");
                addressDiv.textContent = prediction.structured_formatting.secondary_text || "";
                addressDiv.style.fontSize = "12px";
                addressDiv.style.color = "#666";
                addressDiv.style.marginTop = "2px";

                textDiv.appendChild(nameDiv);
                if (prediction.structured_formatting.secondary_text) {
                  textDiv.appendChild(addressDiv);
                }

                item.appendChild(iconSpan);
                item.appendChild(textDiv);

                item.style.cssText =
                  "display:flex; align-items:center; padding:10px 12px; cursor:pointer; border-bottom:1px solid #eee;";

                item.addEventListener("mouseover", () => (item.style.background = "#f5f5f5"));
                item.addEventListener("mouseout", () => (item.style.background = "white"));

                item.addEventListener("click", () => {
                  // Get place details to retrieve coordinates
                  placesService.getDetails(
                    {
                      placeId: prediction.place_id,
                      fields: ['name', 'formatted_address', 'geometry', 'address_components']
                    },
                    (place, detailStatus) => {
                      if (detailStatus === window.google.maps.places.PlacesServiceStatus.OK) {
                        const lat = place.geometry.location.lat();
                        const lng = place.geometry.location.lng();

                        map.setView([lat, lng], 16);
                        setMarkerPosition({ lat, lng });

                        // Parse address components
                        const addressData = parseGoogleAddressComponents(place);

                        onSelect({
                          lat,
                          lng,
                          address: place.formatted_address,
                          streetAddress: addressData.streetAddress,
                          city: addressData.city,
                          state: addressData.state,
                          postalCode: addressData.postalCode
                        });

                        input.value = place.formatted_address;
                        resultsDiv.style.display = "none";
                      } else {
                        console.error("Place details error:", detailStatus);
                        resultsDiv.innerHTML = '<div style="padding:10px; text-align:center; color:#f44336;">Could not get place details</div>';
                      }
                    }
                  );
                });

                resultsDiv.appendChild(item);
              });
            } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
              resultsDiv.innerHTML = '<div style="padding:12px; text-align:center; color:#999;">No results found</div>';
            } else {
              console.error("Autocomplete error:", status);
              resultsDiv.innerHTML = '<div style="padding:10px; text-align:center; color:#f44336;">Search error. Please try again.</div>';
            }
          }
        );
      }, 400); // 400ms debounce
    };

    input.addEventListener("input", handleInput);
    input.addEventListener("blur", () => {
      setTimeout(() => (resultsDiv.style.display = "none"), 250);
    });

    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
      input.removeEventListener("input", handleInput);
      map.getContainer().removeChild(searchDiv);
    };
  }, [map, googleApiKey, onSelect, setMarkerPosition, isGoogleLoaded]);

  return null;
}

// Helper function to parse Google address components
const parseGoogleAddressComponents = (place) => {
  let streetAddress = "";
  let city = "";
  let state = "";
  let postalCode = "";

  if (place.address_components) {
    place.address_components.forEach((component) => {
      const types = component.types;

      if (types.includes("street_number")) {
        streetAddress = component.long_name + " ";
      }
      if (types.includes("route")) {
        streetAddress += component.long_name;
      }
      if (types.includes("sublocality") || types.includes("sublocality_level_1")) {
        if (!city) city = component.long_name; // Use sublocality if locality not found
      }
      if (types.includes("locality")) {
        city = component.long_name;
      }
      if (types.includes("administrative_area_level_1")) {
        state = component.long_name;
      }
      if (types.includes("postal_code")) {
        postalCode = component.long_name;
      }
    });
  }

  // If street address is empty, use the name of the place
  if (!streetAddress && place.name) {
    streetAddress = place.name;
  }

  return {
    streetAddress: streetAddress.trim() || place.name || "",
    city,
    state,
    postalCode
  };
};

// 📍 Marker on map click with reverse geocoding
function LocationMarker({ icon, onSelect, setMarkerPosition, isGoogleLoaded }) {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      setMarkerPosition({ lat, lng });

      if (!isGoogleLoaded) {
        onSelect({
          lat,
          lng,
          address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          streetAddress: "",
          city: "",
          state: "",
          postalCode: ""
        });
        return;
      }

      // Perform reverse geocoding
      try {
        const geocoder = new window.google.maps.Geocoder();
        const latlng = new window.google.maps.LatLng(lat, lng);

        geocoder.geocode({ location: latlng }, (results, status) => {
          if (status === window.google.maps.GeocoderStatus.OK && results[0]) {
            const addressData = parseGoogleAddressComponents(results[0]);

            onSelect({
              lat,
              lng,
              address: results[0].formatted_address,
              streetAddress: addressData.streetAddress,
              city: addressData.city,
              state: addressData.state,
              postalCode: addressData.postalCode
            });
          } else {
            onSelect({
              lat,
              lng,
              address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
              streetAddress: "",
              city: "",
              state: "",
              postalCode: ""
            });
          }
        });
      } catch (err) {
        console.error("Reverse geocoding error:", err);
        onSelect({
          lat,
          lng,
          address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          streetAddress: "",
          city: "",
          state: "",
          postalCode: ""
        });
      }
    },
  });

  return null;
}

// 🌍 Main map component
export default function LocationPicker({ onLocationSelect, defaultLocation, defaultAddress }) {
  const googleApiKey = MAP_TOKEN;
  const [markerPosition, setMarkerPosition] = useState(defaultLocation || null);
  const [currentAddress, setCurrentAddress] = useState(defaultAddress || "");
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  // Load Google Maps JavaScript API
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      setIsGoogleLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log("✅ Google Maps API loaded successfully");
      setIsGoogleLoaded(true);
    };
    script.onerror = () => {
      console.error("❌ Failed to load Google Maps API");
      alert("Failed to load Google Maps. Please check your API key and internet connection.");
    };
    document.head.appendChild(script);
  }, [googleApiKey]);

  // Reverse geocode on mount if defaultLocation exists but no defaultAddress
  useEffect(() => {
    const fetchInitialAddress = async () => {
      if (defaultLocation && !defaultAddress && isGoogleLoaded) {
        try {
          const geocoder = new window.google.maps.Geocoder();
          const latlng = new window.google.maps.LatLng(defaultLocation.lat, defaultLocation.lng);

          geocoder.geocode({ location: latlng }, (results, status) => {
            if (status === window.google.maps.GeocoderStatus.OK && results[0]) {
              const address = results[0].formatted_address;
              const addressData = parseGoogleAddressComponents(results[0]);

              setCurrentAddress(address);
              onLocationSelect({
                ...defaultLocation,
                address,
                streetAddress: addressData.streetAddress,
                city: addressData.city,
                state: addressData.state,
                postalCode: addressData.postalCode
              });
            }
          });
        } catch (err) {
          console.error("Initial reverse geocoding error:", err);
        }
      }
    };

    fetchInitialAddress();
  }, [defaultLocation, defaultAddress, isGoogleLoaded]);

  const handleLocationSelect = (locationData) => {
    setCurrentAddress(locationData.address || "");
    onLocationSelect(locationData);
  };

  if (!isGoogleLoaded) {
    return (
      <div className="w-full rounded-lg overflow-hidden border border-gray-300 shadow-sm flex items-center justify-center bg-gray-50"
        style={{ height: "500px", minHeight: "400px" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Google Maps...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-300 shadow-sm relative"
      style={{ height: "500px", minHeight: "400px" }}>
      <MapContainer
        center={defaultLocation ? [defaultLocation.lat, defaultLocation.lng] : [26.9124, 75.7873]}
        zoom={defaultLocation ? 15 : 12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/">OSM</a>'
        />
        <GooglePlacesSearch
          googleApiKey={googleApiKey}
          onSelect={handleLocationSelect}
          setMarkerPosition={setMarkerPosition}
          isGoogleLoaded={isGoogleLoaded}
        />
        <LocationMarker
          icon={orangeIcon}
          onSelect={handleLocationSelect}
          setMarkerPosition={setMarkerPosition}
          isGoogleLoaded={isGoogleLoaded}
        />
        {markerPosition && (
          <Marker position={markerPosition} icon={orangeIcon}>
            <Popup>
              <div style={{ minWidth: "200px" }}>
                <strong style={{ display: "block", marginBottom: "4px" }}>📍 Selected Location</strong>
                <span style={{ fontSize: "13px", color: "#666" }}>
                  {currentAddress || "Address not available"}
                </span>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}