// @ts-nocheck
import React, { useContext } from "react";
import { Star, Phone, MapPin, Clock, Utensils } from "lucide-react"; // extra icons
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
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function RestroProfile() {
  const { isToggle } = useContext(LayoutContext);

  // Sample banner images
  const banners = [banner1, banner2, banner3];

  // Restaurant Data
  const restaurant = {
    logo: bannerLogo,
    name: "Cafe Aroma",
    shortDesc: "Your cozy corner for Italian & Continental delights.",
    longDesc:
      "Cafe Aroma offers a warm and inviting atmosphere with a wide variety of freshly prepared Italian and Continental dishes. Whether you're here for a casual brunch, family dinner, or romantic evening, our menu and ambiance promise a delightful experience.",
    rating: 4.3,
    totalReviews: 128,
    address: "123 MG Road, Bangalore, Karnataka, India",
    phone: "+91 98765 43210",
    foodType: ["Italian", "Continental", "Bakery"],
    timing: "Mon - Sun: 10:00 AM - 11:00 PM",
    amenities: [
      "Free Wi-Fi",
      "Outdoor Seating",
      "Live Music",
      "Parking Available",
      "Wheelchair Accessible",
    ],
    topDishes: [
      { id: 1, name: "Tandoori Chicken", price: "₹450" },
      { id: 2, name: "Pasta Alfredo", price: "₹300" },
      { id: 3, name: "Chocolate Lava Cake", price: "₹200" },
    ],
    menus: [
      { id: 1, image: profileImg, name: "Margherita Pizza", price: "₹250" },
      { id: 2, image: profileImg1, name: "Pasta Alfredo", price: "₹300" },
      { id: 3, image: profileImg2, name: "Chocolate Cake", price: "₹150" },
    ],
  };

  return (
    <div
      className={`w-[100%] pt-[1.5rem] pb-[1rem] ${
        isToggle ? "pl-[19.3rem]" : ""
      } duration-900 min-h-screen bg-gray-50`}
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
          {banners.map((banner, i) => (
            <div key={i} className="relative">
              <img
                src={banner}
                alt={`Banner-${i}`}
                className="w-full h-100 object-cover"
              />
              <div className="absolute inset-0 bg-black/20 bg-opacity-30 z-0"></div>
            </div>
          ))}
        </Carousel>

        {/* Logo, Name & Rating */}
        <div className="absolute bottom-4 left-6 flex items-center gap-4 z-10">
          <img
            src={restaurant.logo}
            alt="Logo"
            className="w-20 h-20 rounded-full shadow-md border-4 border-white"
          />
          <div className="text-white">
            <h1 className="text-2xl font-bold">{restaurant.name}</h1>
            <p className="text-sm">{restaurant.shortDesc}</p>
            <div className="flex items-center gap-1">
              <Star className="text-yellow-400 w-5 h-5 fill-yellow-400" />
              <span className="font-medium">{restaurant.rating}</span>
              <span className="text-gray-200">
                ({restaurant.totalReviews} reviews)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurant Details */}
      <div className="p-6 space-y-6">
        <div className="bg-white p-5 rounded-xl shadow-md">
          <h2 className="text-lg font-bold text-gray-800 mb-3">
            About {restaurant.name}
          </h2>
          <p className="text-gray-600">{restaurant.longDesc}</p>

          <div className="mt-4 grid sm:grid-cols-2 gap-4 text-gray-700">
            <p className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#F9832B]" /> {restaurant.address}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-[#F9832B]" /> {restaurant.phone}
            </p>
            <p className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-[#F9832B]" />{" "}
              {restaurant.foodType.join(", ")}
            </p>
            <p className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#F9832B]" /> {restaurant.timing}
            </p>
          </div>
        </div>

        {/* Amenities */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Amenities</h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {restaurant.amenities.map((amenity, index) => (
              <li
                key={index}
                className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm"
              >
                <span className="w-2 h-2 bg-[#F9832B] rounded-full"></span>
                <span className="text-gray-700">{amenity}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Top Dishes Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Top Dishes</h2>
          <div className="bg-white rounded-xl shadow-md p-5">
            <ul className="divide-y divide-gray-200">
              {restaurant.topDishes.map((dish) => (
                <li
                  key={dish.id}
                  className="flex justify-between items-center py-3"
                >
                  <span className="text-gray-700 font-medium">{dish.name}</span>
                  <span className="text-[#F9832B] font-bold">{dish.price}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Menu Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Our Menu</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {restaurant.menus.map((menu) => (
              <div
                key={menu.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-3"
              >
                <img
                  src={menu.image}
                  alt={menu.name}
                  className="w-full h-40 object-cover rounded-lg"
                />
                <div className="mt-3">
                  <h3 className="text-lg font-semibold text-gray-700">
                    {menu.name}
                  </h3>
                  <p className="text-[#F9832B] font-bold">{menu.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map Section */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Location</h2>
          <div className="w-full h-72 rounded-xl overflow-hidden shadow-md">
            <MapContainer
              center={[12.9716, 77.5946]} // lat, lng (example: Bangalore)
              zoom={15}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[12.9716, 77.5946]}>
                <Popup>
                  {restaurant.name} - {restaurant.address}
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RestroProfile;
