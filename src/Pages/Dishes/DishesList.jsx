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
import { MdEdit } from "react-icons/md";
import Select from "react-select";
import { BASE_URL, IMAGE_URL } from "../../config/Config";
import {
  FaUtensils,
  FaCheckCircle,
  FaHourglassHalf,
  FaTrashAlt,
} from "react-icons/fa";
import guest from "../../assets/images/guest.png";

function DishesList() {
  const navigate = useNavigate();

  // -------- State --------
  const [dishes, setDishes] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState("");
  const [restaurantId, setRestaurantId] = useState("");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalRecords: 0,
  });
  const [kpi, setKpi] = useState({
    totalDishes: 0,
    availableDishes: 0,
    unavailableDishes: 0,
    deletedDishes: 0,
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
            search,
            restaurantId,
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

      // KPI update based on filtered data
      if (data.data.kpi) setKpi(data.data.kpi);
      else {
        // fallback: calculate from current dishes
        setKpi({
          totalDishes: data.data.items.length,
          availableDishes: data.data.items.filter(d => d.isAvailable).length,
          unavailableDishes: data.data.items.filter(d => !d.isAvailable).length,
          deletedDishes: data.data.items.filter(d => d.isDeleted).length,
        });
      }
    } catch (err) {
      console.error("Failed to fetch dishes:", err);
    } finally {
      setLoading(false);
    }
  };

  // -------- Fetch Restaurants for filter --------
  const fetchRestaurants = async () => {
    const authData = JSON.parse(localStorage.getItem("trofi_user"));
    const token = authData?.token;
    if (!token) {
      toast.error("Please login first");
      navigate("/Login");
      return;
    }

    try {
      const { data } = await axios.get(`${BASE_URL}/restro/get-restaurant-list-admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setRestaurants(data.data);
    } catch (err) {
      console.error("Failed to fetch restaurants:", err);
    }
  };

  // -------- Initial load --------
  useEffect(() => {
    fetchRestaurants();
    fetchDishes(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------- Fetch on search/filter change --------
  useEffect(() => {
    fetchDishes(1);
  }, [search, restaurantId]);

  // -------- Export --------
  const handleExport = () => {
    const exportData = dishes.map((dish, index) => ({
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

      {/* KPI Cards */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className=" bg-blue-900 p-3 rounded-xl text-white h-[100px] flex justify-between">
          <div>
            <h4 className="text-[14px]">Total Dishes</h4>
            <p className="text-[22px] font-semibold">{kpi.totalDishes}</p>
          </div>
          <div className="">
            <div className="w-15 h-15 bg-white/60  rounded-3xl flex justify-center  items-center">
              <FaUtensils size={35} className="text-blue-900" />
            </div>
          </div>
        </div>

        <div className="p-3 bg-green-500 rounded-xl text-white h-[100px] flex justify-between">
          <div>
            <h4 className="text-[14px]">Available Dishes</h4>
            <p className="text-[22px] font-semibold">{kpi.availableDishes}</p>
          </div>
          <div className="">
            <div className="w-15 h-15 bg-white/60  rounded-3xl flex justify-center  items-center">
              <FaCheckCircle size={35} className="text-green-500" />
            </div>
          </div>
        </div>

        <div className="p-3 bg-yellow-500 rounded-xl text-white h-[100px] flex justify-between">
          <div>
            <h4 className="text-[14px]">Unavailable Dishes</h4>
            <p className="text-[22px] font-semibold">{kpi.unavailableDishes}</p>
          </div>
          <div className="">
            <div className="w-15 h-15 bg-white/60  rounded-3xl flex justify-center  items-center">
              <FaHourglassHalf size={35} className="text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="p-3 bg-red-500 rounded-xl text-white h-[100px] flex justify-between">
          <div>
            <h4 className="text-[14px]">Deleted Dishes</h4>
            <p className="text-[22px] font-semibold">{kpi.deletedDishes}</p>
          </div>
          <div className="">
            <div className="w-15 h-15 bg-white/60 flex justify-center items-center rounded-3xl">
              <FaTrashAlt size={35} className="text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Restaurant Filter */}
      <div className="mt-2 bg-white shadow-md rounded-xl border border-gray-200 overflow-x-auto pb-3">
        <div className="flex justify-between items-center m-3 flex-wrap gap-3">

          {/* Search input on left */}
          <input
            type="text"
            placeholder="Search by dish name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 bg-white p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] outline-none w-64"
          />

          {/* Right side: Restaurant dropdown + Export button */}
          <div className="flex items-center gap-3">

            {/* Searchable restaurant dropdown */}
            <Select
              options={restaurants.map(r => ({ value: r._id, label: r.restro_name }))}
              value={
                restaurants.find(r => r._id === restaurantId)
                  ? { value: restaurantId, label: restaurants.find(r => r._id === restaurantId).restro_name }
                  : null
              }
              onChange={(selected) => setRestaurantId(selected ? selected.value : "")}
              placeholder="All Restaurants"
              isClearable
              className="w-64"
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  borderColor: state.isFocused ? "#F9832B" : "#D1D5DB", // gray-300 default
                  boxShadow: state.isFocused ? "0 0 0 2px rgba(249, 131, 43, 0.3)" : "none",
                  "&:hover": { borderColor: state.isFocused ? "#F9832B" : "#D1D5DB" },
                  minHeight: "40px",
                }),
                placeholder: (provided) => ({
                  ...provided,
                  color: "#6B7280", // gray-500
                }),
                dropdownIndicator: (provided) => ({
                  ...provided,
                  color: "#6B7280",
                }),
                clearIndicator: (provided) => ({
                  ...provided,
                  color: "#6B7280",
                }),
              }}
            />


            {/* Export button */}
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md border border-gray-300 text-gray-600 hover:shadow-lg cursor-pointer h-[40px]"
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
              <th className="p-3 border-b border-gray-300">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center p-6 text-gray-500 italic">
                  Loading...
                </td>
              </tr>
            ) : dishes.length > 0 ? (
              dishes.map((dish, index) => (
                <tr
                  key={dish._id}
                  className="hover:bg-gray-50 transition text-gray-700"
                >
                  <td className="p-3 border-b border-gray-200">
                    {(pagination.currentPage - 1) * pagination.pageSize + (index + 1)}
                  </td>
                  <td className="p-3 border-b border-gray-200">
                    <img
                      src={`${IMAGE_URL}/${dish.dish_images?.[0] || ""}`}
                      alt={dish.dish_name}
                      className="w-12 h-12 rounded-md object-cover"
                      onError={(e) => (e.target.src = guest)}
                    />
                  </td>
                  <td className="p-3 border-b border-gray-200 font-medium">{dish.dish_name}</td>
                  <td className="p-3 border-b border-gray-200">{dish.restaurantId?.restro_name || "N/A"}</td>
                  <td className="p-3 border-b border-gray-200">{dish.description}</td>
                  <td className="p-3 border-b border-gray-200">₹{dish.price}</td>
                  <td className="p-3 border-b border-gray-200">
                    <button
                      className="flex items-center gap-1 justify-center w-8 h-8 rounded-lg bg-green-500 text-white cursor-pointer hover:bg-green-600 whitespace-nowrap"
                      onClick={() => navigate(`/UpdateDishes/${dish._id}`)}
                    >
                      <MdEdit size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center p-6 text-gray-500 italic">
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
  );
}

export default DishesList;
