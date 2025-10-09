// @ts-nocheck
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config/Config";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import PageTitle from "../../components/PageTitle/PageTitle";

const NotificationView = () => {
  const { id } = useParams();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        setLoading(true);
        const authData = JSON.parse(localStorage.getItem("trofi_user"));
        const token = authData?.token;
        if (!token) {
          toast.error("Please login first");
          navigate("/login");
          return;
        }

        const res = await axios.get(`${BASE_URL}/admin/notification`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { id },
        });

        if (res.data.success) {
          setNotification(res.data.data);
        } else {
          toast.error(res.data.message || "Failed to fetch notification");
        }
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong while fetching notification");
      } finally {
        setLoading(false);
      }
    };

    fetchNotification();
  }, [id, navigate]);

  if (loading)
    return (
      <div className="p-6 justify-center text-center text-gray-500 text-lg">Loading notification details…</div>
    );

  if (!notification)
    return (
      <div className="p-6 text-center text-gray-400 italic">No Notification found.</div>
    );

  return (
    <div className="main main_page w-full p-4 md:p-6 space-y-6 md:space-y-8 min-h-screen">
      {/* Breadcrumbs */}
      <BreadcrumbsNav
        customTrail={[
          { label: "Notification Management", path: "/NotificationList" },
          { label: "Notification Detail", path: `/NotificationView/${id}` },
        ]}
      />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageTitle title="Notification Detail" />
        <div className="text-sm text-gray-500">
          Created: {new Date(notification.createdAt).toLocaleString()}
        </div>
      </div>

      {/* 📤 Sender Section */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-md space-y-3">
        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">
          Sender Details
        </h3>
        <div className="space-y-1 text-gray-700">
          <p><strong>Name:</strong> {notification.senderId?.name || "N/A"}</p>
          <p><strong>Email:</strong> {notification.senderId?.email || "N/A"}</p>
        </div>
      </div>

      {/* 📥 Receiver Section */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-md space-y-3">
        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">
          Receiver Details
        </h3>
        <div className="text-gray-700">
          {notification.isGlobal ? (
            <p>📢 <strong>Sent To:</strong> All Users</p>
          ) : notification.receiverIds?.length ? (
            <div>
              <p><strong>Total Receivers:</strong> {notification.receiverIds.length}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {notification.receiverIds.map((r) => (
                  <span
                    key={r._id}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                  >
                    {r.name}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p>No specific receivers.</p>
          )}
        </div>
      </div>

      {/* 📝 Title & Message Section */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-md space-y-5">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">
            Notification Title
          </h3>
          <p className="text-gray-700 mt-2">{notification.title || "—"}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">
            Notification Message
          </h3>
          <p className="text-gray-700 mt-2 whitespace-pre-line">
            {notification.message || "—"}
          </p>
        </div>
      </div>

      {/* 🖼️ Image Section */}
      {notification.image && (
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md space-y-3">
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">
            Attached Image
          </h3>
          <img
            src={`${BASE_URL.replace("/api", "")}/${notification.image}`}
            alt="Notification"
            className="w-48 h-48 object-cover rounded-lg border border-gray-200 shadow-sm"
          />
        </div>
      )}

      {/* ⚙️ Type Section */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-md space-y-3">
        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">
          Send Type
        </h3>
        <p className="text-gray-700 capitalize">{notification.send_type || "—"}</p>
      </div>

      {/* 🕒 Meta Info Section */}
      <div className="bg-gradient-to-b from-white to-gray-50 p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-3">Timestamps</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700">
          <div>
            <p className="font-medium">Created At</p>
            <p>{new Date(notification.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="font-medium">Updated At</p>
            <p>{new Date(notification.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationView;
