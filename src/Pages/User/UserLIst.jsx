import React, { useEffect, useState } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import { FaSearch } from "react-icons/fa";
import { CiExport } from "react-icons/ci";
import axios from "axios";
import guest from "../../assets/images/guest.png";
import { BASE_URL, IMAGE_URL } from "../../config/Config";
import { toast } from "react-toastify";
import { FiEye } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import UserUpdateStatus from "../../components/UserUpdateStatus/UserUpdateStatus";
import DeleteModel from "../../components/common/DeleteModel/DeleteModel";
import Pagination from "../../components/common/Pagination/Pagination";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaUsers, FaUserAlt } from "react-icons/fa";
import { FaUserXmark, FaUserShield } from "react-icons/fa6";
import { IoFilterSharp } from "react-icons/io5";
import { Country, State, City } from "country-state-city";
import { motion, AnimatePresence } from "framer-motion";
import { FiFilter } from "react-icons/fi";

function UserList() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
  });

  // Location Filters
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [country, setCountry] = useState("");
  const [stateName, setStateName] = useState("");
  const [city, setCity] = useState("");

  // Advanced Filters
  const [tier, setTier] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [gender, setGender] = useState("");
  const [availableStatuses, setAvailableStatuses] = useState([]);
  const [availableTiers, setAvailableTiers] = useState([]);
  const [availableGenders, setAvailableGenders] = useState([]);

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [registrationFromDate, setRegistrationFromDate] = useState("");
  const [registrationToDate, setRegistrationToDate] = useState("");

  const navigate = useNavigate();

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
    const stateCities = City.getCitiesOfCountry(country, selectedState);
    setCities(stateCities || []);
    setCity("");
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setIsImageModalOpen(false);
  };

  const buildQueryParams = () => {
    const params = {
      page: 1,
      limit: 10,
      search: searchQuery,
    };

    if (country) {
      const countryObj = Country.getCountryByCode(country);
      params.country = countryObj?.name || "";
    }

    if (stateName) {
      const stateObj = State.getStateByCodeAndCountry(stateName, country);
      params.state = stateObj?.name || "";
    }

    if (city) {
      params.city = city;
    }

    if (tier && tier !== "") {
      params.tier = tier;
    }

    if (statusFilter && statusFilter !== "all") {
      params.status = statusFilter;
    }

    // Age Filter - Convert age to birth year
    if (minAge) {
      const currentYear = new Date().getFullYear();
      const maxBirthYear = currentYear - parseInt(minAge);
      params.minAge = parseInt(minAge);
    }

    if (maxAge) {
      const currentYear = new Date().getFullYear();
      const minBirthYear = currentYear - parseInt(maxAge);
      params.maxAge = parseInt(maxAge);
    }

    if (gender && gender !== "") {
      params.gender = gender;
    }

    // Registration Date Filter
    if (registrationFromDate) {
      params.registrationFromDate = registrationFromDate;
    }

    if (registrationToDate) {
      params.registrationToDate = registrationToDate;
    }

    return params;
  };

  const fetchUsers = async (page = 1) => {
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

      const response = await axios.get(`${BASE_URL}/admin/get-all-users`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      if (response.data.success) {
        setUsers(response.data.data.users);
        setPagination({
          currentPage: response.data.data.page,
          totalPages: response.data.data.totalPages,
          totalUsers: response.data.data.totalUsers,
        });
        setAvailableStatuses(response.data.data.filters?.availableStatuses || []);
        setAvailableTiers(response.data.data.filters?.availableTiers || []);
        setAvailableGenders(response.data.data.filters?.availableGenders || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(pagination.currentPage);
  }, [pagination.currentPage]);

  const handleExport = () => {
    const exportData = users.map((user, index) => ({
      SL: index + 1,
      Name: user.name,
      Email: user.email,
      Phone: user.fullPhone,
      Status: user.account_status,
      Gender: user.gender || "N/A",
      Age: user.birth_year ? new Date().getFullYear() - user.birth_year : "N/A",
      Created_At: new Date(user.createdAt).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const fileData = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(fileData, "Users.xlsx");
  };

  const openDeleteModal = (id) => {
    setSelectedCustomerId(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setSelectedCustomerId(null);
    setShowDeleteModal(false);
  };

  const confirmDelete = () => {
    setUsers((prevUsers) =>
      prevUsers.filter((user) => user._id !== selectedCustomerId)
    );
    closeDeleteModal();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCountry("");
    setStateName("");
    setCity("");
    setTier("");
    setStatusFilter("all");
    setMinAge("");
    setMaxAge("");
    setGender("");
    setShowFilterModal(false);
    fetchUsers(1);
    setRegistrationToDate("");
    setRegistrationFromDate("");

  };

  const applyFilters = () => {
    setShowFilterModal(false);
    fetchUsers(1);
  };

  const activeFiltersCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (country) count++;
    if (stateName) count++;
    if (city) count++;
    if (tier) count++;
    if (statusFilter !== "all") count++;
    if (minAge) count++;
    if (maxAge) count++;
    if (gender) count++;
    return count;
  };

  if (loading)
    return (
      <div className="flex items-center justify-start min-h-screen">
        <div className="flex flex-col items-center justify-center ml-64 w-full">
          <div className="w-16 h-16 border-4 border-[#F9832B] border-dashed rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-700 font-bold text-lg">Loading users...</p>
        </div>
      </div>
    );

  return (
    <div className="main main_page font-Montserrat space-y-4 duration-900">
      <BreadcrumbsNav
        customTrail={[{ label: "Users List", path: "/UserList" }]}
      />
      <PageTitle title={"Users"} />

      {/* Summary Cards */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-blue-900 p-3 rounded-xl text-white h-[100px] flex justify-between">
          <div>
            <h4 className="text-[12px] md:text-[14px]">Total Users</h4>
            <p className="text-[20px] md:text-[22px] font-semibold">{pagination.totalUsers}</p>
          </div>
          <div>
            <div className="w-15 h-15 bg-white/60 rounded-3xl flex justify-center items-center">
              <FaUsers size={30} className="text-blue-900" />
            </div>
          </div>
        </div>
        <div className="p-3 bg-green-500 rounded-xl text-white h-[100px] flex justify-between">
          <div>
            <h4 className="text-[12px] md:text-[14px]">Active Users</h4>
            <p className="text-[20px] md:text-[22px] font-semibold">
              {users.filter((u) => u.account_status === "active").length}
            </p>
          </div>
          <div>
            <div className="w-15 h-15 bg-white/60 rounded-3xl flex justify-center items-center">
              <FaUserAlt size={30} className="text-green-500" />
            </div>
          </div>
        </div>
        <div className="p-3 bg-yellow-500 rounded-xl text-white h-[100px] flex justify-between">
          <div>
            <h4 className="text-[12px] md:text-[14px]">Spam Users</h4>
            <p className="text-[20px] md:text-[22px] font-semibold">
              {users.filter((u) => u.account_status === "spam").length}
            </p>
          </div>
          <div>
            <div className="w-15 h-15 bg-white/60 rounded-3xl flex justify-center items-center">
              <FaUserXmark size={30} className="text-yellow-500" />
            </div>
          </div>
        </div>
        <div className="p-3 bg-red-500 rounded-xl text-white h-[100px] flex justify-between">
          <div>
            <h4 className="text-[12px] md:text-[14px]">Suspended</h4>
            <p className="text-[20px] md:text-[22px] font-semibold">
              {users.filter((u) => u.account_status === "suspended").length}
            </p>
          </div>
          <div>
            <div className="w-15 h-15 bg-white/60 rounded-3xl flex justify-center items-center">
              <FaUserShield size={30} className="text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="w-full h-auto p-2 md:p-3 mt-2 bg-white rounded-lg">
        <div className="flex flex-col gap-3 m-2 md:m-3">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row w-full gap-2">
            <input
              type="text"
              placeholder="Search by User Name, Email, Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  fetchUsers(1);
                }
              }}
              className="border border-gray-300 bg-white p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] outline-none flex-1"
            />
            <button
              onClick={() => fetchUsers(1)}
              className="px-4 py-2 rounded-lg bg-[#F9832B] text-white cursor-pointer hover:bg-[#e67600] shadow-md whitespace-nowrap"
            >
              Search
            </button>

            {/* Buttons Row */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-md border text-gray-600 hover:shadow-lg cursor-pointer relative whitespace-nowrap ${activeFiltersCount() > 0 ? "border-[#F9832B] bg-orange-50" : "border-gray-300"
                  }`}
                onClick={() => setShowFilterModal(true)}
              >
                <FiFilter size={20} /> Filter
                {activeFiltersCount() > 0 && (
                  <span className="absolute top-1 right-1 bg-[#F9832B] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFiltersCount()}
                  </span>
                )}
              </button>

              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md border border-gray-300 text-gray-600 hover:shadow-lg cursor-pointer whitespace-nowrap"
                onClick={handleExport}
              >
                <CiExport size={20} /> Export
              </button>
            </div>
          </div>


        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="mt-2 w-full border-collapse text-sm md:text-base">
            <thead className="bg-gray-100">
              <tr className="text-gray-700">
                <th className="text-[12px] md:text-[14px] px-3 md:px-4 py-3 text-left whitespace-nowrap">SL</th>
                <th className="text-[12px] md:text-[14px] px-3 md:px-4 py-3 text-left whitespace-nowrap">User</th>
                <th className="text-[12px] md:text-[14px] px-3 md:px-4 py-3 text-left whitespace-nowrap">Contact</th>
                <th className="text-[12px] md:text-[14px] px-3 md:px-4 py-3 text-center whitespace-nowrap">Status</th>
                <th className="text-[12px] md:text-[14px] px-3 md:px-4 py-3 text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="flex flex-col items-center justify-center p-6">
                      <div className="bg-white shadow-md border border-gray-200 rounded-xl p-6 w-full md:w-1/2 text-center">
                        <p className="text-gray-500 italic">No users found.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((item, index) => (
                  <tr key={item._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="text-[12px] md:text-[14px] px-3 md:px-4 py-3 text-left">
                      {(pagination.currentPage - 1) * 10 + index + 1}
                    </td>

                    <td className="text-[12px] md:text-[14px] px-3 md:px-4 py-3 text-left">
                      <div className="flex items-center gap-2">
                        <img
                          src={item.profile_picture ? `${IMAGE_URL}/${item.profile_picture}` : guest}
                          alt={item.name || "guest"}
                          className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover bg-amber-200 cursor-pointer hover:opacity-80"
                          onClick={() =>
                            openImageModal(item.profile_picture ? `${IMAGE_URL}/${item.profile_picture}` : guest)
                          }
                        />
                        <div className="font-semibold truncate">{item.name || "N/A"}</div>
                      </div>
                    </td>

                    <td className="text-[12px] md:text-[14px] px-3 md:px-4 py-3 text-left">
                      <div className="space-y-1">
                        <div className="font-semibold">{item.fullPhone || "N/A"}</div>
                        <div className="text-gray-500 text-xs md:text-sm truncate">{item.email}</div>
                      </div>
                    </td>

                    <td className="text-[12px] md:text-[14px] px-3 md:px-4 py-2 text-center">
                      <div
                        onClick={() => {
                          setSelectedCustomer(item);
                          setShowStatusModal(true);
                        }}
                        className={`cursor-pointer px-2 py-1 inline-flex justify-center items-center text-xs md:text-sm font-semibold rounded-full hover:opacity-90 transition ${item.account_status === "active"
                          ? "bg-green-200 text-green-700"
                          : item.account_status === "suspended"
                            ? "bg-yellow-200 text-yellow-700"
                            : item.account_status === "spam"
                              ? "bg-orange-200 text-orange-700"
                              : "bg-red-200 text-red-700"
                          }`}
                        title="Click to change status"
                      >
                        {item.account_status}
                      </div>
                    </td>

                    <td className="text-[12px] md:text-[14px] px-3 md:px-4 py-3 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          className="flex justify-center w-7 h-7 md:w-8 md:h-8 items-center rounded-lg bg-blue-500 text-white cursor-pointer hover:bg-blue-600 transition"
                          onClick={() => navigate(`/UserProfile/${item._id}`)}
                          title="View user details"
                        >
                          <FiEye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <Pagination
            currentPage={pagination.currentPage}
            totalItems={pagination.totalUsers}
            itemsPerPage={10}
            onPageChange={(page) => fetchUsers(page)}
            totalPages={pagination.totalPages}
            type="backend"
          />
        </div>
      </div>

      {/* Image Modal */}
      {isImageModalOpen && selectedImage && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeImageModal}
          ></div>
          <div className="relative bg-white rounded-xl shadow-lg max-w-md w-11/12 p-4 z-10">
            <button
              onClick={closeImageModal}
              className="absolute top-3 right-3 text-gray-700 text-xl font-bold hover:text-red-600 cursor-pointer"
            >
              ✕
            </button>
            <img
              src={selectedImage}
              alt="Profile"
              className="w-full h-auto object-contain rounded-lg"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {/* Country */}
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

                {/* State */}
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

                {/* City */}
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

                {/* Tier */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none text-sm"
                  >
                    <option value="">All Tiers</option>
                    <option value="White">White</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Sapphire">Sapphire</option>
                    <option value="Red">Red</option>
                  </select>
                </div>



                {/* Min Age */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Age
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="120"
                    placeholder="e.g., 18"
                    value={minAge}
                    onChange={(e) => setMinAge(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none text-sm"
                  />
                  {minAge && (
                    <p className="text-xs text-gray-500 mt-1">
                      Birth year: {new Date().getFullYear() - parseInt(minAge)} or earlier
                    </p>
                  )}
                </div>

                {/* Max Age */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Age
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="120"
                    placeholder="e.g., 60"
                    value={maxAge}
                    onChange={(e) => setMaxAge(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none text-sm"
                  />
                  {maxAge && (
                    <p className="text-xs text-gray-500 mt-1">
                      Birth year: {new Date().getFullYear() - parseInt(maxAge)} or later
                    </p>
                  )}
                </div>
                {/* Registration Date From */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registered From
                  </label>
                  <input
                    type="date"
                    value={registrationFromDate}
                    onChange={(e) => setRegistrationFromDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none text-sm"
                  />
                </div>

                {/* Registration Date To */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registered To
                  </label>
                  <input
                    type="date"
                    value={registrationToDate}
                    onChange={(e) => setRegistrationToDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none text-sm"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="banned">Banned</option>
                    <option value="spam">Spam</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-6 md:mt-8 pt-4 border-t">
                <button
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer font-medium text-sm"
                  onClick={clearFilters}
                >
                  Clear All
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-[#F9832B] text-white hover:bg-[#e67600] cursor-pointer font-medium text-sm"
                  onClick={applyFilters}
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Delete Modal */}
      <DeleteModel
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        redbutton="Yes, Delete"
        para="Do you really want to delete this User? This action cannot be undone."
      />

      {/* Status Update Modal */}
      {showStatusModal && selectedCustomer && (
        <UserUpdateStatus
          userId={selectedCustomer._id}
          status={selectedCustomer.account_status}
          reason={selectedCustomer.status_reason || ""}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedCustomer(null);
          }}
          onSuccess={() => {
            fetchUsers(pagination.currentPage);
            setShowStatusModal(false);
            setSelectedCustomer(null);
          }}
        />
      )}
    </div>
  );
}

export default UserList;