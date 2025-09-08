import React, { useState } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import Pagination from "../../components/common/Pagination/Pagination";

function RestroGoodForList() {
  // Sample data (replace with API data later)
  const [restaurants] = useState([
    { id: 1, name: "Italian Bistro", goodFor: ["Family", "Couples", "Lunch"] },
    { id: 2, name: "Dragon Wok", goodFor: ["Friends", "Parties"] },
    { id: 3, name: "El Camino", goodFor: ["Dinner", "Takeaway", "Events"] },
  ]);
  const [search, setSearch] = useState("");
  const pageSize = 10;
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalRecords: 0,
  });
  const filteredRestaurant = restaurants.filter((restaurant) =>
    restaurant.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="main main_page p-6 w-full h-screen duration-900">
      <PageTitle title={"Restaurant - Good For"} />
      <div className="bg-white rounded-2xl shadow-md mt-3">
        {/* Table */}
        <div className="overflow-x-auto pb-3">
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
          <table className="w-full border border-gray-200  overflow-hidden">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">S.No.</th>
                <th className="px-4 py-2 text-left">Restaurant Name</th>
                <th className="px-4 py-2 text-left">Good For</th>
              </tr>
            </thead>
            <tbody>
              {filteredRestaurant.length > 0 ? (
                filteredRestaurant.map((restaurant, index) => (
                  <tr
                    key={restaurant.id}
                    className="border-b border-gray-300 hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{restaurant.name}</td>
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap gap-2">
                        {restaurant.goodFor.map((item, i) => (
                          <span
                            key={i}
                            className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    className="text-center py-4 text-gray-500 italic"
                  >
                    No results found
                  </td>
                </tr>
              )}
              {/* {restaurants.map((restaurant, index) => (
                <tr
                  key={restaurant.id}
                  className="border-b border-gray-300 hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{restaurant.name}</td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-2">
                      {restaurant.goodFor.map((item, i) => (
                        <span
                          key={i}
                          className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </td>
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
    </div>
  );
}

export default RestroGoodForList;
