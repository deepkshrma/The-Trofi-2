// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BASE_URL, IMAGE_URL } from "../../config/Config";
import PageTitle from "../../components/PageTitle/PageTitle";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import { STAR_RATINGS } from "../../config/hashtagconfig";
import { toast } from "react-toastify";
import Pagination from "../../components/common/Pagination/Pagination";
import guest from "../../assets/images/guest.png";
import starDefault from "../../assets/images/untitled_folder_6/star0.jfif"; // fallback rating image

function RestaurantReviews() {
  const { restroId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 5,
    totalRecords: 0,
  });

  const fetchReviews = async (page = 1) => {
    try {
      setLoading(true);
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;

      if (!token) {
        toast.error("Please login first");
        return;
      }

      const { data } = await axios.get(`${BASE_URL}/restrowner/restrowner-ratings`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          type: "Restaurant",
          typeId: restroId,
          page,
          limit: pagination.pageSize,
        },
      });

      setReviews(data.data);
      setPagination((prev) => ({
        ...prev,
        currentPage: page,
        totalPages: Math.ceil(data.count / prev.pageSize),
        totalRecords: data.count,
      }));
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      toast.error("Error fetching reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1);
  }, [restroId]);

  return (
    <div className="main main_page p-6 min-h-screen duration-900">
      <BreadcrumbsNav
        customTrail={[{ label: "Restaurant Reviews", path: "/restaurant-reviews" }]}
      />
      <PageTitle title="Restaurant Reviews" />

      {loading ? (
        <div className="text-center p-6 text-gray-500 italic">Loading...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center p-6 text-gray-500 italic">No reviews found.</div>
      ) : (
        <div className="grid gap-6 mt-6">
          {reviews.map((review) => {
            const ratingIndex = Math.max(0, (review.star_value || 1) - 1);

            return (
              <div
                key={review._id}
                className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl transition duration-300 flex flex-col lg:flex-row gap-6"
              >
                {/* Left Column: User info + review comment */}
                <div className="flex flex-col lg:w-1/2 gap-4">
                  {/* User Info */}
                  <div className="flex items-center gap-3">
                    <img
                      src={guest}
                      alt="Anonymous"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-medium text-gray-800">Anonymous</h3>
                      <p className="text-gray-500 text-sm">
                        {new Date(review.createdAt).toLocaleDateString()} •{" "}
                        {new Date(review.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Star Rating */}
                  {review.is_rating_view && (
                    <div className="flex items-center gap-2">
                      <img
                        src={STAR_RATINGS[ratingIndex]?.img || starDefault}
                        alt={STAR_RATINGS[ratingIndex]?.label || "star"}
                        className="w-6 h-6"
                      />
                      <span className="text-gray-700 font-medium">
                        {review.star_value || 0} • {review.rating_label || "No label"}
                      </span>
                    </div>
                  )}

                  {/* Review Comment (User Notes) */}
                  {review.is_comment_view && review.reviewComment && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-700 mb-1">User Notes:</h4>
                      <p className="text-gray-700">{review.reviewComment}</p>
                    </div>
                  )}
                  
                    {/* Admin Notes */}
                  {review.notes && (
                    <div className="bg-gray-100 p-3 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-700 mb-1">Admin Notes:</h4>
                      <p className="text-gray-700">{review.notes}</p>
                    </div>
                  )}
                </div>

                {/* Right Column: Hashtags, Tell Us, Images, Admin Notes */}
                <div className="flex flex-col lg:w-1/2 gap-4">
                  {/* Hashtags */}
                  {review.is_hashtag_view && review.hashTags?.length > 0 && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-700 mb-2">Hashtags:</h4>
                      <div className="flex flex-wrap gap-2">
                        {review.hashTags.map((tag) => (
                          <span
                            key={tag._id}
                            className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm"
                          >
                            {tag.hashTagTitle}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tell Us Q&A */}
                  {review.tell_us?.length > 0 && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-700 mb-2">Tell Us:</h4>
                      {review.tell_us.map((q, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-gray-700 mb-1"
                        >
                          <span className="font-medium">{q.question}</span>
                          <span
                            className={
                              q.answer
                                ? "text-green-600 font-medium"
                                : "text-red-500 font-medium"
                            }
                          >
                            {q.answer ? "Yes" : "No"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Review Images */}
                  {review.images?.length > 0 && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-700 mb-2">Review Images:</h4>
                      <div className="flex flex-wrap gap-3">
                        {review.images.map((img) => (
                          <img
                            key={img._id}
                            src={`${IMAGE_URL}/${img.image}`}
                            alt="review"
                            className="w-28 h-28 md:w-32 md:h-32 rounded-lg object-cover border border-gray-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          <Pagination
            currentPage={pagination.currentPage}
            totalItems={pagination.totalRecords}
            itemsPerPage={pagination.pageSize}
            onPageChange={fetchReviews}
            totalPages={pagination.totalPages}
            type="backend"
          />
        </div>
      )}
    </div>
  );
}

export default RestaurantReviews;
