import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageTitle from "../../components/PageTitle/PageTitle";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL, IMAGE_URL } from "../../config/Config";
import guest from "../../assets/images/dishh.png";
import {
  ChevronRight,
  Star,
  CheckCircle,
  XCircle,
  MapPin,
  Mail,
  IndianRupee,
  ChevronLeft,
  ChevronRight as ArrowRight,
} from "lucide-react";

function DishDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const fetchDish = async () => {
    setLoading(true);
    try {
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;
      if (!token) {
        toast.error("Please login first");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${BASE_URL}/admin/dishes/${id}/details`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setDish(response.data.data);
      } else {
        toast.error(response.data.message || "Failed to fetch dish details");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while fetching dish details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDish();
  }, [id]);

  const openImageModal = (index) => {
    setCurrentImageIndex(index);
    setIsImageModalOpen(true);
  };
  const closeImageModal = () => setIsImageModalOpen(false);

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? dish.dish_images.length - 1 : prev - 1
    );
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === dish.dish_images.length - 1 ? 0 : prev + 1
    );
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-[#F9832B] border-dashed rounded-full animate-spin"></div>
      </div>
    );

  if (!dish)
    return <p className="text-center mt-10 text-gray-500">No dish found</p>;

  return (
    <div className="relative main main_page min-h-screen p-6 duration-900">
      {/* 🔙 Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 right-6 z-5 flex items-center gap-2 mt-2 cursor-pointer px-3 py-2 bg-white/80 backdrop-blur-md text-gray-800 rounded-full shadow-md border border-white hover:bg-[#F9832B] hover:text-white transition-all duration-300 transform hover:translate-x-1 hover:scale-105 active:scale-95"
      >
        <ChevronRight className="w-5 h-5 rotate-180" />
      </button>

      <PageTitle title="Dish Details" />

      {/* Dish Info Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mt-5 flex flex-col lg:flex-row gap-8 items-center lg:items-start animate-fadeIn">
        {/* Left Section: Dish Images */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="relative w-56 h-56 rounded-2xl border-4 border-[#F9832B]/50 shadow-lg overflow-hidden cursor-pointer group hover:scale-105 transition-transform duration-300"
            onClick={() => openImageModal(0)}
          >
            <img
              src={
                dish.dish_images?.[0]
                  ? `${IMAGE_URL}/${dish.dish_images[0]}`
                  : guest
              }
              alt={dish.dish_name}
              className="w-full h-full object-cover group-hover:opacity-90"
              onError={(e) => (e.target.src = guest)}
            />
          </div>

          {/* Thumbnails */}
          <div className="flex gap-2 flex-wrap justify-center">
            {dish.dish_images?.map((img, index) => (
              <img
                key={index}
                src={`${IMAGE_URL}/${img}`}
                alt={`Dish ${index + 1}`}
                className={`w-16 h-16 object-cover rounded-lg border-2 cursor-pointer ${
                  currentImageIndex === index
                    ? "border-[#F9832B]"
                    : "border-gray-200"
                }`}
                onClick={() => openImageModal(index)}
                onError={(e) => (e.target.src = guest)}
              />
            ))}
          </div>
        </div>

        {/* Right Section: Dish Details */}
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-2xl font-bold text-gray-900">{dish.dish_name}</h2>

            <div className="flex items-center gap-2">
              {dish.isAvailable ? (
                <span className="flex items-center gap-1 text-green-600 font-medium">
                  <CheckCircle className="w-5 h-5" /> Available
                </span>
              ) : (
                <span className="flex items-center gap-1 text-red-600 font-medium">
                  <XCircle className="w-5 h-5" /> Not Available
                </span>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="mt-3">
            <span className="inline-flex items-center gap-1 bg-[#F9832B]/10 text-[#F9832B] font-semibold px-4 py-1.5 rounded-full text-lg shadow-sm">
              <IndianRupee className="w-5 h-5" /> {dish.price}
            </span>
          </div>

          {/* Description */}
          {dish.description && (
            <p className="mt-4 text-gray-700 leading-relaxed">
              {dish.description}
            </p>
          )}

          {/* Ingredients */}
          {dish.dish_ingredients?.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-gray-800 mb-2">Ingredients:</h4>
              <div className="flex flex-wrap gap-2">
                {dish.dish_ingredients.map((ing, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-gray-100 text-gray-800 px-3 py-1 rounded-full shadow-sm"
                  >
                    {ing.icon && (
                      <img
                        src={`${IMAGE_URL}/${ing.icon}`}
                        alt={ing.name}
                        className="w-4 h-4"
                      />
                    )}
                    <span>{ing.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Restaurant Info */}
          <div className="mt-4 space-y-2 text-gray-700">
            <p className="flex items-center gap-2">
              <span className="font-semibold">Restaurant:</span>{" "}
              {dish.restaurantId?.restro_name || "N/A"}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#F9832B]" />
              {dish.restaurantId?.address || "N/A"}
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#F9832B]" />
              {dish.restaurantId?.email || "N/A"}
            </p>
          </div>

          {/* Ratings Summary */}
          <div className="mt-5 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-xl shadow-sm">
              <Star className="w-5 h-5" />
              <span className="font-medium">
                Avg Rating: {dish.avgRating || 0} ⭐
              </span>
            </div>

            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl shadow-sm">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">
                Total Ratings: {dish.totalRatings || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Ratings Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mt-8 animate-fadeIn">
        <h3 className="text-lg font-semibold mb-4 text-[#F9832B]">
          User Ratings
        </h3>

        {dish.ratings?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-[#F9832B]/10 text-[#F9832B] text-left">
                  <th className="px-6 py-3 font-semibold">User</th>
                  <th className="px-6 py-3 font-semibold">Rating</th>
                  <th className="px-6 py-3 font-semibold">Comment</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {dish.ratings.map((r) => (
                  <tr
                    key={r._id}
                    className="border-t border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-3 flex items-center gap-2">
                      <img
                        src={
                          r.userId.profile_picture
                            ? `${IMAGE_URL}/${r.userId.profile_picture}`
                            : guest
                        }
                        alt={r.userId.name}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => (e.target.src = guest)}
                      />
                      {r.userId.name}
                    </td>
                    <td className="px-6 py-3">⭐ {r.star_value}</td>
                    <td className="px-6 py-3">{r.reviewComment}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          r.status === "published"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No ratings available</p>
        )}
      </div>

      {/* Image Modal with Navigation */}
      {isImageModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeImageModal}
          ></div>
          <div className="relative bg-white rounded-xl shadow-lg max-w-lg w-11/12 p-4 z-10 flex flex-col items-center">
            <button
              onClick={closeImageModal}
              className="absolute top-3 right-3 text-gray-700 text-xl font-bold hover:text-red-600 cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center justify-between w-full">
              <button
                onClick={prevImage}
                className="p-2 text-gray-600 hover:text-[#F9832B]"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <img
                src={`${IMAGE_URL}/${dish.dish_images[currentImageIndex]}`}
                alt={`Dish ${currentImageIndex + 1}`}
                className="max-h-[70vh] object-contain rounded-lg"
                onError={(e) => (e.target.src = guest)}
              />
              <button
                onClick={nextImage}
                className="p-2 text-gray-600 hover:text-[#F9832B]"
              >
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
            <p className="mt-3 text-gray-500 text-sm">
              {currentImageIndex + 1} of {dish.dish_images.length}
            </p>
          </div>
        </div>
      )}

      {/* Animation */}
      <style>
        {`
          .animate-fadeIn {
            animation: fadeIn 0.8s ease-in-out;
          }
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}

export default DishDetails;
