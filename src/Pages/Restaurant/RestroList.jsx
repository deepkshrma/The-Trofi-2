import React, { useState, useEffect } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import { Eye, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/common/Pagination/Pagination";
import axios from "axios";
import { BASE_URL, IMAGE_URL } from "../../config/Config";
import { MdEdit, MdRestaurantMenu } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import DeleteModel from "../../components/common/DeleteModel/DeleteModel";
import DynamicBreadcrumbs from "../../components/common/BreadcrumbsNav/DynamicBreadcrumbs";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import staticimg from "../../assets/images/logo.jpg";
import { CiExport } from "react-icons/ci";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FiFilter } from "react-icons/fi";
import { FaTriangleExclamation } from "react-icons/fa6";
import RestaurantFilterModal from "../../components/common/locationFilter/RestaurantFilterModal";

import {
  FaUtensils,
  FaLeaf,
  FaDrumstickBite,
  FaShieldAlt,
  FaConciergeBell,
} from "react-icons/fa";
import { toast } from "react-toastify";

function RestroList() {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});


  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalRecords: 0,
  });
  const [kpi, setKpi] = useState({
    total: 0,
    veg: 0,
    nonVeg: 0,
    both: 0,
    hygiene: 0,
    general: 0,
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const closeDeleteModal = () => {
    setShowDeleteModal(false);

  };

  const confirmDelete = async () => { };

  const navigate = useNavigate();

  const truncateDescription = (text, wordLimit = 10) => {
    if (!text) return "";

    let plainText = String(text);
    plainText = plainText.replace(/<\/?[^>]+(>|$)/g, "");
    plainText = plainText.replace(/\s+/g, " ").trim();

    const words = plainText.split(" ");
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(" ") + "...";
    }

    return plainText;
  };


  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setIsImageModalOpen(false);
  };







  const authData = JSON.parse(localStorage.getItem("trofi_user"));
  const token = authData?.token;
  if (!token) {
    toast.error("Please login first");
    return;
  }

  // Fetch restaurants with pagination
  const fetchRestaurants = async (page = 1, searchTerm = "", filters = appliedFilters) => {
    try {
      setLoading(true);

      const response = await axios.get(`${BASE_URL}/restro/get-restaurant-list`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          limit: pagination.pageSize,
          search: searchTerm,
          ...filters, // ✅ attach your filter fields here
        },
      });

      const { data, pagination: backendPagination, kpi: backendKpi } = response.data;

      setRestaurants(data);
      setPagination((prev) => ({
        ...prev,
        currentPage: backendPagination.page,
        totalPages: backendPagination.totalPages,
        totalRecords: backendPagination.total,
      }));

      // Update KPI counts
      const foodCounts = { veg: 0, nonVeg: 0, both: 0 };
      backendKpi.foodTypeCounts.forEach((item) => {
        if (item._id === "veg") foodCounts.veg = item.count;
        else if (item._id === "non-veg") foodCounts.nonVeg = item.count;
        else if (item._id === "both") foodCounts.both = item.count;
      });


      const hygieneCounts = { hygiene: 0, general: 0 };
      backendKpi.hygieneCounts.forEach((item) => {
        hygieneCounts[item._id] = item.count;
      });

      setKpi({
        total: backendPagination.total,
        ...foodCounts,
        ...hygieneCounts,
      });
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      toast.error("Error fetching restaurants");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchRestaurants(1);
  }, []);

  // Search filter (frontend only)
  const filteredRestaurants = restaurants.filter((restro) =>
    restro.restro_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    const exportData = filteredRestaurants.map((restro, index) => ({
      "S.No.": (pagination.currentPage - 1) * pagination.pageSize + (index + 1),
      Name: restro.restro_name,
      Type: restro.food_type,
      Description: restro.description || "N/A",
      Logo: restro.restaurant_images?.[0]
        ? `${IMAGE_URL}/${restro.restaurant_images[0]}`
        : "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Restaurants");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const fileData = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(fileData, "Restaurants.xlsx");
  };

  return (
    <>
      <div className="main main_page p-6 min-h-screen duration-900">
        <BreadcrumbsNav
          customTrail={[{ label: "Restaurant List", path: "RestroList" }]}
        />
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <PageTitle title={"Restaurant List"} />
          <button
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg cursor-pointer"
            style={{ backgroundColor: "#F9832B" }}
            onClick={() => navigate("/RestroAdd")}
          >
            <PlusCircle size={18} /> Add Restaurant
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Total Restaurants */}
          <div className="bg-blue-900 p-3 rounded-xl text-white h-[100px] flex justify-between">
            <div>
              <h4 className="text-[14px]">Total Restaurants</h4>
              <p className="text-[22px] font-semibold">{kpi.total}</p>
            </div>
            <div>
              <div className="w-15 h-15 bg-white/20 rounded-3xl flex justify-center items-center">
                <FaUtensils size={35} className="text-white" />
              </div>
            </div>
          </div>

          {/* Veg Restaurants */}
          <div className="bg-[#4BAA31] p-3 rounded-xl text-white h-[100px] flex justify-between">
            <div>
              <h4 className="text-[14px]">Veg Restaurants</h4>
              <p className="text-[22px] font-semibold">{kpi.veg}</p>
            </div>
            <div>
              <div className="w-15 h-15 bg-white/20 rounded-3xl flex justify-center items-center">
                <FaLeaf size={35} className="text-white" />
              </div>
            </div>
          </div>

          {/* Non-Veg Restaurants */}
          <div className="bg-[#D35400] p-3 rounded-xl text-white h-[100px] flex justify-between">
            <div>
              <h4 className="text-[14px]">Non-Veg Restaurants</h4>
              <p className="text-[22px] font-semibold">{kpi.nonVeg}</p>
            </div>
            <div>
              <div className="w-15 h-15 bg-white/20 rounded-3xl flex justify-center items-center">
                <FaDrumstickBite size={35} className="text-white" />
              </div>
            </div>
          </div>

          {/* Hygiene Restaurants */}
          <div className="p-3 rounded-xl text-white h-[100px] flex justify-between bg-gradient-to-r from-[#4BAA31] to-[#1C8300]">
            <div>
              <h4 className="text-[14px]">Hygiene Restaurants</h4>
              <p className="text-[22px] font-semibold">{kpi.hygiene}</p>
            </div>
            <div>
              <div className="w-15 h-15 bg-white/20 rounded-3xl flex justify-center items-center">
                <FaShieldAlt size={35} className="text-white" />
              </div>
            </div>
          </div>

        </div>



        {/* Table */}
        <div className="mt-2 bg-white shadow-md rounded-xl border border-gray-200 overflow-x-auto pb-3">
          <div className="flex justify-between items-center m-3">
            {/* 🔍 Search input */}
            <input
              type="text"
              placeholder="Search by Restaurant Name"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                fetchRestaurants(1, e.target.value); // call backend on search
              }}
              className="border border-gray-300 bg-white p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] outline-none w-64"
            />


            {/* 📂 Right-side controls */}
            <div className="flex items-center gap-3">
              {/* 🧮 Filter button */}
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md border border-gray-300 text-gray-600 hover:shadow-lg cursor-pointer"
                onClick={() => setShowFilterModal(true)}
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
              <tr className="bg-gray-200 text-left text-gray-700">
                <th className="p-3 border-b border-gray-300">S.No.</th>
                <th className="p-3 border-b border-gray-300">Logo</th>
                <th className="p-3 border-b border-gray-300">Name</th>
                <th className="p-3 border-b border-gray-300">Type</th>
                <th className="p-3 border-b border-gray-300">Description</th>
                <th className="p-3 border-b border-gray-300">Dishes</th>

                <th className="p-3 border-b border-gray-300 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(pagination.pageSize)].map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="p-3 border-b border-gray-200">
                      <div className="bg-gray-300 h-6 w-8 rounded"></div>
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      <div className="bg-gray-300 h-10 w-10 rounded-full"></div>
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      <div className="bg-gray-300 h-6 w-32 rounded"></div>
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      <div className="bg-gray-300 h-6 w-16 rounded"></div>
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      <div className="bg-gray-300 h-6 w-full rounded"></div>
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      <div className="bg-gray-300 h-6 w-full rounded"></div>
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      <div className="bg-gray-300 h-6 w-24 rounded mx-auto"></div>
                    </td>
                  </tr>
                ))
                : filteredRestaurants.length > 0
                  ? filteredRestaurants.map((restro, index) => (
                    <tr key={restro._id} className="hover:bg-gray-50 transition text-gray-700">
                      <td className="p-3 border-b border-gray-200">
                        {(pagination.currentPage - 1) * pagination.pageSize + (index + 1)}
                      </td>
                      <td className="p-3 border-b border-gray-200">
                        <img
                          src={
                            restro.restaurant_images?.[0]
                              ? `${IMAGE_URL}/${restro.restaurant_images[0]}`
                              : staticimg
                          }
                          alt={restro.restro_name}
                          className="w-10 h-10 rounded-full object-cover cursor-pointer"
                          onClick={() =>
                            openImageModal(
                              restro.restaurant_images?.[0]
                                ? `${IMAGE_URL}/${restro.restaurant_images[0]}`
                                : staticimg
                            )
                          }
                        />

                      </td>
                      <td className="p-3 border-b border-gray-200 font-medium">
                        {restro.restro_name}
                      </td>
                      <td className="p-3 border-b border-gray-200">{restro.food_type}</td>
                      <td className="p-3 border-b border-gray-200">
                        {truncateDescription(restro.description)}
                      </td>
                      <td className="p-3 border-b border-gray-200 text-center">
                        <button
                          className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500 text-white cursor-pointer hover:bg-purple-600 mx-auto"
                          onClick={() => navigate(`/DishesList/${restro._id}`)}
                          title="View Dishes"
                        >
                          <MdRestaurantMenu size={16} />
                        </button>
                      </td>



                      <td className="p-3 border-b border-gray-200">
                        <div className="flex justify-center items-center">
                          <div className="flex gap-3">
                            <button
                              className="flex justify-center w-8 h-8 items-center gap-1 rounded-lg bg-blue-500 text-white cursor-pointer hover:bg-blue-600 whitespace-nowrap"
                              onClick={() => navigate(`/RestroProfile/${restro._id}`)}
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              className="flex items-center gap-1 justify-center w-8 h-8 rounded-lg bg-green-500 text-white cursor-pointer hover:bg-green-600 whitespace-nowrap"
                              onClick={() => navigate(`/UpdateRestaurant/${restro._id}`)}
                            >
                              <MdEdit size={16} />
                            </button>

                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                  : (
                    <tr>
                      <td colSpan="6" className="text-center p-6 text-gray-500 italic">
                        No restaurants found.
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>



          {/* ✅ Fixed Pagination */}
          <Pagination
            currentPage={pagination.currentPage}
            totalItems={pagination.totalRecords}
            itemsPerPage={pagination.pageSize}
            onPageChange={(page) => fetchRestaurants(page)}
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
              alt="Restaurant Logo"
              className="w-full h-auto object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      <RestaurantFilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={(filters) => {
          setAppliedFilters(filters);
          fetchRestaurants(1, search, filters);
        }}
      />



      <DeleteModel
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        redbutton="Confirm"
        para="Do you really want to delete? This action cannot be undone."
      />
    </>
  );
}

export default RestroList;
