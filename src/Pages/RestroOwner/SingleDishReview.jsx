// @ts-nocheck
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { LayoutContext } from "../../Layout/Layout";
import { BASE_URL, IMAGE_URL } from "../../config/Config";
import { Star } from "lucide-react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import guestImg from "../../assets/images/guest.png";

function SingleDishReview() {
  const { isToggle } = useContext(LayoutContext);
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [dishName, setDishName] = useState("");

  const token = JSON.parse(localStorage.getItem("trofi_user"))?.token;

  useEffect(() => {
    const fetchDishReviews = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${BASE_URL}/restrowner/restrowner-dish-reviews?typeId=${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const ratings = res.data?.data?.ratings || [];
        setReviews(ratings);

        if (ratings.length > 0) {
          setDishName(ratings[0]?.typeId?.dish_name || "Unknown Dish");
        }
      } catch (err) {
        console.error("Error fetching dish reviews:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDishReviews();
  }, [id]);

  const getImageUrl = (src) => {
    if (!src) return guestImg;
    if (src.startsWith("http")) return src;
    return `${IMAGE_URL}/${src}`;
  };

  if (loading) {
    return (
      <div
        className={`w-[100%] pt-[2rem] ${
          isToggle ? "pl-[19.3rem]" : ""
        } text-gray-600 text-center min-h-screen flex items-center justify-center`}
      >
        <div className="text-lg font-semibold animate-pulse">
          Loading reviews...
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-[100%] pt-[1.5rem] pb-[2rem] ${
        isToggle ? "pl-[19.3rem]" : ""
      } duration-900 min-h-screen bg-gray-50`}
    >
      {/* Header */}
      <div className="bg-white p-6 shadow-md rounded-xl mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Reviews for: <span className="text-[#F9832B]">{dishName}</span>
        </h1>
        <p className="text-gray-500 mt-1">
          All reviews for this particular dish.
        </p>
      </div>

      {/* No Reviews */}
      {(!reviews || reviews.length === 0) && (
        <div className="flex flex-col items-center justify-center mt-20 text-gray-500">
          <img
            src={guestImg}
            alt="No reviews"
            className="w-28 h-28 mb-4 opacity-60"
          />
          <p className="text-lg font-medium">No reviews available</p>
        </div>
      )}

      {/* Reviews Grid */}
      {reviews && reviews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-4">
          {reviews.map((review, i) => (
            <div
              key={review._id || i}
              className="bg-white shadow-md rounded-xl p-5 hover:shadow-lg transition"
            >
              {/* Reviewer Info */}
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={guestImg}
                  alt="Anonymous"
                  className="w-10 h-10 rounded-full border border-gray-200"
                />
                <div>
                  <h3 className="font-semibold text-gray-800">Anonymous</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center mb-3">
                {[...Array(5)].map((_, idx) => (
                  <Star
                    key={idx}
                    className={`w-5 h-5 ${
                      idx < review.star_value
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {review.rating_label || ""}
                </span>
              </div>

              {/* Comment */}
              {review.reviewComment && (
                <p className="text-gray-700 italic mb-3">
                  “{review.reviewComment}”
                </p>
              )}

              {/* Hashtags */}
              {Array.isArray(review.hashTags) && review.hashTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {review.hashTags.map((tag) => (
                    <span
                      key={tag._id}
                      className="px-3 py-1 bg-[#F9832B]/10 text-[#F9832B] rounded-full text-xs font-medium"
                    >
                      {tag.hashTagTitle}
                    </span>
                  ))}
                </div>
              )}

              {/* Tell Us Answers */}
              {Array.isArray(review.tell_us) && review.tell_us.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 mt-3">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Additional Feedback:
                  </p>
                  <ul className="space-y-1">
                    {review.tell_us.map((t, j) => (
                      <li key={j} className="text-sm text-gray-600">
                        <span className="font-medium">{t.question}</span> —{" "}
                        <span
                          className={`${
                            t.answer ? "text-green-600" : "text-red-500"
                          } font-semibold`}
                        >
                          {t.answer ? "Yes" : "No"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Review Images */}
              {Array.isArray(review.images) && review.images.length > 0 && (
                <div className="mt-4">
                  <Carousel
                    showThumbs={false}
                    showStatus={false}
                    infiniteLoop
                    autoPlay={false}
                    dynamicHeight={false}
                    className="rounded-xl"
                  >
                    {review.images.map((img, k) => (
                      <div key={k} className="rounded-lg overflow-hidden">
                        <img
                          src={getImageUrl(img.image)}
                          alt={`Review ${k}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </Carousel>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SingleDishReview;
