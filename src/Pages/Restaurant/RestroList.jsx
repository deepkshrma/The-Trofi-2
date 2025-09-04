// @ts-nocheck
import React, { useState } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import { Eye, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/common/Pagination/Pagination";

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
  const pageSize = 10;
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalRecords: 0,
  });
  const navigate = useNavigate();

  //  Apply search filter
  const filteredRestaurants = restaurants.filter((restro) =>
    restro.name.toLowerCase().includes(search.toLowerCase())
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
                  key={restro.id}
                  className="hover:bg-gray-50 transition text-gray-700"
                >
                  <td className="p-3 border-b border-gray-200">{index + 1}</td>
                  <td className="p-3 border-b border-gray-200">
                    <img
                      src={restro.logo}
                      alt={restro.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </td>
                  <td className="p-3 border-b border-gray-200 font-medium">
                    {restro.name}
                  </td>
                  <td className="p-3 border-b border-gray-200">
                    {restro.type}
                  </td>
                  <td className="p-3 border-b border-gray-200">
                    {restro.description}
                  </td>
                  <td className="p-3 border-b border-gray-200">
                    <div className="flex justify-center items-center">
                      <button className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">
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
        <Pagination
          currentPage={pagination.currentPage}
          totalItems={pagination.totalUsers}
          itemsPerPage={10} // Same limit as API
          onPageChange={(page) => fetchUsers(page)} // Call API on page change
          totalPages={pagination.totalPages} // Backend total pages
          type="backend"
        />
      </div>
    </div>
  );
}

export default RestroList;
