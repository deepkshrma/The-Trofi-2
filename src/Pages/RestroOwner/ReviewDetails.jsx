import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL, IMAGE_URL } from "../../config/Config";
import PageTitle from "../../components/PageTitle/PageTitle";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import { STAR_RATINGS } from "../../config/hashtagconfig";
import { toast } from "react-toastify";
import guest from "../../assets/images/guest.png";
import starDefault from "../../assets/images/untitled_folder_6/star0.jfif";
import { FaArrowLeft, FaImage, FaHashtag, FaStar, FaCalendarAlt, FaClock } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// Image Gallery Modal
const ImageGalleryModal = ({ images, isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen || !images || images.length === 0) return null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Review Images ({currentIndex + 1} / {images.length})
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ✕
            </button>
          </div>

          <div className="relative">
            <img
              src={`${IMAGE_URL}/${images[currentIndex].image}`}
              alt={`Review ${currentIndex + 1}`}
              className="w-full h-[500px] object-contain rounded-lg bg-gray-100"
              onError={(e) => (e.target.src = guest)}
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition"
                >
                  <span className="text-xl font-bold">←</span>
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition"
                >
                  <span className="text-xl font-bold">→</span>
                </button>
              </>
            )}
          </div>

          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <img
                key={img._id}
                src={`${IMAGE_URL}/${img.image}`}
                alt={`Thumbnail ${idx + 1}`}
                className={`w-20 h-20 object-cover rounded cursor-pointer border-2 transition ${
                  idx === currentIndex ? "border-orange-500 scale-105" : "border-gray-300"
                }`}
                onClick={() => setCurrentIndex(idx)}
                onError={(e) => (e.target.src = guest)}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

function ReviewDetails() {
  const { reviewId } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showImageGallery, setShowImageGallery] = useState(false);

  const fetchReviewDetails = async () => {
    try {
      setLoading(true);
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;

      if (!token) {
        toast.error("Please login first");
        navigate(-1);
        return;
      }

      const { data } = await axios.get(
        `${BASE_URL}/restrowner/review/${reviewId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        setReview(data.data);
      } else {
        toast.error("Failed to fetch review details");
        navigate(-1);
      }
    } catch (err) {
      console.error("Failed to fetch review details:", err);
      toast.error(err.response?.data?.message || "Error fetching review details");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewDetails();
  }, [reviewId]);

  if (loading) {
    return (
      <div className="main main_page p-6 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-[#F9832B] border-dashed rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-700 font-bold text-lg">Loading review details...</p>
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="main main_page p-6 min-h-screen">
        <div className="text-center text-gray-500 italic">Review not found</div>
      </div>
    );
  }

  const ratingIndex = Math.max(0, (review.star_value || 1) - 1);

  return (
    <div className="main main_page p-6 min-h-screen duration-900">
      <BreadcrumbsNav
        customTrail={[
          { label: "Reviews", path: `/RestaurantReviews` },
          { label: "Review Details", path: `/ReviewDetails/${reviewId}` },
        ]}
      />

      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer transition"
        >
          <FaArrowLeft size={16} />
          Back
        </button>
        <PageTitle title="Review Details" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Rating Card */}
          {review.is_rating_view && (
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaStar className="text-orange-500" />
                Rating Information
              </h3>
              <div className="flex items-center gap-4">
                <img
                  src={STAR_RATINGS[ratingIndex]?.img || starDefault}
                  alt="rating"
                  className="w-16 h-16"
                />
                <div>
                  <div className="text-3xl font-bold text-gray-800">
                    {review.star_value || 0} Stars
                  </div>
                  <div className="text-lg text-gray-600 mt-1">
                    {review.rating_label || "No label"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Review Comment */}
          {review.is_comment_view && review.reviewComment && (
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">User Comments</h3>
              <p className="text-gray-700 leading-relaxed">{review.reviewComment}</p>
            </div>
          )}

          {/* Hashtags */}
          {review.is_hashtag_view && review.hashTags?.length > 0 && (
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaHashtag className="text-orange-500" />
                Hashtags
              </h3>
              <div className="flex flex-wrap gap-3">
                {review.hashTags.map((tag) => (
                  <span
                    key={tag._id}
                    className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium"
                  >
                    #{tag.hashTagTitle}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tell Us Section */}
          {review.tell_us?.length > 0 && (
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Tell Us More</h3>
              <div className="space-y-3">
                {review.tell_us.map((q, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <span className="font-medium text-gray-700">{q.question}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        q.answer
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {q.answer ? "Yes" : "No"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin Notes */}
          {review.notes && (
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Admin Notes</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-gray-700">{review.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Additional Info */}
        <div className="space-y-6">
          {/* User Info */}
          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Reviewer</h3>
            <div className="flex items-center gap-3">
              <img
                src={guest}
                alt="Anonymous"
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
              />
              <div>
                <h4 className="font-semibold text-gray-800">Anonymous</h4>
                <p className="text-sm text-gray-500">User Identity Hidden</p>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Review Date</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-700">
                <FaCalendarAlt className="text-orange-500" />
                <span>{new Date(review.createdAt).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <FaClock className="text-orange-500" />
                <span>{new Date(review.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}</span>
              </div>
            </div>
          </div>

          {/* Images */}
          {review.images?.length > 0 && (
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaImage className="text-orange-500" />
                Review Images ({review.images.length})
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {review.images.slice(0, 4).map((img, idx) => (
                  <img
                    key={img._id}
                    src={`${IMAGE_URL}/${img.image}`}
                    alt={`Review ${idx + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition"
                    onClick={() => setShowImageGallery(true)}
                    onError={(e) => (e.target.src = guest)}
                  />
                ))}
              </div>
              {review.images.length > 4 && (
                <button
                  onClick={() => setShowImageGallery(true)}
                  className="w-full mt-3 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 cursor-pointer transition"
                >
                  View All {review.images.length} Images
                </button>
              )}
            </div>
          )}

          {/* Review Type */}
          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Review Type</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
              <span className="text-lg font-semibold text-gray-700">
                {review.type === "Restaurant" ? "Restaurant Review" : "Dish Review"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery Modal */}
      <ImageGalleryModal
        images={review.images || []}
        isOpen={showImageGallery}
        onClose={() => setShowImageGallery(false)}
      />
    </div>
  );
}

export default ReviewDetails;