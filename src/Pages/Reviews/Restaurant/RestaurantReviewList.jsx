import React, { useState } from "react";
import { FaRegEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
// import star1 from "../../../assets/images/untitled_folder_6/star1.png";
// import star2 from "../../../assets/images/untitled_folder_6/star2.png";
// import star3 from "../../../assets/images/untitled_folder_6/star3.png";
// import star4 from "../../../assets/images/untitled_folder_6/star4.png";
// import star5 from "../../../assets/images/untitled_folder_6/star5.png";
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

export default function RestaurantReviewList() {
  const [search, setSearch] = useState("");
  const [reviews, setReviews] = useState([
    {
      id: 1,
      userName: "Priyanshu",
      restroName: "Taj Palace",
      rating_label: "Good",
      star_value: 4,
      status: "pending",
    },
    {
      id: 2,
      userName: "Sreya",
      restroName: "Barbeque Nation",
      rating_label: "Excellent",
      star_value: 5,
      status: "accepted",
    },
    {
      id: 3,
      userName: "Rohit",
      restroName: "Dominos",
      rating_label: "Average",
      star_value: 3,
      status: "denied",
    },
    {
      id: 4,
      userName: "Aditi",
      restroName: "Cafe Coffee Day",
      rating_label: "Poor",
      star_value: 2,
      status: "pending",
    },
    {
      id: 5,
      userName: "Karan",
      restroName: "McDonalds",
      rating_label: "Good",
      star_value: 4,
      status: "accepted",
    },
  ]);

  // const faceStars = [
  //   { img: star1, label: "Very Bad" },
  //   { img: star2, label: "Bad" },
  //   { img: star3, label: "Okay" },
  //   { img: star4, label: "Good" },
  //   { img: star5, label: "Excellent" },
  // ];

  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Filter reviews based on search
  const filteredReviews = reviews.filter(
    (rev) =>
      rev.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.restroName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    // Prepare data for Excel
    const exportData = reviews.map((rev, index) => ({
      "S.No.": index + 1,
      "User Name": rev.userName,
      "Restaurant Name": rev.restroName,
      "Rating Label":
        STAR_RATINGS[rev.star_value - 1]?.label || rev.rating_label,
      Stars: rev.star_value,
      Status: rev.status,
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
      <BreadcrumbsNav
        customTrail={[
          {
            label: "Restaurant Review List",
            path: "/RestaurantReviewList",
          },
        ]}
      />
      <PageTitle title={"Restaurant Reviews List"} />
      {/* top kpi in review  */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className=" bg-blue-900 p-3 rounded-xl text-white h-[100px] flex justify-between">
          <div>
            <h4 className="text-[14px]">Total Reviews</h4>
            <p className="text-[22px] font-semibold">{reviews.length}</p>
          </div>
          <div className="">
            <div className="w-15 h-15 bg-white/60  rounded-3xl flex justify-center  items-center">
              <FaStar size={35} className="text-blue-900" />
            </div>
          </div>
        </div>
        <div className="p-3 bg-green-500 rounded-xl text-white h-[100px] flex justify-between">
          <div>
            <h4 className="text-[14px]">Accepted Reviews</h4>
            <p className="text-[22px] font-semibold">
              {reviews.filter((u) => u.status === "active").length}
            </p>
          </div>
          <div className="">
            <div className="w-15 h-15 bg-white/60  rounded-3xl flex justify-center  items-center">
              <FaCheckCircle size={35} className="text-green-500" />
            </div>
          </div>
        </div>
        <div className="p-3 bg-yellow-500 rounded-xl text-white h-[100px] flex justify-between">
          <div>
            <h4 className="text-[14px]">Pending Reviews</h4>
            <p className="text-[22px] font-semibold">
              {reviews.filter((u) => u.status === "inactive").length}
            </p>
          </div>
          <div className="">
            <div className="w-15 h-15 bg-white/60  rounded-3xl flex justify-center  items-center">
              <FaHourglassHalf size={35} className="text-yellow-500" />
            </div>
          </div>
        </div>
        <div className="p-3 bg-red-500 rounded-xl text-white h-[100px] flex justify-between">
          <div>
            <h4 className="text-[14px]">Denied Reviews</h4>
            <p className="text-[22px] font-semibold">
              {reviews.filter((u) => u.status === "suspended").length}
            </p>
          </div>
          <div className="">
            <div className="w-15 h-15 bg-white/60  rounded-3xl flex justify-center  items-center">
              <FaTimesCircle size={35} className="text-red-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 bg-white shadow-md rounded-xl border border-gray-200 overflow-x-auto pb-3">
        {/* Search Field */}
        <div className="flex justify-between items-center m-3">
          {/* 🔍 Search input */}
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 bg-white p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] outline-none w-64"
          />

          {/* 📂 Right-side controls */}
          <div className="flex items-center gap-3">
            {/* 🧮 Filter button */}
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md border border-gray-300 text-gray-600 hover:shadow-lg cursor-pointer"
              onClick={() => {
                // TODO: open a filter modal / drawer
                console.log("Open filter options: cuisine, hygiene, favorites");
              }}
            >
              <FiFilter size={20} /> Filter
            </button>

            {/* ⬇ Export button */}
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
            <tr className="bg-gray-300  text-left">
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
                key={rev.id}
                className="border-b border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <td className="p-3 whitespace-nowrap">{idx + 1}</td>
                <td className="p-3 whitespace-nowrap">{rev.userName}</td>
                <td className="p-3 whitespace-nowrap">{rev.restroName}</td>
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

                <td className="p-3">
                  <span
                    className={`inline-block w-24 text-center  px-2 py-1 rounded-full text-xs font-semibold ${
                      rev.status === "accepted"
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
                      onClick={() => navigate(`/RestaurantReview`)}
                    />
                  </div>
                </td>
              </tr>
            ))}

            {filteredReviews.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center p-4 text-gray-500">
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
