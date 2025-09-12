import React, { useState } from "react";
import { FaRegEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import star1 from "../../../assets/images/untitled_folder_6/star1.png";
import star2 from "../../../assets/images/untitled_folder_6/star2.png";
import star3 from "../../../assets/images/untitled_folder_6/star3.png";
import star4 from "../../../assets/images/untitled_folder_6/star4.png";
import star5 from "../../../assets/images/untitled_folder_6/star5.png";
import PageTitle from "../../../components/PageTitle/PageTitle";
import DynamicBreadcrumbs from "../../../components/common/BreadcrumbsNav/DynamicBreadcrumbs";

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

  const faceStars = [
    { img: star1, label: "Very Bad" },
    { img: star2, label: "Bad" },
    { img: star3, label: "Okay" },
    { img: star4, label: "Good" },
    { img: star5, label: "Excellent" },
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Filter reviews based on search
  const filteredReviews = reviews.filter(
    (rev) =>
      rev.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.restroName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="main main_page p-6 duration-900">
      <DynamicBreadcrumbs />
      <PageTitle title={"Restaurant Reviews List"} />

      <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4 mt-5">
        {/* Search Field */}
        <div className="mb-4 w-80">
          <input
            type="text"
            placeholder="Search by User or Restaurant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-400"
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
              <th className="p-3 whitespace-nowrap">Action</th>
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
                <td className="p-3 whitespace-nowrap">
                  {faceStars[rev.star_value - 1].label}
                </td>
                <td className="p-3">
                  <img
                    src={faceStars[rev.star_value - 1].img}
                    alt={faceStars[rev.star_value - 1].label}
                    className="w-10 h-10 md:w-12 md:h-12"
                  />
                </td>
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
                <td className="p-3">
                  <div>
                    <FaRegEye
                      size={20}
                      onClick={() => navigate(`/RestaurantReview/${rev.id}`)}
                    />
                  </div>
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
