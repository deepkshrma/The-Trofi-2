import React, { useState, useEffect } from "react";
import { FaRegEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";
import { toast } from "react-toastify";

import { STAR_RATINGS } from "../../../config/hashtagconfig";
import PageTitle from "../../../components/PageTitle/PageTitle";
import BreadcrumbsNav from "../../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import DynamicBreadcrumbs from "../../../components/common/BreadcrumbsNav/DynamicBreadcrumbs";

import {
  FaStar,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
} from "react-icons/fa";
import { FiFilter } from "react-icons/fi";
import { CiExport } from "react-icons/ci";

import { BASE_URL } from "../../../config/Config";

export default function RestaurantReviewList() {
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();


  // ✅ Fetch reviews from API
  useEffect(() => {
    const fetchReviews = async () => {
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;

      if (!token) {
        toast.error("Please login first");
        navigate("/login"); // redirect to login if no token
        return;
      }
      try {
        const res = await axios.get(
          `${BASE_URL}/admin/get-ratings?type=Restaurant`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data?.success) {
          setReviews(res.data.data?.ratings || []);
        } else {
          toast.error(res.data?.message || "Failed to load reviews");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error while fetching reviews");
      }
    };

    fetchReviews();
  }, []);

  // ✅ Filter reviews based on search
  const filteredReviews = reviews.filter(
    (rev) =>
      rev.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.typeId?.restro_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Export Excel
  const handleExport = () => {
    const exportData = reviews.map((rev, index) => ({
      "S.No.": index + 1,
      "User Name": rev.userId?.name || "Anonymous",
      "Restaurant Name": rev.typeId?.restro_name || "-",
      "Rating Label": STAR_RATINGS[rev.star_value - 1]?.label || rev.rating_label,
      Stars: rev.star_value,
      Status: rev.status,
      Comment: rev.reviewComment,
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

  return (
    <div className="main main_page p-6 duration-900">
      {/* ✅ Breadcrumbs */}
      <BreadcrumbsNav
        customTrail={[
          {
            label: "Restaurant Review List",
            path: "/RestaurantReviewList",
          }
        
        ]}
      />
      <PageTitle title={"Restaurant Reviews List"} />

      {/* ✅ KPI Cards */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className=" bg-blue-900 p-3 rounded-xl text-white h-[100px] flex justify-between">
          <div>
            <h4 className="text-[14px]">Total Reviews</h4>
            <p className="text-[22px] font-semibold">{reviews.length}</p>
          </div>
          <div>
            <div className="w-15 h-15 bg-white/60 rounded-3xl flex justify-center items-center">
              <FaStar size={35} className="text-blue-900" />
            </div>
          </div>
        </div>
        <div className="p-3 bg-green-500 rounded-xl text-white h-[100px] flex justify-between">
          <div>
            <h4 className="text-[14px]">Accepted Reviews</h4>
            <p className="text-[22px] font-semibold">
              {reviews.filter((u) => u.status === "accepted").length}
            </p>
          </div>
          <div>
            <div className="w-15 h-15 bg-white/60 rounded-3xl flex justify-center items-center">
              <FaCheckCircle size={35} className="text-green-500" />
            </div>
          </div>
        </div>
        <div className="p-3 bg-yellow-500 rounded-xl text-white h-[100px] flex justify-between">
          <div>
            <h4 className="text-[14px]">Pending Reviews</h4>
            <p className="text-[22px] font-semibold">
              {reviews.filter((u) => u.status === "pending").length}
            </p>
          </div>
          <div>
            <div className="w-15 h-15 bg-white/60 rounded-3xl flex justify-center items-center">
              <FaHourglassHalf size={35} className="text-yellow-500" />
            </div>
          </div>
        </div>
        <div className="p-3 bg-red-500 rounded-xl text-white h-[100px] flex justify-between">
          <div>
            <h4 className="text-[14px]">Denied Reviews</h4>
            <p className="text-[22px] font-semibold">
              {reviews.filter((u) => u.status === "denied").length}
            </p>
          </div>
          <div>
            <div className="w-15 h-15 bg-white/60 rounded-3xl flex justify-center items-center">
              <FaTimesCircle size={35} className="text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Table */}
      <div className="mt-2 bg-white shadow-md rounded-xl border border-gray-200 overflow-x-auto pb-3">
        {/* Search + Controls */}
        <div className="flex justify-between items-center m-3">
          <input
            type="text"
            placeholder="Search by user/restaurant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 bg-white p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] outline-none w-64"
          />

          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md border border-gray-300 text-gray-600 hover:shadow-lg cursor-pointer"
              onClick={() => toast.info("Filter feature coming soon")}
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

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-300 text-left">
              <th className="p-3 whitespace-nowrap">S.No</th>
              <th className="p-3 whitespace-nowrap">User Name</th>
              <th className="p-3 whitespace-nowrap">Restro Name</th>
              <th className="p-3 whitespace-nowrap">Rating Label</th>
              <th className="p-3 whitespace-nowrap">Rating</th>
              <th className="p-3 whitespace-nowrap">Status</th>
              <th className="p-3 whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.map((rev, idx) => (
              <tr
                key={rev._id}
                className="border-b border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <td className="p-3 whitespace-nowrap">{idx + 1}</td>
                <td className="p-3 whitespace-nowrap">
                  {rev.userId?.name || "Anonymous"}
                </td>
                <td className="p-3 whitespace-nowrap">
                  {rev.typeId?.restro_name || "-"}
                </td>
                <td className="p-3 whitespace-nowrap">
                  {STAR_RATINGS[rev.star_value - 1]?.label ||
                    rev.rating_label}
                </td>
                <td className="p-3">
                  <img
                    src={STAR_RATINGS[rev.star_value - 1]?.img}
                    alt={STAR_RATINGS[rev.star_value - 1]?.label || "star"}
                    className="w-10 h-10 md:w-12 md:h-12"
                  />
                </td>
                <td className="p-3">
                  <span
                    className={`inline-block w-24 text-center px-2 py-1 rounded-full text-xs font-semibold ${rev.status === "accepted"
                      ? "bg-green-100 text-green-700"
                      : rev.status === "denied"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                      }`}
                  >
                    {rev.status}
                  </span>
                </td>
                <td className="p-3">
                  <div className="cursor-pointer">
                    <FaRegEye
                      size={20}
                      onClick={() =>
                        navigate(`/RestaurantReview/${rev._id}`, {
                          state: rev,
                        })
                      }
                    />
                  </div>
                </td>
              </tr>
            ))}

            {filteredReviews.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center p-4 text-gray-500">
                  No reviews found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
