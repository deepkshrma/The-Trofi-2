import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config/Config";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import PageTitle from "../../components/PageTitle/PageTitle";

const AppFeedbackSee = () => {
  const { id } = useParams();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const authData = JSON.parse(localStorage.getItem("trofi_user"));
        const token = authData?.token;
        if (!token) {
          toast.error("Please login first");
          navigate("/login");
          return;
        }

        const res = await axios.get(`${BASE_URL}/admin/app-feedbacks/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (res.data.success) {
          setFeedback(res.data.data);
        } else {
          toast.error(res.data.message || "Failed to fetch feedback");
        }
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong while fetching feedback");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [id, navigate]);

  return (
    <div className="main main_page p-6 duration-900">
      <BreadcrumbsNav
        customTrail={[
          { label: "App Feedbacks", path: "/AppFeedback" },
          { label: "Feedback Detail", path: `/AppFeedback/${id}` },
        ]}
      />

      <div className="bg-white rounded-2xl shadow-md p-6">
        <PageTitle title="Feedback Detail" />

        {loading ? (
          <div className="text-center p-6">Loading Feedback…</div>
        ) : feedback ? (
          <div className="space-y-6 mt-5">
            {/* User Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">User</h2>
              <p className="text-gray-600">
                {feedback.userId?.name || "N/A"} ({feedback.userId?.email || "N/A"})
              </p>
            </div>

            {/* Feedback Type */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Feedback Type</h2>
              <p className="text-gray-600">{feedback.feedbackType?.join(", ")}</p>
            </div>

            {/* Message */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Message</h2>
              <p className="text-gray-600">{feedback.message}</p>
            </div>

            {/* Created & Updated */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Created At
                </h2>
                <p className="text-gray-600">
                  {new Date(feedback.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Updated At
                </h2>
                <p className="text-gray-600">
                  {new Date(feedback.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 text-gray-500 italic">
            No Feedback found.
          </div>
        )}
      </div>
    </div>
  );
};

export default AppFeedbackSee;
