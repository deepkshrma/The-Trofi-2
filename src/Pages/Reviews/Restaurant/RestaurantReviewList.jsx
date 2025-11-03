import React, { useState, useEffect } from "react";
import { FaRegEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { Country, State, City } from "country-state-city";
import { STAR_RATINGS } from "../../../config/hashtagconfig";
import PageTitle from "../../../components/PageTitle/PageTitle";
import BreadcrumbsNav from "../../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import Pagination from "../../../components/common/Pagination/Pagination";
import guest from "../../../assets/images/guest.png";

import {
  FaStar,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
} from "react-icons/fa";
import { FiFilter } from "react-icons/fi";
import { CiExport } from "react-icons/ci";

import { BASE_URL, IMAGE_URL } from "../../../config/Config";

export default function RestaurantReviewList() {
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [minRating, setMinRating] = useState("");
  const [maxRating, setMaxRating] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [country, setCountry] = useState("");
  const [stateName, setStateName] = useState("");
  const [city, setCity] = useState("");
  const [isAdminReview, setIsAdminReview] = useState("");


  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    pageSize: 10,
  });
  const [kpi, setKpi] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    published: 0,
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 🔍 Fetch restaurant suggestions
  const fetchRestroList = async (query) => {
    try {
      if (!query.trim()) {
        setRestroList([]);
        return;
      }
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;
      const res = await axios.get(`${BASE_URL}/restro/get-restaurant-dropdown?search=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) setRestroList(res.data.data || []);
    } catch (err) {
      console.error("Error fetching restaurants:", err);
    }
  };



  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

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


  // ✅ Fetch Reviews from backend (with pagination, filters, search)
  const fetchReviews = async (
    page = 1,
    search = "",
    status = statusFilter,
    minRat = minRating,
    maxRat = maxRating,
    sDate = startDate,
    eDate = endDate,
    countryName = "",
    stateNameParam = "",
    cityName = "",
    adminReview = isAdminReview,
  ) => {
    try {
      setLoading(true);
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;
      if (!token) {
        toast.error("Please login first");
        navigate("/login");
        return;
      }

      let url = `${BASE_URL}/admin/get-ratings?type=Restaurant&page=${page}&limit=${pagination.pageSize}`;

      if (search.trim()) url += `&search=${search.trim()}`;
      if (status) url += `&status=${status}`;
      if (minRat) url += `&minRating=${minRat}`;
      if (maxRat) url += `&maxRating=${maxRat}`;
      if (sDate) url += `&startDate=${sDate}`;
      if (eDate) url += `&endDate=${eDate}`;
      if (countryName) url += `&country=${countryName}`;
      if (stateNameParam) url += `&state=${stateNameParam}`;
      if (cityName) url += `&city=${cityName}`;
      if (adminReview !== "") url += `&isAdminReview=${adminReview}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.success) {
        const { ratings, page, limit, totalCount, kpi } = res.data.data;
        setReviews(ratings || []);
        setPagination({
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalRecords: totalCount,
          pageSize: limit,
        });
        setKpi(kpi || {});
      } else {
        toast.error(res.data?.message || "Failed to fetch reviews");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1);
  }, []);

  // ✅ Export Excel
  const handleExport = () => {
    const exportData = reviews.map((rev, index) => ({
      "S.No.": (pagination.currentPage - 1) * pagination.pageSize + index + 1,
      "User Name": rev.is_admin_review
        ? (rev.displayName || "Admin Review")
        : (rev.userId?.name || "Anonymous"), // ✅ Updated
      "Restaurant Name": rev.typeId?.restro_name || "-",
      "Rating Label": STAR_RATINGS[rev.star_value - 1]?.label || rev.rating_label,
      Stars: rev.star_value,
      Comment: rev.reviewComment || "N/A",
      Status: rev.status,
      "Review Type": rev.is_admin_review ? "Admin" : "User", // ✅ Add this
      "Created At": new Date(rev.createdAt).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "RestaurantReviews");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "RestaurantReviews.xlsx");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setMinRating("");
    setMaxRating("");
    setStartDate("");
    setEndDate("");
    setShowFilterModal(false);
    fetchReviews(1, "", "", "", "", "", "", "", "", "", "");
    setCountry("");
    setStateName("");
    setCity("");
    setIsAdminReview("");
  };

  const applyFilters = () => {
    const selectedCountryName = Country.getCountryByCode(country)?.name || "";
    const selectedStateName = State.getStateByCodeAndCountry(stateName, country)?.name || "";
    const selectedCityName = city || "";

    setShowFilterModal(false);

    fetchReviews(
      1,
      searchTerm,
      statusFilter,
      minRating,
      maxRating,
      startDate,
      endDate,
      selectedCountryName,
      selectedStateName,
      selectedCityName,
      isAdminReview,

    );
  };


  const activeFiltersCount = () => {
    let count = 0;
    if (searchTerm.trim()) count++;
    if (statusFilter) count++;
    if (minRating) count++;
    if (maxRating) count++;
    if (startDate) count++;
    if (endDate) count++;
    if (country) count++;
    if (stateName) count++;
    if (city) count++;
    if (isAdminReview !== "") count++;
    return count;
  };

  if (loading && reviews.length === 0) {
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
      {/* ✅ Breadcrumbs */}
      <BreadcrumbsNav
        customTrail={[{ label: "Restaurant Review List", path: "/RestaurantReviewList" }]}
      />
      <PageTitle title={"Restaurant Reviews List"} />

      {/* ✅ KPI Cards */}
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

      {/* ✅ Main Content */}
      <div className="mt-2 bg-white shadow-md rounded-xl border border-gray-200 overflow-x-auto pb-3">
        {/* Search + Filter + Export */}
        <div className="flex flex-col gap-3 items-center m-3">
          <div className="flex flex-col sm:flex-row w-full gap-2">
            <input
              type="text"
              placeholder="Search by user/restaurant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchReviews(1, e.target.value, statusFilter, minRating, maxRating, startDate, endDate);
              }}
              className="border border-gray-300 bg-white p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] outline-none flex-1"
            />
            <button
              onClick={() => fetchReviews(1, searchTerm, statusFilter, minRating, maxRating, startDate, endDate)}
              className="px-4 py-2 rounded-lg bg-[#F9832B] text-white cursor-pointer hover:bg-[#e67600] shadow-md whitespace-nowrap"
            >
              Search
            </button>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-md border text-gray-600 cursor-pointer hover:shadow-lg relative whitespace-nowrap ${activeFiltersCount() > 0
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

        {/* Table */}
        <table className="w-full border-collapse text-sm md:text-base">
          <thead>
            <tr className="bg-gray-300 text-left">
              <th className="p-3 whitespace-nowrap">S.No</th>
              <th className="p-3 whitespace-nowrap">User Name</th>
              <th className="p-3 whitespace-nowrap">Restaurant Name</th>
              <th className="p-3 whitespace-nowrap">Rating Label</th>
              <th className="p-3 whitespace-nowrap">Rating</th>
              <th className="p-3 whitespace-nowrap">Comment</th>
              <th className="p-3 whitespace-nowrap">Status</th>
              <th className="p-3 whitespace-nowrap text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center p-4 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : reviews.length > 0 ? (
              reviews.map((rev, idx) => (
                <tr
                  key={rev._id}
                  className="border-b border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3 whitespace-nowrap">
                    {(pagination.currentPage - 1) * pagination.pageSize + (idx + 1)}
                  </td>


                  {/* ✅ User Name / Admin Name (Clickable) */}
                  <td
                    className={`p-3 whitespace-nowrap ${rev.is_admin_review && rev.adminId?._id
                        ? "text-[#F9832B] cursor-pointer hover:underline"
                        : rev.userId?._id
                          ? "text-[#F9832B] cursor-pointer hover:underline"
                          : "text-gray-700"
                      }`}
                    onClick={() => {
                      if (rev.is_admin_review && rev.adminId?._id) {
                        navigate(`/AdminProfileView/${rev.adminId._id}`);
                      } else if (rev.userId?._id) {
                        navigate(`/UserProfile/${rev.userId._id}`);
                      }
                    }}
                  >
                    {rev.is_admin_review ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            rev.adminId?.profile_picture
                              ? `${IMAGE_URL}/${rev.adminId.profile_picture}`
                              : guest
                          }
                          alt={rev.adminId?.name || "Admin"}
                          className="w-8 h-8 rounded-full object-cover border-2 border-purple-500"
                        />
                        <span className="font-medium">
                          {rev.adminId?.name || "Admin Review"}
                        </span>
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full border border-purple-300">
                          Admin
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {/* ✅ Existing user logic */}
                        <img
                          src={
                            rev.userId?.profile_picture
                              ? `${IMAGE_URL}/${rev.userId.profile_picture}`
                              : guest
                          }
                          alt={rev.userId?.name || "User"}
                          className="w-8 h-8 rounded-full object-cover border-2 border-orange-500"
                        />
                        <span>{rev.userId?.name || "Anonymous"}</span>
                      </div>
                    )}
                  </td>


                  {/* ✅ Restaurant Name (Clickable) */}
                  <td
                    className={`p-3 whitespace-nowrap ${rev.typeId?._id
                      ? "text-[#F9832B] cursor-pointer hover:underline"
                      : "text-gray-500"
                      }`}
                    onClick={() => {
                      if (rev.typeId?._id) navigate(`/RestroProfile/${rev.typeId._id}`);
                    }}
                  >
                    {rev.typeId?.restro_name || "-"}
                  </td>


                  <td className="p-3 whitespace-nowrap">
                    {STAR_RATINGS[rev.star_value - 1]?.label || rev.rating_label}
                  </td>
                  <td className="p-3">
                    <img
                      src={STAR_RATINGS[rev.star_value - 1]?.img}
                      alt={STAR_RATINGS[rev.star_value - 1]?.label || "star"}
                      className="w-10 h-10 md:w-12 md:h-12"
                    />
                  </td>
                  <td className="p-3 max-w-xs">
                    <div className="truncate text-sm">
                      {rev.reviewComment || "No comment"}
                    </div>
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-block min-w-[90px] text-center px-3 py-1 rounded-full text-xs font-semibold capitalize 
                      ${rev.status === "approved"
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : rev.status === "pending"
                            ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                            : rev.status === "rejected"
                              ? "bg-red-100 text-red-700 border border-red-300"
                              : rev.status === "published"
                                ? "bg-blue-100 text-blue-700 border border-blue-300"
                                : "bg-gray-100 text-gray-700 border border-gray-300"
                        }`}
                    >
                      {rev.status}
                    </span>
                  </td>

                  <td className="p-3 text-center">
                    <button
                      onClick={() =>
                        navigate(`/RestaurantReview/${rev._id}`, { state: rev })
                      }
                      className="cursor-pointer text-gray-700 hover:text-[#F9832B]"
                    >
                      <FaRegEye size={20} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center p-4 text-gray-500">
                  No reviews found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ✅ Pagination */}
        <Pagination
          currentPage={pagination.currentPage}
          totalItems={pagination.totalRecords}
          itemsPerPage={pagination.pageSize}
          totalPages={pagination.totalPages}
          onPageChange={(page) => fetchReviews(page, searchTerm, statusFilter, minRating, maxRating, startDate, endDate)}
          type="backend"
        />

        {/* Pagination Info */}
        <div className="flex justify-between items-center mt-4 px-3">
          <div className="text-sm text-gray-600">
            Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{" "}
            {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalRecords)} of{" "}
            {pagination.totalRecords} reviews
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

              {/* ===== Country ===== */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
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

              {/* ===== State ===== */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
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

              {/* ===== City ===== */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
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



              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


                {/* Min Rating */}
                <div>
                  <label className="block text-sm mt-3 font-medium text-gray-700 mb-1">
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
                  <label className="block text-sm mt-3 font-medium text-gray-700 mb-1">
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
                    Rating From
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
                    Rating To
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none"
                  />
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

                {/* Review Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Review Type
                  </label>
                  <select
                    value={isAdminReview}
                    onChange={(e) => setIsAdminReview(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none"
                  >
                    <option value="">All Reviews</option>
                    <option value="true">Admin Reviews Only</option>
                    <option value="false">User Reviews Only</option>
                  </select>
                </div>
              </div>

              {/* Active Filters Display */}
              {activeFiltersCount() > 0 && (
                <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Active Filters ({activeFiltersCount()}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {/* ✅ ADD location filters */}
                    {country && (
                      <span className="px-2 py-1 bg-white rounded-full text-xs border border-gray-300">
                        Country: {Country.getCountryByCode(country)?.name}
                      </span>
                    )}
                    {stateName && (
                      <span className="px-2 py-1 bg-white rounded-full text-xs border border-gray-300">
                        State: {State.getStateByCodeAndCountry(stateName, country)?.name}
                      </span>
                    )}
                    {city && (
                      <span className="px-2 py-1 bg-white rounded-full text-xs border border-gray-300">
                        City: {city}
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
                    {searchTerm.trim() && (
                      <span className="px-2 py-1 bg-white rounded-full text-xs border border-gray-300">
                        Search: {searchTerm}
                      </span>
                    )}

                    {isAdminReview !== "" && (
                      <span className="px-2 py-1 bg-white rounded-full text-xs border border-gray-300">
                        Type: {isAdminReview === "true" ? "Admin Reviews" : "User Reviews"}
                      </span>
                    )}


                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 cursor-pointer hover:bg-gray-300 font-medium"
                  onClick={clearFilters}
                >
                  Clear All
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-[#F9832B] text-white cursor-pointer hover:bg-[#e67600] font-medium"
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