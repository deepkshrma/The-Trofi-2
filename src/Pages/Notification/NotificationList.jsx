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
import Pagination from "../../components/common/Pagination/Pagination";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function NotificationList() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [showFilter, setShowFilter] = useState(false);

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

      const res = await axios.get(`${BASE_URL}/admin/notification`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          limit: pagination.pageSize,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          date: filterDate || undefined,
          search: searchTerm || undefined,
        },
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
  }, [searchTerm]);

  const filteredNotifications = notifications.filter(
    (item) =>
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.senderId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    const exportData = notifications.map((item, idx) => ({
      "S.No": idx + 1,
      Title: item.title || "-",
      Sender: item.senderId?.name || "N/A",
      Receivers: item.isGlobal
        ? "All Users"
        : item.receiverIds?.map((r) => r.name).join(", ") || "-",
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
            placeholder="Search by title or sender..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 bg-white p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] outline-none w-full md:w-64"
          />

          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md border border-gray-300 text-gray-600 hover:shadow-lg cursor-pointer"
              onClick={() => setShowFilter(!showFilter)}
            >
              <FiFilter size={20} /> Filter
            </button>

            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md border border-gray-300 text-gray-600 hover:shadow-lg cursor-pointer"
              onClick={handleExport}
            >
              <CiExport size={20} /> Export
            </button>
          </div>
        </div>

        {/* Filter Dropdown */}
        {showFilter && (
          <div className="flex flex-col md:flex-row gap-4 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 items-center mx-3">
            {/* Start Date */}
            <div className="flex flex-col">
              <label className="text-gray-600 text-sm mb-0">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-[#F9832B] outline-none"
              />
            </div>

            {/* End Date */}
            <div className="flex flex-col">
              <label className="text-gray-600 text-sm mb-0">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-[#F9832B] outline-none"
              />
            </div>

            {/* Specific Date */}
            <div className="flex flex-col">
              <label className="text-gray-600 text-sm mb-0">Specific Date</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-[#F9832B] outline-none"
              />
            </div>

            {/* Apply Button */}
            <button
              className="bg-[#F9832B] text-white mt-4 cursor-pointer px-4 py-2 rounded-lg hover:bg-[#e67600]"
              onClick={() => {
                fetchNotifications(1);
                setShowFilter(false);
              }}
            >
              Apply
            </button>

            {/* Clear Button */}
            <button
              className="bg-gray-200 text-gray-700 px-4 py-2 mt-4 cursor-pointer rounded-lg hover:bg-gray-300"
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setFilterDate("");
                fetchNotifications(1);
                setShowFilter(false);
              }}
            >
              Clear
            </button>
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
                <th className="p-3 border-b border-gray-300">Receivers</th>
                <th className="p-3 border-b border-gray-300">Date</th>
                <th className="p-3 border-b border-gray-300 text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((item, idx) => (
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
                      {item.senderId?.name || "N/A"}
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      {item.isGlobal
                        ? "All Users"
                        : item.receiverIds?.map((r) => r.name).join(", ") || "—"}
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3 border-b border-gray-200 text-center">
                      <button
                        className="flex justify-center items-center w-8 h-8 rounded-lg bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                        onClick={() =>
                          navigate(`/NotificationView/${item._id}`, { state: item })
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
                    colSpan="6"
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
    </div>
  );
}
