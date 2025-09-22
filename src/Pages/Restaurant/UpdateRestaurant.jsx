import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import PageTitle from "../../components/PageTitle/PageTitle";
import { PlusCircle, Upload, MapPin, Utensils } from "lucide-react";
import LocationPicker from "../../components/LocationPicker/LocationPicker";
import { BASE_URL } from "../../config/Config.js";
import DynamicBreadcrumbs from "../../components/common/BreadcrumbsNav/DynamicBreadcrumbs.jsx";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

function UpdateRestaurant() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [restaurantData, setRestaurantData] = useState({
    name: "",
    email: "",
    password: "", // added default to avoid uncontrolled warnings
    role_id: "", // default role id
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
    openingTime: "", // will be in "HH:MM" format for <input type="time" />
    closingTime: "",
    openDays: [], // ["Monday","Tuesday"...]
    dish_type: [], // array of IDs
    restaurant_type: [],
    good_for: [],
    cuisines: [],
    amenities: [],
  });

  // dropdown options
  const [dishTypes, setDishTypes] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [goodFors, setGoodFors] = useState([]);
  const [restroTypes, setRestroTypes] = useState([]);
  const [amenities, setAmenities] = useState([]);

  const [gallery, setGallery] = useState([]);
  const [menuFiles, setMenuFiles] = useState([]);
  const [profileImage, setProfileImage] = useState(null);

  const [loading, setLoading] = useState(true);

  // Helpers
  const normalizeIdArray = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr
      .map((it) => {
        if (!it) return null;
        if (typeof it === "string") return it;
        if (typeof it === "object") return it._id || it.id || null;
        return null;
      })
      .filter(Boolean);
  };

  const parseTimeToInput = (timeStr) => {
    if (!timeStr) return "";
    const s = String(timeStr).trim();

    // If already HH:MM, return padded
    const hhmm = s.match(/^(\d{1,2}):(\d{2})/);
    if (hhmm) {
      const hh = String(hhmm[1]).padStart(2, "0");
      const mm = String(hhmm[2]).padStart(2, "0");
      return `${hh}:${mm}`;
    }

    // Match patterns like "7AM", "7 AM", "7:30PM", "11 PM"
    const m = s.match(/(\d{1,2})(?::(\d{2}))?\s*([AaPp][Mm])?/);
    if (!m) return "";

    let hour = parseInt(m[1], 10);
    const minute = m[2] ? parseInt(m[2], 10) : 0;
    const ampm = m[3];

    if (ampm) {
      if (ampm.toLowerCase() === "pm" && hour !== 12) hour += 12;
      if (ampm.toLowerCase() === "am" && hour === 12) hour = 0;
    }
    const hh = String(hour).padStart(2, "0");
    const mm = String(minute).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const parseDaysToFullNames = (daysStr) => {
    if (!daysStr) return [];
    const abbMap = {
      Mon: "Monday",
      Tue: "Tuesday",
      Wed: "Wednesday",
      Thu: "Thursday",
      Fri: "Friday",
      Sat: "Saturday",
      Sun: "Sunday",
    };
    return String(daysStr)
      .split(",")
      .map((t) => t.trim())
      .map((token) => {
        if (!token) return null;
        // normalize token like "Mon" or "Monday"
        if (token.length <= 3) {
          const key = token.charAt(0).toUpperCase() + token.slice(1, 3);
          return abbMap[key] || token;
        }
        // Already full name: ensure capitalization
        return token.charAt(0).toUpperCase() + token.slice(1);
      })
      .filter(Boolean);
  };

  // Fetch dropdowns and restaurant details (axios)
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const urls = [
          `${BASE_URL}/restro/get-dish-type`,
          `${BASE_URL}/restro/get-cusine`,
          `${BASE_URL}/restro/get-good-for`,
          `${BASE_URL}/restro/get-restaurant-types`,
          `${BASE_URL}/restro/get-amenity`,
        ];
        const responses = await Promise.all(
          urls.map((u) =>
            axios
              .get(u)
              .then((r) => r.data)
              .catch(() => ({ data: [] }))
          )
        );

        setDishTypes(responses[0].data || []);
        setCuisines(responses[1].data || []);
        setGoodFors(responses[2].data || []);
        setRestroTypes(responses[3].data || []);
        setAmenities(responses[4].data || []);
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
      }
    };

    const fetchRestaurant = async () => {
      try {
        const authData = JSON.parse(localStorage.getItem("trofi_user"));
        const token = authData?.token;
        if (!token) {
          toast.error("Please login first");
          return;
        }
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(
          `${BASE_URL}/restro/get-restaurant-list/${id}`,
          {
            headers,
          }
        );
        const data = res.data?.data || {};

        // parse time parts
        const [rawOpen, rawClose] = (data.time || "").split(/\s*to\s*/i);

        setRestaurantData((prev) => ({
          ...prev,
          name: data.restro_name || "",
          email: data.email || "",
          address: data.address || "",
          country_code: data.country_code || "",
          phone: data.phone || "",
          birthYear: data.birth_year || "",
          city: data.city || "",
          state: data.state || "",
          postalCode: data.postalCode || "",
          country: data.country || "India",
          latitude:
            data.latitude !== undefined && data.latitude !== null
              ? String(data.latitude)
              : null,
          longitude:
            data.longitude !== undefined && data.longitude !== null
              ? String(data.longitude)
              : null,
          food_type: data.food_type || "both",
          description: data.description || "",
          longDescription: data.long_description || "",
          hygieneStatus: data.hygiene_status || "general",
          openingTime: parseTimeToInput(rawOpen),
          closingTime: parseTimeToInput(rawClose),
          openDays: parseDaysToFullNames(data.days),
          dish_type: normalizeIdArray(data.dish_type),
          restaurant_type: normalizeIdArray(data.restaurant_type),
          good_for: normalizeIdArray(data.good_for),
          cuisines: normalizeIdArray(data.cuisines),
          amenities: normalizeIdArray(data.amenities),
          role_id: data.role_id || prev.role_id || "",
        }));

        // If you want to preview existing images (not required), you can store their URLs in a separate state:
        // setExistingImageUrls(data.restaurant_images || []);
      } catch (err) {
        console.error("Error fetching restaurant:", err);
        toast.error("Failed to fetch restaurant data");
      } finally {
        setLoading(false);
      }
    };

    fetchDropdownData();
    fetchRestaurant();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setRestaurantData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setRestaurantData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("restro_name", restaurantData.name);
      formData.append("email", restaurantData.email);
      formData.append("address", restaurantData.address || "");
      formData.append("postalCode", restaurantData.postalCode || "");
      formData.append("country", restaurantData.country || "");
      formData.append("country_code", restaurantData.country_code || "");
      formData.append("phone", restaurantData.phone || "");
      formData.append("birth_year", restaurantData.birthYear || "");
      formData.append("city", restaurantData.city || "");
      formData.append("state", restaurantData.state || "");
      formData.append("latitude", restaurantData.latitude || "");
      formData.append("longitude", restaurantData.longitude || "");
      formData.append("food_type", restaurantData.food_type || "both");
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
        // backend may expect abbreviations — transform back if needed
        formData.append("days", restaurantData.openDays.join(", "));
      }

      gallery.forEach((file) => formData.append("restaurant_images", file));
      if (profileImage) formData.append("restaurant_images", profileImage);
      menuFiles.forEach((file) =>
        formData.append("restaurant_menu_images", file)
      );

      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;
      if (!token) {
        toast.error("Please login first");
        return;
      }
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      const response = await axios.patch(
        `${BASE_URL}/restro/update-restro/${id}`,
        formData,
        {
          headers: {
            ...(headers || {}),
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Restaurant updated successfully!");
      navigate("/RestroList");
    } catch (err) {
      console.error("Error updating:", err);
      toast.error("Update failed");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="main main_page p-6 min-h-screen duration-900">
      {/* <Breadcrumbs
        customTrail={[
          {
            label: "Update Restaurant",
            path: `/UpdateRestaurant/:${restaurantData.role_id}`,
          },
        ]}
      /> */}
      <PageTitle title={"Update Restaurant"} />
      {/*  Basic Info */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-200 mt-5">
        <h2
          className="text-xl font-semibold flex items-center gap-2 mb-4 border-b pb-2"
          style={{ color: "#F9832B" }}
        >
          <Utensils size={20} /> Basic Information
        </h2>
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-gray-600 font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={restaurantData.email || ""}
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
              value={restaurantData.password || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:ring focus:ring-[#F9832B] focus:border-[#F9832B] outline-none"
            />
          </div>
        </div> */}

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
  disabled
  className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-100 text-gray-700 cursor-not-allowed"
>
  <option value="68aead7b9db7925a61de75bb">Restro Owner</option>
</select>

          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-600 font-medium mb-2">
              Phone Number
            </label>
            <PhoneInput
              country="us" // default country
              value={restaurantData.phone}
              onChange={(phone) =>
                setRestaurantData((prev) => ({ ...prev, phone }))
              }
              inputClass="!w-full !h-12 !p-3 !pl-14 !rounded-lg !border-gray-300"
            />
          </div>
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
              name="longDescription"
              placeholder="About the restaurant..."
              value={restaurantData.longDescription}
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
              className="px-4 py-2 bg-[#F9832B] text-white rounded-lg cursor-pointer shadow hover:shadow-md"
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
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 cursor-pointer flex items-center justify-center text-xs hover:bg-red-600 shadow-md"
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
              className="px-4 py-2 bg-[#F9832B] text-white rounded-lg shadow cursor-pointer  hover:shadow-md"
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
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full cursor-pointer w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 shadow-md"
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
                  className={`px-4 py-2 rounded-full text-sm cursor-pointer font-medium shadow-sm transition 
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
                    className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer shadow-sm transition ${
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
        {restaurantData.latitude != null &&
          restaurantData.longitude != null && (
            <p className="mt-3 text-gray-700">
              📍 Selected: {parseFloat(restaurantData.latitude).toFixed(5)},{" "}
              {parseFloat(restaurantData.longitude).toFixed(5)}
            </p>
          )}
      </div>
      <button
        className="text-white font-semibold px-6 py-3 cursor-pointer rounded-lg shadow-md"
        style={{ backgroundColor: "#F9832B" }}
        onClick={handleSubmit}
      >
        Update Restaurant
      </button>
    </div>
  );
}

export default UpdateRestaurant;
