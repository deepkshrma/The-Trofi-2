// @ts-nocheck
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL, IMAGE_URL } from "../../../config/Config";
import PageTitle from "../../../components/PageTitle/PageTitle";
import BreadcrumbsNav from "../../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import star1 from "../../../assets/images/untitled_folder_6/star1.png";
import star2 from "../../../assets/images/untitled_folder_6/star2.png";
import star3 from "../../../assets/images/untitled_folder_6/star3.png";
import star4 from "../../../assets/images/untitled_folder_6/star4.png";
import star5 from "../../../assets/images/untitled_folder_6/star5.png";
import AdminUpdateReviewStatus from "../../../components/AdminUpdateReviewStatus/AdminUpdateReviewStatus ";
import dummyimg from "../../../assets/images/logo.jpg";

function DishReview() {
  const { id: ratingId } = useParams();
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

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

  async function fetchRating() {
    setLoading(true);
    try {
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;
      if (!token) {
        toast.error("Please login first");
        setLoading(false);
        return;
      }

      const res = await axios.get(`${BASE_URL}/admin/get-ratings/${ratingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const api = res?.data?.data;
      if (!api) throw new Error("Invalid API response");

      const images = (api.images || []).map((it) => ({
        _id: it._id,
        src: it.image?.startsWith("http") ? it.image : `${IMAGE_URL}/${it.image}`,
        status: it.is_view ? "approved" : "pending",
      }));

      const mappedQA = (api.tell_us || []).map((t) => ({
        question: t.question || "",
        answer: typeof t.answer === "boolean" ? (t.answer ? "Yes" : "No") : String(t.answer || ""),
      }));

      setReview({
        id: api._id,
        user: api.userId || {},
        dish: api.typeId || {},
        rating_label: api.rating_label,
        star_value: api.star_value,
        comment: api.reviewComment,
        qa: mappedQA,
        images,
        status: api.status || "pending",
        hashTags: api.hashTags || [],
        views: {
          is_hashtag_view: !!api.is_hashtag_view,
          is_rating_view: !!api.is_rating_view,
          is_comment_view: !!api.is_comment_view,
          is_tellus_view: !!api.is_tellus_view,
        },
        notes: api.notes || "",
        createdAt: api.createdAt,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch rating details");
    } finally {
      setLoading(false);
    }
  }

  async function handleSectionToggle(section) {
    if (!review) return;
    try {
      setProcessing(true);
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;
      if (!token) {
        toast.error("Please login first");
        setProcessing(false);
        return;
      }

      const currentValue = review.views[`is_${section}_view`] || false;
      const payload = { [`is_${section}_view`]: !currentValue };

      await axios.patch(`${BASE_URL}/admin/update-rating-status/${review.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReview((prev) => ({
        ...prev,
        views: { ...prev.views, [`is_${section}_view`]: !currentValue },
      }));
    } catch (err) {
      console.error(err);
      toast.error(`Failed to toggle ${section}`);
    } finally {
      setProcessing(false);
    }
  }

  async function handleImageDecision(imageId, decision) {
    if (!review) return;
    try {
      setProcessing(true);
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;
      const payload = { images: [{ _id: imageId, is_view: decision === "accept" }] };

      await axios.patch(`${BASE_URL}/admin/update-rating-status/${review.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReview((prev) => ({
        ...prev,
        images: prev.images.map((img) =>
          img._id === imageId ? { ...img, status: decision === "accept" ? "approved" : "pending" } : img
        ),
      }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to update image status");
    } finally {
      setProcessing(false);
    }
  }

  async function handlePublishDecision(decision) {
    if (!review) return;
    const notes = review.notes?.trim() || "";
    try {
      setProcessing(true);
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;

      const payload = {
        status: decision === "accept" ? "published" : "rejected",
        notes,
      };

      await axios.patch(`${BASE_URL}/admin/update-rating-status/${review.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReview((prev) => ({
        ...prev,
        status: payload.status,
        notes,
      }));

      toast.success(`Review ${decision}ed successfully`);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to ${decision} review`);
    } finally {
      setProcessing(false);
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-start min-h-screen">
        <div className="flex flex-col items-center justify-center ml-64 w-full">
          <div className="w-16 h-16 border-4 border-[#F9832B] border-dashed rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-700 font-bold text-lg">Loading review details...</p>
        </div>
      </div>
    );

  if (!review) return <div className="p-4 text-gray-500">No review data found.</div>;


  const face = faceStars[Math.max(0, Math.min(4, (review.star_value || 3) - 1))];
  const badgeClass = (active) => (active ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600");

  return (
    <div className="main main_page w-full p-4 md:p-6 space-y-6 md:space-y-8 min-h-screen">
      <BreadcrumbsNav
        customTrail={[
          { label: "Dish Review List", path: "/DishReviewList" },
          { label: "Dish Review Detail", path: `/DishReviewList/${ratingId}` },
        ]}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageTitle title={`Review — ${review.dish.dish_name || "Dish"}`} />
        <div className="text-sm text-gray-500">Submitted: {new Date(review.createdAt).toLocaleString()}</div>
      </div>

      {/* ⭐ Rating Section */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-md space-y-4">
        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
          <h3 className="text-lg font-semibold text-gray-800">Rating Details</h3>
          <div
            className={`cursor-pointer font-semibold px-3 py-1 rounded-full ${badgeClass(
              review.views.is_rating_view
            )}`}
            onClick={() => handleSectionToggle("rating")}
          >
            {review.views.is_rating_view ? "Accepted" : "Rejected"}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <img
            src={
              review.images?.[0]?.src || dummyimg
            }
            alt="dish"
            className="w-24 h-24 rounded-lg object-cover"
          />
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {review.dish.dish_name || "Dish"}
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <img src={face.img} alt={face.label} className="w-10 h-10" />
              <div>
                <div className="text-gray-600">{face.label}</div>
                <div className="text-sm text-gray-500">
                  {review.rating_label} — {review.star_value} / 5
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 💬 Comment Section */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-md space-y-4">
        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
          <h3 className="text-lg font-semibold text-gray-800">User Comment</h3>
          <div
            className={`cursor-pointer font-semibold px-3 py-1 rounded-full ${badgeClass(
              review.views.is_comment_view
            )}`}
            onClick={() => handleSectionToggle("comment")}
          >
            {review.views.is_comment_view ? "Accepted" : "Rejected"}
          </div>
        </div>
        <p className="text-gray-700 italic">{review.comment || "No comment available"}</p>
      </div>

      {/* 🏷️ Hashtags Section */}
      {review.hashTags.length > 0 && (
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <h3 className="text-lg font-semibold text-gray-800">Hashtags</h3>
            <div
              className={`cursor-pointer font-semibold px-3 py-1 rounded-full ${badgeClass(
                review.views.is_hashtag_view
              )}`}
              onClick={() => handleSectionToggle("hashtag")}
            >
              {review.views.is_hashtag_view ? "Accepted" : "Rejected"}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {review.hashTags.map((t) => (
              <span key={t._id} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                {t.hashTagTitle}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ❓Q&A Section */}
      {review.qa.length > 0 && (
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <h3 className="text-lg font-semibold text-gray-800">Tell Us Answers</h3>
            <div
              className={`cursor-pointer font-semibold px-3 py-1 rounded-full ${badgeClass(
                review.views.is_tellus_view
              )}`}
              onClick={() => handleSectionToggle("tellus")}
            >
              {review.views.is_tellus_view ? "Accepted" : "Rejected"}
            </div>
          </div>

          <div className="grid gap-3">
            {review.qa.map((q, i) => (
              <div key={i} className="p-3 border border-gray-100 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                <div className="font-medium text-gray-800">Q: {q.question}</div>
                <div className="text-gray-600 mt-1">A: {q.answer}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 📸 Images Section */}
      {review.images.length > 0 && (
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <h3 className="text-lg font-semibold text-gray-800">User Uploaded Images</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {review.images.map((img) => (
              <div key={img._id} className="bg-gray-50 rounded-lg overflow-hidden shadow-sm border border-gray-100">
                <img src={img.src} alt={img._id} className="w-full h-48 object-cover" />
                <div
                  className={`cursor-pointer text-center font-semibold px-3 py-1 ${badgeClass(
                    img.status === "approved"
                  )}`}
                  onClick={() =>
                    handleImageDecision(img._id, img.status === "approved" ? "reject" : "accept")
                  }
                >
                  {img.status === "approved" ? "Accepted" : "Rejected"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🌟 Final Publish / Reject */}
      <div className="bg-gradient-to-b from-white to-gray-50 p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
        <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
          Final Review Decision
        </h3>
        <p className="text-sm text-gray-600 mb-1">
          Current Status:{" "}
          <span
            className={`font-semibold capitalize ${review.status === "published"
                ? "text-green-600"
                : review.status === "rejected"
                  ? "text-red-600"
                  : "text-gray-700"
              }`}
          >
            {review.status}
          </span>
        </p>
        {review.notes && (
          <div className="text-gray-700 mt-2 max-w-2xl mx-auto">
            <strong>Admin Notes:</strong> {review.notes}
          </div>
        )}
        <p className="text-xs text-gray-400 mt-3">
          Add or update admin notes before making your final decision.
        </p>
        <div className="border-t border-gray-200 my-5 w-3/4 mx-auto"></div>
        <div className="flex justify-center">
          <button
            onClick={() => setShowStatusModal(true)}
            className="group relative px-8 py-3 text-white bg-[#F9832B] rounded-full font-semibold text-lg shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
          >
            <span className="relative z-10">Change Review Status</span>
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#F9832B] to-[#e86b00] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </button>
        </div>
      </div>

      {showStatusModal && (
        <AdminUpdateReviewStatus
          reviewId={review.id}
          currentStatus={review.status}
          notes={review.notes}
          onClose={() => setShowStatusModal(false)}
          onSuccess={() => {
            fetchRating();
            setShowStatusModal(false);
          }}
        />
      )}
    </div>
  );
}

export default DishReview;
