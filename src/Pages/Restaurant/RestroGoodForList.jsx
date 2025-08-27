import React, { useState } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";

function RestroGoodForList() {
  // Sample data (replace with API data later)
  const [restaurants] = useState([
    { id: 1, name: "Italian Bistro", goodFor: ["Family", "Couples", "Lunch"] },
    { id: 2, name: "Dragon Wok", goodFor: ["Friends", "Parties"] },
    { id: 3, name: "El Camino", goodFor: ["Dinner", "Takeaway", "Events"] },
  ]);

  return (
    <div className="main main_page p-6 w-full">
      <div className="bg-white rounded-2xl shadow-md p-4">
        <PageTitle title={"Restaurant - Good For"} />

        {/* Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-orange-500 text-white">
              <tr>
                <th className="px-4 py-2 text-left">S.No.</th>
                <th className="px-4 py-2 text-left">Restaurant Name</th>
                <th className="px-4 py-2 text-left">Good For</th>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default RestroGoodForList;
