// @ts-nocheck
import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../config/Config";
import PageTitle from "../../components/PageTitle/PageTitle";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaRegEye } from "react-icons/fa";
import { FiFilter } from "react-icons/fi";
import { CiExport } from "react-icons/ci";
import { IoClose } from "react-icons/io5";
import Pagination from "../../components/common/Pagination/Pagination";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function NotificationList() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    sendType: "",
    receiverType: "",
    receiverName: "",
  });

  // Applied filters (for display and API call)
  const [appliedFilters, setAppliedFilters] = useState({});

  const navigate = useNavigate();

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalRecords: 0,
  });

  const fetchNotifications = async (page = 1) => {
    setLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem("trofi_user"))?.token;
      if (!token) throw new Error("Not authenticated");

      const params = {
        page,
        limit: pagination.pageSize,
        search: searchTerm || undefined,
      };

      // Add applied filters to params
      if (appliedFilters.startDate) params.startDate = appliedFilters.startDate;
      if (appliedFilters.endDate) params.endDate = appliedFilters.endDate;
      if (appliedFilters.sendType) params.send_type = appliedFilters.sendType;
      if (appliedFilters.receiverType) params.receiverType = appliedFilters.receiverType;
      if (appliedFilters.receiverName) params.receiverName = appliedFilters.receiverName;

      const res = await axios.get(`${BASE_URL}/admin/notification`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      if (res.data.success) {
        setNotifications(res.data.data || []);
        setPagination((prev) => ({
          ...prev,
          currentPage: page,
          totalPages:
            Math.ceil(res.data.pagination?.total / res.data.pagination?.limit) ||
            1,
          totalRecords: res.data.pagination?.total || 0,
        }));
      } else {
        toast.error("Failed to fetch notifications");
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      toast.error(err.response?.data?.message || "Error fetching notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1);
  }, [searchTerm, appliedFilters]);

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
    setShowFilterModal(false);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      startDate: "",
      endDate: "",
      sendType: "",
      receiverType: "",
      receiverName: "",
    };
    setFilters(clearedFilters);
    setAppliedFilters({});
    setShowFilterModal(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const getActiveFilterCount = () => {
    return Object.values(appliedFilters).filter((val) => val !== "").length;
  };

  const handleExport = () => {
    const exportData = notifications.map((item, idx) => ({
      "S.No": idx + 1,
      Title: item.title || "-",
      Sender: item.senderId?.name || "Auto Assign",
      "Send Type": item.send_type || "-",
      "Receiver Type": item.receiverType || "-",
      Receivers: item.isGlobal
        ? "All Users"
        : item.receiverIds?.map((r) => r.name || r.restro_name).join(", ") || "-",
      Date: new Date(item.createdAt).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Notifications");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "Notifications.xlsx");
  };

  return (
    <div className="main main_page p-6 min-h-screen duration-900 bg-gray-50">
      <BreadcrumbsNav
        customTrail={[
          { label: "Notification List", path: "/NotificationList" },
        ]}
      />

      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <PageTitle title={"Notification List"} />
        <button
          onClick={() => navigate("/NotificationPost")}
          className="flex items-center gap-2 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg cursor-pointer"
          style={{ backgroundColor: "#F9832B" }}
        >
          Post Notification
        </button>
      </div>

      {/* Table Wrapper */}
      <div className="mt-4 bg-white shadow-md rounded-xl border border-gray-200 overflow-x-auto pb-3">
        {/* Search + Export + Filter */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 m-3">
          <input
            type="text"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 bg-white p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] outline-none w-full md:w-64"
          />

          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md border border-gray-300 text-gray-600 hover:shadow-lg cursor-pointer relative"
              onClick={() => setShowFilterModal(true)}
            >
              <FiFilter size={20} /> Filter
              {getActiveFilterCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#F9832B] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getActiveFilterCount()}
                </span>
              )}
            </button>

            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md border border-gray-300 text-gray-600 hover:shadow-lg cursor-pointer"
              onClick={handleExport}
            >
              <CiExport size={20} /> Export
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {getActiveFilterCount() > 0 && (
          <div className="mx-3 mb-3 flex flex-wrap gap-2">
            {appliedFilters.startDate && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                Start: {appliedFilters.startDate}
                <IoClose
                  className="cursor-pointer"
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, startDate: "" }));
                    setAppliedFilters((prev) => ({ ...prev, startDate: "" }));
                  }}
                />
              </span>
            )}
            {appliedFilters.endDate && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                End: {appliedFilters.endDate}
                <IoClose
                  className="cursor-pointer"
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, endDate: "" }));
                    setAppliedFilters((prev) => ({ ...prev, endDate: "" }));
                  }}
                />
              </span>
            )}
            {appliedFilters.sendType && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                Send Type: {appliedFilters.sendType.replace(/_/g, " ")}
                <IoClose
                  className="cursor-pointer"
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, sendType: "" }));
                    setAppliedFilters((prev) => ({ ...prev, sendType: "" }));
                  }}
                />
              </span>
            )}
            {appliedFilters.receiverType && (
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                Receiver Type: {appliedFilters.receiverType}
                <IoClose
                  className="cursor-pointer"
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, receiverType: "" }));
                    setAppliedFilters((prev) => ({ ...prev, receiverType: "" }));
                  }}
                />
              </span>
            )}
            {appliedFilters.receiverName && (
              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                Receiver: {appliedFilters.receiverName}
                <IoClose
                  className="cursor-pointer"
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, receiverName: "" }));
                    setAppliedFilters((prev) => ({ ...prev, receiverName: "" }));
                  }}
                />
              </span>
            )}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="text-center p-6 text-gray-500">Loading...</div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left text-gray-700">
                <th className="p-3 border-b border-gray-300">S.No</th>
                <th className="p-3 border-b border-gray-300">Title</th>
                <th className="p-3 border-b border-gray-300">Sender</th>
                <th className="p-3 border-b border-gray-300">Send Type</th>
                <th className="p-3 border-b border-gray-300">Receiver Type</th>
                <th className="p-3 border-b border-gray-300">Receivers</th>
                <th className="p-3 border-b border-gray-300">Date</th>
                <th className="p-3 border-b border-gray-300 text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {notifications.length > 0 ? (
                notifications.map((item, idx) => (
                  <tr
                    key={item._id}
                    className="hover:bg-gray-50 transition text-gray-700"
                  >
                    <td className="p-3 border-b border-gray-200">
                      {(pagination.currentPage - 1) * pagination.pageSize +
                        (idx + 1)}
                    </td>
                    <td className="p-3 border-b border-gray-200 font-medium">
                      {item.title}
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      {item.senderId?.name || "Auto Assign"}
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {item.send_type?.replace(/_/g, " ") || "-"}
                      </span>
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                        {item.receiverType || "-"}
                      </span>
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      {item.isGlobal
                        ? "All Users"
                        : item.receiverIds?.map((r) => r.name || r.restro_name).join(", ") || "—"}
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3 border-b border-gray-200 text-center">
                      <button
                        className="flex justify-center items-center w-8 h-8 rounded-lg bg-blue-500 text-white hover:bg-blue-600 cursor-pointer mx-auto"
                        onClick={() =>
                          navigate(`/NotificationView?notificationId=${item._id}`)
                        }
                      >
                        <FaRegEye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center p-6 text-gray-500 italic"
                  >
                    No notifications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={pagination.currentPage}
          totalItems={pagination.totalRecords}
          itemsPerPage={pagination.pageSize}
          onPageChange={(page) => fetchNotifications(page)}
          totalPages={pagination.totalPages}
          type="backend"
        />
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Advanced Filters
              </h2>
              <button
                onClick={() => setShowFilterModal(false)}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <IoClose size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange("startDate", e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-[#F9832B] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange("endDate", e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-[#F9832B] outline-none"
                  />
                </div>
              </div>

             
              

              {/* Receiver Name */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Receiver Name
                </label>
                <input
                  type="text"
                  placeholder="Search by receiver name..."
                  value={filters.receiverName}
                  onChange={(e) => handleFilterChange("receiverName", e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-[#F9832B] outline-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={handleClearFilters}
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              >
                Clear All
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-6 py-2 rounded-lg bg-[#F9832B] text-white hover:bg-[#e67600] transition cursor-pointer"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}