// @ts-nocheck
import React, { useState } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/common/Pagination/Pagination";
import DynamicBreadcrumbs from "../../components/common/BreadcrumbsNav/DynamicBreadcrumbs";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";

function DishesList() {
  // 🔹 Sample static data
  const [dishes, setDishes] = useState([
    {
      id: 1,
      image: "https://via.placeholder.com/50",
      name: "Margherita Pizza",
      price: 250,
      description: "Classic pizza with tomato, mozzarella, and basil.",
    },
    {
      id: 2,
      image: "https://via.placeholder.com/50",
      name: "Pasta Alfredo",
      price: 300,
      description: "Creamy Alfredo sauce with fettuccine pasta.",
    },
    {
      id: 3,
      image: "https://via.placeholder.com/50",
      name: "Chocolate Cake",
      price: 150,
      description: "Rich and moist chocolate cake slice.",
    },
  ]);

  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const pageSize = 10;
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalRecords: 0,
  });

  //  Apply search filter
  const filteredDishes = dishes.filter((dish) =>
    dish.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="main main_page p-6 min-h-screen  duration-900">
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

      {/*  Table */}
      <div className="bg-white shadow-md rounded-xl border border-gray-200 overflow-x-auto pb-3">
        {/* 🔍 Search */}
        <div className="flex flex-wrap gap-3 m-3">
          <input
            type="text"
            placeholder="Search by dish name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 bg-white p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] outline-none w-64"
          />
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 text-left text-gray-700">
              <th className="p-3 border-b border-gray-300">S.No.</th>
              <th className="p-3 border-b border-gray-300">Image</th>
              <th className="p-3 border-b border-gray-300">Name</th>
              <th className="p-3 border-b border-gray-300">Description</th>
              <th className="p-3 border-b border-gray-300">Price (₹)</th>
            </tr>
          </thead>
          <tbody>
            {filteredDishes.length > 0 ? (
              filteredDishes.map((dish, index) => (
                <tr
                  key={dish.id}
                  className="hover:bg-gray-50 transition text-gray-700"
                >
                  <td className="p-3 border-b border-gray-200">{index + 1}</td>
                  <td className="p-3 border-b border-gray-200">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-12 h-12 rounded-md object-cover"
                    />
                  </td>
                  <td className="p-3 border-b border-gray-200 font-medium">
                    {dish.name}
                  </td>
                  <td className="p-3 border-b border-gray-200">
                    {dish.description}
                  </td>
                  <td className="p-3 border-b border-gray-200">
                    ₹{dish.price}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center p-6 text-gray-500 italic"
                >
                  No dishes found.
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

export default DishesList;
