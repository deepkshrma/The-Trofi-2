import React, { useContext, useEffect, useState } from "react";
import { Star, Phone, MapPin, Clock, Utensils } from "lucide-react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { LayoutContext } from "../../Layout/Layout";
import banner1 from "../../assets/images/banner1.jpg";
import banner2 from "../../assets/images/banner2.jpg";
import banner3 from "../../assets/images/banner3.jpg";
import profileImg from "../../assets/images/profileImg.jpg";
import profileImg1 from "../../assets/images/profileImg1.jpg";
import profileImg2 from "../../assets/images/profileImg2.jpg";
import bannerLogo from "../../assets/images/bannerLogo.png";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../config/Config";
import AVATAR_PLACEHOLDER from "../../assets/images/guest.png";
import PLACEHOLDER_IMG from "../../assets/images/logo.jpg";

const IMAGE_URL = "http://trofi-backend.apponedemo.top";

function RestroProfile() {
  const { isToggle } = useContext(LayoutContext);
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  const banners = [banner1, banner2, banner3];

  const [restaurant, setRestaurant] = useState([]);

  let token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YzgwNDA2ODllOTM1NWZmYWVjMmE4MyIsImVtYWlsIjoid2VsQGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzU3OTM4Njk0LCJleHAiOjE3NTg1NDM0OTR9.pof-vPOVslMGk7Fbz5x5QGBVibvvSBjiKFR5g74wUVM";

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/restro/get-restaurant/${id}`, {
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
  }, [id]);

  function getImageUrl(src) {
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
      const cleaned = trimmed.replace(/^\/+/, "");
      return `${IMAGE_URL}/${cleaned}`;
    }
    return PLACEHOLDER_IMG;
  }

  function formatPrice(price) {
    if (price == null || price === "") return "—";
    if (typeof price === "number") return `₹${price}`;
    return price.toString().startsWith("₹") ? price : `₹${price}`;
  }

  function renderAmenityItem(amenity, idx) {
    if (!amenity) return null;
    if (typeof amenity === "string") {
      return (
        <li
          key={idx}
          className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm"
        >
          <span className="w-2 h-2 bg-[#F9832B] rounded-full"></span>
          <span className="text-gray-700">{amenity}</span>
        </li>
      );
    }
    if (typeof amenity === "object") {
      const name =
        amenity.amenity_name ||
        amenity.name ||
        amenity.title ||
        JSON.stringify(amenity);
      const icon = amenity.amenity_icon || amenity.icon || amenity.image;
      return (
        <li
          key={amenity._id || idx}
          className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm"
        >
          {icon ? (
            <img
              src={getImageUrl(icon)}
              alt={name}
              className="w-5 h-5 rounded"
            />
          ) : (
            <span className="w-2 h-2 bg-[#F9832B] rounded-full"></span>
          )}
          <span className="text-gray-700">{name}</span>
        </li>
      );
    }
    return null;
  }

  const lat = Number(restaurant.latitude ?? restaurant.lat ?? 0);
  const lng = Number(restaurant.longitude ?? restaurant.lng ?? 0);
  const hasLocation =
    !Number.isNaN(lat) && !Number.isNaN(lng) && lat !== 0 && lng !== 0;

  if (loading) {
    return <div className="p-6 text-gray-600">Loading...</div>;
  }

  if (!restaurant) {
    return <div className="p-6 text-red-500">Restaurant not found</div>;
  }

  function FixMapSize() {
    const map = useMap();
    useEffect(() => {
      setTimeout(() => {
        map.invalidateSize();
      }, 1000);
    }, [map]);
    return null;
  }

  const bannerImages = Array.isArray(restaurant.restaurant_images)
    ? restaurant.restaurant_images
    : Array.isArray(restaurant.images)
    ? restaurant.images
    : [];

  const menuImagesRaw = Array.isArray(restaurant.restaurant_menu_images)
    ? restaurant.restaurant_menu_images
    : Array.isArray(restaurant.menu)
    ? restaurant.menu
    : [];

  const amenitiesRaw =
    restaurant.amenities ??
    restaurant.amenities_list ??
    restaurant.facilities ??
    null;

  const longDescription =
    restaurant.long_description ||
    restaurant.longDesc ||
    restaurant.description ||
    restaurant.shortDesc ||
    "";

  return (
    <div
      className={`w-[100%] pt-[1.5rem] pb-[1rem] ${
        isToggle ? "pl-[19.3rem]" : ""
      } duration-900 min-h-screen `}
    >
      {/* Banner Carousel */}
      <div className="relative w-full h-100">
        <Carousel
          autoPlay
          infiniteLoop
          showThumbs={false}
          showStatus={false}
          interval={4000}
        >
          {bannerImages.length > 0 ? (
            bannerImages.map((img, i) => {
              // img can be string or object
              const imgPath =
                typeof img === "string"
                  ? img
                  : img.image || img.url || img.path || img.src || "";
              const src = getImageUrl(imgPath);
              return (
                <div key={i} className="relative">
                  <img
                    src={src}
                    alt={`Banner-${i}`}
                    className="w-full h-100 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 bg-opacity-30 z-0"></div>
                </div>
              );
            })
          ) : (
            <div className="bg-gray-200 h-64 flex items-center justify-center">
              No Images
            </div>
          )}
        </Carousel>

        {/* Logo, Name & Rating */}
        <div className="absolute bottom-4 left-6 flex items-center gap-4 z-[1]">
          <img
            src={getImageUrl(restaurant.logo)}
            alt="Logo"
            className="w-20 h-20 rounded-full shadow-md border-4 border-white"
            onError={(e) => (e.currentTarget.src = AVATAR_PLACEHOLDER)}
          />
          <div className="text-white">
            <h1 className="text-2xl font-bold">
              {restaurant.restro_name || restaurant.name}
            </h1>
            <p className="text-sm">
              {restaurant.description || restaurant.shortDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Restaurant Details */}
      <div className="p-6 space-y-6">
        <div className="bg-white p-5 rounded-xl shadow-md">
          <h2 className="text-lg font-bold text-gray-800 mb-3">
            About {restaurant.restro_name || restaurant.name}
          </h2>
          <p className="text-gray-600">{longDescription}</p>

          <div className="mt-4 grid sm:grid-cols-2 gap-4 text-gray-700">
            <p className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#F9832B]" />{" "}
              {restaurant.address || restaurant.location || "N/A"}
            </p>

            <p className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#F9832B]" />{" "}
              {restaurant.city || "N/A"}, {restaurant.state || "N/A"}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#F9832B]" />{" "}
              {restaurant.postalCode || "N/A"}
            </p>

            <p className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-[#F9832B]" />{" "}
              {(restaurant.country_code ? `${restaurant.country_code} ` : "") +
                (restaurant.phone || "N/A")}
            </p>
            <p className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-[#F9832B]" />{" "}
              {Array.isArray(restaurant.food_type)
                ? restaurant.food_type.join(", ")
                : restaurant.food_type || "N/A"}
            </p>
            <p className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#F9832B]" />{" "}
              {restaurant.time || "N/A"}
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md mt-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">
            Status Information
          </h2>
          <div className="grid sm:grid-cols-3 gap-4 text-gray-700">
            <p className="flex items-center gap-2">
              <Star className="w-5 h-5 text-[#F9832B]" /> Status:{" "}
              {restaurant.account_status || "N/A"}
            </p>
            <p className="flex items-center gap-2">
              <Star className="w-5 h-5 text-[#F9832B]" /> Hygiene:{" "}
              {restaurant.hygiene_status || "N/A"}
            </p>
            <p className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#F9832B]" /> Working Days:{" "}
              {restaurant.days || "N/A"}
            </p>
          </div>
        </div>

        {/* Amenities */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Amenities</h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.isArray(amenitiesRaw) && amenitiesRaw.length > 0 ? (
              amenitiesRaw.map((amenity, idx) =>
                renderAmenityItem(amenity, idx)
              )
            ) : typeof amenitiesRaw === "string" &&
              amenitiesRaw.trim().length > 0 ? (
              // try to split comma separated string
              amenitiesRaw.split(",").map((a, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm"
                >
                  <span className="w-2 h-2 bg-[#F9832B] rounded-full"></span>
                  <span className="text-gray-700">{a.trim()}</span>
                </li>
              ))
            ) : (
              <div className="text-gray-400 italic">No amenities</div>
            )}
          </ul>
        </div>

        {/* Top Dishes Section */}
        {Array.isArray(restaurant.top_dishes) &&
          restaurant.top_dishes.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Top Dishes
              </h2>
              <div className="bg-white rounded-xl shadow-md p-5">
                <ul className="divide-y divide-gray-200">
                  {restaurant.top_dishes.map((dish, i) => (
                    <li
                      key={dish._id || dish.id || i}
                      className="flex justify-between items-center py-3"
                    >
                      <span className="text-gray-700 font-medium">
                        {dish.name || dish.dish_name || "Untitled"}
                      </span>
                      <span className="text-[#F9832B] font-bold">
                        {formatPrice(dish.price)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

        {/* Menu Section */}
        {Array.isArray(menuImagesRaw) && menuImagesRaw.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Our Menu</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {menuImagesRaw.map((menu, i) => {
                const menuImg =
                  typeof menu === "string"
                    ? menu
                    : menu.image || menu.url || menu.path || menu.src || "";
                const src = getImageUrl(menuImg);
                return (
                  <div
                    key={i}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-3"
                  >
                    <img
                      src={src}
                      alt={`Menu-${i}`}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <div className="mt-3">
                      {/* If menu items have name/price fields, you may show them here */}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end text-blue-500 mt-5">
              <Link to="" className="link">
                View all
              </Link>
            </div>
          </div>
        )}

        {/* Map Section */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Location</h2>
          <div className="w-full h-72 bg-white p-1 rounded-xl overflow-hidden shadow-md">
            {hasLocation ? (
              <MapContainer
                center={[lat, lng]}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[lat, lng]}>
                  <Popup>
                    {restaurant.restro_name || restaurant.name} -{" "}
                    {restaurant.address}
                  </Popup>
                </Marker>
                <FixMapSize />
              </MapContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-500">
                Location not available
              </div>
            )}
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md mt-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">
            Additional Info
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 text-gray-700">
            <p className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#F9832B]" /> Last Menu Update:{" "}
              {restaurant.lastMenuUpdated
                ? new Date(restaurant.lastMenuUpdated).toLocaleDateString()
                : "N/A"}
            </p>
            <p className="flex items-center gap-2">
              <Star className="w-5 h-5 text-[#F9832B]" /> Avg Rating:{" "}
              {restaurant.avgRating || "N/A"} / 5
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RestroProfile;
