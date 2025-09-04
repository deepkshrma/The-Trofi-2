import React, { useState } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import pizza from "../../assets/images/pizza1.jpg";
import Pagination from "../../components/common/Pagination/Pagination";

function RestroAmenityList() {
  // Sample data (replace with API data later)
  const [amenities] = useState([
    { id: 1, name: "Italian Restaurant", logo: pizza },
    { id: 2, name: "Chinese Restaurant", logo: pizza },
    { id: 3, name: "Mexican Restaurant", logo: pizza },
  ]);
  const pageSize = 10;
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalRecords: 0,
  });
  const [search, setSearch] = useState("");

  // Filter amenities based on search text
  const filteredAmenities = amenities.filter((amenity) =>
    amenity.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="main main_page p-6 w-full h-screen duration-900">
      <PageTitle title={"Restaurant Amenities List"} />
      <div className="bg-white rounded-2xl shadow-md mt-3">
        <div className="overflow-x-auto pb-3">
          {/* Search input */}
          <div className="flex flex-wrap gap-3 m-3">
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 bg-white p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] outline-none w-64"
            />
          </div>

          {/* Table */}
          <table className="w-full border border-gray-200  overflow-hidden">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">S.No</th>
                <th className="px-4 py-2 text-left">Restaurant Name</th>
                <th className="px-4 py-2 text-left">Logo</th>
              </tr>
            </thead>
            <tbody>
              {filteredAmenities.length > 0 ? (
                filteredAmenities.map((amenity, index) => (
                  <tr
                    key={amenity.id}
                    className="border-b border-gray-300 hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{amenity.name}</td>
                    <td className="px-4 py-2">
                      <img
                        src={amenity.logo}
                        alt={amenity.name}
                        className="h-12 w-12 object-cover rounded-full border"
                      />
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

export default RestroAmenityList;
