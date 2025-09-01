import React, { useState } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";

function RestroCuisineList() {
  // Sample data (replace with API data later)
  const [restaurants] = useState([
    { id: 1, name: "Italian Bistro", cuisines: ["Italian", "Mediterranean"] },
    { id: 2, name: "Dragon Wok", cuisines: ["Chinese", "Thai"] },
    { id: 3, name: "El Camino", cuisines: ["Mexican", "Spanish"] },
  ]);

  return (
    <div className="main main_page p-6 w-full h-screen duration-900">
      <div className="bg-white rounded-2xl shadow-md p-4">
        <PageTitle title={"Restaurant & Cuisines"} />

        {/* Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-orange-500 text-white">
              <tr>
                <th className="px-4 py-2 text-left">S.No.</th>
                <th className="px-4 py-2 text-left">Restaurant Name</th>
                <th className="px-4 py-2 text-left">Cuisine List</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map((restaurant, index) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default RestroCuisineList;
