// @ts-nocheck
import React, { useState, useEffect } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import { Eye, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/common/Pagination/Pagination";
import axios from "axios";
import { BASE_URL } from "../../config/Config";
import { MdEdit } from "react-icons/md";
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
import {
  FaUtensils,
  FaStoreAlt,
  FaConciergeBell,
  FaStoreSlash,
  FaBan,
} from "react-icons/fa";
import { toast } from "react-toastify";

function RestroList() {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10, // default page size
    totalRecords: 0,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    // setSelectedAdmin(null);
  };

  const confirmDelete = async () => {};

  const navigate = useNavigate();

  const IMAGE_URL = "http://trofi-backend.apponedemo.top";

  let token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4Y2QzOTAwNWM4ZjA0NWRjZDRjNjI1MSIsImVtYWlsIjoiam9obkBjZW5hLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzU4Mjc5OTM2LCJleHAiOjE3NTg4ODQ3MzZ9.pVPRinrHt75yG4pP8lu6nxDXyyN8HlF60cVuOToD5Ew";

  // Fetch restaurants with pagination
  const fetchRestaurants = async (page = 1) => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${BASE_URL}/restro/get-restaurant?page=${page}&limit=${pagination.pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { data, pagination: backendPagination } = response.data;

      setRestaurants(data);
      setPagination((prev) => ({
        ...prev,
        currentPage: backendPagination.page,
        totalPages: backendPagination.totalPages,
        totalRecords: backendPagination.total,
      }));
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      toast.error("Error fetching restaurants:", error);
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
          <div className=" bg-blue-900 p-3 rounded-xl text-white h-[100px] flex justify-between">
            <div>
              <h4 className="text-[14px]">Total restaurants</h4>
              <p className="text-[22px] font-semibold">{restaurants.length}</p>
            </div>
            <div className="">
              <div className="w-15 h-15 bg-white/60  rounded-3xl flex justify-center  items-center">
                <FaUtensils size={35} className="text-blue-900" />
              </div>
            </div>
          </div>
          <div className="p-3 bg-green-500 rounded-xl text-white h-[100px] flex justify-between">
            <div>
              <h4 className="text-[14px]">Active restaurants</h4>
              <p className="text-[22px] font-semibold">
                {restaurants.filter((u) => u.status === "active").length}
              </p>
            </div>
            <div className="">
              <div className="w-15 h-15 bg-white/60  rounded-3xl flex justify-center  items-center">
                <FaStoreAlt size={35} className="text-green-500" />
              </div>
            </div>
          </div>
          <div className="p-3 bg-yellow-500 rounded-xl text-white h-[100px] flex justify-between">
            <div>
              <h4 className="text-[14px]">Inactive restaurants</h4>
              <p className="text-[22px] font-semibold">
                {restaurants.filter((u) => u.status === "inactive").length}
              </p>
            </div>
            <div className="">
              <div className="w-15 h-15 bg-white/60  rounded-3xl flex justify-center  items-center">
                <FaStoreSlash size={35} className="text-yellow-500" />
              </div>
            </div>
          </div>
          <div className="p-3 bg-red-500 rounded-xl text-white h-[100px] flex justify-between">
            <div>
              <h4 className="text-[14px]">Suspended restaurants</h4>
              <p className="text-[22px] font-semibold">
                {restaurants.filter((u) => u.status === "suspended").length}
              </p>
            </div>
            <div className="">
              <div className="w-15 h-15 bg-white/60  rounded-3xl flex justify-center  items-center">
                <FaBan size={35} className="text-red-500" />
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

          {loading ? (
            <div className="text-center p-6 text-gray-500">Loading...</div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 text-left text-gray-700">
                  <th className="p-3 border-b border-gray-300">S.No.</th>
                  <th className="p-3 border-b border-gray-300">Logo</th>
                  <th className="p-3 border-b border-gray-300">Name</th>
                  <th className="p-3 border-b border-gray-300">Type</th>
                  <th className="p-3 border-b border-gray-300">Description</th>
                  <th className="p-3 border-b border-gray-300 text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRestaurants.length > 0 ? (
                  filteredRestaurants.map((restro, index) => (
                    <tr
                      key={restro._id}
                      className="hover:bg-gray-50 transition text-gray-700"
                    >
                      <td className="p-3 border-b border-gray-200">
                        {(pagination.currentPage - 1) * pagination.pageSize +
                          (index + 1)}
                      </td>
                      <td className="p-3 border-b border-gray-200">
                        <img
                          src={
                            restro.restaurant_images?.[0]
                              ? `${IMAGE_URL}/${restro.restaurant_images[0]}`
                              : staticimg
                          }
                          alt={restro.restro_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </td>
                      <td className="p-3 border-b border-gray-200 font-medium">
                        {restro.restro_name}
                      </td>
                      <td className="p-3 border-b border-gray-200">
                        {restro.food_type}
                      </td>
                      <td className="p-3 border-b border-gray-200">
                        {restro.description}
                      </td>
                      <td className="p-3 border-b border-gray-200">
                        <div className="flex justify-center items-center">
                          <div className="flex gap-3">
                            <button
                              className="flex justify-center w-8 h-8 items-center gap-1 rounded-lg bg-blue-500 text-white cursor-pointer hover:bg-blue-600 whitespace-nowrap"
                              onClick={() =>
                                navigate(`/RestroProfile/${restro._id}`)
                              }
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              className="flex items-center gap-1 justify-center w-8 h-8 rounded-lg bg-green-500 text-white cursor-pointer hover:bg-green-600 whitespace-nowrap"
                              onClick={() =>
                                navigate(`/UpdateRestaurant/${restro._id}`)
                              }
                            >
                              <MdEdit size={16} />
                            </button>
                            <button
                              className="flex items-center gap-1 justify-center w-8 h-8 rounded-lg bg-red-500 text-white cursor-pointer hover:bg-red-600 whitespace-nowrap"
                              onClick={() => setShowDeleteModal(true)}
                            >
                              <MdDelete size={16} />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center p-6 text-gray-500 italic"
                    >
                      No restaurants found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

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
