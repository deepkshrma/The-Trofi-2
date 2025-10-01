import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config/Config";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import PageTitle from "../../components/PageTitle/PageTitle";

const FAQInDetail = () => {
  const { id } = useParams(); // URL से FAQ ID ले लो
  const [faq, setFaq] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch FAQ detail
  useEffect(() => {
    const fetchFAQ = async () => {
      try {
        setLoading(true);
        const authData = JSON.parse(localStorage.getItem("trofi_user"));
        const token = authData?.token;
        if (!token) {
          toast.error("Please login first");
          navigate("/login");
          return;
        }

        const res = await axios.get(`${BASE_URL}/admin/faq/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (res.data.success) {
          setFaq(res.data.data);
        } else {
          toast.error(res.data.message || "Failed to fetch FAQ");
        }
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong while fetching FAQ");
      } finally {
        setLoading(false);
      }
    };

    fetchFAQ();
  }, [id, navigate]);

  return (
    <div className="main main_page p-6 duration-900">
      <BreadcrumbsNav
        customTrail={[
          { label: "FAQs List", path: "/FAQList" },
          { label: "FAQ Detail", path: `/FAQInDetail/${id}` },
        ]}
      />

      <div className="bg-white rounded-2xl shadow-md p-6">
        <PageTitle title="FAQ Detail" />

        {loading ? (
          <div className="text-center p-6">Loading FAQ…</div>
        ) : faq ? (
          <div className="space-y-6 mt-5">
            {/* Title */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Title</h2>
              <p className="text-gray-600">{faq.title}</p>
            </div>

            {/* Description (render HTML) */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Description
              </h2>
              <div
                className="text-gray-600 prose max-w-none"
                dangerouslySetInnerHTML={{ __html: faq.description }}
              />
            </div>

            {/* Status */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Status</h2>
              <span
                className={`px-4 py-1 rounded-full font-medium ${
                  faq.status === "active"
                    ? "bg-green-100 text-green-600"
                    : faq.status === "inactive"
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {faq.status}
              </span>
            </div>

            {/* Deleted Info */}
            {faq.isDeleted && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Deleted Info
                </h2>
                <p className="text-red-500 font-medium">This FAQ is deleted.</p>
                {faq.deletedAt && (
                  <p className="text-gray-500 text-sm">
                    Deleted At: {new Date(faq.deletedAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {/* Created & Updated */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Created At
                </h2>
                <p className="text-gray-600">
                  {new Date(faq.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Updated At
                </h2>
                <p className="text-gray-600">
                  {new Date(faq.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 text-gray-500 italic">
            No FAQ found.
          </div>
        )}
      </div>
    </div>
  );
};

export default FAQInDetail;
