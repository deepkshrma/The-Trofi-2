// @ts-nocheck
import React, { useState, useEffect } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/common/Pagination/Pagination";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import { CiExport } from "react-icons/ci";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";
import { BASE_URL } from "../../config/Config";
import {
  FaStar,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
} from "react-icons/fa";
import { FiFilter } from "react-icons/fi";

const IMAGE_URL = "http://trofi-backend.apponedemo.top";

function DishesList() {
  const navigate = useNavigate();

  // -------- State --------
  const [dishes, setDishes] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalRecords: 0,
  });

  // -------- Fetch Dishes --------
  const fetchDishes = async (page = 1) => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${BASE_URL}/dishes/get-all-dishes-admin`,
        {
          params: {
            page,
            limit: pagination.pageSize,
            search, // optional backend search (add $text on API if needed)
          },
        }
      );

      setDishes(data.data.items);
      setPagination((prev) => ({
        ...prev,
        currentPage: page,
        totalPages: data.data.totalPages,
        totalRecords: data.data.totalItems,
      }));
    } catch (err) {
      console.error("Failed to fetch dishes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDishes(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------- Client-side Search Filter --------
  const filteredDishes = dishes.filter((dish) =>
    dish.dish_name.toLowerCase().includes(search.toLowerCase())
  );

  // -------- Export --------
  const handleExport = () => {
    const exportData = filteredDishes.map((dish, index) => ({
      "S.No.": (pagination.currentPage - 1) * pagination.pageSize + (index + 1),
      Name: dish.dish_name,
      Description: dish.description || "N/A",
      Price: dish.price,
      Restaurant: dish.restaurantId?.restro_name || "N/A",
      Available: dish.isAvailable ? "Yes" : "No",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dishes");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const fileData = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(fileData, "Dishes.xlsx");
  };

  return (
    <>
      <div className="main main_page p-6 min-h-screen duration-900">
        <BreadcrumbsNav
          customTrail={[{ label: "Dishes List", path: "/DishesList" }]}
        />

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <PageTitle title={"Dishes List"} />
          <button
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg cursor-pointer"
            style={{ backgroundColor: "#F9832B" }}
            onClick={() => navigate("/AddDishes")}
          >
            <PlusCircle size={18} /> Add Dish
          </button>
        </div>
        {/* top kpi in review  */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className=" bg-blue-900 p-3 rounded-xl text-white h-[100px] flex justify-between">
            <div>
              <h4 className="text-[14px]">Total Reviews</h4>
              <p className="text-[22px] font-semibold">{dishes.length}</p>
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
                {dishes.filter((u) => u.status === "active").length}
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
                {dishes.filter((u) => u.status === "inactive").length}
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
                {dishes.filter((u) => u.status === "suspended").length}
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
          {/* Search & Export */}
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
                  console.log(
                    "Open filter options: cuisine, hygiene, favorites"
                  );
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

          {/* Table */}
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left text-gray-700">
                <th className="p-3 border-b border-gray-300">S.No.</th>
                <th className="p-3 border-b border-gray-300">Image</th>
                <th className="p-3 border-b border-gray-300">Dish Name</th>
                <th className="p-3 border-b border-gray-300">Restaurant</th>
                <th className="p-3 border-b border-gray-300">Description</th>
                <th className="p-3 border-b border-gray-300">Price (₹)</th>
                <th className="p-3 border-b border-gray-300">Available</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center p-6 text-gray-500 italic"
                  >
                    Loading...
                  </td>
                </tr>
              ) : filteredDishes.length > 0 ? (
                filteredDishes.map((dish, index) => (
                  <tr
                    key={dish._id}
                    className="hover:bg-gray-50 transition text-gray-700"
                  >
                    <td className="p-3 border-b border-gray-200">
                      {(pagination.currentPage - 1) * pagination.pageSize +
                        (index + 1)}
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      <img
                        src={`${IMAGE_URL}/${dish.dish_images?.[0] || ""}`}
                        alt={dish.dish_name}
                        className="w-12 h-12 rounded-md object-cover"
                        onError={(e) =>
                          (e.target.src = "https://via.placeholder.com/50")
                        }
                      />
                    </td>
                    <td className="p-3 border-b border-gray-200 font-medium">
                      {dish.dish_name}
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      {dish.restaurantId?.restro_name || "N/A"}
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      {dish.description}
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      ₹{dish.price}
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      {dish.isAvailable ? (
                        <span className="text-green-600 font-semibold">
                          Yes
                        </span>
                      ) : (
                        <span className="text-red-600 font-semibold">No</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center p-6 text-gray-500 italic"
                  >
                    No dishes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <Pagination
            currentPage={pagination.currentPage}
            totalItems={pagination.totalRecords}
            itemsPerPage={pagination.pageSize}
            onPageChange={fetchDishes}
            totalPages={pagination.totalPages}
            type="backend"
          />
        </div>
      </div>
    </>
  );
}

export default DishesList;
