import React, { useState, useEffect } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import { PlusCircle, Upload, MapPin, Utensils } from "lucide-react";
import LocationPicker from "../../components/LocationPicker/LocationPicker";

const BASE_URL = "http://trofi-backend.apponedemo.top/api";

function RestroAdd() {
  const [restaurantData, setRestaurantData] = useState({
    name: "",
    email: "",
    password: "",
    role_id: "68aead7b9db7925a61de75bb",
    address: "",
    country_code: "",
    phone: "",
    birthYear: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    latitude: null,
    longitude: null,
    food_type: "both",
    description: "",
    longDescription: "",
    hygieneStatus: "general",
    openingTime: "",
    closingTime: "",
    openDays: [],
    dish_type: [],
    restaurant_type: [],
    good_for: [],
    cuisines: [],
    amenities: [],
  });

  const [dishTypes, setDishTypes] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [goodFors, setGoodFors] = useState([]);
  const [restroTypes, setRestroTypes] = useState([]);
  const [amenities, setAmenities] = useState([]);

  const [gallery, setGallery] = useState([]);
  const [menuFiles, setMenuFiles] = useState([]);
  const [profileImage, setProfileImage] = useState(null);

  const [loading, setLoading] = useState(true);

  // const facilityOptions = ['veg', 'non-veg', 'both'];

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const endpoints = [
          "restro/get-dish-type",
          "restro/get-cusine",
          "restro/get-good-for",
          "restro/get-restaurant-types",
          "restro/get-amenity",
        ];

        const [dishRes, cuisineRes, goodForRes, restroTypeRes, amenityRes] =
          await Promise.all(
            endpoints.map((ep) =>
              fetch(`${BASE_URL}/${ep}`).then((res) => res.json())
            )
          );

        setDishTypes(dishRes.data || []);
        setCuisines(cuisineRes.data || []);
        setGoodFors(goodForRes.data || []);
        setRestroTypes(restroTypeRes.data || []);
        setAmenities(amenityRes.data || []);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDropdownData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRestaurantData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (e, field) => {
    const values = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setRestaurantData((prev) => ({ ...prev, [field]: values }));
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

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("role_id", restaurantData.role_id);
      formData.append("restro_name", restaurantData.name);
      formData.append("email", restaurantData.email);
      formData.append("password", restaurantData.password);
      formData.append("address", restaurantData.address);
      formData.append("postalCode", restaurantData.postalCode);
      formData.append("country", restaurantData.country);
      formData.append("country_code", restaurantData.country_code);
      formData.append("phone", restaurantData.phone);
      formData.append("birth_year", restaurantData.birthYear);
      formData.append("city", restaurantData.city || "");
      formData.append("state", restaurantData.state || "");
      formData.append("latitude", restaurantData.latitude);
      formData.append("longitude", restaurantData.longitude);
      formData.append("food_type", restaurantData.food_type);
      formData.append("description", restaurantData.description || "");
      formData.append("long_description", restaurantData.longDescription || "");
      formData.append("dish_type", JSON.stringify(restaurantData.dish_type));
      formData.append(
        "restaurant_type",
        JSON.stringify(restaurantData.restaurant_type)
      );
      formData.append("good_for", JSON.stringify(restaurantData.good_for));
      formData.append("cuisines", JSON.stringify(restaurantData.cuisines));
      formData.append("amenities", JSON.stringify(restaurantData.amenities));

      formData.append(
        "hygiene_status",
        restaurantData.hygieneStatus || "general"
      );
      if (restaurantData.openingTime && restaurantData.closingTime) {
        formData.append(
          "time",
          `${restaurantData.openingTime} to ${restaurantData.closingTime}`
        );
      }
      if (restaurantData.openDays.length > 0) {
        formData.append("days", restaurantData.openDays.join(", "));
      }

      // restaurantData.dish_type.forEach((id) =>
      //   formData.append("dish_type", id)
      // );
      // restaurantData.restaurant_type.forEach((id) =>
      //   formData.append("restaurant_type", id)
      // );
      // restaurantData.good_for.forEach((id) => formData.append("good_for", id));
      // restaurantData.cuisines.forEach((id) => formData.append("cuisines", id));
      // restaurantData.amenities.forEach((id) =>
      //   formData.append("amenities", id)
      // );

      gallery.forEach((file) => formData.append("restaurant_images", file));
      if (profileImage) {
        formData.append("restaurant_images", profileImage);
      }
      menuFiles.forEach((file) =>
        formData.append("restaurant_menu_images", file)
      );

      const response = await fetch(`${BASE_URL}/restro/create-restaurant`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("Restaurant Created:", result);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  if (loading) return <p>Loading options...</p>;

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
          <div>
            <label className="block text-gray-600 font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={restaurantData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:ring focus:ring-[#F9832B] focus:border-[#F9832B] outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={restaurantData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:ring focus:ring-[#F9832B] focus:border-[#F9832B] outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {" "}
          <div>
            <label className="block text-gray-600 font-medium mb-2">
              Restaurant Name
            </label>
            <input
              type="text"
              name="name"
              value={restaurantData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:ring focus:ring-[#F9832B] focus:border-[#F9832B] outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-600 font-medium mb-2">Role</label>
            <select
              name="role_id"
              value={restaurantData.role_id}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring focus:ring-orange-400 focus:border-[#F9832B] transition bg-white"
            >
              <option value="68aead7b9db7925a61de75bb">Admin</option>
              {/* You can add more static roles here if needed */}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-600 font-medium mb-2">
              Country Code
            </label>
            <input
              type="text"
              name="country_code"
              value={restaurantData.country_code}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:ring focus:ring-[#F9832B] focus:border-[#F9832B] outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-2">
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              value={restaurantData.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:ring focus:ring-[#F9832B] focus:border-[#F9832B] outline-none"
            />
          </div>

          {/* <input
            type="text"
            name="type"
            placeholder="Restaurant Type (e.g., Cafe, Bakery)"
            value={restaurantData.restaurant_type}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] focus:border-[#F9832B] outline-none"
          /> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          <div>
            <label className="block text-gray-600 font-medium mb-2">
              Short Description
            </label>
            <textarea
              name="description"
              placeholder="About the restaurant..."
              value={restaurantData.description}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg shadow-sm  focus:ring focus:ring-[#F9832B] focus:border-[#F9832B] outline-none"
              rows="4"
            />
          </div>
          <div>
            <label className="block text-gray-600 font-medium mb-2">
              Long Description
            </label>
            <textarea
              name="description"
              placeholder="About the restaurant..."
              value={restaurantData.description}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg shadow-sm  focus:ring focus:ring-[#F9832B] focus:border-[#F9832B] outline-none"
              rows="4"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 mb-6">
          {/* Profile Image */}
          <div>
            {/* Menu Upload */}
            <label className="block mb-2 font-medium text-gray-600">
              Upload Menu (PDF/Images)
            </label>
            <input
              id="menuInput"
              type="file"
              accept="image/*,.pdf"
              multiple
              onChange={(e) =>
                setMenuFiles((prev) => [...prev, ...Array.from(e.target.files)])
              }
              className="hidden"
            />
            <button
              type="button"
              onClick={() => document.getElementById("menuInput").click()}
              className="px-4 py-2 bg-[#F9832B] text-white rounded-lg shadow hover:shadow-md"
            >
              Choose Images
            </button>
            <div className="flex gap-4 flex-wrap mt-4">
              {menuFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="relative w-24 text-center border rounded-lg shadow-sm bg-gray-50 p-2"
                >
                  {/* File name */}
                  <p className="text-xs text-gray-700 truncate mb-1">
                    {file.name}
                  </p>

                  {/* Image preview */}
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`menu-${idx}`}
                    className="w-20 h-20 object-cover rounded-md border mx-auto"
                  />

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() =>
                      setMenuFiles((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 shadow-md"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Gallery */}
          <div>
            <label className="block mb-2 font-medium text-gray-600">
              Gallery Uploads
            </label>

            {/* Hidden file input */}
            <input
              id="galleryInput"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) =>
                setGallery([...gallery, ...Array.from(e.target.files)])
              }
              className="hidden"
            />

            {/* Custom button to trigger input */}
            <button
              type="button"
              onClick={() => document.getElementById("galleryInput").click()}
              className="px-4 py-2 bg-[#F9832B] text-white rounded-lg shadow hover:shadow-md"
            >
              Choose Images
            </button>

            {/* Previews with file names */}
            <div className="flex gap-4 flex-wrap mt-4">
              {gallery.map((file, idx) => (
                <div
                  key={idx}
                  className="relative w-24 text-center border rounded-lg shadow-sm bg-gray-50 p-2"
                >
                  {/* File name */}
                  <p className="text-xs text-gray-700 truncate mb-1">
                    {file.name}
                  </p>

                  {/* Image preview */}
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`gallery-${idx}`}
                    className="w-20 h-20 object-cover rounded-md border mx-auto"
                  />

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() =>
                      setGallery((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 shadow-md"
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
            <div>
              <label className="block mb-2 font-medium text-gray-600">
                Food Type
              </label>
              <div className="flex gap-4">
                {["veg", "non-veg", "both"].map((status) => (
                  <label
                    key={status}
                    className="flex items-center gap-2 text-gray-600"
                  >
                    <input
                      type="radio"
                      name="food_type"
                      value={status}
                      checked={restaurantData.food_type === status}
                      onChange={handleChange}
                      className="accent-[#F9832B]"
                    />
                    {status}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* hygiene status */}
          <div>
            <label className="block mb-2 font-medium text-gray-600">
              Hygiene Status
            </label>
            <div className="flex gap-4">
              {["hygiene", "general"].map((status) => (
                <label
                  key={status}
                  className="flex items-center gap-2 text-gray-600"
                >
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
            <label
              htmlFor="birthYear"
              className="block mb-1 font-medium text-gray-600"
            >
              Select Birth Year
            </label>
            <select
              name="birthYear"
              value={restaurantData.birthYear}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3.5 rounded-lg shadow-sm focus:ring focus:ring-[#F9832B] focus:border-[#F9832B] outline-none"
            >
              <option value="" className="text-gray-600">
                Select Year
              </option>
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
              <label className="block mb-1 font-medium text-gray-600">
                Opening Time
              </label>
              <input
                type="time"
                name="openingTime"
                value={restaurantData.openingTime}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:ring focus:ring-[#F9832B] focus:border-[#F9832B] outline-none"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-600">
                Closing Time
              </label>
              <input
                type="time"
                name="closingTime"
                value={restaurantData.closingTime}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:ring focus:ring-[#F9832B] focus:border-[#F9832B] outline-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <label className="block mb-2 font-medium text-gray-600">
            Open Days
          </label>
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
      <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-200">
        <h2
          className="text-xl font-semibold flex items-center gap-2 mb-4 border-b pb-2"
          style={{ color: "#F9832B" }}
        >
          <PlusCircle size={20} /> Additional Details
        </h2>

        {/* Helper function for rendering selection buttons */}
        {[
          { label: "Dish Type", field: "dish_type", options: dishTypes },
          { label: "Cuisines", field: "cuisines", options: cuisines },
          { label: "Good For", field: "good_for", options: goodFors },
          {
            label: "Restaurant Type",
            field: "restaurant_type",
            options: restroTypes,
          },
          { label: "Amenities", field: "amenities", options: amenities },
        ].map(({ label, field, options }) => (
          <div
            key={field}
            className="mb-6 shadow-xl p-3 rounded-lg bg-gray-100"
          >
            <label className="block mb-2 text-lg font-bold text-gray-700">
              {label}
            </label>
            <div className="flex gap-3 flex-wrap">
              {options.map((item) => {
                const isSelected = restaurantData[field].includes(item._id);
                return (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() =>
                      setRestaurantData((prev) => {
                        const updatedArray = isSelected
                          ? prev[field].filter((id) => id !== item._id)
                          : [...prev[field], item._id];
                        return { ...prev, [field]: updatedArray };
                      })
                    }
                    className={`px-4 py-2 rounded-full text-sm font-medium shadow-sm transition ${
                      isSelected
                        ? "bg-[#F9832B] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {item.name ||
                      item.amenity_name ||
                      item.cuisine_name ||
                      item.good_for_name ||
                      item.restaurant_type_name ||
                      "Unnamed"}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Location Info */}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
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
          <input
            type="text"
            name="postalCode"
            placeholder="Postal Code"
            value={restaurantData.postalCode}
            onChange={handleChange}
            className="border border-gray-300 p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] focus:border-[#F9832B] outline-none"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3"></div>

        {/* ✅ Interactive Map */}
        <div className="w-full h-72 bg-white p-1 rounded-xl overflow-hidden shadow-md">
          <LocationPicker
            onLocationSelect={({ lat, lng }) =>
              setRestaurantData({
                ...restaurantData,
                latitude: lat,
                longitude: lng,
              })
            }
          />
        </div>

        {/* Show selected lat/lng */}
        {restaurantData.latitude && restaurantData.longitude && (
          <p className="mt-3 text-gray-700">
            📍 Selected: {restaurantData.latitude.toFixed(5)},{" "}
            {restaurantData.longitude.toFixed(5)}
          </p>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          className="text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg"
          style={{ backgroundColor: "#F9832B" }}
          onClick={handleSubmit}
        >
          Save Restaurant
        </button>
      </div>
    </div>
  );
}

export default RestroAdd;
