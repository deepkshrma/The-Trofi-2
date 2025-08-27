import React, { useState } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";

function RestroAmenityList() {
  // Sample data (you can replace with API data later)
  const [amenities] = useState([
    {
      id: 1,
      name: "Italian Restaurant",
      logo: "https://via.placeholder.com/50x50?text=Logo",
      image: "https://via.placeholder.com/100x70?text=Image",
    },
    {
      id: 2,
      name: "Chinese Restaurant",
      logo: "https://via.placeholder.com/50x50?text=Logo",
      image: "https://via.placeholder.com/100x70?text=Image",
    },
    {
      id: 3,
      name: "Mexican Restaurant",
      logo: "https://via.placeholder.com/50x50?text=Logo",
      image: "https://via.placeholder.com/100x70?text=Image",
    },
  ]);

  return (
    <div className="main main_page p-6 w-full">
      <div className="bg-white rounded-2xl shadow-md p-4">
        <PageTitle title={"Restaurant Amenities List"} />

        {/* Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-orange-500 text-white">
              <tr>
                <th className="px-4 py-2 text-left">S.No</th>
                <th className="px-4 py-2 text-left">Restaurant Name</th>
                <th className="px-4 py-2 text-left">Logo</th>
              </tr>
            </thead>
            <tbody>
              {amenities.map((amenity) => (
                <tr
                  key={amenity.id}
                  className="border-b border-gray-300 hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-2">{amenity.id}</td>
                  <td className="px-4 py-2">{amenity.name}</td>
                  <td className="px-4 py-2">
                    <img
                      src={amenity.logo}
                      alt={amenity.name}
                      className="h-12 w-12 object-cover rounded-full border"
                    />
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

export default RestroAmenityList;
