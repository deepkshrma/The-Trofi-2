import React, { useState, useEffect } from "react";
import { FaRegEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  FaStar,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
} from "react-icons/fa";
import { FiFilter } from "react-icons/fi";
import { CiExport } from "react-icons/ci";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../../config/Config";
import PageTitle from "../../../components/PageTitle/PageTitle";
import BreadcrumbsNav from "../../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import Pagination from "../../../components/common/Pagination/Pagination";

// ⭐ your same star images
import star1 from "../../../assets/images/untitled_folder_6/star1.png";
import star2 from "../../../assets/images/untitled_folder_6/star2.png";
import star3 from "../../../assets/images/untitled_folder_6/star3.png";
import star4 from "../../../assets/images/untitled_folder_6/star4.png";
import star5 from "../../../assets/images/untitled_folder_6/star5.png";

export default function DishReviewList() {
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
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

  const faceStars = [
    { img: star1, label: "Very Bad" },
    { img: star2, label: "Bad" },
    { img: star3, label: "Okay" },
    { img: star4, label: "Good" },
    { img: star5, label: "Excellent" },
  ];

  // ✅ Fetch dish reviews from backend
  const fetchReviews = async (
    page = 1,
    search = "",
    status = statusFilter
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

      const res = await axios.get(
        `${BASE_URL}/admin/get-ratings?type=Dish&page=${page}&limit=${pagination.pageSize}&search=${search}&status=${status}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

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
        toast.error(res.data?.message || "Failed to load dish reviews");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching dish reviews");
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
      "S.No.": index + 1,
      "User Name": rev.userId?.name || "Anonymous",
      "Dish Name": rev.typeId?.dish_name || "-",
      "Rating Label": faceStars[rev.star_value - 1]?.label || rev.rating_label,
      Stars: rev.star_value,
      Status: rev.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DishReviews");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "DishReviews.xlsx");
  };

  return (
    <div className="main main_page p-6 duration-900">
      {/* ✅ Breadcrumbs */}
      <BreadcrumbsNav
        customTrail={[{ label: "Dish Reviews List", path: "/DishReviewList" }]}
      />
      <PageTitle title={"Dish Reviews List"} />

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

      {/* ✅ Table Section */}
      <div className="mt-2 bg-white shadow-md rounded-xl border border-gray-200 overflow-x-auto pb-3">
        {/* Search + Filter + Export */}
        <div className="flex flex-wrap justify-between gap-3 items-center m-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Search by user/dish name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              fetchReviews(1, e.target.value, statusFilter);
            }}
            className="border border-gray-300 bg-white p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] outline-none w-64"
          />

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter */}
            <div className="flex items-center border border-gray-300 rounded-lg px-2 bg-white">
              <FiFilter size={18} className="text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  fetchReviews(1, searchTerm, e.target.value);
                }}
                className="outline-none p-2 bg-transparent text-gray-700 text-sm cursor-pointer"
              >
                <option value="">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="published">Published</option>
              </select>
            </div>

            {/* Export */}
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md border border-gray-300 text-gray-600 hover:shadow-lg cursor-pointer"
              onClick={handleExport}
            >
              <CiExport size={20} /> Export
            </button>
          </div>
        </div>

        {/* Table */}
        <table className="w-full border-collapse text-sm md:text-base">
          <thead>
            <tr className="bg-gray-300 text-left">
              <th className="p-3 whitespace-nowrap">S.No</th>
              <th className="p-3 whitespace-nowrap">User Name</th>
              <th className="p-3 whitespace-nowrap">Dish Name</th>
              <th className="p-3 whitespace-nowrap">Rating Label</th>
              <th className="p-3 whitespace-nowrap">Rating</th>
              <th className="p-3 whitespace-nowrap">Status</th>
              <th className="p-3 whitespace-nowrap text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center p-4 text-gray-500">
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
                  <td className="p-3 whitespace-nowrap">
                    {rev.userId?.name || "Anonymous"}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {rev.typeId?.dish_name || "-"}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {faceStars[rev.star_value - 1]?.label || rev.rating_label}
                  </td>
                  <td className="p-3">
                    <img
                      src={faceStars[rev.star_value - 1]?.img}
                      alt={faceStars[rev.star_value - 1]?.label}
                      className="w-10 h-10 md:w-12 md:h-12"
                    />
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-block min-w-[90px] text-center px-3 py-1 rounded-full text-xs font-semibold capitalize 
                      ${
                        rev.status === "approved"
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
                        navigate(`/DishReview/${rev._id}`, { state: rev })
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
                <td colSpan="7" className="text-center p-4 text-gray-500">
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
          onPageChange={(page) => fetchReviews(page, searchTerm, statusFilter)}
          type="backend"
        />
      </div>
    </div>
  );
}
