import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import headerlogo from "../../../assets/images/headerlogo.jpg";
import { toast } from "react-toastify";
import star1 from "../../../assets/images/untitled_folder_6/star1.png";
import star2 from "../../../assets/images/untitled_folder_6/star2.png";
import star3 from "../../../assets/images/untitled_folder_6/star3.png";
import star4 from "../../../assets/images/untitled_folder_6/star4.png";
import star5 from "../../../assets/images/untitled_folder_6/star5.png";
import PageTitle from "../../../components/PageTitle/PageTitle";
import BreadcrumbsNav from "../../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import { BASE_URL, IMAGE_URL } from "../../../config/Config";

function RestaurantReview() {
  const { id: ratingId } = useParams();
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState(null);

  const faceStars = [
    { img: star1, label: "Very Bad" },
    { img: star2, label: "Bad" },
    { img: star3, label: "Okay" },
    { img: star4, label: "Good" },
    { img: star5, label: "Excellent" },
  ];

  useEffect(() => {
    if (ratingId) fetchRating();
  }, [ratingId]);

  const fetchRating = async () => {
    setLoading(true);
    try {
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;
      if (!token) {
        toast.error("Please login first");
        return;
      }
      const res = await axios.get(`${BASE_URL}/admin/get-ratings/${ratingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const api = res?.data?.data;

      const images = (api.images || []).map((it) => ({
        _id: it._id,
        src: it.image?.startsWith("http") ? it.image : `${IMAGE_URL}/${it.image}`,
        status: api.status || "pending",
      }));

      const mappedQA = (api.tell_us || []).map((t) => ({
        question: t.question || "",
        answer: typeof t.answer === "boolean" ? (t.answer ? "Yes" : "No") : String(t.answer || ""),
      }));

      setReview({
        id: api._id,
        restaurantImage:
          api.typeId?.image
            ? `${IMAGE_URL.replace(/\/$/, "")}/${api.typeId.image}`
            : headerlogo,

        restroName: api.typeId?.restro_name || "",
        rating_label: api.rating_label,
        star_value: api.star_value,
        comment: api.reviewComment,
        qa: mappedQA,
        images,
        status: api.status || "pending",
        hashTags: api.hashTags || [],
        is_hashtag_view: api.is_hashtag_view,
        is_rating_view: api.is_rating_view,
        is_comment_view: api.is_comment_view,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch rating details");
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (section, decision, id = null, reason = "") => {
    try {
      const url = id
        ? `${BASE_URL}/admin/rating-images/${id}/action`
        : `${BASE_URL}/admin/update-ratings/${review.id}/action`;

      await axios.post(url, { section, decision, reason });
      toast.success(`${section} ${decision}d`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update decision");
    }
  };

  if (!ratingId) {
    return (
      <div className="p-4">
        No rating id provided. Open this page from the ratings list.
      </div>
    );
  }

  if (loading || !review) {
    return <div className="p-4 text-gray-500">Loading...</div>;
  }

  return (
    <div className="main main_page p-4 md:p-6 space-y-6 md:space-y-8">
      {/* Breadcrumb */}
      <BreadcrumbsNav
        customTrail={[
          { label: "Restaurant Review List", path: "/RestaurantReviewList" },
          { label: "Review in Detail", path: `/RestaurantReviewList/${ratingId}` },
        ]}
      />

      {/* Header */}
      <div className="flex justify-between items-center">
        <PageTitle title={"Restaurant Review Details"} />
      </div>

      {/* Restaurant Info */}
      {review.is_rating_view && (
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg flex flex-col md:flex-row gap-4 md:gap-6">
          <img
            src={review.restaurantImage}
            alt={review.restroName}
            className="w-full md:w-40 h-40 object-cover rounded-lg"
          />
          <div className="flex flex-col justify-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">{review.restroName}</h2>
            <p className="text-gray-600 mb-1">{faceStars[review.star_value - 1]?.label}</p>
            <img
              src={faceStars[review.star_value - 1]?.img || star3}
              alt={faceStars[review.star_value - 1]?.label}
              className="w-10 h-10 md:w-12 md:h-12"
            />

            {/* Approve / Reject buttons */}
            <div className="flex gap-3 mt-2">
              <button
                disabled
                className="px-4 py-2 bg-green-500 text-white rounded-md opacity-50 cursor-not-allowed"
              >
                Approve
              </button>
              <button
                disabled
                className="px-4 py-2 bg-red-500 text-white rounded-md opacity-50 cursor-not-allowed"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Comment */}
      {review.is_comment_view && (
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-3">Review Comment</h3>
          <p className="text-gray-700 italic">{review.comment}</p>
          <div className="flex gap-3 mt-3">
            <button
              disabled
              className="px-4 py-2 bg-green-500 text-white rounded-md opacity-50 cursor-not-allowed"
            >
              Approve
            </button>
            <button
              disabled
              className="px-4 py-2 bg-red-500 text-white rounded-md opacity-50 cursor-not-allowed"
            >
              Reject
            </button>
          </div>
        </div>
      )}

      {/* HashTags */}
      {review.is_hashtag_view && review.hashTags?.length > 0 && (
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-3">HashTags</h3>
          <div className="flex flex-wrap gap-2">
            {review.hashTags.map((tag) => (
              <span
                key={tag._id}
                className="px-2 py-1 text-sm bg-gray-200 rounded-full"
              >
                {tag.hashTagTitle}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Q&A Section */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-3">Q&A</h3>
        <div className="space-y-4">
          {review.qa.map((item, idx) => (
            <div
              key={idx}
              className="p-3 border border-gray-200 rounded-lg shadow-sm"
            >
              <p className="font-medium text-gray-800">Q: {item.question}</p>
              <p className="text-gray-600">A: {item.answer}</p>
              <div className="flex gap-3 mt-2">
                <button
                  disabled
                  className="px-4 py-1 bg-green-500 text-white rounded-md opacity-50 cursor-not-allowed text-sm"
                >
                  Approve
                </button>
                <button
                  disabled
                  className="px-4 py-1 bg-red-500 text-white rounded-md opacity-50 cursor-not-allowed text-sm"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review Images */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Review Images</h3>
        <div className="flex flex-col gap-6">
          {review.images.map((img, idx) => (
            <div
              key={idx}
              className="flex flex-col md:flex-row items-start gap-4 md:gap-6 p-4 border border-gray-200 rounded-lg shadow-sm"
            >
              <img
                src={img.src}
                alt={`review-${idx}`}
                className="w-full md:w-60 h-48 object-cover rounded-lg shadow-md"
              />
              <div className="flex flex-col gap-3 flex-1 w-full">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Status:</span>
                  <span className="text-sm px-2 py-1 rounded-md border">{img.status}</span>
                </div>

                <div className="flex gap-3">
                  <button
                    disabled
                    className="px-4 py-2 bg-green-500 text-white rounded-md opacity-50 cursor-not-allowed"
                  >
                    Approve
                  </button>
                  <button
                    disabled
                    className="px-4 py-2 bg-red-500 text-white rounded-md opacity-50 cursor-not-allowed"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RestaurantReview;
