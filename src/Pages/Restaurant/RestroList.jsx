import React, { useState, useEffect } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import { Eye, PlusCircle, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/common/Pagination/Pagination";
import axios from "axios";
import { BASE_URL, IMAGE_URL } from "../../config/Config";
import { MdAdminPanelSettings, MdEdit, MdRestaurantMenu, MdDelete } from "react-icons/md";
import DeleteModel from "../../components/common/DeleteModel/DeleteModel";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import staticimg from "../../assets/images/logo.jpg";
import { CiExport } from "react-icons/ci";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FiFilter, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Country, State, City } from "country-state-city";
import {
  FaUtensils,
  FaLeaf,
  FaDrumstickBite,
  FaShieldAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";

function RestroList() {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});

  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [deleteReason, setDeleteReason] = useState("");
  const [deleteComment, setDeleteComment] = useState("");

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [country, setCountry] = useState("");
  const [stateName, setStateName] = useState("");
  const [city, setCity] = useState("");




  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalRecords: 0,
  });

  const [kpi, setKpi] = useState({
    total: 0,
    veg: 0,
    nonVeg: 0,
    both: 0,
    hygiene: 0,
    general: 0,
  });

  const [filterOptions, setFilterOptions] = useState({
    dishTypes: [],
    hygieneStatuses: [],
    accountStatuses: [],
  });

  const navigate = useNavigate();

  const handleCountryChange = (e) => {
    const selectedCountry = e.target.value;
    setCountry(selectedCountry);
    const countryStates = State.getStatesOfCountry(selectedCountry);
    setStates(countryStates);
    setStateName("");
    setCities([]);
    setCity("");
  };

  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    setStateName(selectedState);
    const stateCities = City.getCitiesOfCountry(country, selectedState);
    setCities(stateCities || []);
    setCity("");
  };


  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);


  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/admin/restaurant-groups`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setGroups(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching groups:", err);
      }
    };
    fetchGroups();
  }, []);


  const authData = JSON.parse(localStorage.getItem("trofi_user"));
  const token = authData?.token;

  if (!token) {
    toast.error("Please login first");
    return null;
  }

  // Fetch restaurants with pagination and filters
  const fetchRestaurants = async (
    page = 1,
    searchTerm = "",
    filters = appliedFilters
  ) => {
    try {
      setLoading(true);

      const params = {
        page,
        limit: pagination.pageSize,
        searchName: searchTerm,
      };

      // ============ FILTERS ============
      // Controller expects: filters as object with nested structure
      const backendFilters = {};

      if (filters["filters[hygieneStatus][]"] && filters["filters[hygieneStatus][]"].length > 0) {
        backendFilters.hygieneStatus = filters["filters[hygieneStatus][]"];
      }
      if (filters["filters[dishType][]"] && filters["filters[dishType][]"].length > 0) {
        backendFilters.dishType = filters["filters[dishType][]"];
      }
      if (filters["filters[accountStatus][]"] && filters["filters[accountStatus][]"].length > 0) {
        backendFilters.accountStatus = filters["filters[accountStatus][]"];
      }
      if (filters["filters[minPrice]"]) {
        backendFilters.minPrice = parseFloat(filters["filters[minPrice]"]);
      }
      if (filters["filters[maxPrice]"]) {
        backendFilters.maxPrice = parseFloat(filters["filters[maxPrice]"]);
      }
      if (filters["filters[minRating]"]) {
        backendFilters.minRating = parseFloat(filters["filters[minRating]"]);
      }
      if (filters["filters[maxRating]"]) {
        backendFilters.maxRating = parseFloat(filters["filters[maxRating]"]);
      }
      if (filters["filters[startDate]"]) {
        backendFilters.startDate = filters["filters[startDate]"];
      }
      if (filters["filters[endDate]"]) {
        backendFilters.endDate = filters["filters[endDate]"];
      }
      if (filters["filters[groupId]"]) {
        backendFilters.groupId = filters["filters[groupId]"];
      }


      // Add all filters to params
      if (Object.keys(backendFilters).length > 0) {
        params.filters = backendFilters;
      }

      // ============ LOCATION FILTERS ============
      if (filters.country) {
        params.country = filters.country;
      }
      if (filters.state) {
        params.state = filters.state;
      }
      if (filters.city) {
        params.city = filters.city;
      }

      // ============ SORTING ============
      // Always include 'latest' as default, then add rating/price sort if selected
      const sortArray = ["latest"];

      // Add rating sort if selected
      if (filters["sort[]_rating"]) {
        sortArray.push(filters["sort[]_rating"]);
      }

      // Add price sort if selected
      if (filters["sort[]_price"]) {
        sortArray.push(filters["sort[]_price"]);
      }

      // Send sort as array - axios will convert to sort[]=latest&sort[]=rating_desc
      params.sort = sortArray;

      console.log("Sending params:", params); // Debug

      const response = await axios.get(
        `${BASE_URL}/restro/get-restaurant-list`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      const {
        data,
        pagination: backendPagination,
        kpi: backendKpi,
      } = response.data;

      setRestaurants(data);
      setPagination((prev) => ({
        ...prev,
        currentPage: backendPagination.page,
        totalPages: backendPagination.totalPages,
        totalRecords: backendPagination.total,
      }));

      // ============ KPI COUNTS ============
      const foodCounts = { veg: 0, nonVeg: 0, both: 0 };
      backendKpi.foodTypeCounts?.forEach((item) => {
        if (item._id === "veg") foodCounts.veg = item.count;
        else if (item._id === "non-veg") foodCounts.nonVeg = item.count;
        else if (item._id === "both") foodCounts.both = item.count;
      });

      const hygieneCounts = { hygiene: 0, general: 0 };
      backendKpi.hygieneCounts?.forEach((item) => {
        hygieneCounts[item._id] = item.count;
      });

      setKpi({
        total: backendPagination.total,
        ...foodCounts,
        ...hygieneCounts,
      });

      // ============ FILTER OPTIONS ============
      if (backendKpi.dishTypeCounts) {
        setFilterOptions((prev) => ({
          ...prev,
          dishTypes: backendKpi.dishTypeCounts,
        }));
      }

      if (backendKpi.hygieneCounts) {
        setFilterOptions((prev) => ({
          ...prev,
          hygieneStatuses: backendKpi.hygieneCounts,
        }));
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong while fetching restaurants");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants(1);
  }, []);

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedRestaurant(null);
    setDeleteReason("");
    setDeleteComment("");
  };

  const confirmDelete = async () => {
    if (!selectedRestaurant) return;

    // Validate reason
    if (!deleteReason) {
      toast.error("Please select a deletion reason");
      return;
    }

    try {
      const res = await axios.delete(
        `${BASE_URL}/admin/restaurant/${selectedRestaurant._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: {
            reason: deleteReason,
            comment: deleteComment || ""
          }
        }
      );

      if (res.data.success) {
        toast.success("Restaurant deleted successfully");
        fetchRestaurants(pagination.currentPage, search, appliedFilters);
      } else {
        toast.error(res.data.message || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong while deleting");
    } finally {
      setShowDeleteModal(false);
      setSelectedRestaurant(null);
      setDeleteReason("");
      setDeleteComment("");
    }
  };

  const truncateText = (text, limit = 30) => {
    if (!text) return "N/A";
    const plainText = String(text).replace(/<\/?[^>]+(>|$)/g, "").trim();
    return plainText.length > limit ? plainText.slice(0, limit) + "..." : plainText;
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setIsImageModalOpen(false);
  };

  const handleExport = () => {
    const exportData = restaurants.map((restro, index) => ({
      "S.No.": (pagination.currentPage - 1) * pagination.pageSize + (index + 1),
      Name: restro.restro_name,
      "Food Type": restro.food_type,
      "Dish Types": restro.dishTypes?.map((d) => d.name).join(", ") || "N/A",
      "Avg Rating": restro.avgRating || 0,
      "Price Per Person": restro.price || 0,
      "Hygiene Status": restro.hygiene_status || "N/A",
      "Account Status": restro.account_status,
      Address: restro.address || "N/A",
      City: restro.city || "N/A",
      State: restro.state || "N/A",
      Country: restro.country || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Restaurants");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const fileData = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(fileData, "Restaurants.xlsx");
  };

  // Helper function to get filter display text
  const getFilterDisplayText = (key, value) => {
    if (key === 'country') return `Country: ${value}`;
    if (key === 'state') return `State: ${value}`;
    if (key === 'city') return `City: ${value}`;
    if (key === 'minPrice') return `Min Price: ₹${value}`;
    if (key === 'maxPrice') return `Max Price: ₹${value}`;
    if (key === 'minRating') return `Min Rating: ${value}⭐`;
    if (key === 'maxRating') return `Max Rating: ${value}⭐`;
    if (key === 'priceSort') return value === 'price_asc' ? 'Price: Low to High' : 'Price: High to Low';
    if (key === 'ratingSort') return value === 'rating_asc' ? 'Rating: Low to High' : 'Rating: High to Low';
    if (Array.isArray(value)) return value.join(", ");
    return value;
  };

  return (
    <>
      <div className="main main_page p-6 min-h-screen duration-900">
        <BreadcrumbsNav
          customTrail={[{ label: "Restaurant List", path: "RestroList" }]}
        />

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <PageTitle title={"Restaurant List"} />
          <button
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg cursor-pointer transition"
            style={{ backgroundColor: "#F9832B" }}
            onClick={() => navigate("/RestroAdd")}
          >
            <PlusCircle size={18} /> Add Restaurant
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-900 p-4 rounded-xl text-white shadow-lg hover:shadow-xl transition">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xs md:text-sm font-medium opacity-90">
                  Total Restaurants
                </h4>
                <p className="text-2xl md:text-3xl font-bold mt-1">{kpi.total}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex justify-center items-center flex-shrink-0">
                <FaUtensils size={24} className="text-white" />
              </div>
            </div>
          </div>

          <div className="bg-green-600 p-4 rounded-xl text-white shadow-lg hover:shadow-xl transition">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xs md:text-sm font-medium opacity-90">
                  Veg Restaurants
                </h4>
                <p className="text-2xl md:text-3xl font-bold mt-1">{kpi.veg}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex justify-center items-center flex-shrink-0">
                <FaLeaf size={24} className="text-white" />
              </div>
            </div>
          </div>

          <div className="bg-orange-600 p-4 rounded-xl text-white shadow-lg hover:shadow-xl transition">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xs md:text-sm font-medium opacity-90">
                  Non-Veg Restaurants
                </h4>
                <p className="text-2xl md:text-3xl font-bold mt-1">{kpi.nonVeg}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex justify-center items-center flex-shrink-0">
                <FaDrumstickBite size={24} className="text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-teal-600 p-4 rounded-xl text-white shadow-lg hover:shadow-xl transition">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xs md:text-sm font-medium opacity-90">
                  Hygiene Certified
                </h4>
                <p className="text-2xl md:text-3xl font-bold mt-1">{kpi.hygiene}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex justify-center items-center flex-shrink-0">
                <FaShieldAlt size={24} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <input
              type="text"
              placeholder=" Restaurant / Group Name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                fetchRestaurants(1, e.target.value, appliedFilters);
              }}
              className="w-full lg:w-72 border border-gray-300 bg-white px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] outline-none transition"
            />

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <button
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg shadow-md border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer transition flex-1 sm:flex-none"
                onClick={() => setShowFilterModal(true)}
              >
                <FiFilter size={18} /> Filter
              </button>

              <button
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg shadow-md border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer transition flex-1 sm:flex-none"
                onClick={handleExport}
              >
                <CiExport size={18} /> Export
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {Object.keys(appliedFilters).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600 font-medium">Active Filters:</span>
              {Object.entries(appliedFilters).map(([key, value]) => {
                // Skip empty values
                if (!value || (Array.isArray(value) && value.length === 0)) return null;

                return (
                  <div
                    key={key}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {getFilterDisplayText(key, value)}
                    <button
                      onClick={() => {
                        const newFilters = { ...appliedFilters };
                        delete newFilters[key];
                        setAppliedFilters(newFilters);
                        fetchRestaurants(1, search, newFilters);
                      }}
                      className="hover:text-red-600 transition"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                );
              })}
              <button
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer font-medium text-sm transition"
                onClick={() => {
                  setAppliedFilters({});
                  // Also reset location dropdowns
                  setCountry("");
                  setStateName("");
                  setCity("");
                  setStates([]);
                  setCities([]);
                  setShowFilterModal(false);
                  fetchRestaurants(1, search, {});
                }}
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs md:text-sm font-semibold text-gray-700">
                    S.No.
                  </th>
                  <th className="px-4 py-3 text-left text-xs md:text-sm font-semibold text-gray-700">
                    Logo
                  </th>
                  <th className="px-4 py-3 text-left text-xs md:text-sm font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs md:text-sm font-semibold text-gray-700">
                    Dish Types
                  </th>
                  <th className="px-4 py-3 text-center text-xs md:text-sm font-semibold text-gray-700">
                    Avg Rating
                  </th>
                  <th className="px-4 py-3 text-center text-xs md:text-sm font-semibold text-gray-700">
                    Permission
                  </th>
                  <th className="px-4 py-3 text-center text-xs md:text-sm font-semibold text-gray-700">
                    Dishes
                  </th>
                  <th className="px-4 py-3 text-center text-xs md:text-sm font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? [...Array(pagination.pageSize)].map((_, idx) => (
                    <tr key={idx} className="border-b border-gray-200 animate-pulse">
                      <td className="px-4 py-4">
                        <div className="h-4 bg-gray-300 rounded w-8"></div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 bg-gray-300 rounded w-32"></div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 bg-gray-300 rounded w-24"></div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 bg-gray-300 rounded w-16 mx-auto"></div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-8 w-8 bg-gray-300 rounded mx-auto"></div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-8 w-8 bg-gray-300 rounded mx-auto"></div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-8 w-24 bg-gray-300 rounded mx-auto"></div>
                      </td>
                    </tr>
                  ))
                  : restaurants.length > 0
                    ? restaurants.map((restro, index) => (
                      <tr
                        key={restro._id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition text-gray-700"
                      >
                        <td className="px-4 py-4 text-sm font-medium">
                          {(pagination.currentPage - 1) * pagination.pageSize +
                            (index + 1)}
                        </td>
                        <td className="px-4 py-4">
                          <img
                            src={
                              restro.restaurant_images?.[0]
                                ? `${IMAGE_URL}/${restro.restaurant_images[0]}`
                                : staticimg
                            }
                            alt={restro.restro_name}
                            className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition"
                            onClick={() =>
                              openImageModal(
                                restro.restaurant_images?.[0]
                                  ? `${IMAGE_URL}/${restro.restaurant_images[0]}`
                                  : staticimg
                              )
                            }
                          />
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-medium text-gray-900">
                            {truncateText(restro.restro_name, 25)}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2 items-center">
                            {restro.dishTypes && restro.dishTypes.length > 0
                              ? restro.dishTypes.slice(0, 4).map((dt) => (
                                <div
                                  key={dt._id}
                                  className="relative group"
                                  title={dt.name}
                                >
                                  <img
                                    src={
                                      dt.icon
                                        ? `${IMAGE_URL}/${dt.icon}`
                                        : staticimg
                                    }
                                    alt={dt.name}
                                    className="w-6 h-6 object-cover rounded-md hover:scale-110 transition cursor-pointer"
                                  />
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition z-10 pointer-events-none">
                                    {dt.name}
                                  </div>
                                </div>
                              ))
                              : <span className="text-xs text-gray-500">N/A</span>}
                            {restro.dishTypes && restro.dishTypes.length > 4 && (
                              <div className="relative group">
                                <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-300 text-gray-700 text-xs font-bold rounded-md cursor-pointer hover:bg-gray-400 transition">
                                  +{restro.dishTypes.length - 4}
                                </span>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition z-10 pointer-events-none">
                                  {restro.dishTypes
                                    .slice(4)
                                    .map((dt) => dt.name)
                                    .join(", ")}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-sm font-semibold text-yellow-600">
                              ★
                            </span>
                            <span className="text-sm font-medium">
                              {(restro.avgRating || 0).toFixed(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            title="Assign Permissions"
                            className="w-8 h-8 rounded-lg bg-[#F9832B] text-white hover:bg-[#ba580e] transition mx-auto flex items-center justify-center cursor-pointer"
                            onClick={() =>
                              navigate(`/PermissionAssignRestro/restaurant/${restro._id}`, {
                                state: {
                                  name: restro.restro_name,
                                  email: restro.email,
                                },
                              })
                            }
                          >
                            <MdAdminPanelSettings size={16} />
                          </button>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            className="w-8 h-8 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition mx-auto flex items-center justify-center cursor-pointer"
                            onClick={() => navigate(`/DishesList/${restro._id}`)}
                            title="View Dishes"
                          >
                            <MdRestaurantMenu size={16} />
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              className="w-8 h-8 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition flex items-center justify-center cursor-pointer"
                              onClick={() =>
                                navigate(`/RestroProfile/${restro._id}`)
                              }
                              title="View"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              className="w-8 h-8 rounded-lg bg-green-500 text-white hover:bg-green-600 transition flex items-center justify-center cursor-pointer"
                              onClick={() =>
                                navigate(`/UpdateRestaurant/${restro._id}`)
                              }
                              title="Edit"
                            >
                              <MdEdit size={16} />
                            </button>
                            <button
                              className="w-8 h-8 rounded-lg bg-red-500 text-white hover:bg-red-600 transition flex items-center justify-center cursor-pointer"
                              onClick={() => {
                                setSelectedRestaurant(restro);
                                setShowDeleteModal(true);
                              }}
                              title="Delete"
                            >
                              <MdDelete size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                    : (
                      <tr>
                        <td colSpan="8" className="px-4 py-8 text-center">
                          <p className="text-gray-500 text-sm">No restaurants found.</p>
                        </td>
                      </tr>
                    )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {restaurants.length > 0 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalItems={pagination.totalRecords}
              itemsPerPage={pagination.pageSize}
              onPageChange={(page) =>
                fetchRestaurants(page, search, appliedFilters)
              }
              totalPages={pagination.totalPages}
              type="backend"
            />
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
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
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <MdDelete size={20} className="text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                      Delete Restaurant
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      This action cannot be undone
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeDeleteModal}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <FiX size={24} />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 md:p-6 space-y-4">
                {/* Warning Message */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">
                    <strong>Warning:</strong> Deleting{" "}
                    <span className="font-semibold">{selectedRestaurant?.restro_name}</span> will
                    permanently remove all its data, including dishes, menus, ratings,
                    and related records. This action cannot be undone.
                  </p>
                </div>

                {/* Reason Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deletion Reason <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2 bg-gray-50 p-3 rounded-lg max-h-48 overflow-y-auto">
                    {[
                      "Violation of Terms",
                      "Duplicate Entry",
                      "Closed Permanently",
                      "Fake/Fraudulent",
                      "Owner Request",
                      "Quality Issues",
                      "Other"
                    ].map((option) => (
                      <label
                        key={option}
                        className="flex items-center gap-3 cursor-pointer hover:text-[#F9832B] transition"
                      >
                        <input
                          type="radio"
                          name="deleteReason"
                          value={option}
                          checked={deleteReason === option}
                          onChange={(e) => setDeleteReason(e.target.value)}
                          className="w-4 h-4 border-gray-300 cursor-pointer accent-red-600"
                        />
                        <span className="text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Additional Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Comment (Optional)
                  </label>
                  <textarea
                    value={deleteComment}
                    onChange={(e) => setDeleteComment(e.target.value)}
                    placeholder="Add any additional details about the deletion..."
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-red-500 outline-none text-sm resize-none"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 p-4 md:p-6 pt-0">
                <button
                  onClick={closeDeleteModal}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-gray-200 text-gray-700 cursor-pointer hover:bg-gray-300 font-medium text-sm transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={!deleteReason}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-red-600 text-white cursor-pointer hover:bg-red-700 font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <MdDelete size={16} />
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
      {/* Image Modal */}
      {isImageModalOpen && selectedImage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeImageModal}
          ></div>

          <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 z-10">
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-600 cursor-pointer transition text-2xl font-bold"
            >
              ✕
            </button>

            <img
              src={selectedImage}
              alt="Restaurant Logo"
              className="w-full h-auto object-contain rounded-lg max-h-96"
            />
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
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
              className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 md:p-6"
            >
              <h2 className="text-lg md:text-xl font-semibold text-gray-700 mb-4 md:mb-6">
                Apply Filters
              </h2>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <select
                  value={country}
                  onChange={handleCountryChange}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none text-sm"
                >
                  <option value="">Select Country</option>
                  {countries.map((c) => (
                    <option key={c.isoCode} value={c.isoCode}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <select
                  value={stateName}
                  onChange={handleStateChange}
                  disabled={!country}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none text-sm disabled:bg-gray-100"
                >
                  <option value="">Select State</option>
                  {states.map((s) => (
                    <option key={s.isoCode} value={s.isoCode}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={!stateName}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none text-sm disabled:bg-gray-100"
                >
                  <option value="">Select City</option>
                  {cities.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 md:gap-4">



                {/* Min Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Price (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 100"
                    value={appliedFilters["filters[minPrice]"] || ""}
                    onChange={(e) =>
                      setAppliedFilters((prev) => ({
                        ...prev,
                        "filters[minPrice]": e.target.value ? parseFloat(e.target.value) : undefined,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none text-sm"
                  />
                </div>

                {/* Max Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Price (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 500"
                    value={appliedFilters["filters[maxPrice]"] || ""}
                    onChange={(e) =>
                      setAppliedFilters((prev) => ({
                        ...prev,
                        "filters[maxPrice]": e.target.value ? parseFloat(e.target.value) : undefined,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none text-sm"
                  />
                </div>

                {/* Min Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Rating
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    placeholder="e.g., 3.5"
                    value={appliedFilters["filters[minRating]"] || ""}
                    onChange={(e) =>
                      setAppliedFilters((prev) => ({
                        ...prev,
                        "filters[minRating]": e.target.value ? parseFloat(e.target.value) : undefined,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none text-sm"
                  />
                </div>

                {/* Max Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Rating
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    placeholder="e.g., 4.8"
                    value={appliedFilters["filters[maxRating]"] || ""}
                    onChange={(e) =>
                      setAppliedFilters((prev) => ({
                        ...prev,
                        "filters[maxRating]": e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none text-sm"
                  />
                </div>

                {/* Date Range Filter */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Added Range
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Start Date */}
                    <input
                      type="date"
                      value={appliedFilters["filters[startDate]"] || ""}
                      onChange={(e) =>
                        setAppliedFilters((prev) => ({
                          ...prev,
                          "filters[startDate]": e.target.value || undefined,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none text-sm"
                    />
                    {/* End Date */}
                    <input
                      type="date"
                      value={appliedFilters["filters[endDate]"] || ""}
                      onChange={(e) =>
                        setAppliedFilters((prev) => ({
                          ...prev,
                          "filters[endDate]": e.target.value || undefined,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none text-sm"
                    />
                  </div>

                  {/* Dish Types Filter */}
                  <div>
                    <label className="block text-sm mt-3 font-medium text-gray-700 mb-2">
                      Dish Types
                    </label>
                    <div className="space-y-2 bg-gray-50 p-3 rounded-lg max-h-40 overflow-y-auto">
                      {filterOptions.dishTypes?.length > 0 ? (
                        filterOptions.dishTypes.map((dishType) => (
                          <label
                            key={dishType._id}
                            className="flex items-center gap-3 cursor-pointer hover:text-[#F9832B] transition"
                          >
                            <input
                              type="checkbox"
                              checked={(appliedFilters["filters[dishType][]"] || []).includes(
                                dishType._id
                              )}
                              onChange={(e) => {
                                const current = appliedFilters["filters[dishType][]"] || [];
                                const updated = e.target.checked
                                  ? [...current, dishType._id]
                                  : current.filter((item) => item !== dishType._id);
                                setAppliedFilters((prev) => ({
                                  ...prev,
                                  "filters[dishType][]": updated.length > 0 ? updated : undefined,
                                }));
                              }}
                              className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-[#F9832B]"
                            />
                            <span className="text-sm text-gray-700">
                              {dishType.name} ({dishType.count})
                            </span>
                          </label>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500">No options available</p>
                      )}
                    </div>
                  </div>

                  {/* Hygiene Status Filter */}
                  <div>
                    <label className="block text-sm mt-3 font-medium text-gray-700 mb-2">
                      Hygiene Status
                    </label>
                    <div className="space-y-2 bg-gray-50 p-3 rounded-lg max-h-40 overflow-y-auto">
                      {filterOptions.hygieneStatuses?.length > 0 ? (
                        filterOptions.hygieneStatuses.map((status) => (
                          <label
                            key={status._id}
                            className="flex items-center gap-3 cursor-pointer hover:text-[#F9832B] transition"
                          >
                            <input
                              type="checkbox"
                              checked={(appliedFilters["filters[hygieneStatus][]"] || []).includes(
                                status._id
                              )}
                              onChange={(e) => {
                                const current = appliedFilters["filters[hygieneStatus][]"] || [];
                                const updated = e.target.checked
                                  ? [...current, status._id]
                                  : current.filter((item) => item !== status._id);
                                setAppliedFilters((prev) => ({
                                  ...prev,
                                  "filters[hygieneStatus][]": updated.length > 0 ? updated : undefined,
                                }));
                              }}
                              className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-[#F9832B]"
                            />
                            <span className="text-sm text-gray-700">
                              {status._id} ({status.count})
                            </span>
                          </label>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500">No options available</p>
                      )}
                    </div>
                  </div>



                  {/* Account Status Filter */}
                  <div>
                    <label className="block text-sm mt-3 font-medium text-gray-700 mb-2">
                      Account Status
                    </label>
                    <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
                      {[
                        { _id: "active", label: "Active" },
                        { _id: "suspended", label: "Suspended" },
                        { _id: "banned", label: "Banned" },
                        { _id: "deleted", label: "Deleted" },
                      ].map((status) => (
                        <label
                          key={status._id}
                          className="flex items-center gap-3 cursor-pointer hover:text-[#F9832B] transition"
                        >
                          <input
                            type="checkbox"
                            checked={(appliedFilters["filters[accountStatus][]"] || []).includes(
                              status._id
                            )}
                            onChange={(e) => {
                              const current = appliedFilters["filters[accountStatus][]"] || [];
                              const updated = e.target.checked
                                ? [...current, status._id]
                                : current.filter((item) => item !== status._id);
                              setAppliedFilters((prev) => ({
                                ...prev,
                                "filters[accountStatus][]": updated.length > 0 ? updated : undefined,
                              }));
                            }}
                            className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-[#F9832B]"
                          />
                          <span className="text-sm text-gray-700">{status.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>



                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort by Rating
                  </label>
                  <select
                    value={appliedFilters["sort[]_rating"] || ""}
                    onChange={(e) => {
                      const sortArray = appliedFilters["sort[]"] ? [].concat(appliedFilters["sort[]"]) : [];
                      const filtered = sortArray.filter(s => !s.includes("rating"));

                      if (e.target.value) {
                        setAppliedFilters((prev) => ({
                          ...prev,
                          "sort[]": [...filtered, e.target.value],
                          "sort[]_rating": e.target.value,
                        }));
                      } else {
                        setAppliedFilters((prev) => ({
                          ...prev,
                          "sort[]": filtered,
                          "sort[]_rating": "",
                        }));
                      }
                    }}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none text-sm"
                  >
                    <option value="">No Sort</option>
                    <option value="rating_desc">High to Low</option>
                    <option value="rating_asc">Low to High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort by Price
                  </label>
                  <select
                    value={appliedFilters["sort[]_price"] || ""}
                    onChange={(e) => {
                      const sortArray = appliedFilters["sort[]"] ? [].concat(appliedFilters["sort[]"]) : [];
                      const filtered = sortArray.filter(s => !s.includes("price"));

                      if (e.target.value) {
                        setAppliedFilters((prev) => ({
                          ...prev,
                          "sort[]": [...filtered, e.target.value],
                          "sort[]_price": e.target.value,
                        }));
                      } else {
                        setAppliedFilters((prev) => ({
                          ...prev,
                          "sort[]": filtered,
                          "sort[]_price": "",
                        }));
                      }
                    }}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none text-sm"
                  >
                    <option value="">No Sort</option>
                    <option value="price_asc">Low to High</option>
                    <option value="price_desc">High to Low</option>
                  </select>
                </div> */}
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 mt-6 md:mt-8 pt-4 border-t">
                <button
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer font-medium text-sm transition"
                  onClick={() => {
                    setAppliedFilters({});
                    // Also reset location dropdowns
                    setCountry("");
                    setStateName("");
                    setCity("");
                    setStates([]);
                    setCities([]);
                    setShowFilterModal(false);
                    fetchRestaurants(1, search, {});
                  }}
                >
                  Clear All
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-[#F9832B] text-white hover:bg-[#e67600] cursor-pointer font-medium text-sm transition"
                  onClick={() => {
                    // Convert selected codes into readable names
                    const selectedCountryName = Country.getCountryByCode(country)?.name || "";
                    const selectedStateName = State.getStateByCodeAndCountry(stateName, country)?.name || "";
                    const selectedCityName = city || "";

                    // Create NEW filter object (don't merge with old appliedFilters)
                    const updatedFilters = {
                      // Only include filters that have values from the modal
                      ...(appliedFilters["filters[dishType][]"] && { "filters[dishType][]": appliedFilters["filters[dishType][]"] }),
                      ...(appliedFilters["filters[hygieneStatus][]"] && { "filters[hygieneStatus][]": appliedFilters["filters[hygieneStatus][]"] }),
                      ...(appliedFilters["filters[accountStatus][]"] && { "filters[accountStatus][]": appliedFilters["filters[accountStatus][]"] }),
                      ...(appliedFilters["filters[minPrice]"] && { "filters[minPrice]": appliedFilters["filters[minPrice]"] }),
                      ...(appliedFilters["filters[maxPrice]"] && { "filters[maxPrice]": appliedFilters["filters[maxPrice]"] }),
                      ...(appliedFilters["filters[minRating]"] && { "filters[minRating]": appliedFilters["filters[minRating]"] }),
                      ...(appliedFilters["filters[maxRating]"] && { "filters[maxRating]": appliedFilters["filters[maxRating]"] }),
                      ...(appliedFilters["filters[startDate]"] && { "filters[startDate]": appliedFilters["filters[startDate]"] }),
                      ...(appliedFilters["filters[endDate]"] && { "filters[endDate]": appliedFilters["filters[endDate]"] }),
                      // Add location filters from state (not from appliedFilters)
                      ...(selectedCountryName && { country: selectedCountryName }),
                      ...(selectedStateName && { state: selectedStateName }),
                      ...(selectedCityName && { city: selectedCityName }),
                    };

                    // Update filters + trigger fetch
                    setAppliedFilters(updatedFilters);
                    setShowFilterModal(false);
                    fetchRestaurants(1, search, updatedFilters);
                  }}
                >
                  Apply Filters
                </button>

              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

    </>

  )
}

export default RestroList;