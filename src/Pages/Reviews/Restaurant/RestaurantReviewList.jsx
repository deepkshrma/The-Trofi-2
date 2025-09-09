import React, { useState } from "react";

export default function RestaurantReviewList() {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      userName: "Priyanshu",
      restroName: "Taj Palace",
      rating_label: "Good",
      star_value: 4,
      status: "pending",
    },
    {
      id: 2,
      userName: "Sreya",
      restroName: "Barbeque Nation",
      rating_label: "Excellent",
      star_value: 5,
      status: "accepted",
    },
    {
      id: 3,
      userName: "Rohit",
      restroName: "Dominos",
      rating_label: "Average",
      star_value: 3,
      status: "denied",
    },
    {
      id: 4,
      userName: "Aditi",
      restroName: "Cafe Coffee Day",
      rating_label: "Poor",
      star_value: 2,
      status: "pending",
    },
    {
      id: 5,
      userName: "Karan",
      restroName: "McDonalds",
      rating_label: "Good",
      star_value: 4,
      status: "accepted",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  // Filter reviews based on search
  const filteredReviews = reviews.filter(
    (rev) =>
      rev.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.restroName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper to render stars
  const renderStars = (count) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className={i < count ? "text-yellow-400" : "text-gray-300"}>
        ★
      </span>
    ));
  };

  return (
    <div className="main main_page p-6 duration-900">
      <h1 className="text-xl font-bold mb-4">Restaurant Reviews List</h1>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4">
        {/* Search Field */}
        <div className="mb-4 w-80">
          <input
            type="text"
            placeholder="Search by User or Restaurant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-300  text-left">
              <th className="p-3 whitespace-nowrap">S.No</th>
              <th className="p-3 whitespace-nowrap">User Name</th>
              <th className="p-3 whitespace-nowrap">Restro Name</th>
              <th className="p-3 whitespace-nowrap">Rating Label</th>
              <th className="p-3 whitespace-nowrap">Rating</th>
              <th className="p-3 whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.map((rev, idx) => (
              <tr
                key={rev.id}
                className="border-b border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <td className="p-3 whitespace-nowrap">{idx + 1}</td>
                <td className="p-3 whitespace-nowrap">{rev.userName}</td>
                <td className="p-3 whitespace-nowrap">{rev.restroName}</td>
                <td className="p-3 whitespace-nowrap">{rev.rating_label}</td>
                <td className="p-3">{renderStars(rev.star_value)}</td>
                <td className="p-3">
                  <span
                    className={`inline-block w-24 text-center  px-2 py-1 rounded-full text-xs font-semibold ${
                      rev.status === "accepted"
                        ? "bg-green-100 text-green-700"
                        : rev.status === "denied"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {rev.status}
                  </span>
                </td>
              </tr>
            ))}

            {filteredReviews.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center p-4 text-gray-500">
                  No reviews found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
