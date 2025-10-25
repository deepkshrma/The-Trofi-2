import React, { useState, useEffect } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import { Info, MapPin, Utensils } from "lucide-react";
import LocationPicker from "../../components/LocationPicker/LocationPicker";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../config/Config.js";
import axios from "axios";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav.jsx";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Listbox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { motion, AnimatePresence } from "framer-motion";


function RestroAdd() {
  const [restaurantData, setRestaurantData] = useState({
    name: "",
    email: "",
    password: "",
    role_id: "",
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
    is_best_seller: false,
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
  const [errors, setErrors] = useState({});
  const [locationAddress, setLocationAddress] = useState("");
  const [gallery, setGallery] = useState([]);
  const [menuFiles, setMenuFiles] = useState([]);
  const [profileImage, setProfileImage] = useState(null);

  const [groups, setGroups] = useState([]);
  const [groupId, setGroupId] = useState(null);
  const [groupSearch, setGroupSearch] = useState("");
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);

  // Group Add Modal States
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);




  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchRestaurantOwnerRole = async () => {
      try {
        const authData = JSON.parse(localStorage.getItem("trofi_user"));
        const token = authData?.token;
        if (!token) return;

        const res = await axios.get(`${BASE_URL}/admin/admins-roles`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const roles = res.data?.roles || [];
        const restaurantOwnerRole = roles.find(
          (r) => r.name === "restaurant_owner"
        );

        if (restaurantOwnerRole) {
          setRestaurantData((prev) => ({
            ...prev,
            role_id: restaurantOwnerRole._id,
          }));
        } else {
          toast.error("Restaurant owner role not found!");
        }
      } catch (err) {
        toast.error("Failed to fetch roles for restaurant.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantOwnerRole();
  }, []);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const authData = JSON.parse(localStorage.getItem("trofi_user"));
        const token = authData?.token;

        const headers = token ? { Authorization: `Bearer ${token}` } : {};

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
              axios.get(`${BASE_URL}/${ep}`, { headers }).then((res) => res.data)
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

  const fetchGroups = async () => {
    try {
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;

      const res = await axios.get(`${BASE_URL}/admin/restaurant-groups`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.data.success) {
        setGroups(res.data.data);
      }
    } catch (err) {
      toast.error("Failed to load groups");
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const filteredGroups = groups.filter((g) =>
    g.group_name.toLowerCase().includes(groupSearch.toLowerCase())
  );


  useEffect(() => {
    const close = (e) => {
      if (!e.target.closest(".relative")) setShowGroupDropdown(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }

    const authData = JSON.parse(localStorage.getItem("trofi_user"));
    const token = authData?.token;

    try {
      const res = await axios.post(
        `${BASE_URL}/admin/restaurant-group`,
        {
          group_name: groupName.trim(),
          description,
          is_active: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.success) {
        toast.success("Group created ✅");
        setGroups((prev) => [...prev, res.data.data]); // add in dropdown
        setGroupId(res.data.data._id); // auto-select new
        setGroupName("");
        setDescription("");
        setShowGroupModal(false);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };



  const handleChange = (e) => {
    const { name, value } = e.target;
    setRestaurantData((prev) => ({ ...prev, [name]: value }));

    // Live field-wise validation
    setErrors((prev) => {
      const newErrors = { ...prev };

      switch (name) {
        case "name":
          newErrors.name = value.trim() === "" ? "Restaurant name is required" : "";
          break;

        case "email":
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          newErrors.email = !emailRegex.test(value)
            ? "Please enter a valid email address"
            : "";
          break;

        case "password":
          newErrors.password =
            value.length > 0 && value.length < 8
              ? "Password must be at least 8 characters long"
              : "";
          break;

        case "price":
          newErrors.price =
            !value || value <= 0 ? "Enter a valid price per person" : "";
          break;



        case "closingTime":
          newErrors.closingTime = value ? "" : "Closing time is required";
          break;

        default:
          break;
      }
      switch (name) {
        case "description":
          newErrors.description =
            value.trim().length === 0
              ? "Short description is required"
              : value.trim().length < 20
                ? "Description should be at least 20 characters long"
                : "";
          break;

        case "phone":
          newErrors.phone =
            !/^\d{10,15}$/.test(value)
              ? "Enter a valid phone number (10–15 digits)"
              : "";
          break;

        case "birthYear":
          newErrors.birthYear = value ? "" : "Please select your birth year";
          break;

        default:
          break;
      }


      return newErrors;
    });
  };



  const validateForm = () => {
    const requiredFields = {
      name: "Restaurant Name",
      email: "Email Address",
      password: "Password",
      phone: "Phone Number",
      address: "Address",
      city: "City",
      state: "State",
      postalCode: "Postal Code",
      price: "Price Per Person",
      description: "Short Description",
      closingTime: "Closing Time",
    };

    for (const [key, label] of Object.entries(requiredFields)) {
      if (!restaurantData[key] || restaurantData[key].toString().trim() === "") {
        toast.error(`${label} is required`);
        return false;
      }
    }

    // validate coordinates (map)
    if (!restaurantData.latitude || !restaurantData.longitude) {
      toast.error("Please select a location on the map");
      return false;
    }

    return true;
  };




  const handleSubmit = async () => {
    if (!restaurantData.role_id) {
      toast.error("Role ID not loaded yet. Please wait a moment.");
      return;
    }
    if (!validateForm()) {
      return; // stop here if invalid
    }

    // Validate Additional Details
    const sectionFields = [
      { field: "dish_type", label: "Dish Type" },
      { field: "cuisines", label: "Cuisines" },
      { field: "good_for", label: "Good For" },
      { field: "restaurant_type", label: "Restaurant Type" },
      { field: "amenities", label: "Amenities" },
    ];

    for (const { field, label } of sectionFields) {
      if (!restaurantData[field] || restaurantData[field].length === 0) {
        toast.error(`Please select at least one option in ${label}`);
        return;
      }
    }

    try {
      // ✅ Get token like in handleSave
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;

      if (!token) {
        toast.error("Please login first");
        return;
      }

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
      formData.append("price", restaurantData.price);
      formData.append("birth_year", restaurantData.birthYear);
      formData.append("city", restaurantData.city || "");
      formData.append("state", restaurantData.state || "");
      formData.append("latitude", restaurantData.latitude);
      formData.append("longitude", restaurantData.longitude);
      formData.append("food_type", restaurantData.food_type);
      formData.append("is_best_seller", restaurantData.is_best_seller);
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
      if (restaurantData.closingTime) {
        formData.append("time", restaurantData.closingTime);
      }
      if (groupId) {
        formData.append("group_id", groupId);
      }

      if (restaurantData.openDays.length > 0) {
        formData.append("days", restaurantData.openDays.join(", "));
      }

      gallery.forEach((file) => formData.append("restaurant_images", file));
      if (profileImage) {
        formData.append("restaurant_images", profileImage);
      }
      menuFiles.forEach((file) =>
        formData.append("restaurant_menu_images", file)
      );

      // ✅ Include token in headers
      const { data } = await axios.post(
        `${BASE_URL}/restro/create-restaurant`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Restaurant Created:", data);
      toast.success("Restro created successfully!");
      navigate("/RestroList");
    } catch (err) {
      console.error("Error:", err);
      const msg =
        err.response?.data?.message || err.message || "Something went wrong";
      toast.error(msg);
    }
  };


  if (loading) return <p>Loading options...</p>;

  return (
    <div className="main main_page p-6 min-h-screen  duration-900">
      <BreadcrumbsNav
        customTrail={[
          { label: "Restaurant List", path: "/RestroList" },
          { label: "Add New Restaurant", path: "RestroAdd" },
        ]}
      />
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
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={restaurantData.email}
              onChange={handleChange}
              className={`w-full border ${errors.email ? "border-red-500" : "border-gray-300"}
      p-2 rounded-lg shadow-sm focus:ring focus:ring-[#F9832B] focus:border-[#F9832B] outline-none`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>


          <div>
            <label className="block text-gray-600 font-medium mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={restaurantData.password}
              onChange={(e) => {
                const val = e.target.value;
                setRestaurantData((prev) => ({ ...prev, password: val }));

                if (val.length > 0 && val.length < 8) {
                  setErrors((prev) => ({ ...prev, password: "Password must be at least 8 characters long" }));
                } else {
                  setErrors((prev) => ({ ...prev, password: "" }));
                }
              }}
              className={`w-full border ${errors.password ? "border-red-500" : "border-gray-300"
                } p-2 rounded-lg shadow-sm focus:ring focus:ring-[#F9832B] focus:border-[#F9832B] outline-none`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {" "}


          {/* <div>
            <label className="block text-gray-600 font-medium mb-2">Role</label>
            <input
              type="text"
              value="restaurant_owner"
              disabled
              className="w-full border border-gray-300 p-2 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
            />

          </div> */}

          {/* Restaurant Group */}
          <div>
            <label className="block text-gray-600 font-medium mb-2">
              Restaurant Group
            </label>

            <div className="relative w-full">

              {/* Main Select Button */}
              <button
                onClick={() => setShowGroupDropdown(!showGroupDropdown)}
                type="button"
                className="w-full border border-gray-300 p-2 rounded-lg bg-white text-gray-700 shadow-sm 
      text-left flex justify-between items-center focus:ring focus:ring-orange-300 focus:border-orange-400 outline-none"
              >
                {groupId && groups.find((g) => g._id === groupId)?.group_name || "Select Group"}

                <span className="text-gray-500 text-xs">
                  ▼
                </span>
              </button>

              {/* Dropdown */}
              {showGroupDropdown && (
                <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-md mt-1 max-h-60 overflow-auto">

                  {/* Search input inside dropdown */}
                  <div className="p-2 border-b">
                    <input
                      type="text"
                      value={groupSearch}
                      onChange={(e) => setGroupSearch(e.target.value)}
                      placeholder="Search..."
                      className="w-full px-3 py-1 rounded-md border border-gray-300 text-sm 
            focus:ring focus:ring-orange-300 outline-none"
                    />
                  </div>

                  {/* Group List */}
                  {filteredGroups.length > 0 ? (
                    filteredGroups.map((g) => (
                      <div
                        key={g._id}
                        onClick={() => {
                          setGroupId(g._id);
                          setShowGroupDropdown(false);
                        }}
                        className="px-3 py-2 hover:bg-orange-100 cursor-pointer text-sm text-gray-700"
                      >
                        {g.group_name}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-gray-500 text-sm">
                      No group found
                    </div>
                  )}

                  <div className="border-t">
                    <button
                      type="button"
                      className="text-blue-500 text-xs hover:underline"
                      onClick={() => setShowGroupModal(true)}
                    >
                      + Create New Group
                    </button>

                  </div>

                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-2">
              Restaurant Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={restaurantData.name}
              onChange={handleChange}
              className={`w-full border ${errors.name ? "border-red-500" : "border-gray-300"}
      p-2 rounded-lg shadow-sm focus:ring focus:ring-[#F9832B] focus:border-[#F9832B] outline-none`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>



        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-600 font-medium mb-2">
              Phone Number
            </label>
            <div className="w-full">
              <PhoneInput
                country="in"
                value={restaurantData.phone}
                onChange={(phone, country) => {
                  setRestaurantData((prev) => ({
                    ...prev,
                    phone,
                    country_code: `+${country.dialCode}`,
                  }));

                  if (!/^\d{10,15}$/.test(phone)) {
                    setErrors((prev) => ({
                      ...prev,
                      phone: "Enter a valid phone number (10–15 digits)",
                    }));
                  } else {
                    setErrors((prev) => ({ ...prev, phone: "" }));
                  }
                }}
                inputClass="!w-full !h-[42px] !text-base !pl-12 !pr-3 !border !border-gray-300 !rounded-lg !shadow-sm !focus:ring !focus:ring-[#F9832B] !focus:border-[#F9832B] !outline-none"
                buttonClass="!border-gray-300 !rounded-l-lg"
                containerClass="!w-full"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}

            </div>
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-2">
              Price Per Person <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              min="1" // 🔒 Prevents values below 1 via arrows
              value={restaurantData.price || ""}
              onChange={(e) => {
                const value = Math.max(1, Number(e.target.value)); // 🛡️ Prevent manual entry below 1
                handleChange({ target: { name: "price", value } });
              }}
              className={`w-full border ${errors.price ? "border-red-500" : "border-gray-300"
                } p-2 rounded-lg shadow-sm focus:ring focus:ring-[#F9832B] focus:border-[#F9832B] outline-none`}
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price}</p>
            )}
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
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}

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
              className="px-4 py-2 bg-[#F9832B] text-white rounded-lg shadow hover:shadow-md cursor-pointer"
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
              className="px-4 py-2 bg-[#F9832B] text-white rounded-lg shadow hover:shadow-md cursor-pointer"
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
              Established Year
            </label>
            <select
              name="birthYear"
              value={restaurantData.birthYear}
              onChange={handleChange}
              className="w-full border border-gray-300 p-2 rounded-lg shadow-sm focus:ring focus:ring-[#F9832B] focus:border-[#F9832B] outline-none"
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
                Closing Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="closingTime"
                value={restaurantData.closingTime}
                onChange={handleChange}
                className={`w-full border ${errors.closingTime ? "border-red-500" : "border-gray-300"}
        p-2 rounded-lg shadow-sm focus:ring focus:ring-[#F9832B] focus:border-[#F9832B] outline-none`}
              />
              {errors.closingTime && (
                <p className="text-red-500 text-sm mt-1">{errors.closingTime}</p>
              )}
            </div>
          </div>

        </div>

        <div className="mt-8">
          <label className="block mb-2 font-medium text-gray-600">
            Open Days
          </label>
          <div className="flex gap-3  flex-wrap">
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
            ${isSelected
                      ? "bg-[#F9832B] text-white"
                      : "bg-gray-100 text-gray-700  hover:bg-gray-200"
                    }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          {restaurantData.openDays.length === 0 && (
            <p className="text-red-500 text-sm mt-2">
              Please select at least one open day
            </p>
          )}

        </div>
      </div>

      {/* ================== Best Seller Section ================== */}
      <div className="mt-4 mb-4 bg-white shadow-sm rounded-2xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          🏆 Best Seller
        </h2>

        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            id="is_best_seller"
            name="is_best_seller"
            checked={restaurantData.is_best_seller}
            onChange={(e) =>
              setRestaurantData((prev) => ({
                ...prev,
                is_best_seller: e.target.checked,
              }))
            }
            className="w-5 h-5 accent-[#F9832B] cursor-pointer"
          />
          <label
            htmlFor="is_best_seller"
            className="text-gray-700 font-medium select-none cursor-pointer"
          >
            Mark this restaurant as <span className="text-[#F9832B]">Best Seller</span>
          </label>
        </div>

        <p className="text-sm text-gray-500 mt-2 ml-9">
          Enable this if this restaurant is featured or highly rated.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-200">
        <h2
          className="text-xl font-semibold flex items-center gap-2 mb-4 border-b pb-2"
          style={{ color: "#F9832B" }}
        >
          <Info size={20} /> Additional Details
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
                    className={`px-4 py-2 rounded-full text-sm font-medium shadow-sm transition ${isSelected
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
            {field === "dish_type" && restaurantData.dish_type.length === 0 && (
              <p className="text-red-500 text-sm mt-2">
                Please select at least one Dish Type
              </p>
            )}
            {field === "good_for" && restaurantData.good_for.length === 0 && (
              <p className="text-red-500 text-sm mt-2">
                Please select at least one Good For option
              </p>
            )}
            {field === "cuisines" && restaurantData.cuisines.length === 0 && (
              <p className="text-red-500 text-sm mt-2">
                Please select at least one Cuisine
              </p>
            )}
            {field === "restaurant_type" && restaurantData.restaurant_type.length === 0 && (
              <p className="text-red-500 text-sm mt-2">
                Please select at least one Restaurant Type
              </p>
            )}
            {field === "amenities" && restaurantData.amenities.length === 0 && (
              <p className="text-red-500 text-sm mt-2">
                Please select at least one Amenity
              </p>
            )}

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
          className="w-full border border-gray-300 p-2 rounded-lg shadow-sm mb-3 focus:ring-2 focus:ring-[#F9832B] focus:border-[#F9832B] outline-none"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
          <input
            type="text"
            name="city"
            placeholder="City"
            value={restaurantData.city}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] focus:border-[#F9832B] outline-none"
          />
          <input
            type="text"
            name="state"
            placeholder="State"
            value={restaurantData.state}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] focus:border-[#F9832B] outline-none"
          />
          <input
            type="text"
            name="postalCode"
            placeholder="Postal Code"
            value={restaurantData.postalCode}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] focus:border-[#F9832B] outline-none"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3"></div>

        {/* ✅ Interactive Map */}
        <div className="w-full h-100 bg-white p-1 rounded-xl overflow-hidden shadow-md">
          <LocationPicker
            onLocationSelect={({ lat, lng, address, streetAddress, city, state, postalCode }) => {
              setRestaurantData((prev) => ({
                ...prev,
                latitude: lat,
                longitude: lng,
                // Optional: populate address fields if available
                ...(streetAddress && { address: streetAddress }),
                ...(city && { city }),
                ...(state && { state }),
                ...(postalCode && { postalCode }),
              }));
              setLocationAddress(address || "");
            }}
          />

        </div>

        {/* Show selected lat/lng */}
        {restaurantData.latitude && restaurantData.longitude && (
          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-gray-700 flex items-start gap-2">
              <span className="text-lg">📍</span>
              <span className="flex-1">
                <strong className="text-orange-600">Selected Location:</strong>
                <br />
                {locationAddress || "Loading address..."}
              </span>
            </p>
          </div>
        )}

      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          className="text-white font-semibold px-6 py-3 cursor-pointer rounded-lg shadow-md hover:shadow-lg"
          style={{ backgroundColor: "#F9832B" }}
          onClick={handleSubmit}
        >
          Save Restaurant
        </button>
      </div>
      {showGroupModal && (
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 md:p-6"
            >
              <h2 className="text-lg md:text-xl font-semibold text-gray-700 mb-4">
                Create Restaurant Group
              </h2>

              {/* Form */}
              <div className="space-y-5">

                {/* Group Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none text-sm"
                    placeholder="Enter Group Name"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none text-sm"
                    placeholder="Enter Description"
                    rows={3}
                  ></textarea>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer font-medium text-sm transition"
                    onClick={() => {
                      setGroupName("");
                      setDescription("");
                      setShowGroupModal(false);
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    className="px-4 py-2 rounded-lg bg-[#F9832B] text-white hover:bg-[#e67600] cursor-pointer font-medium text-sm transition"
                    onClick={handleCreateGroup}
                  >
                    Save
                  </button>
                </div>
              </div>

            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

    </div>


  );
}

export default RestroAdd;
