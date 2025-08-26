// @ts-nocheck
import React, { useState } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import {
  Eye,
  Edit,
  Trash2,
  PlusCircle,
  Star,
  ShieldCheck,
  Heart,
} from "lucide-react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";

function RestroList() {
  // 🔹 Sample static data
  const [restaurants, setRestaurants] = useState([
    {
      id: 1,
      name: "Cafe Aroma",
      type: "Cafe",
      city: "Jaipur",
      state: "Rajasthan",
      feedbackCount: 120,
      avgRating: 4.3,
      hygieneSeal: true,
      favorite: false,
    },
    {
      id: 2,
      name: "Royal Bites",
      type: "Fine Dining",
      city: "Delhi",
      state: "Delhi",
      feedbackCount: 85,
      avgRating: 4.7,
      hygieneSeal: false,
      favorite: true,
    },
    {
      id: 3,
      name: "Bake House",
      type: "Bakery",
      city: "Mumbai",
      state: "Maharashtra",
      feedbackCount: 60,
      avgRating: 4.1,
      hygieneSeal: true,
      favorite: false,
    },
  ]);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterHygiene, setFilterHygiene] = useState("All");
  const [filterFav, setFilterFav] = useState(false);
  const navigate = useNavigate();

  //  Toggle favorite
  const toggleFavorite = (id) => {
    setRestaurants(
      restaurants.map((restro) =>
        restro.id === id ? { ...restro, favorite: !restro.favorite } : restro
      )
    );
  };

  //  Delete Restaurant
  const handleDelete = (id) => {
    setRestaurants(restaurants.filter((restro) => restro.id !== id));
  };

  //  Apply filters
  const filteredRestaurants = restaurants.filter((restro) => {
    const matchesSearch =
      restro.name.toLowerCase().includes(search.toLowerCase()) ||
      restro.city.toLowerCase().includes(search.toLowerCase());

    const matchesType = filterType === "All" || restro.type === filterType;

    const matchesHygiene =
      filterHygiene === "All" ||
      (filterHygiene === "Hygiene Passed" && restro.hygieneSeal) ||
      (filterHygiene === "Hygiene Failed" && !restro.hygieneSeal);

    const matchesFav = !filterFav || restro.favorite;

    return matchesSearch && matchesType && matchesHygiene && matchesFav;
  });

  return (
    <div className="main main_page p-6 min-h-screen bg-gray-50">
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

      {/* 🔍 Search + Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] outline-none w-64"
        />

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border border-gray-300 p-2 rounded-lg shadow-sm"
        >
          <option value="All">All Types</option>
          <option value="Cafe">Cafe</option>
          <option value="Fine Dining">Fine Dining</option>
          <option value="Bakery">Bakery</option>
        </select>

        <select
          value={filterHygiene}
          onChange={(e) => setFilterHygiene(e.target.value)}
          className="border border-gray-300 p-2 rounded-lg shadow-sm"
        >
          <option value="All">All Hygiene Status</option>
          <option value="Hygiene Passed">Hygiene Passed</option>
          <option value="Hygiene Failed">Hygiene Failed</option>
        </select>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filterFav}
            onChange={(e) => setFilterFav(e.target.checked)}
          />
          Favorites Only
        </label>
      </div>

      {/*  Table */}
      <div className="bg-white shadow-md rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-700">
              <th className="p-3 border-b border-gray-300">#</th>
              <th className="p-3 border-b border-gray-300">Name</th>
              <th className="p-3 border-b border-gray-300">Cuisine</th>
              <th className="p-3 border-b border-gray-300">City</th>
              <th className="p-3 border-b border-gray-300">State</th>
              <th className="p-3 border-b border-gray-300">Feedbacks</th>
              <th className="p-3 border-b border-gray-300">Avg Rating</th>
              <th className="p-3 border-b border-gray-300">Hygiene Seal</th>
              <th className="p-3 border-b border-gray-300">Favorite</th>
              <th className="p-3 border-b border-gray-300 text-center">
                Actions
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
                  <td className="p-3 border-b border-gray-200 font-medium">
                    {restro.name}
                  </td>
                  <td className="p-3 border-b border-gray-200">
                    {restro.type}
                  </td>
                  <td className="p-3 border-b border-gray-200">
                    {restro.city}
                  </td>
                  <td className="p-3 border-b border-gray-200">
                    {restro.state}
                  </td>
                  <td className="p-3 border-b border-gray-200">
                    {restro.feedbackCount}
                  </td>
                  <td className="p-3 border-b border-gray-200 flex items-center gap-1">
                    <Star className="text-yellow-500 h-4 w-4" />{" "}
                    {restro.avgRating}
                  </td>
                  <td className="p-3 border-b border-gray-200">
                    {restro.hygieneSeal ? (
                      <span className="flex items-center gap-1 text-green-600 font-medium">
                        <ShieldCheck className="h-4 w-4" /> Passed
                      </span>
                    ) : (
                      <span className="text-red-600 font-medium">Failed</span>
                    )}
                  </td>
                  <td className="p-3 border-b border-gray-200">
                    <button onClick={() => toggleFavorite(restro.id)}>
                      <Heart
                        className={`h-5 w-5 ${
                          restro.favorite
                            ? "text-red-500 fill-red-500"
                            : "text-gray-400"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="p-3 border-b border-gray-200 flex justify-center gap-3">
                    <button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">
                      <Eye size={16} />
                    </button>
                    <button className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100">
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(restro.id)}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="10"
                  className="text-center p-6 text-gray-500 italic"
                >
                  No restaurants found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RestroList;
