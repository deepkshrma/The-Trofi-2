// @ts-nocheck
import React, { useState, useEffect } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import { Eye, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/common/Pagination/Pagination";
import axios from "axios";
import { BASE_URL } from "../../config/Config";
const IMAGE_URL = "http://trofi-backend.apponedemo.top";

function RestroList() {
  // Sample static data (added logo + description)
  const [restaurants, setRestaurants] = useState([
    {
      id: 1,
      logo: "https://via.placeholder.com/40", // sample placeholder logo
      name: "Cafe Aroma",
      type: "Cafe",
      description: "Cozy place serving coffee & snacks.",
    },
    {
      id: 2,
      logo: "https://via.placeholder.com/40",
      name: "Royal Bites",
      type: "Fine Dining",
      description: "Luxury dining experience with gourmet dishes.",
    },
    {
      id: 3,
      logo: "https://via.placeholder.com/40",
      name: "Bake House",
      type: "Bakery",
      description: "Freshly baked breads, cakes & pastries.",
    },
  ]);
  const [search, setSearch] = useState("");
  const pageSize = 15;
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 15,
    totalRecords: 0,
  });
  const navigate = useNavigate();

  let token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YmE4MGYwMzQwNWQ2ODNiYjNmMzQ2ZiIsImVtYWlsIjoidGVzdDJAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NTcwNjIzNjksImV4cCI6MTc1NzY2NzE2OX0.VE-WDp9i0fmGQbKF7TSsPWnx_EXLN60ccHq2_LYwnjM";

  // Fetch all restaurants
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        console.log("before api call");

        const response = await axios.get(`${BASE_URL}/restro/get-restaurant`, {
          headers: {
            Authorization: `Bearer ${token}`, // attach token here
          },
        });
        console.log("after api call");
        setRestaurants(response.data.data);
        console.log(response);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      }
    };

    fetchRestaurants();
  }, []);

  //  Apply search filter
  const filteredRestaurants = restaurants.filter((restro) =>
    restro.restro_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="main main_page p-6 min-h-screen duration-900">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <PageTitle title={"Restaurant List"} />
        <button
          className="flex items-center gap-2 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg"
          style={{ backgroundColor: "#F9832B" }}
          onClick={() => navigate("/RestroAdd")}
        >
          <PlusCircle size={18} /> Add Restaurant
        </button>
      </div>

      {/*  Table */}
      <div className="bg-white shadow-md rounded-xl border border-gray-200 overflow-x-auto pb-3">
        {/*  Search */}
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
                      {index + 1}
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
                        <button
                          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 whitespace-nowrap"
                          onClick={() =>
                            navigate(`/RestroProfile/${restro._id}`)
                          }
                        >
                          <Eye size={16} /> View Profile
                        </button>
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

        <Pagination
          currentPage={pagination.currentPage}
          totalItems={pagination.totalUsers}
          itemsPerPage={15} // Same limit as API
          onPageChange={(page) => fetchUsers(page)} // Call API on page change
          totalPages={pagination.totalPages} // Backend total pages
          type="backend"
        />
      </div>
    </div>
  );
}

export default RestroList;
