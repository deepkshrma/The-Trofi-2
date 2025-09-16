import React, { useState } from "react";
import star1 from "../../../assets/images/untitled_folder_6/star1.png";
import star2 from "../../../assets/images/untitled_folder_6/star2.png";
import star3 from "../../../assets/images/untitled_folder_6/star3.png";
import star4 from "../../../assets/images/untitled_folder_6/star4.png";
import star5 from "../../../assets/images/untitled_folder_6/star5.png";
import PageTitle from "../../../components/PageTitle/PageTitle";
import DynamicBreadcrumbs from "../../../components/common/BreadcrumbsNav/DynamicBreadcrumbs";

function RestaurantReview() {
  const [editMode, setEditMode] = useState(false);

  const [review, setReview] = useState({
    restaurantImage:
      "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=600",
    restroName: "Taj Palace",
    rating_label: "Excellent experience!",
    star_value: 3,
    comment:
      "The food was delicious, ambiance was wonderful, and service was top-notch. Definitely visiting again!",
    qa: [
      { question: "Was the food served hot?", answer: "Yes, perfectly hot." },
      { question: "Would you recommend us to others?", answer: "Absolutely!" },
    ],
    images: [
      "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=400",
      "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=400",
    ],
  });

  const faceStars = [
    { img: star1, label: "Very Bad" },
    { img: star2, label: "Bad" },
    { img: star3, label: "Okay" },
    { img: star4, label: "Good" },
    { img: star5, label: "Excellent" },
  ];

  // Handle input changes
  const handleChange = (field, value) => {
    setReview((prev) => ({ ...prev, [field]: value }));
  };

  // Handle Q&A changes
  const handleQAChange = (idx, key, value) => {
    const newQA = [...review.qa];
    newQA[idx][key] = value;
    setReview((prev) => ({ ...prev, qa: newQA }));
  };

  return (
    <div className="main main_page p-4 md:p-6 space-y-6 md:space-y-8 duration-900">
      <DynamicBreadcrumbs />
      {/* Header with Edit/Save button */}
      <div className="flex justify-between items-center">
        <PageTitle title={"Review Details"} />
        <button
          onClick={() => setEditMode(!editMode)}
          className="px-4 py-2 bg-orange-500 text-white rounded shadow hover:bg-orange-600 transition cursor-pointer"
        >
          {editMode ? "Save" : "Edit"}
        </button>
      </div>

      {/* Restaurant Info */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg flex flex-col md:flex-row gap-4 md:gap-6">
        <img
          src={review.restaurantImage}
          alt={review.restroName}
          className="w-full md:w-40 h-40 object-cover rounded-lg"
        />
        <div className="flex flex-col justify-center gap-3">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            {review.restroName}
          </h2>

          <p className="text-gray-600 mb-1">
            {faceStars[review.star_value - 1].label}
          </p>

          {/* Editable Stars */}
          {editMode ? (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Rating
              </label>
              <select
                value={review.star_value}
                onChange={(e) =>
                  handleChange("star_value", Number(e.target.value))
                }
                className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2 focus:border-orange-400 focus:ring-2 focus:ring-orange-400 focus:outline-none"
              >
                {faceStars.map((s, i) => (
                  <option key={i} value={i + 1}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <img
              src={faceStars[review.star_value - 1].img}
              alt={faceStars[review.star_value - 1].label}
              className="w-10 h-10 md:w-12 md:h-12"
            />
          )}
        </div>
      </div>

      {/* Review Comment */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-3">Review Comment</h3>
        {editMode ? (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Comment</label>
            <textarea
              value={review.comment}
              onChange={(e) => handleChange("comment", e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2 focus:border-orange-400 focus:ring-2 focus:ring-orange-400 focus:outline-none"
            />
          </div>
        ) : (
          <p className="text-gray-700 italic">{review.comment}</p>
        )}
      </div>

      {/* Q&A Section */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-3">Q&A</h3>
        <div className="space-y-3">
          {review.qa.map((item, idx) => (
            <div key={idx} className="border-b border-gray-300 pb-2">
              {editMode ? (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                      Q: {idx + 1}
                    </label>
                    <input
                      type="text"
                      value={item.question}
                      onChange={(e) =>
                        handleQAChange(idx, "question", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2 focus:border-orange-400 focus:ring-2 focus:ring-orange-400 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                      A: {idx + 1}
                    </label>
                    <input
                      type="text"
                      value={item.answer}
                      onChange={(e) =>
                        handleQAChange(idx, "answer", e.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2 focus:border-orange-400 focus:ring-2 focus:ring-orange-400 focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <p className="font-medium text-gray-800">
                    Q: {item.question}
                  </p>
                  <p className="text-gray-600">A: {item.answer}</p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Review Images (Approve/Reject stays same) */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Review Images</h3>
        <div className="flex flex-col gap-6">
          {review.images.map((img, idx) => (
            <div
              key={idx}
              className="flex flex-col md:flex-row items-start gap-4 md:gap-6 p-4 border border-gray-200 rounded-lg shadow-sm"
            >
              <img
                src={img}
                alt={`review-${idx}`}
                className="w-full md:w-60 h-48 object-cover rounded-lg shadow-md"
              />
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  console.log("Image Action:", formData.get("action"));
                  console.log("Reason:", formData.get("reason"));
                }}
                className="flex flex-col gap-3 flex-1 w-full"
              >
                <div className="flex gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`action-${idx}`}
                      value="approve"
                    />
                    Approve
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name={`action-${idx}`} value="reject" />
                    Reject
                  </label>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">
                    Reason
                  </label>
                  <textarea
                    name="reason"
                    placeholder="Reason for this action..."
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2 h-20 focus:border-orange-400 focus:ring-2 focus:ring-orange-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-400 text-white rounded-md hover:bg-orange-500 transition cursor-pointer"
                >
                  Done
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RestaurantReview;
