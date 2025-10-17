// @ts-nocheck
import React, { useState, useEffect } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import { PlusCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Pagination from "../../components/common/Pagination/Pagination";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import { CiExport } from "react-icons/ci";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";
import { MdEdit } from "react-icons/md";
import { BASE_URL, IMAGE_URL } from "../../config/Config";
import {
  FaUtensils,
  FaCheckCircle,
  FaHourglassHalf,
  FaTrashAlt,
  FaEye,
} from "react-icons/fa";
import { FiFilter } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import guest from "../../assets/images/dishh.png";
import { toast } from "react-toastify";

function DishesList() {
  const navigate = useNavigate();
  const { restaurantId } = useParams();

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
  const [kpi, setKpi] = useState({
    totalDishes: 0,
    availableDishes: 0,
    unavailableDishes: 0,
    deletedDishes: 0,
  });

  // Filter states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [isAvailable, setIsAvailable] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [avgRatingMin, setAvgRatingMin] = useState("");
  const [avgRatingMax, setAvgRatingMax] = useState("");
  const [sortBy, setSortBy] = useState("");

  // Dropdown options
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [dishTypes, setDishTypes] = useState([]);
  const [cuisines, setCuisines] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedDishType, setSelectedDishType] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("");

  // Image modal
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setIsImageModalOpen(false);
  };

  const filteredSubCategories = selectedCategory
    ? subCategories.filter(sub => sub.parentCategoryId === selectedCategory)
    : subCategories;


  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedSubCategory(""); // reset
  };

  // -------- Fetch Dropdown Options --------
  const fetchDropdownOptions = async () => {
    try {
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;

      if (!token) {
        toast.error("Please login first");
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const [catRes, subCatRes, typeRes, cuisineRes] = await Promise.all([
        axios.get(`${BASE_URL}/restro/get-dish-category`, config),
        axios.get(`${BASE_URL}/restro/get-dish-sub-category`, config),
        axios.get(`${BASE_URL}/restro/get-dish-type`, config),
        axios.get(`${BASE_URL}/restro/get-cusine`, config),
      ]);

      if (catRes.data.success) setCategories(catRes.data.data || []);
      if (subCatRes.data.success) setSubCategories(subCatRes.data.data || []);
      if (typeRes.data.success) setDishTypes(typeRes.data.data || []);
      if (cuisineRes.data.success) setCuisines(cuisineRes.data.data || []);

    } catch (err) {
      console.error("Failed to fetch dropdown options:", err);
      toast.error("Failed to load dropdown options");
    }
  };


  // -------- Fetch Dishes --------
  const fetchDishesForTable = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pagination.pageSize,
        restaurantId,
      };

      if (search) params.search = search;
      if (isAvailable !== "") params.isAvailable = isAvailable;
      if (priceMin) params.priceMin = priceMin;
      if (priceMax) params.priceMax = priceMax;
      if (avgRatingMin) params.avgRatingMin = avgRatingMin;
      if (avgRatingMax) params.avgRatingMax = avgRatingMax;
      if (selectedCategory) params.categoryId = selectedCategory;
      if (selectedSubCategory) params.subCategoryId = selectedSubCategory;
      if (selectedDishType) params.typeId = selectedDishType;
      if (selectedCuisine) params.cuisineId = selectedCuisine;
      if (sortBy) params.sort = sortBy;

      const { data } = await axios.get(`${BASE_URL}/dishes/get-all-dishes-admin`, { params });

      setDishes(data.data.items);
      setPagination((prev) => ({
        ...prev,
        currentPage: page,
        totalPages: data.data.totalPages,
        totalRecords: data.data.totalItems,
      }));

      if (data.data.kpi) setKpi(data.data.kpi);
    } catch (err) {
      console.error("Failed to fetch dishes:", err);
      toast.error("Failed to fetch dishes");
    } finally {
      setLoading(false);
    }
  };

  // -------- Effects --------
  useEffect(() => {
    fetchDropdownOptions();
  }, []);

  useEffect(() => {
    if (restaurantId) {
      fetchDishesForTable(1);
    }
  }, [restaurantId]);

  // -------- Clear Filters --------
  const handleClearFilters = () => {
    setIsAvailable("");
    setPriceMin("");
    setPriceMax("");
    setAvgRatingMin("");
    setAvgRatingMax("");
    setSelectedCategory("");
    setSelectedSubCategory("");
    setSelectedDishType("");
    setSelectedCuisine("");
    setSortBy("");
    setSearch("");
    setShowFilterModal(false);
    fetchDishesForTable(1);
  };

  // -------- Apply Filters --------
  const handleApplyFilters = () => {
    setShowFilterModal(false);
    fetchDishesForTable(1);
  };

  // -------- Export --------
  const handleExport = () => {
    const exportData = dishes.map((dish, index) => ({
      "S.No.": (pagination.currentPage - 1) * pagination.pageSize + (index + 1),
      Name: dish.dish_name,
      Description: dish.description || "N/A",
      Price: dish.price,
      Restaurant: dish.restaurantId?.restro_name || "N/A",
      Available: dish.isAvailable ? "Yes" : "No",
      Rating: dish.avgRating || "N/A",
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
        customTrail={[
          { label: "Restaurant List", path: "/RestroList" },
          { label: "Dishes List", path: `/DishesList/${restaurantId}` },
        ]}
      />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <PageTitle title={"Dishes List"} />
        <button
          className="flex items-center gap-2 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg cursor-pointer"
          style={{ backgroundColor: "#F9832B" }}
          onClick={() => navigate(`/AddDishes/${restaurantId}`)}
        >
          <PlusCircle size={18} /> Add Dish
        </button>
      </div>

      {/* KPI Cards */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-900 p-3 rounded-xl text-white h-[100px] flex justify-between">
          <div>
            <h4 className="text-[14px]">Total Dishes</h4>
            <p className="text-[22px] font-semibold">{kpi.totalDishes}</p>
          </div>
          <div>
            <div className="w-15 h-15 bg-white/60 rounded-3xl flex justify-center items-center">
              <FaUtensils size={35} className="text-blue-900" />
            </div>
          </div>
        </div>

        <div className="p-3 bg-green-500 rounded-xl text-white h-[100px] flex justify-between">
          <div>
            <h4 className="text-[14px]">Available Dishes</h4>
            <p className="text-[22px] font-semibold">{kpi.availableDishes}</p>
          </div>
          <div>
            <div className="w-15 h-15 bg-white/60 rounded-3xl flex justify-center items-center">
              <FaCheckCircle size={35} className="text-green-500" />
            </div>
          </div>
        </div>

        <div className="p-3 bg-yellow-500 rounded-xl text-white h-[100px] flex justify-between">
          <div>
            <h4 className="text-[14px]">Unavailable Dishes</h4>
            <p className="text-[22px] font-semibold">{kpi.unavailableDishes}</p>
          </div>
          <div>
            <div className="w-15 h-15 bg-white/60 rounded-3xl flex justify-center items-center">
              <FaHourglassHalf size={35} className="text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="p-3 bg-red-500 rounded-xl text-white h-[100px] flex justify-between">
          <div>
            <h4 className="text-[14px]">Deleted Dishes</h4>
            <p className="text-[22px] font-semibold">{kpi.deletedDishes}</p>
          </div>
          <div>
            <div className="w-15 h-15 bg-white/60 flex justify-center items-center rounded-3xl">
              <FaTrashAlt size={35} className="text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="mt-2 bg-white shadow-md rounded-xl border border-gray-200 overflow-x-auto pb-3">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 m-3">
          {/* Search */}
          <div className="flex w-full md:w-auto gap-2">
            <input
              type="text"
              placeholder="Search by dish name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  fetchDishesForTable(1);
                }
              }}
              className="border border-gray-300 bg-white p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] outline-none w-full md:w-64"
            />
            <button
              onClick={() => fetchDishesForTable(1)}
              className="px-4 py-2 rounded-lg bg-[#F9832B] text-white cursor-pointer hover:bg-[#e67600] shadow-md"
            >
              Search
            </button>
          </div>

          {/* Filter & Export Buttons */}
          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md border border-gray-300 text-gray-600 hover:shadow-lg cursor-pointer"
              onClick={() => setShowFilterModal(true)}
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left text-gray-700">
                <th className="p-3 border-b border-gray-300">S.No.</th>
                <th className="p-3 border-b border-gray-300">Image</th>
                <th className="p-3 border-b border-gray-300">Dish Name</th>
                <th className="p-3 border-b border-gray-300">Restaurant</th>
                <th className="p-3 border-b border-gray-300">Description</th>
                <th className="p-3 border-b border-gray-300">Available</th>
                <th className="p-3 border-b border-gray-300">Price (₹)</th>
                <th className="p-3 border-b border-gray-300">Rating</th>
                <th className="p-3 border-b border-gray-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center p-6 text-gray-500 italic">
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
                        src={`${IMAGE_URL}/${dish.dish_images?.[0] || "dish"}`}
                        alt={dish.dish_name}
                        className="w-12 h-12 rounded-md object-cover cursor-pointer"
                        onClick={() =>
                          openImageModal(`${IMAGE_URL}/${dish.dish_images?.[0] || ""}`)
                        }
                        onError={(e) => (e.target.src = guest)}
                      />
                    </td>
                    <td className="p-3 border-b border-gray-200 font-medium">
                      {dish.dish_name}
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      {dish.restaurantId?.restro_name || "N/A"}
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      {dish.description || "N/A"}
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      <span
                        className={`px-2 py-1 rounded-full text-white text-sm font-medium ${dish.isAvailable ? "bg-green-500" : "bg-red-500"
                          }`}
                      >
                        {dish.isAvailable ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="p-3 border-b border-gray-200">₹{dish.price}</td>
                    <td className="p-3 border-b border-gray-200">
                      <span className="flex items-center gap-1">
                        ⭐ {dish.avgRating?.toFixed(1) || "N/A"}
                      </span>
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      <div className="flex justify-center items-center gap-3">
                        <button
                          className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500 text-white cursor-pointer hover:bg-green-600"
                          onClick={() => navigate(`/UpdateDishes/${dish._id}`)}
                        >
                          <MdEdit size={16} />
                        </button>
                        <button
                          className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500 text-white cursor-pointer hover:bg-blue-600"
                          onClick={() => navigate(`/DishDetails/${dish._id}`)}
                        >
                          <FaEye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center p-6 text-gray-500 italic">
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
            onPageChange={fetchDishesForTable}
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
              alt="Dish"
              className="w-full h-auto object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Filter Modal */}
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
              className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Apply Filters
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Availability */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Availability
                  </label>
                  <select
                    value={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none"
                  >
                    <option value="">All</option>
                    <option value="true">Available</option>
                    <option value="false">Unavailable</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.category_name} {/* use the correct field */}
                      </option>
                    ))}

                  </select>
                </div>

                {/* Sub Category */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Sub Category
                  </label>
                  <select
                    value={selectedSubCategory}
                    onChange={(e) => setSelectedSubCategory(e.target.value)}
                  >
                    <option value="">All Sub Categories</option>
                    {filteredSubCategories.map((sub) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.sub_categ_name}
                      </option>
                    ))}

                  </select>

                </div>

                {/* Dish Type */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Dish Type
                  </label>
                  <select
                    value={selectedDishType}
                    onChange={(e) => setSelectedDishType(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none"
                  >
                    <option value="">All Types</option>
                    {dishTypes.map((type) => (
                      <option key={type._id} value={type._id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cuisine */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Cuisine</label>
                  <select
                    value={selectedCuisine}
                    onChange={(e) => setSelectedCuisine(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none"
                  >
                    <option value="">All Cuisines</option>
                    {cuisines.map((cuisine) => (
                      <option key={cuisine._id} value={cuisine._id}>
                        {cuisine.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none"
                  >
                    <option value="">Default (Newest)</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating_desc">Rating: High to Low</option>
                    <option value="rating_asc">Rating: Low to High</option>
                  </select>
                </div>

                {/* Price Min */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Min Price (₹)
                  </label>
                  <input
                    type="number"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none"
                  />
                </div>

                {/* Price Max */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Max Price (₹)
                  </label>
                  <input
                    type="number"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    placeholder="5000"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none"
                  />
                </div>

                {/* Rating Min */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Min Rating
                  </label>
                  <input
                    type="number"
                    value={avgRatingMin}
                    onChange={(e) => setAvgRatingMin(e.target.value)}
                    placeholder="0"
                    min="0"
                    max="5"
                    step="0.1"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none"
                  />
                </div>

                {/* Rating Max */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Max Rating
                  </label>
                  <input
                    type="number"
                    value={avgRatingMax}
                    onChange={(e) => setAvgRatingMax(e.target.value)}
                    placeholder="5"
                    min="0"
                    max="5"
                    step="0.1"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer"
                  onClick={handleClearFilters}
                >
                  Clear
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-[#F9832B] text-white hover:bg-[#e67600] cursor-pointer"
                  onClick={handleApplyFilters}
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

export default DishesList;