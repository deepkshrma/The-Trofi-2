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
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YzQwMDk0NmE3NzY2YzYyM2YyMDE5YyIsImVtYWlsIjoidGRzQGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzU3Njc1NjY4LCJleHAiOjE3NTgyODA0Njh9.Yx_0GEsvT0x-73pIkf-BOz20agZwKd9f6otdTOTr-MI";

  // ✅ Fetch restaurants with pagination
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants(1); // initial load
  }, []);

  // Search filter (frontend only)
  const filteredRestaurants = restaurants.filter((restro) =>
    restro.restro_name?.toLowerCase().includes(search.toLowerCase())
  );

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

        {/* Table */}
        <div className="bg-white shadow-md rounded-xl border border-gray-200 overflow-x-auto pb-3">
          {/* Search */}
          <div className="flex flex-wrap gap-3 m-3">
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 bg-white p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] outline-none w-64"
            />
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
                              : "https://via.placeholder.com/40"
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
