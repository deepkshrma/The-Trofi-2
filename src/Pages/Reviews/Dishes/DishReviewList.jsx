import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FiEye, FiFilter } from "react-icons/fi";
import { CiExport } from "react-icons/ci";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import { Country, State, City } from "country-state-city";
import { saveAs } from "file-saver";
import { BASE_URL, IMAGE_URL } from "../../../config/Config";
import { FaCheckCircle, FaHourglassHalf, FaRegEye, FaStar, FaTimesCircle } from "react-icons/fa";
import { STAR_RATINGS } from "../../../config/hashtagconfig";
import Pagination from "../../../components/common/Pagination/Pagination";

function DishReviewList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Add these new state variables after existing filter states:
  const [country, setCountry] = useState("");
  const [stateName, setStateName] = useState("");
  const [city, setCity] = useState("");
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });

  // KPI Stats
  const [kpi, setKpi] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    published: 0,
  });

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [restaurantFilter, setRestaurantFilter] = useState("");
  const [minRating, setMinRating] = useState("");
  const [maxRating, setMaxRating] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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
    const stateCities = City.getCitiesOfState(country, selectedState);
    setCities(stateCities || []);
    setCity("");
  };

  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    fetchReviews(pagination.currentPage);
  }, [pagination.currentPage]);

  const fetchRestaurants = async () => {
    try {
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;
      if (!token) return;

      const response = await axios.get(`${BASE_URL}/restro/get-restaurant-dropdown`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setRestaurants(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch restaurants:", error);
    }
  };

  const buildQueryParams = () => {
    const params = {
      type: "Dish",
      page: pagination.currentPage,
      limit: 10,
    };

    if (searchQuery.trim()) params.search = searchQuery.trim();
    if (statusFilter) params.status = statusFilter;
    if (restaurantFilter) params.restaurantId = restaurantFilter;
    if (minRating) params.minRating = minRating;
    if (maxRating) params.maxRating = maxRating;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    if (!restaurantFilter) {
      if (country) {
        const selectedCountryName = Country.getCountryByCode(country)?.name || "";
        if (selectedCountryName) params.country = selectedCountryName;
      }
      if (stateName) {
        const selectedStateName = State.getStateByCodeAndCountry(stateName, country)?.name || "";
        if (selectedStateName) params.state = selectedStateName;
      }
      if (city) params.city = city;
    }

    return params;
  };

  const fetchReviews = async (page = 1) => {
    setLoading(true);
    try {
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;
      if (!token) {
        toast.error("Please login first");
        return;
      }

      const params = buildQueryParams();
      params.page = page;

      const response = await axios.get(`${BASE_URL}/admin/get-ratings`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      if (response.data.success) {
        setReviews(response.data.data.ratings);
        setPagination({
          currentPage: response.data.data.page,
          totalPages: response.data.data.totalPages,
          totalCount: response.data.data.totalCount,
        });
        setKpi(response.data.data.kpi);
      }
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error("Permission denied. Please contact admin.");
      } else if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        navigate("/login");
      } else {
        toast.error("Failed to fetch reviews");
      }
    }
    finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const exportData = reviews.map((review, index) => ({
      SL: (pagination.currentPage - 1) * 10 + index + 1,
      Dish_Name: review.typeId?.dish_name || "N/A",
      User_Name: review.userId?.name || "N/A",
      Rating: review.star_value,
      Rating_Label: review.rating_label || "N/A",
      Comment: review.reviewComment || "N/A",
      Status: review.status,
      Created_At: new Date(review.createdAt).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dish Reviews");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const fileData = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(fileData, "Dish_Reviews.xlsx");
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setRestaurantFilter("");
    setMinRating("");
    setMaxRating("");
    setStartDate("");
    setEndDate("");
    setShowFilterModal(false);
    fetchReviews(1);
    setCountry("");        // ✅ ADD
    setStateName("");      // ✅ ADD
    setCity("");
  };

  const applyFilters = () => {
    setShowFilterModal(false);
    fetchReviews(1);
  };

  const activeFiltersCount = () => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (statusFilter) count++;
    if (restaurantFilter) count++;
    if (minRating) count++;
    if (maxRating) count++;
    if (startDate) count++;
    if (endDate) count++;
    if (country && !restaurantFilter) count++;     // ✅ ADD
    if (stateName && !restaurantFilter) count++;   // ✅ ADD
    if (city && !restaurantFilter) count++;
    return count;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-[#F9832B] border-dashed rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-700 font-bold text-lg">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main main_page p-6 duration-900">
      {/* Page Title */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dish Reviews</h1>
      </div>



      {/* ✅ KPI Cards (Old Theme) */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-900 p-3 rounded-xl text-white h-[100px] flex justify-between items-center">
          <div>
            <h4 className="text-[14px]">Total Reviews</h4>
            <p className="text-[22px] font-semibold">{kpi.total}</p>
          </div>
          <div className="w-15 h-15 bg-white/60 rounded-3xl flex justify-center items-center">
            <FaStar size={35} className="text-blue-900" />
          </div>
        </div>

        <div className="p-3 bg-green-500 rounded-xl text-white h-[100px] flex justify-between items-center">
          <div>
            <h4 className="text-[14px]">Approved Reviews</h4>
            <p className="text-[22px] font-semibold">{kpi.approved}</p>
          </div>
          <div className="w-15 h-15 bg-white/60 rounded-3xl flex justify-center items-center">
            <FaCheckCircle size={35} className="text-green-500" />
          </div>
        </div>

        <div className="p-3 bg-yellow-500 rounded-xl text-white h-[100px] flex justify-between items-center">
          <div>
            <h4 className="text-[14px]">Pending Reviews</h4>
            <p className="text-[22px] font-semibold">{kpi.pending}</p>
          </div>
          <div className="w-15 h-15 bg-white/60 rounded-3xl flex justify-center items-center">
            <FaHourglassHalf size={35} className="text-yellow-500" />
          </div>
        </div>

        <div className="p-3 bg-red-500 rounded-xl text-white h-[100px] flex justify-between items-center">
          <div>
            <h4 className="text-[14px]">Rejected Reviews</h4>
            <p className="text-[22px] font-semibold">{kpi.rejected}</p>
          </div>
          <div className="w-15 h-15 bg-white/60 rounded-3xl flex justify-center items-center">
            <FaTimesCircle size={35} className="text-red-500" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow p-4">
        {/* Search and Filter Bar */}
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex flex-col sm:flex-row w-full gap-2">
            <input
              type="text"
              placeholder="Search by Dish Name, User Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchReviews(1);
              }}
              className="border border-gray-300 bg-white p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] outline-none flex-1"
            />
            <button
              onClick={() => fetchReviews(1)}
              className="px-4 py-2 rounded-lg bg-[#F9832B] text-white cursor-pointer hover:bg-[#e67600] shadow-md whitespace-nowrap"
            >
              Search
            </button>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-md border text-gray-600 hover:shadow-lg relative whitespace-nowrap ${activeFiltersCount() > 0
                  ? "border-[#F9832B] bg-orange-50"
                  : "border-gray-300"
                  }`}
                onClick={() => setShowFilterModal(true)}
              >
                <FiFilter size={20} /> Filter
                {activeFiltersCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#F9832B] text-white cursor-pointer text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFiltersCount()}
                  </span>
                )}
              </button>

              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer shadow-md border border-gray-300 text-gray-600 hover:shadow-lg whitespace-nowrap"
                onClick={handleExport}
              >
                <CiExport size={20} /> Export
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-100">
              <tr className="text-gray-700">
                <th className="px-4 py-3 text-left">SL</th>
                <th className="px-4 py-3 text-left">Dish</th>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-center">Rating</th>
                <th className="px-4 py-3 text-left">Comment</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Date</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">
                    <p className="text-gray-500 italic">No reviews found.</p>
                  </td>
                </tr>
              ) : (
                reviews.map((review, index) => (
                  <tr
                    key={review._id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      {(pagination.currentPage - 1) * 10 + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={review.images?.[0]?.image ? `${IMAGE_URL}/${review.images[0].image}` : "/placeholder.jpg"}
                          alt={review.typeId?.dish_name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />

                        <div>
                          {/* ✅ Dish Name Clickable */}
                          <div
                            className={`font-semibold ${review.typeId?._id
                              ? "text-[#F9832B] cursor-pointer hover:underline"
                              : "text-gray-700"
                              }`}
                            onClick={() => {
                              if (review.typeId?._id) navigate(`/DishDetails/${review.typeId._id}`);
                            }}
                          >
                            {review.typeId?.dish_name || "N/A"}
                          </div>

                          {/* ✅ Optional: Show Restaurant name clickable if available */}
                          {review.typeId?.restro_id && (
                            <div
                              className="text-xs text-gray-500 cursor-pointer hover:underline"
                              onClick={() => navigate(`/RestroProfile/${review.typeId.restro_id}`)}
                            >
                              Restaurant ID: {review.typeId.restro_id}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td
                      className={`px-4 py-3 whitespace-nowrap ${review.userId?._id
                          ? "text-[#F9832B] cursor-pointer hover:underline"
                          : "text-gray-500"
                        }`}
                      onClick={() => {
                        if (review.userId?._id) navigate(`/UserProfile/${review.userId._id}`);
                      }}
                    >
                      {review.userId?.name || "Anonymous"}
                    </td>
                    <td className="p-3">
                      <img
                        src={STAR_RATINGS[review.star_value - 1]?.img}
                        alt={STAR_RATINGS[review.star_value - 1]?.label || "star"}
                        className="w-10 h-10 md:w-12 md:h-12"
                      />
                    </td>

                    <td className="px-4 py-3 max-w-xs">
                      <div className="truncate">
                        {review.reviewComment || "No comment"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${review.status === "published"
                          ? "bg-green-100 text-green-700"
                          : review.status === "approved"
                            ? "bg-blue-100 text-blue-700"
                            : review.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                      >
                        {review.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-600">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => navigate(`/DishReview/${review._id}`, { state: review })}
                        className="cursor-pointer text-gray-700 hover:text-[#F9832B]"
                      >
                        <FaRegEye size={20} />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
          <Pagination
            currentPage={pagination.currentPage}
            totalItems={pagination.totalRecords}
            itemsPerPage={pagination.pageSize}
            totalPages={pagination.totalPages}
            onPageChange={(page) => fetchReviews(page, searchQuery, statusFilter, restaurantFilter, minRating, maxRating, startDate, endDate)}
            type="backend"
          />


          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Showing {(pagination.currentPage - 1) * 10 + 1} to{" "}
              {Math.min(pagination.currentPage * 10, pagination.totalCount)} of{" "}
              {pagination.totalCount} reviews
            </div>
          </div>
        </div>
      </div>

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
              className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
            >
              <h2 className="text-xl font-semibold text-gray-700 mb-6">
                Apply Filters
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Restaurant Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Restaurant
                  </label>
                  <select
                    value={restaurantFilter}
                    onChange={(e) => setRestaurantFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none"
                  >
                    <option value="">All Restaurants</option>
                    {restaurants.map((restaurant) => (
                      <option key={restaurant._id} value={restaurant._id}>
                        {restaurant.restro_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ===== Country Filter ===== */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country {restaurantFilter && <span className="text-xs text-gray-500">(Disabled when restaurant selected)</span>}
                  </label>
                  <select
                    value={country}
                    onChange={handleCountryChange}
                    disabled={!!restaurantFilter}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Country</option>
                    {countries.map((c) => (
                      <option key={c.isoCode} value={c.isoCode}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ===== State Filter ===== */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <select
                    value={stateName}
                    onChange={handleStateChange}
                    disabled={!country || !!restaurantFilter}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select State</option>
                    {states.map((s) => (
                      <option key={s.isoCode} value={s.isoCode}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ===== City Filter ===== */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={!stateName || !!restaurantFilter}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select City</option>
                    {cities.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="published">Published</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Min Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Rating
                  </label>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none"
                  >
                    <option value="">Any</option>
                    <option value="1">1 Star</option>
                    <option value="2">2 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>

                {/* Max Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Rating
                  </label>
                  <select
                    value={maxRating}
                    onChange={(e) => setMaxRating(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none"
                  >
                    <option value="">Any</option>
                    <option value="1">1 Star</option>
                    <option value="2">2 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none"
                  />
                </div>
              </div>

              {/* Active Filters Display */}
              {activeFiltersCount() > 0 && (
                <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Active Filters ({activeFiltersCount()}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {restaurantFilter && (
                      <span className="px-2 py-1 bg-white rounded-full text-xs border border-gray-300">
                        Restaurant: {restaurants.find(r => r._id === restaurantFilter)?.restro_name}
                      </span>
                    )}
                    {statusFilter && (
                      <span className="px-2 py-1 bg-white rounded-full text-xs border border-gray-300">
                        Status: {statusFilter}
                      </span>
                    )}
                    {minRating && (
                      <span className="px-2 py-1 bg-white rounded-full text-xs border border-gray-300">
                        Min Rating: {minRating}★
                      </span>
                    )}
                    {maxRating && (
                      <span className="px-2 py-1 bg-white rounded-full text-xs border border-gray-300">
                        Max Rating: {maxRating}★
                      </span>
                    )}
                    {startDate && (
                      <span className="px-2 py-1 bg-white rounded-full text-xs border border-gray-300">
                        From: {new Date(startDate).toLocaleDateString()}
                      </span>
                    )}
                    {endDate && (
                      <span className="px-2 py-1 bg-white rounded-full text-xs border border-gray-300">
                        To: {new Date(endDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium"
                  onClick={clearFilters}
                >
                  Clear All
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-[#F9832B] text-white hover:bg-[#e67600] font-medium"
                  onClick={applyFilters}
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

export default DishReviewList;