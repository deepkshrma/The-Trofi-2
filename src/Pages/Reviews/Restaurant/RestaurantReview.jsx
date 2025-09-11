// src/pages/Reviews/ReviewDetail.jsx
import React from "react";
import star1 from "../../../assets/images/untitled_folder_6/star1.png";
import star2 from "../../../assets/images/untitled_folder_6/star2.png";
import star3 from "../../../assets/images/untitled_folder_6/star3.png";
import star4 from "../../../assets/images/untitled_folder_6/star4.png";
import star5 from "../../../assets/images/untitled_folder_6/star5.png";

function RestaurantReview() {
  const review = {
    restaurantImage:
      "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=600",
    restroName: "Taj Palace",
    rating_label: "Excellent experience!",
    star_value: 5,
    comment:
      "The food was delicious, ambiance was wonderful, and service was top-notch. Definitely visiting again!",
    qa: [
      { question: "Was the food served hot?", answer: "Yes, perfectly hot." },
      { question: "Would you recommend us to others?", answer: "Absolutely!" },
    ],
    images: [
      "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=400",
      "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=400",
      "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=400",
      "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=400",
    ],
  };

  const faceStars = [
    { img: star1, label: "Very Bad" },
    { img: star2, label: "Bad" },
    { img: star3, label: "Okay" },
    { img: star4, label: "Good" },
    { img: star5, label: "Excellent" },
  ];

  return (
    <div className="main main_page p-4 md:p-6 space-y-6 md:space-y-8 duration-900">
      {/*  Restaurant Info */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg flex flex-col md:flex-row gap-4 md:gap-6">
        <img
          src={review.restaurantImage}
          alt={review.restroName}
          className="w-full md:w-40 h-40 object-cover rounded-lg"
        />
        <div className="flex flex-col justify-center">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            {review.restroName}
          </h2>
          <p className="text-gray-600 mb-2">
            {faceStars[review.star_value - 1].label}
          </p>
          <div className="flex gap-2">
            <img
              src={faceStars[review.star_value - 1].img}
              alt={faceStars[review.star_value - 1].label}
              className={`w-10 h-10 md:w-12 md:h-12 `}
            />

            {}
          </div>
        </div>
      </div>

      {/*  Review Comment */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-3">Review Comment</h3>
        <p className="text-gray-700 italic">{review.comment}</p>
      </div>

      {/*  Q&A Section */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-3">Q&A</h3>
        <div className="space-y-3">
          {review.qa.map((item, idx) => (
            <div key={idx} className="border-b border-gray-300 pb-2">
              <p className="font-medium text-gray-800">Q: {item.question}</p>
              <p className="text-gray-600">A: {item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/*  Review Images */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Review Images</h3>
        <div className="flex flex-col gap-6">
          {review.images.map((img, idx) => (
            <div
              key={idx}
              className="flex flex-col md:flex-row items-start gap-4 md:gap-6 p-4 border border-gray-200 rounded-lg shadow-sm"
            >
              {/* Left side - Image */}
              <img
                src={img}
                alt={`review-${idx}`}
                className="w-full md:w-60 h-48 object-cover rounded-lg shadow-md"
              />

              {/* Right side - Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const action = formData.get("action");
                  const reason = formData.get("reason");
                  console.log(
                    "Image:",
                    img,
                    "Action:",
                    action,
                    "Reason:",
                    reason
                  );
                }}
                className="flex flex-col gap-3 flex-1 w-full"
              >
                {/* Approve / Reject */}
                <div className="flex gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`action-${idx}`}
                      value="approve"
                      required
                    />
                    Approve
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`action-${idx}`}
                      value="reject"
                      required
                    />
                    Reject
                  </label>
                </div>

                {/* Reason */}
                <textarea
                  name={`reason-${idx}`}
                  placeholder="Reason for this action..."
                  className="border border-gray-300 rounded-md p-2 h-20 w-full focus:outline-none focus:ring-2 focus:ring-orange-400"
                />

                {/* Submit */}
                <button
                  type="submit"
                  className="self-start px-4 py-2 bg-orange-400 text-white rounded-md shadow hover:bg-orange-500 cursor-pointer"
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
