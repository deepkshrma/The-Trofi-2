import React, { useState } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import Pagination from "../../components/common/Pagination/Pagination";

function RestroCuisineList() {
  // Sample data (replace with API data later)
  const [restaurants] = useState([
    { id: 1, name: "Italian Bistro", cuisines: ["Italian", "Mediterranean"] },
    { id: 2, name: "Dragon Wok", cuisines: ["Chinese", "Thai"] },
    { id: 3, name: "El Camino", cuisines: ["Mexican", "Spanish"] },
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
      <PageTitle title={"Restaurant & Cuisines"} />
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
                <th className="px-4 py-2 text-left">Cuisine List</th>
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
                        {restaurant.cuisines.map((cuisine, i) => (
                          <span
                            key={i}
                            className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm"
                          >
                            {cuisine}
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
                      {restaurant.cuisines.map((cuisine, i) => (
                        <span
                          key={i}
                          className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm"
                        >
                          {cuisine}
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

export default RestroCuisineList;
