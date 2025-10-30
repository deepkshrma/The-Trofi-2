// @ts-nocheck
import React, { useEffect, useState } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import { CiExport } from "react-icons/ci";
import { FiEye, FiFilter } from "react-icons/fi";
import { FaUserSlash, FaUserXmark, FaUsers } from "react-icons/fa6";
import { toast } from "react-toastify";
import axios from "axios";
import guest from "../../assets/images/guest.png";
import { BASE_URL, IMAGE_URL } from "../../config/Config";
import Pagination from "../../components/common/Pagination/Pagination";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import { Country, State, City } from "country-state-city";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";

function DeletedUserList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalUsers: 0,
    });

    // Filters
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [country, setCountry] = useState("");
    const [stateName, setStateName] = useState("");
    const [city, setCity] = useState("");
    const [deletedFromDate, setDeletedFromDate] = useState("");
    const [deletedToDate, setDeletedToDate] = useState("");
    const [showFilterModal, setShowFilterModal] = useState(false);

    // Image modal
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

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

    const openImageModal = (url) => {
        setSelectedImage(url);
        setIsImageModalOpen(true);
    };

    const closeImageModal = () => {
        setSelectedImage(null);
        setIsImageModalOpen(false);
    };

    // 🔹 Build Filters
    const buildQueryParams = (page = 1) => {
        const params = { page, limit: 10, search: searchQuery.trim() };

        if (country) {
            const countryObj = Country.getCountryByCode(country);
            params.country = countryObj?.name || "";
        }
        if (stateName) {
            const stateObj = State.getStateByCodeAndCountry(stateName, country);
            params.state = stateObj?.name || "";
        }
        if (city) params.city = city;
        if (deletedFromDate) params.deletedFromDate = deletedFromDate;
        if (deletedToDate) params.deletedToDate = deletedToDate;

        return params;
    };

    // 🔹 Fetch Deleted Users
    const fetchDeletedUsers = async (page = 1) => {
        setLoading(true);
        try {
            const authData = JSON.parse(localStorage.getItem("trofi_user"));
            const token = authData?.token;
            if (!token) {
                toast.error("Please login first");
                return;
            }

            const params = buildQueryParams(page);
            const { data } = await axios.get(`${BASE_URL}/admin/self-deleted-users`, {
                headers: { Authorization: `Bearer ${token}` },
                params,
            });

            if (data.success) {
                setUsers(data.data.users || []);
                setPagination({
                    currentPage: data.data.page,
                    totalPages: data.data.totalPages,
                    totalUsers: data.data.totalUsers,
                });
            } else {
                toast.error(data.message || "Failed to fetch deleted users");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch deleted users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeletedUsers(1);
    }, []);

    // 🔹 Clear Filters
    const clearFilters = () => {
        setCountry("");
        setStateName("");
        setCity("");
        setDeletedFromDate("");
        setDeletedToDate("");
        setShowFilterModal(false);
        fetchDeletedUsers(1);
    };

    const applyFilters = () => {
        setShowFilterModal(false);
        fetchDeletedUsers(1);
    };

    // 🔹 Export to Excel
    const handleExport = () => {
        const exportData = users.map((u, i) => ({
            "S.No.": i + 1,
            Name: u.deleted_name || u.name || "N/A",
            Email: u.deleted_email || u.email || "N/A",
            Phone: u.deleted_phone || u.fullPhone || "N/A",
            "Deleted At": new Date(u.deletedAt).toLocaleString(),
            Reason: u.status_reason || "N/A",
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Deleted Users");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, "DeletedUsers.xlsx");
    };

    if (loading)
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-[#F9832B] border-dashed rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-700 font-semibold">Loading deleted users...</p>
                </div>
            </div>
        );

    return (
        <div className="main main_page font-Montserrat space-y-4 duration-900">
            <BreadcrumbsNav
                customTrail={[{ label: "Users", path: "/UserList" }, { label: "Deleted Users", path: "/DeletedUserList" }]}
            />
            <PageTitle title="Deleted Users" />

            {/* KPI Cards */}
            {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mt-4">
        <div className="bg-red-600 text-white p-3 rounded-xl flex justify-between h-[100px]">
          <div>
            <h4 className="text-[13px] md:text-[14px]">Total Deleted Users</h4>
            <p className="text-[22px] font-semibold">{pagination.totalUsers}</p>
          </div>
          <div className="w-15 h-15 bg-white/50 rounded-3xl flex justify-center items-center">
            <FaUserSlash size={32} className="text-red-600" />
          </div>
        </div>

        <div className="bg-yellow-500 text-white p-3 rounded-xl flex justify-between h-[100px]">
          <div>
            <h4 className="text-[13px] md:text-[14px]">Recently Deleted</h4>
            <p className="text-[22px] font-semibold">
              {users.filter(
                (u) => new Date(u.deletedAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              ).length}
            </p>
          </div>
          <div className="w-15 h-15 bg-white/60 rounded-3xl flex justify-center items-center">
            <FaUserXmark size={32} className="text-yellow-500" />
          </div>
        </div>

        <div className="bg-blue-600 text-white p-3 rounded-xl flex justify-between h-[100px]">
          <div>
            <h4 className="text-[13px] md:text-[14px]">All Users</h4>
            <p className="text-[22px] font-semibold">{pagination.totalUsers}</p>
          </div>
          <div className="w-15 h-15 bg-white/60 rounded-3xl flex justify-center items-center">
            <FaUsers size={32} className="text-blue-600" />
          </div>
        </div>
      </div> */}

            {/* Search + Buttons */}
            <div className="bg-white shadow-md rounded-xl border border-gray-200 p-4 mt-3 flex flex-col sm:flex-row justify-between gap-3">
                <div className="flex w-full sm:w-auto gap-2">
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && fetchDeletedUsers(1)}
                        className="border border-gray-300 bg-white p-2 rounded-lg  shadow-sm focus:ring-2 focus:ring-[#F9832B] outline-none w-full sm:w-72"
                    />
                    <button
                        onClick={() => fetchDeletedUsers(1)}
                        className="px-4 py-2 rounded-lg bg-[#F9832B] text-white cursor-pointer hover:bg-[#e67600] shadow-md whitespace-nowrap"
                    >
                        Search
                    </button>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setShowFilterModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:shadow-md cursor-pointer"
                    >
                        <FiFilter size={18} /> Filters
                    </button>

                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:shadow-md cursor-pointer"
                    >
                        <CiExport size={20} /> Export
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 mt-3 shadow-sm">
                <table className="w-full border-collapse text-sm  md:text-base">
                    <thead className="bg-gray-100">
                        <tr className="text-gray-700">
                            <th className="p-3 text-left">S.No.</th>
                            <th className="p-3 text-left">User</th>
                            <th className="p-3 text-left">Deleted Info</th>
                            <th className="p-3 text-left">Deleted At</th>
                            <th className="p-3 text-left">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-6 text-gray-500 italic">
                                    No deleted users found.
                                </td>
                            </tr>
                        ) : (
                            users.map((user, index) => (
                                <tr key={user._id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="p-3">{index + 1}</td>
                                    <td className="p-3 flex items-center gap-2">
                                        <img
                                            src={user.profile_picture ? `${IMAGE_URL}/${user.profile_picture}` : guest}
                                            alt={user.deleted_name || user.name}
                                            className="w-8 h-8 rounded-full object-cover cursor-pointer"
                                            onClick={() =>
                                                openImageModal(user.profile_picture ? `${IMAGE_URL}/${user.profile_picture}` : guest)
                                            }
                                        />
                                        <div>
                                            <p className="font-semibold text-gray-800">{user.deleted_name || user.name || "N/A"}</p>
                                            <p className="text-xs text-gray-500 truncate max-w-[150px]">{user.deleted_email || user.email}</p>
                                        </div>
                                    </td>
                                    <td className="p-3 text-sm text-gray-700">
                                        <p>
                                            <span className="font-medium">Phone:</span> {user.deleted_phone || user.fullPhone || "N/A"}
                                        </p>
                                        <p className="text-gray-500">{user.status_reason || "User deleted their account"}</p>
                                    </td>
                                    <td className="p-3 text-sm">{new Date(user.deletedAt).toLocaleString()}</td>
                                    <td className="p-3 text-center">
                                        <button
                                            onClick={() => navigate(`/DeletedUserDetails/${user._id}`)}
                                            className="flex justify-center w-7 h-7 md:w-8 md:h-8 items-center rounded-lg bg-blue-500 text-white cursor-pointer hover:bg-blue-600 transition"
                                        >
                                            <FiEye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                <Pagination
                    currentPage={pagination.currentPage}
                    totalItems={pagination.totalUsers}
                    itemsPerPage={10}
                    onPageChange={(page) => fetchDeletedUsers(page)}
                    totalPages={pagination.totalPages}
                    type="backend"
                />

            </div>


            {/* Image Modal */}
            {isImageModalOpen && selectedImage && (
                <AnimatePresence>
                    <motion.div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="relative bg-white rounded-xl shadow-lg max-w-md w-11/12 p-4 z-10">
                            <button
                                onClick={closeImageModal}
                                className="absolute top-3 right-3 text-gray-700 text-xl font-bold hover:text-red-600 cursor-pointer"
                            >
                                ✕
                            </button>
                            <img src={selectedImage} alt="Profile" className="w-full h-auto object-contain rounded-lg" />
                        </div>
                    </motion.div>
                </AnimatePresence>
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
                                Filter Deleted Users
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                {/* Country */}
                                {/* <div>
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
                                </div> */}

                                {/* State */}
                                {/* <div>
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
                                </div> */}

                                {/* City */}
                                {/* <div>
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
                                </div> */}

                                {/* Deleted From */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Deleted From</label>
                                    <input
                                        type="date"
                                        value={deletedFromDate}
                                        onChange={(e) => setDeletedFromDate(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none text-sm"
                                    />
                                </div>

                                {/* Deleted To */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Deleted To</label>
                                    <input
                                        type="date"
                                        value={deletedToDate}
                                        onChange={(e) => setDeletedToDate(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none text-sm"
                                    />
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end mt-6 gap-2 md:gap-3">
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm cursor-pointer font-medium"
                                >
                                    Clear
                                </button>
                                <button
                                    onClick={applyFilters}
                                    className="px-4 py-2 rounded-lg bg-[#F9832B] text-white cursor-pointer hover:bg-[#e67600] text-sm font-medium"
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

export default DeletedUserList;
