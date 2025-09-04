import React, { useState } from "react";
import Pagination from "../../components/common/Pagination/Pagination";

function RestroDishSubCategoryList() {
  const subCategories = [
    {
      id: 1,
      image: "https://via.placeholder.com/60",
      name: "Veg Starters",
      description: "Crispy, light vegetarian appetizers.",
    },
    {
      id: 2,
      image: "https://via.placeholder.com/60",
      name: "Non-Veg Starters",
      description: "Chicken, fish, and meat-based starters.",
    },
    {
      id: 3,
      image: "https://via.placeholder.com/60",
      name: "Ice Creams",
      description: "Different flavored ice creams and sundaes.",
    },
  ];

  const [search, setSearch] = useState("");
  const pageSize = 10;
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalRecords: 0,
  });

  //  Apply search filter
  const filteredSubCategories = subCategories.filter((subCategory) =>
    subCategory.name.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="p-6 main main_page duration-900">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        Dish Sub Categories
      </h2>
      <div className="overflow-x-auto bg-white rounded-2xl shadow-md pb-3">
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
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 text-gray-700 text-left">
              <th className="p-3 pl-4 ">S.No.</th>
              <th className="p-3">Image</th>
              <th className="p-3">Sub Category Name</th>
              <th className="p-3">Description</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubCategories.length > 0 ? (
              filteredSubCategories.map((sub, index) => (
                <tr
                  key={sub.id}
                  className="border-b border-gray-300 hover:bg-orange-50 transition"
                >
                  <td className="p-3 pl-4 font-medium text-gray-700">
                    {index + 1}
                  </td>
                  <td className="p-3">
                    <img
                      src={sub.image}
                      alt={sub.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  </td>
                  <td className="p-3 text-gray-700">{sub.name}</td>
                  <td className="p-3 text-gray-500">{sub.description}</td>
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
            {/* {subCategories.map((sub, index) => (
              <tr
                key={sub.id}
                className="border-b hover:bg-orange-50 transition"
              >
                <td className="p-3 pl-4 font-medium text-gray-700">
                  {index + 1}
                </td>
                <td className="p-3">
                  <img
                    src={sub.image}
                    alt={sub.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                </td>
                <td className="p-3 text-gray-700">{sub.name}</td>
                <td className="p-3 text-gray-500">{sub.description}</td>
              </tr>
            ))} */}
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

export default RestroDishSubCategoryList;
