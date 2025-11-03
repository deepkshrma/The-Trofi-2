import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config/Config";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import PageTitle from "../../components/PageTitle/PageTitle";

const QueryFAQSee = () => {
  const { id } = useParams(); // URL से Query ID
  const [query, setQuery] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch FAQ Query detail
  useEffect(() => {
    const fetchQuery = async () => {
      try {
        setLoading(true);
        const authData = JSON.parse(localStorage.getItem("trofi_user"));
        const token = authData?.token;
        if (!token) {
          toast.error("Please login first");
          navigate("/login");
          return;
        }

        const res = await axios.get(`${BASE_URL}/admin/faq-query/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (res.data.success) {
          setQuery(res.data.data);
        } else {
          toast.error(res.data.message || "Failed to fetch query");
        }
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong while fetching query");
      } finally {
        setLoading(false);
      }
    };

    fetchQuery();
  }, [id, navigate]);

  return (
    <div className="main main_page p-6 duration-900">
      <BreadcrumbsNav
        customTrail={[
          { label: "FAQ Queries", path: "/QueryFAQ" },
          { label: "Query Detail", path: `/QueryFAQSee/${id}` },
        ]}
      />

      <div className="bg-white rounded-2xl shadow-md p-6">
        <PageTitle title="FAQ Query Detail" />

        {loading ? (
          <div className="text-center p-6">Loading Query…</div>
        ) : query ? (
          <div className="space-y-6 mt-5">
            {/* Email */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Email</h2>
              <p className="text-gray-600">{query.email}</p>
            </div>

            {/* Message */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Message</h2>
              <p className="text-gray-600">{query.message}</p>
            </div>

            {/* Created & Updated */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Created At
                </h2>
                <p className="text-gray-600">
                  {new Date(query.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Updated At
                </h2>
                <p className="text-gray-600">
                  {new Date(query.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-6 text-gray-500 italic">
            No Query found.
          </div>
        )}
      </div>
    </div>
  );
};

export default QueryFAQSee;
