import React, { useState } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import { PlusCircle, Upload, MapPin, Utensils } from "lucide-react";
import LocationPicker from "./LocationPicker";

function RestroAdd({ address, onChange }) {
  const [restaurantData, setRestaurantData] = useState({
    name: "",
    type: "",
    description: "",
    address: "",
    city: "",
    state: "",
    facilities: [],
    dishes: [],
    hygieneStatus: "",
    email: "",
    password: "",
    birthYear: "",
    openingTime: "",
    closingTime: "",
    openDays: [],
  });

  const [gallery, setGallery] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [menuFiles, setMenuFiles] = useState([]);

  const facilityOptions = ["Wi-Fi", "Parking", "AC", "Delivery"];

  const handleChange = (e) => {
    setRestaurantData({
      ...restaurantData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFacilityToggle = (facility) => {
    setRestaurantData((prev) => {
      const facilities = prev.facilities.includes(facility)
        ? prev.facilities.filter((f) => f !== facility)
        : [...prev.facilities, facility];
      return { ...prev, facilities };
    });
  };

  const handleDishAdd = () => {
    setRestaurantData({
      ...restaurantData,
      dishes: [
        ...restaurantData.dishes,
        {
          name: "",
          type: "Veg",
          spiceLevel: "Normal",
          price: "",
          image: null,
          available: true,
          lastUpdated: new Date().toLocaleDateString(),
        },
      ],
    });
  };

  return (
    <div className="main main_page p-6 min-h-screen  duration-900">
      <PageTitle title={"Add New Restaurant"} />

      {/*  Basic Info */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-200 mt-5">
        <h2
          className="text-xl font-semibold flex items-center gap-2 mb-4 border-b pb-2"
          style={{ color: "#F9832B" }}
        >
          <Utensils size={20} /> Basic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={restaurantData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] focus:border-[#F9832B] outline-none"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={restaurantData.password}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] focus:border-[#F9832B] outline-none"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Restaurant Name"
            value={restaurantData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] focus:border-[#F9832B] outline-none"
          />
          <input
            type="text"
            name="type"
            placeholder="Restaurant Type (e.g., Cafe, Bakery)"
            value={restaurantData.type}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] focus:border-[#F9832B] outline-none"
          />
        </div>
        <textarea
          name="description"
          placeholder="About the restaurant..."
          value={restaurantData.description}
          onChange={handleChange}
          className="w-full border border-gray-300 p-3 rounded-lg shadow-sm mt-4 focus:ring-2 focus:ring-[#F9832B] focus:border-[#F9832B] outline-none"
          rows="4"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 mb-6">
          {/* Profile Image */}
          <div>
            <label className="block mb-2 font-medium">
              Profile Image / Logo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfileImage(e.target.files[0])}
              className="w-full border border-gray-300 p-2 rounded-lg shadow-sm bg-gray-50"
            />
          </div>

          {/* Gallery */}
          <div>
            <label className="block mb-2 font-medium">Gallery Uploads</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) =>
                setGallery((prev) => [...prev, ...Array.from(e.target.files)])
              }
              className="w-full border border-gray-300 p-2 rounded-lg shadow-sm bg-gray-50"
            />

            {/* Preview selected images */}
            <div className="flex gap-3 flex-wrap mt-3">
              {gallery.map((img, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={URL.createObjectURL(img)}
                    alt={`gallery-${idx}`}
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() =>
                      setGallery((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 shadow-md"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Facilities */}
          <div>
            <h3 className="font-medium ">Facilities Available:</h3>
            <div className="flex gap-3 flex-wrap">
              {facilityOptions.map((facility) => {
                const isActive = restaurantData.facilities.includes(facility);
                return (
                  <button
                    key={facility}
                    type="button"
                    onClick={() => handleFacilityToggle(facility)}
                    className={`px-4 py-2 rounded-full text-sm font-medium shadow-sm transition 
        ${
          isActive
            ? "bg-[#F9832B] text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
                  >
                    {facility}
                  </button>
                );
              })}
            </div>
          </div>

          {/* hygiene status */}
          <div>
            <label className="block mb-2 font-medium">Hygiene Status</label>
            <div className="flex gap-4">
              {["Excellent", "Good", "Average", "Poor"].map((status) => (
                <label key={status} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="hygieneStatus"
                    value={status}
                    checked={restaurantData.hygieneStatus === status}
                    onChange={handleChange}
                    className="accent-[#F9832B]"
                  />
                  {status}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="birthYear" className="block mb-1 font-medium">
              Select Birth Year
            </label>
            <select
              name="birthYear"
              value={restaurantData.birthYear}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3.5 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] focus:border-[#F9832B] outline-none"
            >
              <option value="">Select Year</option>
              {Array.from(
                { length: 150 },
                (_, i) => new Date().getFullYear() - i
              ).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Opening Time</label>
              <input
                type="time"
                name="openingTime"
                value={restaurantData.openingTime}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] focus:border-[#F9832B] outline-none"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Closing Time</label>
              <input
                type="time"
                name="closingTime"
                value={restaurantData.closingTime}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] focus:border-[#F9832B] outline-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <label className="block mb-2 font-medium">Open Days</label>
          <div className="flex gap-3 flex-wrap">
            {[
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ].map((day) => {
              const isSelected = restaurantData.openDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    setRestaurantData((prev) => {
                      const updatedDays = isSelected
                        ? prev.openDays.filter((d) => d !== day)
                        : [...prev.openDays, day];
                      return { ...prev, openDays: updatedDays };
                    });
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium shadow-sm transition 
            ${
              isSelected
                ? "bg-[#F9832B] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/*  Location Info */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-200">
        <h2
          className="text-xl font-semibold flex items-center gap-2 mb-4 border-b pb-2"
          style={{ color: "#F9832B" }}
        >
          <MapPin size={20} /> Location Details
        </h2>
        <input
          type="text"
          name="address"
          placeholder="Full Address + Landmark"
          value={restaurantData.address}
          onChange={handleChange}
          className="w-full border border-gray-300 p-3 rounded-lg shadow-sm mb-3 focus:ring-2 focus:ring-[#F9832B] focus:border-[#F9832B] outline-none"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <input
            type="text"
            name="city"
            placeholder="City"
            value={restaurantData.city}
            onChange={handleChange}
            className="border border-gray-300 p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] focus:border-[#F9832B] outline-none"
          />
          <input
            type="text"
            name="state"
            placeholder="State"
            value={restaurantData.state}
            onChange={handleChange}
            className="border border-gray-300 p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] focus:border-[#F9832B] outline-none"
          />
        </div>

        {/* Map Picker */}
        <LocationPicker address={restaurantData.address} />

        {/* {restaurantData.latitude && restaurantData.longitude && (
          <p className="mt-3 text-gray-700">
            📍 Selected: {restaurantData.latitude.toFixed(5)},{" "}
            {restaurantData.longitude.toFixed(5)}
          </p>
        )} */}
      </div>

      {/*  Menu Details */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-200">
        <h2
          className="text-xl font-semibold flex items-center gap-2 mb-4 border-b pb-2"
          style={{ color: "#F9832B" }}
        >
          <Upload size={20} /> Menu Details
        </h2>

        {/* Menu Upload */}
        <label className="block mb-2 font-medium">
          Upload Menu (PDF/Images)
        </label>
        <input
          type="file"
          accept="image/*,.pdf"
          multiple
          onChange={(e) =>
            setMenuFiles((prev) => [...prev, ...Array.from(e.target.files)])
          }
          className="w-full border border-gray-300 p-2 rounded-lg shadow-sm bg-gray-50 mb-6"
        />
        <div className="flex gap-3 flex-wrap mt-3">
          {menuFiles.map((file, idx) => (
            <div key={idx} className="relative">
              {/* Only preview images */}
              {file.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={`menu-${idx}`}
                  className="w-20 h-20 object-cover rounded-lg border"
                />
              ) : (
                <div className="w-20 h-20 flex items-center justify-center bg-gray-200 text-gray-600 text-xs rounded-lg border">
                  {file.name}
                </div>
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={() =>
                  setMenuFiles((prev) => prev.filter((_, i) => i !== idx))
                }
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 shadow-md"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Dish Form */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-gray-700">Dishes</h3>
          <button
            onClick={handleDishAdd}
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg"
            style={{ backgroundColor: "#F9832B" }}
          >
            <PlusCircle size={18} /> Add Dish
          </button>
        </div>

        {restaurantData.dishes.map((dish, index) => (
          <div
            key={index}
            className="border border-gray-300 p-4 rounded-lg mb-4 bg-gray-50 shadow-md"
          >
            {/* Dish Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <input
                type="text"
                placeholder="Dish Name"
                value={dish.name}
                onChange={(e) => {
                  const updatedDishes = [...restaurantData.dishes];
                  updatedDishes[index].name = e.target.value;
                  setRestaurantData({
                    ...restaurantData,
                    dishes: updatedDishes,
                  });
                }}
                className="w-full border border-gray-300 p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] focus:border-[#F9832B] outline-none"
              />

              {/* Dish Type */}
              <select
                value={dish.type}
                onChange={(e) => {
                  const updatedDishes = [...restaurantData.dishes];
                  updatedDishes[index].type = e.target.value;
                  setRestaurantData({
                    ...restaurantData,
                    dishes: updatedDishes,
                  });
                }}
                className="w-full border border-gray-300 p-2 rounded-lg shadow-sm bg-white text-gray-700 focus:ring-2 focus:ring-[#F9832B] focus:border-[#F9832B] outline-none"
              >
                <option>Veg</option>
                <option>Non-Veg</option>
                <option>Vegan</option>
              </select>
            </div>

            {/* Spice + Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <select
                value={dish.spiceLevel}
                onChange={(e) => {
                  const updatedDishes = [...restaurantData.dishes];
                  updatedDishes[index].spiceLevel = e.target.value;
                  setRestaurantData({
                    ...restaurantData,
                    dishes: updatedDishes,
                  });
                }}
                className="w-full border border-gray-300 p-2 rounded-lg shadow-sm bg-white text-gray-700 focus:ring-2 focus:ring-[#F9832B] focus:border-[#F9832B] outline-none"
              >
                <option>Normal</option>
                <option>Spicy</option>
                <option>Extra Spicy</option>
              </select>
              <input
                type="number"
                placeholder="Price"
                value={dish.price}
                onChange={(e) => {
                  const updatedDishes = [...restaurantData.dishes];
                  updatedDishes[index].price = e.target.value;
                  setRestaurantData({
                    ...restaurantData,
                    dishes: updatedDishes,
                  });
                }}
                className="w-full border border-gray-300 p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] focus:border-[#F9832B] outline-none"
              />
            </div>

            {/* Image + Availability */}
            <label className="block mb-1">Dish Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const updatedDishes = [...restaurantData.dishes];
                updatedDishes[index].image = e.target.files[0];
                setRestaurantData({ ...restaurantData, dishes: updatedDishes });
              }}
              className="w-full border border-gray-300 p-2 rounded-lg shadow-sm bg-gray-50 mb-2"
            />

            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={dish.available}
                onChange={() => {
                  const updatedDishes = [...restaurantData.dishes];
                  updatedDishes[index].available =
                    !updatedDishes[index].available;
                  setRestaurantData({
                    ...restaurantData,
                    dishes: updatedDishes,
                  });
                }}
              />
              Available
            </label>

            {/* Footer with Remove Button */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  const updatedDishes = restaurantData.dishes.filter(
                    (_, i) => i !== index
                  );
                  setRestaurantData({
                    ...restaurantData,
                    dishes: updatedDishes,
                  });
                }}
                className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
              >
                Remove Dish
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          className="text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg"
          style={{ backgroundColor: "#F9832B" }}
        >
          Save Restaurant
        </button>
      </div>
    </div>
  );
}

export default RestroAdd;
