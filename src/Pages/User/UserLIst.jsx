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

  // Filters
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [country, setCountry] = useState("India");
  const [stateName, setStateName] = useState("Rajasthan");
  const [city, setCity] = useState("");


  const [tier, setTier] = useState("");
  const [availableStatuses, setAvailableStatuses] = useState([]);


  const [showFilterModal, setShowFilterModal] = useState(false);
  const [address, setAddress] = useState("");

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);


  const navigate = useNavigate();

  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);


  const handleCountryChange = (e) => {
    const selectedCountry = e.target.value;
    setCountry(selectedCountry);
    setStates(State.getStatesOfCountry(selectedCountry));
    setStateName("");
    setCities([]);
    setCity("");
  };

  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    setStateName(selectedState);
    setCities(City.getCitiesOfState(country, selectedState));
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

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;
      if (!token) {
        toast.error("Please login first");
        return;
      }

      const response = await axios.get(
        `${BASE_URL}/admin/get-all-users?page=${page}&limit=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            search: searchQuery,
            city: city ? City.getCitiesOfState(country, stateName).find(ct => ct.name === city)?.name || "" : "",
            state: stateName ? State.getStatesOfCountry(country).find(s => s.isoCode === stateName)?.name || "" : "",
            country: country ? Country.getCountryByCode(country)?.name || "" : "",
            tier,
            status: statusFilter !== "all" ? statusFilter : "",
          },

        }
      );

      if (response.data.success) {
        setUsers(response.data.data.users);
        setPagination({
          currentPage: response.data.data.page,
          totalPages: response.data.data.totalPages,
          totalUsers: response.data.data.totalUsers,
        });
        setAvailableStatuses(response.data.data.availableStatuses || []);
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




  if (loading)
    return (
      <div className="flex items-center justify-start min-h-screen">
        <div className="flex flex-col items-center justify-center ml-64 w-full">
          <div className="w-16 h-16 border-4 border-[#F9832B] border-dashed rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-700 font-bold text-lg">Loading users...</p>
        </div>
      </div>
    );

  const fetchFilteredData = () => {
    fetchUsers(1);
  };


  return (
    <div className="main main_page font-Montserrat space-y-4 duration-900">
      <BreadcrumbsNav
        customTrail={[{ label: "Users List", path: "/UserList" }]}
      />
      <PageTitle title={"Users"} />

      {/* Summary Cards */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-900 p-3 rounded-xl text-white h-[100px] flex justify-between">
          <div>
            <h4 className="text-[14px]">Total Users</h4>
            <p className="text-[22px] font-semibold">{pagination.totalUsers}</p>
          </div>
          <div>
            <div className="w-15 h-15 bg-white/60 rounded-3xl flex justify-center items-center">
              <FaUsers size={35} className="text-blue-900" />
            </div>
          </div>
        </div>
        <div className="p-3 bg-green-500 rounded-xl text-white h-[100px] flex justify-between">
          <div>
            <h4 className="text-[14px]">Active Users</h4>
            <p className="text-[22px] font-semibold">
              {users.filter((u) => u.account_status === "active").length}
            </p>
          </div>
          <div>
            <div className="w-15 h-15 bg-white/60 rounded-3xl flex justify-center items-center">
              <FaUserAlt size={35} className="text-green-500" />
            </div>
          </div>
        </div>
        <div className="p-3 bg-yellow-500 rounded-xl text-white h-[100px] flex justify-between">
          <div>
            <h4 className="text-[14px]">Spam Users</h4>
            <p className="text-[22px] font-semibold">
              {users.filter((u) => u.account_status === "spam").length}
            </p>
          </div>
          <div>
            <div className="w-15 h-15 bg-white/60 rounded-3xl flex justify-center items-center">
              <FaUserXmark size={35} className="text-yellow-500" />
            </div>
          </div>
        </div>
        <div className="p-3 bg-red-500 rounded-xl text-white h-[100px] flex justify-between">
          <div>
            <h4 className="text-[14px]">Suspended</h4>
            <p className="text-[22px] font-semibold">
              {users.filter((u) => u.account_status === "suspended").length}
            </p>
          </div>
          <div>
            <div className="w-15 h-15 bg-white/60 rounded-3xl flex justify-center items-center">
              <FaUserShield size={35} className="text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="w-full h-auto p-2 mt-2 bg-white rounded-lg">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 m-3">
          <div className="flex w-full md:w-auto gap-2">
            <input
              type="text"
              placeholder="Search by User Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  fetchUsers(1); // Only fetch when Enter is pressed
                }
              }}
              className="border border-gray-300 bg-white p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] outline-none w-full md:w-64"
            />
            <button
              onClick={() => fetchUsers(1)}
              className="px-4 py-2 rounded-lg bg-[#F9832B] text-white cursor-pointer hover:bg-[#e67600] shadow-md"
            >
              Search
            </button>
          </div>




          <div className="flex items-center gap-3">
            {/* Filter Button */}
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md border border-gray-300 text-gray-600 hover:shadow-lg cursor-pointer"
              onClick={() => setShowFilterModal(true)}
            >
              <FiFilter size={20} /> Filter
            </button>


            {/* Export Button */}
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md border border-gray-300 text-gray-600 hover:shadow-lg cursor-pointer"
              onClick={handleExport}
            >
              <CiExport size={20} /> Export
            </button>
          </div>
        </div>



        {/* Table */}
        <div className="overflow-x-auto">
          <table className="mt-2 w-full border-collapse">
            <thead className="bg-gray-100">
              <tr className="text-gray-700">
                {["SL", "User", "Contact Info", "Status", "Action"].map(
                  (head, i) => (
                    <th
                      key={head}
                      className={`text-[14px] ${head === "Action" || head === "Status" ? "px-4" : "px-8"
                        } ${i >= 3 ? "text-center" : "text-left"
                        } py-3 whitespace-nowrap`}
                    >
                      {head}
                    </th>
                  )
                )}
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
                users
                  .map((item, index) => (
                    <tr key={item._id} className="border-b border-gray-200">
                      <td className="text-[14px] px-8 py-3 text-left">
                        {(pagination.currentPage - 1) * 10 + index + 1}
                      </td>

                      <td className="text-[14px] px-8 py-3 text-left min-w-[180px]">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.profile_picture ? `${IMAGE_URL}/${item.profile_picture}` : guest}
                            alt={item.name || guest}
                            className="w-10 h-10 rounded-full object-cover bg-amber-200 cursor-pointer"
                            onClick={() =>
                              openImageModal(item.profile_picture ? `${IMAGE_URL}/${item.profile_picture}` : guest)
                            }
                          />

                          <div className="whitespace-nowrap font-semibold">{item.name}</div>
                        </div>
                      </td>

                      <td className="text-[14px] px-8 py-3 text-left min-w-[250px]">
                        <div>
                          <div className="font-semibold">{item.device_type || "N/A"}</div>
                          <div className="text-gray-500">{item.fullPhone}</div>
                          <div className="text-gray-500">{item.email}</div>
                        </div>
                      </td>

                      <td className="text-[14px] px-4 py-2">
                        <div
                          onClick={() => {
                            setSelectedCustomer(item);
                            setShowStatusModal(true);
                          }}
                          className={`cursor-pointer px-2 py-1 w-full flex justify-center items-center ${item.account_status === "active"
                            ? "bg-green-200 text-green-500"
                            : item.account_status === "suspended"
                              ? "bg-yellow-200 text-yellow-500"
                              : "bg-red-200 text-red-500"
                            } font-semibold rounded-full hover:opacity-90 transition`}
                          title="Click to change status"
                        >
                          {item.account_status}
                        </div>
                      </td>

                      <td className="text-[14px] px-8 py-3 text-center">
                        <div className="flex justify-center items-center gap-3">
                          <button
                            className="flex justify-center w-8 h-8 items-center gap-1 rounded-lg bg-blue-500 text-white cursor-pointer hover:bg-blue-600 whitespace-nowrap"
                            onClick={() => navigate(`/UserProfile/${item._id}`)}
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

      {isImageModalOpen && selectedImage && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Blurred Background */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeImageModal}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-xl shadow-lg max-w-md w-11/12 p-4 z-10">
            {/* Close Button */}
            <button
              onClick={closeImageModal}
              className="absolute top-3 right-3 text-gray-700 text-xl font-bold hover:text-red-600 cursor-pointer"
            >
              ✕
            </button>

            {/* Image */}
            <img
              src={selectedImage}
              alt="Profile"
              className="w-full h-auto object-contain rounded-lg"
            />
          </div>
        </div>
      )}


      {showFilterModal && (
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Apply Filters
              </h2>

              {/* Country */}
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">Country</label>
                <select
                  value={country}
                  onChange={handleCountryChange}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none"
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
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">State</label>
                <select
                  value={stateName}
                  onChange={handleStateChange}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none"
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
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none"
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
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">Tier</label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none"
                >
                  <option value="">Select Tier</option>
                  <option value="White">White</option>
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                  <option value="Sapphire">Sapphire</option>
                  <option value="Red">Red</option>
                </select>
              </div>

              {/* Status */}
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="banned">Banned</option>
                  <option value="spam">Spam</option>
                  {availableStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>

              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer"
                  onClick={() => {
                    setTier("");
                    setCountry("India");
                    setStateName("Rajasthan");
                    setCity("");
                    setStatusFilter("all");
                    setShowFilterModal(false);
                    fetchUsers(1);
                  }}
                >
                  Clear
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-[#F9832B] text-white hover:bg-[#e67600] cursor-pointer"
                  onClick={() => {
                    setShowFilterModal(false);
                    fetchUsers(1);
                  }}
                >
                  Apply
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
          reason={selectedCustomer.status_reason || ""} // <-- use status_reason
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
