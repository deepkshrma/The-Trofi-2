import React, { useContext, useEffect, useState } from "react";
import { Star, Phone, MapPin, Clock, Utensils } from "lucide-react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { LayoutContext } from "../../Layout/Layout";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { BASE_URL, IMAGE_URL } from "../../config/Config";
import AVATAR_PLACEHOLDER from "../../assets/images/guest.png";
import PLACEHOLDER_IMG from "../../assets/images/logo.jpg";

function RestaurantProfile() {
  const { isToggle } = useContext(LayoutContext);
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState(null);

  const token = JSON.parse(localStorage.getItem("trofi_user"))?.token;
  if (!token) return <div>Please login first</div>;

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/restrowner/restrowner-restaurant`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRestaurant(res.data.data);
      } catch (error) {
        console.error("Error fetching restaurant:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurant();
  }, [token]);

  const getImageUrl = (src) => {
    if (!src) return PLACEHOLDER_IMG;
    if (typeof src === "object") {
      const candidate =
        src.image ||
        src.url ||
        src.path ||
        src.src ||
        src.amenity_icon ||
        src.icon;
      return getImageUrl(candidate);
    }
    if (typeof src === "string") {
      const trimmed = src.trim();
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return trimmed;
      }
      return `${IMAGE_URL}/${trimmed.replace(/^\/+/, "")}`;
    }
    return PLACEHOLDER_IMG;
  };

  const formatPrice = (price) => {
    if (price == null || price === "") return "—";
    if (typeof price === "number") return `₹${price}`;
    return price.toString().startsWith("₹") ? price : `₹${price}`;
  };

  const renderAmenityItem = (amenity, idx) => {
    if (!amenity) return null;
    const name = amenity.amenity_name || amenity.name || JSON.stringify(amenity);
    const icon = amenity.amenity_icon || amenity.icon || amenity.image;
    return (
      <li
        key={amenity._id || idx}
        className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm"
      >
        {icon ? (
          <img src={getImageUrl(icon)} alt={name} className="w-5 h-5 rounded" />
        ) : (
          <span className="w-2 h-2 bg-[#F9832B] rounded-full"></span>
        )}
        <span className="text-gray-700">{name}</span>
      </li>
    );
  };

  const FixMapSize = () => {
    const map = useMap();
    useEffect(() => {
      setTimeout(() => map.invalidateSize(), 1000);
    }, [map]);
    return null;
  };

  if (loading) return <div className="p-6 text-gray-600">Loading...</div>;
  if (!restaurant) return <div className="p-6 text-red-500">Restaurant not found</div>;

  const lat = Number(restaurant.latitude ?? 0);
  const lng = Number(restaurant.longitude ?? 0);
  const hasLocation = !Number.isNaN(lat) && !Number.isNaN(lng) && lat !== 0 && lng !== 0;

  const bannerImages = restaurant.restaurant_images || [];
  const menuImages = restaurant.restaurant_menu_images || [];
  const amenitiesRaw = restaurant.amenities || [];
  const longDescription = restaurant.long_description || restaurant.description || "";

  return (
    <div className={`w-[100%] pt-[1.5rem] pb-[1rem] ${isToggle ? "pl-[19.3rem]" : ""} duration-900 min-h-screen`}>
      {/* Banner Carousel */}
      <div className="relative w-full h-100">
        <Carousel autoPlay infiniteLoop showThumbs={false} showStatus={false} interval={4000}>
          {bannerImages.length > 0 ? (
            bannerImages.map((img, i) => {
              const src = getImageUrl(typeof img === "string" ? img : img.image || img.url || "");
              return (
                <div key={i} className="relative">
                  <img src={src} alt={`Banner-${i}`} className="w-full h-100 object-cover" />
                  <div className="absolute inset-0 bg-black/20 z-0"></div>
                </div>
              );
            })
          ) : (
            <div className="bg-gray-200 h-64 flex items-center justify-center">No Images</div>
          )}
        </Carousel>

        {/* Logo & Name */}
        <div className="absolute bottom-4 left-6 flex items-center gap-4 z-[1]">
          <img
            src={getImageUrl(restaurant.logo)}
            alt="Logo"
            className="w-20 h-20 rounded-full shadow-md border-4 border-white"
            onError={(e) => (e.currentTarget.src = AVATAR_PLACEHOLDER)}
          />
          <div className="text-white">
            <h1 className="text-2xl font-bold">{restaurant.restro_name}</h1>
            <p className="text-sm">{restaurant.description}</p>
          </div>
        </div>
      </div>

      {/* Restaurant Details */}
      <div className="p-6 space-y-6">
        {/* About */}
        <div className="bg-white p-5 rounded-xl shadow-md">
          <h2 className="text-lg font-bold text-gray-800 mb-3">About {restaurant.restro_name}</h2>
          <p className="text-gray-600">{longDescription}</p>

          <div className="mt-4 grid sm:grid-cols-2 gap-4 text-gray-700">
            <p className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#F9832B]" /> {restaurant.address || "N/A"}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#F9832B]" /> {restaurant.city || "N/A"}, {restaurant.state || "N/A"}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-[#F9832B]" /> {(restaurant.country_code ? `${restaurant.country_code} ` : "") + (restaurant.phone || "N/A")}
            </p>
            <p className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-[#F9832B]" /> {restaurant.food_type || "N/A"}
            </p>
            <p className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#F9832B]" /> {restaurant.time || "N/A"}
            </p>
          </div>
        </div>

        {/* Status Information */}
        <div className="bg-white p-5 rounded-xl shadow-md mt-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Status Information</h2>
          <div className="grid sm:grid-cols-3 gap-4 text-gray-700">
            <p className="flex items-center gap-2">
              <Star className="w-5 h-5 text-[#F9832B]" /> Status: {restaurant.account_status || "N/A"}
            </p>
            <p className="flex items-center gap-2">
              <Star className="w-5 h-5 text-[#F9832B]" /> Hygiene: {restaurant.hygiene_status || "N/A"}
            </p>
            <p className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#F9832B]" /> Working Days: {restaurant.days || "N/A"}
            </p>
          </div>
        </div>

        {/* Amenities */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Amenities</h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.isArray(amenitiesRaw) && amenitiesRaw.length > 0
              ? amenitiesRaw.map((amenity, idx) => renderAmenityItem(amenity, idx))
              : <div className="text-gray-400 italic">No amenities</div>}
          </ul>
        </div>

        {/* Dish Types */}
        {Array.isArray(restaurant.dish_type) && restaurant.dish_type.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Dish Types</h2>
            <div className="flex flex-wrap gap-3">
              {restaurant.dish_type.map((dish) => (
                <div key={dish._id} className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                  <img src={getImageUrl(dish.icon)} alt={dish.name} className="w-6 h-6 object-contain" />
                  <span className="text-gray-700">{dish.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Restaurant Type */}
        {Array.isArray(restaurant.restaurant_type) && restaurant.restaurant_type.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Restaurant Type</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {restaurant.restaurant_type.map((type) => (
                <div key={type._id} className="flex flex-col items-center bg-white p-4 rounded-lg shadow-sm">
                  <img src={getImageUrl(type.icon)} alt={type.name} className="w-10 h-10 object-contain mb-2" />
                  <span className="text-gray-700 font-medium">{type.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Good For */}
        {Array.isArray(restaurant.good_for) && restaurant.good_for.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Good For</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {restaurant.good_for.map((item) => (
                <div key={item._id} className="flex flex-col items-center bg-white p-4 rounded-lg shadow-sm">
                  <img src={getImageUrl(item.icon)} alt={item.name} className="w-10 h-10 object-contain mb-2" />
                  <span className="text-gray-700">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cuisines */}
        {Array.isArray(restaurant.cuisines) && restaurant.cuisines.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Cuisines</h2>
            <div className="flex flex-wrap gap-3">
              {restaurant.cuisines.map((cuisine) => (
                <span key={cuisine._id} className="px-4 py-2 bg-[#F9832B]/10 text-[#F9832B] rounded-full text-sm font-medium">
                  {cuisine.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Top Dishes */}
        {Array.isArray(restaurant.topDishes) && restaurant.topDishes.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Top Dishes</h2>
            <div className="bg-white rounded-xl shadow-md p-5">
              <ul className="divide-y divide-gray-200">
                {restaurant.topDishes.map((dish, i) => (
                  <li key={dish._id || i} className="flex justify-between items-center py-3">
                    <span className="text-gray-700 font-medium">{dish.dish_name || "Untitled"}</span>
                    <span className="text-[#F9832B] font-bold">{formatPrice(dish.price)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Menu Images */}
        {Array.isArray(menuImages) && menuImages.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Our Menu</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {menuImages.map((menu, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-3">
                  <img src={getImageUrl(menu)} alt={`Menu-${i}`} className="w-full h-40 object-cover rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Map */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Location</h2>
          <div className="w-full h-72 bg-white p-1 rounded-xl overflow-hidden shadow-md">
            {hasLocation ? (
              <MapContainer center={[lat, lng]} zoom={15} style={{ height: "100%", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[lat, lng]}>
                  <Popup>{restaurant.restro_name} - {restaurant.address}</Popup>
                </Marker>
                <FixMapSize />
              </MapContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-500">Location not available</div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white p-5 rounded-xl shadow-md mt-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Additional Info</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-gray-700">
            <p className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#F9832B]" /> Last Menu Update: {restaurant.lastMenuUpdated ? new Date(restaurant.lastMenuUpdated).toLocaleDateString() : "N/A"}
            </p>
            <p className="flex items-center gap-2">
              <Star className="w-5 h-5 text-[#F9832B]" /> Avg Rating: {restaurant.avgRating || "N/A"} / 5
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RestaurantProfile;
