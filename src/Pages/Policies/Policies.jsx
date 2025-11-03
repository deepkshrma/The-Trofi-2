import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config/Config";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import PageTitle from "../../components/PageTitle/PageTitle";

const Policies = () => {
  const { id } = useParams(); 
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        setLoading(true);
        const authData = JSON.parse(localStorage.getItem("trofi_user"));
        const token = authData?.token;
        if (!token) {
          toast.error("Please login first");
          navigate("/login");
          return;
        }

        const res = await axios.get(`${BASE_URL}/admin/policy/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (res.data.success) {
          setPolicy(res.data.data);
        } else {
          toast.error(res.data.message || "Failed to fetch Policy");
        }
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong while fetching Policy");
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, [id, navigate]);

  return (
    <div className="main main_page p-6 duration-900">
      <BreadcrumbsNav
        customTrail={[
          { label: "Policies List", path: "/PoliciesList" },
          { label: "Policy Detail", path: `/Policies/${id}` },
        ]}
      />

      <div className="bg-white rounded-2xl shadow-md p-6">
        <PageTitle title="Policy Detail" />

        {loading ? (
          <div className="text-center p-6">Loading Policy…</div>
        ) : policy ? (
          <div className="space-y-6 mt-5">
            {/* Policy Type */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Policy Type
              </h2>
              <span className="px-4 py-1 rounded-full font-medium bg-blue-100 text-blue-600">
                {policy.policyType}
              </span>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Title</h2>
              <p className="text-gray-600">{policy.title}</p>
            </div>

            {/* Description (HTML Render - prose for proper formatting) */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Description
              </h2>
              <div
                className="text-gray-600 prose max-w-none"
                dangerouslySetInnerHTML={{ __html: policy.description }}
              />
            </div>

            {/* Created & Updated */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Created At
                </h2>
                <p className="text-gray-600">
                  {new Date(policy.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Updated At
                </h2>
                <p className="text-gray-600">
                  {new Date(policy.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 text-gray-500 italic">
            No Policy found.
          </div>
        )}
      </div>
    </div>
  );
};

export default Policies;
