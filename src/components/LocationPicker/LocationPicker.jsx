// import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import { useState, useEffect } from "react";
// import { MAP_TOKEN } from "../../config/Config";

// // 🎨 Custom orange marker icon
// const orangeIcon = new L.Icon({
//   iconUrl:
//     "data:image/svg+xml;base64," +
//     btoa(`
//       <svg xmlns="http://www.w3.org/2000/svg" width="32" height="48" viewBox="0 0 384 512">
//         <path fill="#F9832B" d="M168 0C75.1 0 0 75.1 0 168c0 87 141.3 309.4 152.2 327.1a24 24 0 0 0 39.6 0C210.7 477.4 352 255 352 168 352 75.1 276.9 0 184 0zM184 256a88 88 0 1 1 88-88 88 88 0 0 1-88 88z"/>
//       </svg>
//     `),
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
//   popupAnchor: [1, -34],
//   shadowUrl:
//     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
//   shadowSize: [41, 41],
// });

// // 🧭 Google Maps Places API powered search
// function GooglePlacesSearch({ googleApiKey, onSelect, setMarkerPosition }) {
//   const map = useMap();

//   useEffect(() => {
//     if (!map) return;

//     const searchDiv = L.DomUtil.create("div", "google-search-control");
//     const input = L.DomUtil.create("input", "", searchDiv);
//     const resultsDiv = L.DomUtil.create("div", "search-results", searchDiv);

//     input.type = "text";
//     input.placeholder = "Search business, restaurant, or address...";
//     input.style.cssText =
//       "position:absolute; top:12px; left:12px; right:12px; z-index:1000; padding:12px 14px; border:1px solid #ccc; border-radius:10px; box-shadow:0 2px 6px rgba(0,0,0,0.15); background:white; font-size:15px; outline:none; transition:0.2s;";

//     input.addEventListener("focus", () => {
//       input.style.borderColor = "#F9832B";
//       input.style.boxShadow = "0 0 4px #F9832B";
//     });

//     input.addEventListener("blur", () => {
//       input.style.borderColor = "#ccc";
//       input.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
//     });

//     resultsDiv.style.cssText =
//       "position:absolute; top:58px; left:12px; right:12px; z-index:1001; background:white; border:1px solid #ddd; border-radius:10px; box-shadow:0 3px 10px rgba(0,0,0,0.18); max-height:260px; overflow-y:auto; display:none;";

//     L.DomEvent.disableClickPropagation(searchDiv);
//     L.DomEvent.disableScrollPropagation(searchDiv);
//     map.getContainer().appendChild(searchDiv);

//     let sessionToken = null;

//     // 🔍 Handle input with Google Places Autocomplete
//     const handleInput = async () => {
//       const query = input.value.trim();
//       if (!query) {
//         resultsDiv.style.display = "none";
//         resultsDiv.innerHTML = "";
//         return;
//       }

//       // Create new session token if not exists
//       if (!sessionToken) {
//         sessionToken = Math.random().toString(36).substring(7);
//       }

//       // Get map center for location bias
//       const center = map.getCenter();
      
//       const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
//         query
//       )}&key=${googleApiKey}&sessiontoken=${sessionToken}&components=country:in&location=${center.lat},${center.lng}&radius=50000`;

//       try {
//         // Note: Direct API calls from browser will fail due to CORS
//         // Using Places Autocomplete Service through proxy or library
//         const service = new window.google.maps.places.AutocompleteService();
//         const request = {
//           input: query,
//           componentRestrictions: { country: 'in' },
//           location: new window.google.maps.LatLng(center.lat, center.lng),
//           radius: 50000
//         };

//         service.getPlacePredictions(request, (predictions, status) => {
//           if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
//             resultsDiv.style.display = "block";
//             resultsDiv.innerHTML = "";

//             predictions.forEach((prediction) => {
//               const item = document.createElement("div");
//               item.textContent = prediction.description;
//               item.style.cssText =
//                 "padding:8px 10px; cursor:pointer; border-bottom:1px solid #eee; font-size:13px; line-height:1.4;";
//               item.addEventListener("mouseover", () => (item.style.background = "#f5f5f5"));
//               item.addEventListener("mouseout", () => (item.style.background = "white"));
//               item.addEventListener("click", () => {
//                 // Get place details to retrieve coordinates
//                 const placesService = new window.google.maps.places.PlacesService(
//                   document.createElement('div')
//                 );
                
//                 placesService.getDetails(
//                   { placeId: prediction.place_id },
//                   (place, detailStatus) => {
//                     if (detailStatus === window.google.maps.places.PlacesServiceStatus.OK) {
//                       const lat = place.geometry.location.lat();
//                       const lng = place.geometry.location.lng();
                      
//                       map.setView([lat, lng], 15);
//                       setMarkerPosition({ lat, lng });
                      
//                       // Parse address components
//                       const addressData = parseGoogleAddressComponents(place);
                      
//                       onSelect({
//                         lat,
//                         lng,
//                         address: place.formatted_address,
//                         streetAddress: addressData.streetAddress,
//                         city: addressData.city,
//                         state: addressData.state,
//                         postalCode: addressData.postalCode
//                       });
                      
//                       input.value = place.formatted_address;
//                       resultsDiv.style.display = "none";
//                       sessionToken = null; // Reset session token
//                     }
//                   }
//                 );
//               });
//               resultsDiv.appendChild(item);
//             });
//           } else {
//             resultsDiv.style.display = "none";
//           }
//         });
//       } catch (err) {
//         console.error("Google Places autocomplete error:", err);
//       }
//     };

//     input.addEventListener("input", handleInput);
//     input.addEventListener("focus", handleInput);
//     input.addEventListener("blur", () => {
//       setTimeout(() => (resultsDiv.style.display = "none"), 200);
//     });

//     return () => {
//       input.removeEventListener("input", handleInput);
//       map.getContainer().removeChild(searchDiv);
//     };
//   }, [map, googleApiKey, onSelect, setMarkerPosition]);

//   return null;
// }

// // Helper function to parse Google address components
// const parseGoogleAddressComponents = (place) => {
//   let streetAddress = "";
//   let city = "";
//   let state = "";
//   let postalCode = "";

//   if (place.address_components) {
//     place.address_components.forEach((component) => {
//       const types = component.types;
      
//       if (types.includes("street_number")) {
//         streetAddress = component.long_name + " ";
//       }
//       if (types.includes("route")) {
//         streetAddress += component.long_name;
//       }
//       if (types.includes("locality")) {
//         city = component.long_name;
//       }
//       if (types.includes("administrative_area_level_1")) {
//         state = component.long_name;
//       }
//       if (types.includes("postal_code")) {
//         postalCode = component.long_name;
//       }
//     });
//   }

//   // If street address is empty, use the name of the place
//   if (!streetAddress && place.name) {
//     streetAddress = place.name;
//   }

//   return {
//     streetAddress: streetAddress.trim() || place.name || "",
//     city,
//     state,
//     postalCode
//   };
// };

// // 📍 Marker on map click with reverse geocoding using Google
// function LocationMarker({ icon, onSelect, setMarkerPosition, googleApiKey }) {
//   useMapEvents({
//     async click(e) {
//       const { lat, lng } = e.latlng;
//       setMarkerPosition({ lat, lng });

//       // Perform reverse geocoding using Google Geocoding API
//       try {
//         const geocoder = new window.google.maps.Geocoder();
//         const latlng = new window.google.maps.LatLng(lat, lng);

//         geocoder.geocode({ location: latlng }, (results, status) => {
//           if (status === window.google.maps.GeocoderStatus.OK && results[0]) {
//             const addressData = parseGoogleAddressComponents(results[0]);
            
//             onSelect({
//               lat,
//               lng,
//               address: results[0].formatted_address,
//               streetAddress: addressData.streetAddress,
//               city: addressData.city,
//               state: addressData.state,
//               postalCode: addressData.postalCode
//             });
//           } else {
//             onSelect({ lat, lng, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` });
//           }
//         });
//       } catch (err) {
//         console.error("Reverse geocoding error:", err);
//         onSelect({ lat, lng, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` });
//       }
//     },
//   });

//   return null;
// }

// // 🌍 Main map component
// export default function LocationPicker({ onLocationSelect, defaultLocation, defaultAddress }) {
//   const googleApiKey = MAP_TOKEN; // Your Google Maps API key
//   const [markerPosition, setMarkerPosition] = useState(defaultLocation || null);
//   const [currentAddress, setCurrentAddress] = useState(defaultAddress || "");
//   const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

//   // Load Google Maps JavaScript API
//   useEffect(() => {
//     if (window.google && window.google.maps) {
//       setIsGoogleLoaded(true);
//       return;
//     }

//     const script = document.createElement('script');
//     script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places`;
//     script.async = true;
//     script.defer = true;
//     script.onload = () => setIsGoogleLoaded(true);
//     script.onerror = () => console.error("Failed to load Google Maps API");
//     document.head.appendChild(script);

//     return () => {
//       // Cleanup if needed
//     };
//   }, [googleApiKey]);

//   // Reverse geocode on mount if defaultLocation exists but no defaultAddress
//   useEffect(() => {
//     const fetchInitialAddress = async () => {
//       if (defaultLocation && !defaultAddress && isGoogleLoaded) {
//         try {
//           const geocoder = new window.google.maps.Geocoder();
//           const latlng = new window.google.maps.LatLng(defaultLocation.lat, defaultLocation.lng);

//           geocoder.geocode({ location: latlng }, (results, status) => {
//             if (status === window.google.maps.GeocoderStatus.OK && results[0]) {
//               const address = results[0].formatted_address;
//               setCurrentAddress(address);
//               onLocationSelect({ ...defaultLocation, address });
//             }
//           });
//         } catch (err) {
//           console.error("Initial reverse geocoding error:", err);
//         }
//       }
//     };

//     fetchInitialAddress();
//   }, [defaultLocation, defaultAddress, isGoogleLoaded, onLocationSelect]);

//   const handleLocationSelect = (locationData) => {
//     setCurrentAddress(locationData.address || "");
//     onLocationSelect(locationData);
//   };

//   if (!isGoogleLoaded) {
//     return (
//       <div className="h-100 w-full rounded-lg overflow-hidden border border-gray-300 shadow-sm flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading map...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="h-100 w-full rounded-lg overflow-hidden border border-gray-300 shadow-sm relative">
//       <MapContainer
//         center={defaultLocation ? [defaultLocation.lat, defaultLocation.lng] : [20.5937, 78.9629]}
//         zoom={defaultLocation ? 15 : 5}
//         style={{ height: "100%", width: "100%" }}
//       >
//         <TileLayer
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           attribution='© <a href="https://www.openstreetmap.org/">OSM</a>'
//         />
//         <GooglePlacesSearch
//           googleApiKey={googleApiKey}
//           onSelect={handleLocationSelect}
//           setMarkerPosition={setMarkerPosition}
//         />
//         <LocationMarker
//           icon={orangeIcon}
//           onSelect={handleLocationSelect}
//           setMarkerPosition={setMarkerPosition}
//           googleApiKey={googleApiKey}
//         />
//         {markerPosition && (
//           <Marker position={markerPosition} icon={orangeIcon}>
//             <Popup>
//               {currentAddress || "Address not available"}
//             </Popup>
//           </Marker>
//         )}
//       </MapContainer>
//     </div>
//   );
// }


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