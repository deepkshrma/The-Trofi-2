import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaThumbsUp, FaThumbsDown, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { BASE_URL, IMAGE_URL } from "../../../config/Config";
import PageTitle from "../../../components/PageTitle/PageTitle";
import BreadcrumbsNav from "../../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import AdminUpdateReviewStatus from "../../../components/AdminUpdateReviewStatus/AdminUpdateReviewStatus ";
import dummyimg from "../../../assets/images/logo.jpg";
import { STAR_RATINGS } from "../../../config/hashtagconfig";

function DishReview() {
  const { id: ratingId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedStarRating, setEditedStarRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [editedHashtags, setEditedHashtags] = useState([]);
  const [availableHashtags, setAvailableHashtags] = useState([]);
  const [editedComment, setEditedComment] = useState("");
  const [editedAnswers, setEditedAnswers] = useState({});
  const [hashtagsLoading, setHashtagsLoading] = useState(false);

  const [newImages, setNewImages] = useState([]); // For newly uploaded images
  const [removedImageIds, setRemovedImageIds] = useState([]); // Track removed image IDs
  const [editedImages, setEditedImages] = useState([]); // Current images in edit mode


  useEffect(() => {
    if (ratingId) fetchRating();
  }, [ratingId]);

  // Fetch hashtags when star rating changes in edit mode
  useEffect(() => {
    if (isEditMode && editedStarRating > 0) {
      fetchHashtagsForRating(editedStarRating);
    }
  }, [editedStarRating, isEditMode]);

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
        type: api.type || "Dish",
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

  // Fetch hashtags based on star rating
  async function fetchHashtagsForRating(rating) {
    try {
      setHashtagsLoading(true);
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;

      const type = review?.type || "Dish";

      const res = await axios.get(
        `${BASE_URL}/restro/get-hashtags?type=${type}&rating=${rating}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        const allHashtags = res.data.data || {};
        const selectedStarTags = allHashtags[rating] || [];
        setAvailableHashtags(selectedStarTags);
      } else {
        setAvailableHashtags([]);
      }
    } catch (err) {
      console.error("Hashtag fetch error:", err);
      setAvailableHashtags([]);
    } finally {
      setHashtagsLoading(false);
    }
  }

  // ====== UPDATE handleEnterEditMode FUNCTION (around line 147) ======
  function handleEnterEditMode() {
    if (!review) return;

    setIsEditMode(true);
    setEditedStarRating(review.star_value);
    setEditedHashtags(review.hashTags.map(h => h._id));
    setEditedComment(review.comment);
    setEditedImages(review.images); // ✅ ADD THIS
    setNewImages([]); // ✅ ADD THIS
    setRemovedImageIds([]); // ✅ ADD THIS

    // Convert Q&A to editable format
    const answersObj = {};
    review.qa.forEach(q => {
      answersObj[q.question] = q.answer === "Yes" ? "up" : q.answer === "No" ? "down" : null;
    });
    setEditedAnswers(answersObj);
  }


  // ====== UPDATE handleCancelEdit FUNCTION (around line 161) ======
  function handleCancelEdit() {
    setIsEditMode(false);
    setEditedStarRating(0);
    setEditedHashtags([]);
    setEditedComment("");
    setEditedAnswers({});
    setAvailableHashtags([]);
    setNewImages([]); // ✅ ADD THIS
    setRemovedImageIds([]); // ✅ ADD THIS
  }


  // ====== REPLACE handleSaveEdit FUNCTION (around line 171) ======
  async function handleSaveEdit() {
    if (!review) return;

    // Validation
    if (editedStarRating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    if (editedHashtags.length === 0) {
      toast.error("Please select at least one hashtag");
      return;
    }
    if (!editedComment.trim()) {
      toast.error("Please add a comment");
      return;
    }

    try {
      setProcessing(true);
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;

      // ✅ Use FormData for file uploads
      const formData = new FormData();

      // Prepare tell_us array
      const tellUsData = Object.entries(editedAnswers)
        .filter(([_, value]) => value !== null)
        .map(([question, answer]) => ({
          question,
          answer: answer === "up",
        }));

      // Add text fields
      formData.append("star_value", editedStarRating);
      formData.append("rating_label", STAR_RATINGS[editedStarRating - 1]?.label || "");
      formData.append("reviewComment", editedComment.trim());
      formData.append("hashTags", JSON.stringify(editedHashtags));
      formData.append("tell_us", JSON.stringify(tellUsData));

      // ✅ Add removed image IDs
      if (removedImageIds.length > 0) {
        formData.append("imagesToRemove", JSON.stringify(removedImageIds));
      }

      // ✅ Add new image files
      newImages.forEach((img) => {
        if (img instanceof File) {
          formData.append("images", img);
        }
      });

      await axios.patch(
        `${BASE_URL}/admin/edit-rating/${review.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      toast.success("Dish review updated successfully! ✅");
      setIsEditMode(false);
      setNewImages([]);
      setRemovedImageIds([]);
      fetchRating();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update dish review");
    } finally {
      setProcessing(false);
    }
  }

  async function handleSectionToggle(section) {
    if (!review || isEditMode) return;
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
    if (!review || isEditMode) return;
    try {
      setProcessing(true);
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;
      const payload = { imageUpdates: [{ id: imageId, is_view: decision === "accept" }] };

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

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-[#F9832B] border-dashed rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-700 font-bold text-lg">Loading dish review details...</p>
        </div>
      </div>
    );

  if (!review) return <div className="p-4 text-gray-500">No review data found.</div>;

  function handleRemoveExistingImage(imageId) {
    setRemovedImageIds(prev => [...prev, imageId]);
    setEditedImages(prev => prev.filter(img => img._id !== imageId));
  }

  // Handle adding new images
  function handleAddNewImages(e) {
    const files = Array.from(e.target.files);
    setNewImages(prev => [...prev, ...files]);
  }

  // Handle removing newly added images (before upload)
  function handleRemoveNewImage(index) {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  }


  const face = STAR_RATINGS[Math.max(0, Math.min(4, (review.star_value || 3) - 1))];
  const badgeClass = (active) => (active ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600");

  // Get questions based on review type
  const RESTAURANT_QUESTIONS = [
    "Was the staff polite and helpful?",
    "Was the restaurant clean and well maintained?",
    "Did the menu have enough variety?",
  ];

  const DISH_QUESTIONS = [
    "Was the staff polite and helpful?",
    "Was the restaurant clean and well maintained?",
    "Did the menu have enough variety?",
  ];

  const currentQuestions = review.type === "Restaurant" ? RESTAURANT_QUESTIONS : DISH_QUESTIONS;

  return (
    <div className="main main_page w-full p-4 md:p-6 space-y-6 md:space-y-8 min-h-screen  duration-900">
      <BreadcrumbsNav
        customTrail={[
          { label: "Dish Review List", path: "/DishReviewList" },
          { label: "Dish Review Detail", path: `/DishReviewList/${ratingId}` },
        ]}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageTitle title={`Review — ${review.dish.dish_name || "Dish"}`} />
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">
            Submitted: {new Date(review.createdAt).toLocaleString()}
          </div>
          {!isEditMode && (
            <button
              onClick={handleEnterEditMode}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white cursor-pointer rounded-lg hover:bg-orange-600 transition shadow-md"
            >
              <FaEdit /> Edit Review
            </button>
          )}
        </div>
      </div>

      {/* Edit Mode Actions */}
      {isEditMode && (
        <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FaEdit className="text-blue-600" />
            <span className="font-semibold text-blue-700">Edit Mode Active</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCancelEdit}
              disabled={processing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 cursor-pointer rounded-lg hover:bg-gray-300 transition"
            >
              <FaTimes /> Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={processing}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white cursor-pointer rounded-lg hover:bg-green-600 transition shadow-md disabled:opacity-50"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave /> Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ⭐ Rating Section */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-md space-y-4">
        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
          <h3 className="text-lg font-semibold text-gray-800">Rating Details</h3>
          {!isEditMode && (
            <div
              className={`cursor-pointer font-semibold px-3 py-1 rounded-full ${badgeClass(
                review.views.is_rating_view
              )}`}
              onClick={() => handleSectionToggle("rating")}
            >
              {review.views.is_rating_view ? "Active" : "Inactive"}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <img
            src={review.images?.[0]?.src || dummyimg}
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

        {/* Edit Star Rating */}
        {isEditMode && (
          <div className="mt-6 border-t pt-4">
            <label className="block text-gray-700 font-semibold mb-3">
              Update Star Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center justify-center gap-3 md:gap-6 flex-wrap py-4">
              {STAR_RATINGS.map((star) => (
                <div
                  key={star.value}
                  onMouseEnter={() => setHoverRating(star.value)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setEditedStarRating(star.value)}
                  className="flex flex-col items-center gap-2 cursor-pointer transition-all duration-200 hover:scale-110"
                >
                  <div className="relative">
                    <img
                      src={star.img}
                      alt={star.label}
                      className={`w-14 h-14 md:w-20 md:h-20 object-contain transition-all duration-200 ${(hoverRating || editedStarRating) >= star.value
                        ? "opacity-100 scale-110 drop-shadow-lg"
                        : "opacity-40 grayscale"
                        }`}
                    />
                  </div>
                  <span
                    className={`text-xs md:text-sm font-medium text-center transition-colors ${editedStarRating === star.value
                      ? "text-orange-500 font-bold"
                      : "text-gray-500"
                      }`}
                  >
                    {star.label}
                  </span>
                </div>
              ))}
            </div>
            {editedStarRating > 0 && (
              <p className="text-sm text-green-600 mt-2 text-center">
                ✓ Updated rating: {STAR_RATINGS[editedStarRating - 1]?.label} ({editedStarRating} star
                {editedStarRating > 1 ? "s" : ""})
              </p>
            )}
          </div>
        )}
      </div>



      {/* 🏷️ Hashtags Section */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-md space-y-4">
        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
          <h3 className="text-lg font-semibold text-gray-800">Hashtags</h3>
          {!isEditMode && (
            <div
              className={`cursor-pointer font-semibold px-3 py-1 rounded-full ${badgeClass(
                review.views.is_hashtag_view
              )}`}
              onClick={() => handleSectionToggle("hashtag")}
            >
              {review.views.is_hashtag_view ? "Active" : "Inactive"}
            </div>
          )}
        </div>

        {!isEditMode ? (
          <div className="flex flex-wrap gap-2">
            {review.hashTags.map((t) => (
              <span key={t._id} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                {t.hashTagTitle}
              </span>
            ))}
          </div>
        ) : (
          <div>
            {editedStarRating > 0 ? (
              hashtagsLoading ? (
                <div className="text-center py-6">
                  <div className="inline-block w-8 h-8 border-4 border-orange-500 border-dashed rounded-full animate-spin"></div>
                  <p className="text-gray-600 mt-2 text-sm">Loading hashtags...</p>
                </div>
              ) : availableHashtags.length > 0 ? (
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {availableHashtags.map((tag) => {
                    const isSelected = editedHashtags.includes(tag._id);
                    return (
                      <button
                        key={tag._id}
                        onClick={() =>
                          setEditedHashtags((prev) =>
                            isSelected ? prev.filter((id) => id !== tag._id) : [...prev, tag._id]
                          )
                        }
                        className={`px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium shadow-sm transition ${isSelected
                          ? "bg-orange-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                      >
                        {tag.hashTagTitle}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 italic text-sm bg-gray-50 p-4 rounded-lg border border-gray-200">
                  No hashtags available for this rating level
                </p>
              )
            ) : (
              <p className="text-gray-400 italic text-sm">Please select a star rating first</p>
            )}
            {editedHashtags.length > 0 && (
              <p className="text-sm text-green-600 mt-2">
                ✓ {editedHashtags.length} hashtag{editedHashtags.length > 1 ? "s" : ""} selected
              </p>
            )}
          </div>
        )}
      </div>

      {/* 💬 Comment Section */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-md space-y-4">
        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
          <h3 className="text-lg font-semibold text-gray-800">User Comment</h3>
          {!isEditMode && (
            <div
              className={`cursor-pointer font-semibold px-3 py-1 rounded-full ${badgeClass(
                review.views.is_comment_view
              )}`}
              onClick={() => handleSectionToggle("comment")}
            >
              {review.views.is_comment_view ? "Active" : "Inactive"}
            </div>
          )}
        </div>

        {!isEditMode ? (
          <p className="text-gray-700 italic">{review.comment || "No comment available"}</p>
        ) : (
          <div>
            <textarea
              value={editedComment}
              onChange={(e) => setEditedComment(e.target.value)}
              placeholder="Share your experience about this dish..."
              rows={4}
              maxLength={350}
              className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none"
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">Min 10 characters</p>
              <p className="text-sm text-gray-500">{editedComment.length} / 350 characters</p>
            </div>
          </div>
        )}
      </div>

      {/* ❓Q&A Section */}
      {review.qa.length > 0 && (
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <h3 className="text-lg font-semibold text-gray-800">Tell Us Answers</h3>
            {!isEditMode && (
              <div
                className={`cursor-pointer font-semibold px-3 py-1 rounded-full ${badgeClass(
                  review.views.is_tellus_view
                )}`}
                onClick={() => handleSectionToggle("tellus")}
              >
                {review.views.is_tellus_view ? "Active" : "Inactive"}
              </div>
            )}
          </div>

          {!isEditMode ? (
            <div className="grid gap-3">
              {review.qa.map((q, i) => (
                <div key={i} className="p-3 border border-gray-100 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                  <div className="font-medium text-gray-800">Q: {q.question}</div>
                  <div className="text-gray-600 mt-1">A: {q.answer}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {currentQuestions.map((question, idx) => (
                <div
                  key={idx}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <span className="text-gray-700 font-medium text-sm md:text-base">{question}</span>
                  <div className="flex gap-2 self-end md:self-auto">
                    <button
                      onClick={() =>
                        setEditedAnswers((prev) => ({
                          ...prev,
                          [question]: prev[question] === "up" ? null : "up",
                        }))
                      }
                      className={`p-2 md:p-3 rounded-lg transition ${editedAnswers[question] === "up"
                        ? "bg-green-500 text-white shadow-md"
                        : "bg-white text-gray-600 hover:bg-green-100 border border-gray-300"
                        }`}
                    >
                      <FaThumbsUp size={16} />
                    </button>
                    <button
                      onClick={() =>
                        setEditedAnswers((prev) => ({
                          ...prev,
                          [question]: prev[question] === "down" ? null : "down",
                        }))
                      }
                      className={`p-2 md:p-3 rounded-lg transition ${editedAnswers[question] === "down"
                        ? "bg-red-500 text-white shadow-md"
                        : "bg-white text-gray-600 hover:bg-red-100 border border-gray-300"
                        }`}
                    >
                      <FaThumbsDown size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 📸 Images Section - ALWAYS VISIBLE */}
      {review.images.length > 0 && (
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <h3 className="text-lg font-semibold text-gray-800">User Uploaded Images</h3>
            {isEditMode && (
              <label className="px-4 py-2 bg-orange-500 text-white rounded-lg cursor-pointer hover:bg-orange-600 transition shadow-md">
                + Add More Images
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleAddNewImages}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Existing Images - ALWAYS SHOW (with different actions based on mode) */}
          {!isEditMode && review.images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {review.images.map((img) => (
                <div
                  key={img._id}
                  className="bg-gray-50 rounded-lg overflow-hidden shadow-sm border border-gray-100"
                >
                  <img src={img.src} alt={img._id} className="w-full h-48 object-cover" />
                  <div
                    className={`cursor-pointer text-center font-semibold px-3 py-2 transition ${badgeClass(
                      img.status === "approved"
                    )}`}
                    onClick={() =>
                      handleImageDecision(img._id, img.status === "approved" ? "reject" : "accept")
                    }
                  >
                    {img.status === "approved" ? "Active ✓" : "Inactive ✕"}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Edit Mode - Show existing images with remove option */}
          {isEditMode && editedImages.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-3">Current Images</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {editedImages.map((img) => (
                  <div
                    key={img._id}
                    className="relative bg-gray-50 rounded-lg overflow-hidden shadow-sm border border-gray-200 group"
                  >
                    <img src={img.src} alt={img._id} className="w-full h-48 object-cover" />

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveExistingImage(img._id)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-lg opacity-0 group-hover:opacity-100"
                      title="Remove this image"
                    >
                      ✕
                    </button>

                    {/* Current Status Badge */}
                    <div className={`text-center text-xs font-semibold px-2 py-1 ${img.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                      }`}>
                      {img.status === "approved" ? "Currently Active" : "Currently Inactive"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images Preview - Only in Edit Mode */}
          {isEditMode && newImages.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-green-600 mb-3 flex items-center gap-2">
                <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs">NEW</span>
                Images to Upload ({newImages.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {newImages.map((img, index) => (
                  <div
                    key={index}
                    className="relative bg-green-50 rounded-lg overflow-hidden shadow-sm border-2 border-green-300 group"
                  >
                    <img
                      src={URL.createObjectURL(img)}
                      alt={`new-${index}`}
                      className="w-full h-48 object-cover"
                    />

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveNewImage(index)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-lg"
                      title="Remove this new image"
                    >
                      ✕
                    </button>

                    {/* New Badge */}
                    <div className="bg-green-500 text-white text-center text-xs py-2 font-semibold">
                      ✓ Will be uploaded
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Images Message - Only in Edit Mode */}
          {isEditMode && editedImages.length === 0 && newImages.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-400 italic text-sm">No images. Click "Add More Images" to upload.</p>
            </div>
          )}
        </div>
      )}

      {/* 🌟 Final Publish / Reject */}
      {!isEditMode && (
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
      )}

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