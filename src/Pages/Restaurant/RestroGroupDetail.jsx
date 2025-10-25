import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageTitle from "../../components/PageTitle/PageTitle";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import { BASE_URL } from "../../config/Config";
import { toast } from "react-toastify";
import axios from "axios";
import { ChevronLeft } from "lucide-react";

function RestroGroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = async () => {
    try {
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;

      const res = await axios.get(
        `${BASE_URL}/admin/restaurant-group/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.success) {
        setData(res.data.data);
      } else {
        toast.error(res.data.message || "Failed to load details");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetails();
  }, [id]);

  if (loading) return <div className="p-6">Loading details…</div>;

  if (!data) {
    return (
      <div className="p-6 text-center text-gray-500">
        No details found for this group.
      </div>
    );
  }

  return (
    <div className="main main_page p-6 duration-900">
      <BreadcrumbsNav
        customTrail={[
          { label: "Restaurant Groups", path: "/RestroGroup" },
          { label: "Group Details", path: `/GroupInDetail/${id}` },
        ]}
      />

      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <PageTitle title="Group Details" />
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-700 border rounded-lg px-3 py-1 shadow-sm hover:bg-gray-50"
          >
            <ChevronLeft size={18} /> Back
          </button>
        </div>

        {/* Main Info */}
        <div className="space-y-4 text-sm text-gray-700">
          <div><strong>Group Name:</strong> {data.group_name || "-"}</div>

          <div><strong>Description:</strong> {data.description || "No description"}</div>

          <div>
            <strong>Status:</strong>{" "}
            <span className={data.is_active ? "text-green-600" : "text-red-500"}>
              {data.is_active ? "Active" : "Inactive"}
            </span>
          </div>

          <div>
            <strong>Created:</strong>{" "}
            {new Date(data.createdAt).toLocaleDateString("en-IN")}
          </div>
          <div>
            <strong>Updated:</strong>{" "}
            {new Date(data.updatedAt).toLocaleDateTimeString?.("en-IN") ||
              new Date(data.updatedAt).toLocaleString("en-IN")}
          </div>
        </div>

        {/* Related Data */}
        {Array.isArray(data.related) && data.related.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Related Items
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 shadow-sm">
              <ul className="list-disc ml-4">
                {data.related.map((r) => (
                  <li key={r._id} className="text-gray-700 py-1">
                    {r.name || "Unnamed"}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default RestroGroupDetail;
