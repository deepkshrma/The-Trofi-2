import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageTitle from "../../components/PageTitle/PageTitle";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config/Config";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";

function UserProfile() {
  const [user, setUser] = useState(null);
  const [userAddress, setUserAddress] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    const fetchUser = async () => {
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;
      if (!token) {
        toast.error("Please login first");
        return;
      }

      try {
        const response = await axios.get(
          `${BASE_URL}/admin/get-all-users?userID=${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setUser(response.data.data);
          setUserAddress(response.data.userAddress || []);
        } else {
          toast.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong while fetching user data");
      }
    };

    fetchUser();
  }, [id, BASE_URL]);

  if (!user) return <p className="p-6">Loading user data...</p>;

  const initials = user.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="main main_page min-h-screen p-6 duration-900 ">
      <BreadcrumbsNav
        customTrail={[{ label: "Users List", path: "/UserList" }, { label: "Users Profile", path: "/UserProfile" }]}
      />
      <PageTitle title="User Profile" />

      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-28 h-28 rounded-full border-4 border-[#F9832B] shadow-md flex items-center justify-center text-3xl font-bold bg-gray-100 text-gray-600 overflow-hidden">
            {user.profile_picture ? (
              <img
                src={user.profile_picture}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <div>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              {user.name}
              {user.isSpam && (
                <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded">
                  Spam User
                </span>
              )}
              {user.isDeleted && (
                <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">
                  Deleted Account
                </span>
              )}
            </h2>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-gray-500">
              {user.country_code} {user.phone}
            </p>
            <p className="text-sm text-gray-500">
              Status:{" "}
              <span
                className={`font-medium ${user.account_status === "active"
                  ? "text-green-600"
                  : "text-red-600"
                  }`}
              >
                {user.account_status}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Addresses */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: "#F9832B" }}>
          Addresses
        </h3>

        {userAddress && userAddress.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {userAddress.map((addr, idx) => (
              <div
                key={addr._id || idx}
                className="border border-gray-200 p-4 rounded-lg bg-gray-50 shadow-sm hover:shadow-md transition"
              >
                {/* Address Label */}
                <p className="font-semibold text-gray-800 mb-1">
                  {addr.addressLabel
                    ? addr.addressLabel.replace("_", " ")
                    : "Address"}
                </p>

                {/* Full Address */}
                <p className="text-sm text-gray-600 mb-2">{addr.address || "N/A"}</p>

                {/* Extra Info */}
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
                  <p>
                    <span className="font-medium">City:</span> {addr.city || "—"}
                  </p>
                  <p>
                    <span className="font-medium">State:</span> {addr.state || "—"}
                  </p>
                  <p>
                    <span className="font-medium">Postal:</span>{" "}
                    {addr.postalCode || "—"}
                  </p>
                  <p>
                    <span className="font-medium">Country:</span> {addr.country || "—"}
                  </p>
                </div>

                {/* Coordinates */}
                {addr.latitude && addr.longitude && (
                  <p className="text-xs text-gray-400 mt-2">
                    📍 Lat: {addr.latitude}, Lng: {addr.longitude}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No addresses available</p>
        )}
      </div>


      {/* Devices */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: "#F9832B" }}>
          Devices
        </h3>

        {user.devices && user.devices.length > 0 ? (
          <div className="grid gap-4">
            {user.devices.map((dev) => (
              <div
                key={dev._id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm hover:shadow-md transition"
              >
                <div className="flex flex-wrap justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">
                      Device ID: <span className="text-gray-600">{dev.deviceId}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Last Used:{" "}
                      {dev.lastUsedAt
                        ? new Date(dev.lastUsedAt).toLocaleString()
                        : "—"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Linked Users:{" "}
                      {dev.linkedUsers?.length > 0
                        ? dev.linkedUsers.map((u) => u.name).join(", ")
                        : "None"}
                    </p>
                  </div>

                  {/* Device Type Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${dev.device_type?.toLowerCase() === "android"
                        ? "bg-green-100 text-green-700"
                        : dev.device_type?.toLowerCase() === "ios"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                  >
                    {dev.device_type || "Unknown"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // ✅ fallback when API gives only single device info
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <p className="font-medium text-gray-800">
              Device ID: <span className="text-gray-600">{user.deviceId || "—"}</span>
            </p>
            <p className="text-sm text-gray-600">
              Device Type:{" "}
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${user.device_type?.toLowerCase() === "android"
                    ? "bg-green-100 text-green-700"
                    : user.device_type?.toLowerCase() === "ios"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
              >
                {user.device_type || "Unknown"}
              </span>
            </p>
          </div>
        )}
      </div>


      {/* Activity Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: "#F9832B" }}>
          Activity
        </h3>
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-sm">Ratings: {user.ratings?.length || 0}</p>
            {user.ratings?.map((r, idx) => (
              <p key={idx}>
                ⭐ {r.stars} at {r.restaurant}
              </p>
            ))}
          </div>
          <div>
            <p className="text-sm">Comments: {user.comments?.length || 0}</p>
            {user.comments?.map((c, idx) => (
              <p key={idx}>💬 {c.text}</p>
            ))}
          </div>
          <div>
            <p className="text-sm">Check-ins: {user.checkIns?.length || 0}</p>
            {user.checkIns?.map((c, idx) => (
              <p key={idx}>
                📍 {c.place} on {new Date(c.date).toDateString()}
              </p>
            ))}
          </div>
          <div>
            <p className="text-sm">
              Favourites: {user.favourites?.length || 0}
            </p>
            {user.favourites?.map((f, idx) => (
              <p key={idx}>❤️ Favorited {f.name}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: "#F9832B" }}>
          Account Details
        </h3>
        <p className="text-sm text-gray-600">
          Member Since: {new Date(user.createdAt).toDateString()}
        </p>
        <p className="text-sm text-gray-600">
          Last Login: {new Date(user.last_login_at).toLocaleString()}
        </p>
        <p className="text-sm text-gray-600">
          Email Verified:{" "}
          <span
            className={user.emailVerified ? "text-green-600" : "text-red-600"}
          >
            {user.emailVerified ? "Yes" : "No"}
          </span>
        </p>
        <p className="text-sm text-gray-600">
          Phone Verified:{" "}
          <span
            className={user.phoneVerified ? "text-green-600" : "text-red-600"}
          >
            {user.phoneVerified ? "Yes" : "No"}
          </span>
        </p>
      </div>

      {/* Status History */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: "#F9832B" }}>
          Account Status History
        </h3>

        {user.statusHistory && user.statusHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-[#F9832B]/10 text-[#F9832B] text-left">
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Reason</th>
                  <th className="px-4 py-3 font-semibold">Changed By</th>
                  <th className="px-4 py-3 font-semibold">Changed At</th>
                </tr>
              </thead>
              <tbody>
                {user.statusHistory
                  .slice()
                  .reverse()
                  .map((item, idx) => (
                    <tr
                      key={item._id || idx}
                      className="border-t border-gray-200 hover:bg-gray-50 transition"
                    >
                      {/* Status with Badge */}
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${item.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                            }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Reason */}
                      <td className="px-4 py-3 text-gray-700">
                        {item.reason || "—"}
                      </td>

                      {/* Changed By */}
                      <div className="flex items-start gap-2">
                        <div>
                          <p className="font-medium text-gray-800">{item.changedBy?.name}</p>
                          <p className="text-sm text-gray-400">{item.changedBy?.email}</p>
                        </div>
                      </div>


                      {/* Changed At */}
                      <td className="px-4 py-3 text-gray-500">
                        {item.changedAt
                          ? new Date(item.changedAt).toLocaleString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No status changes recorded</p>
        )}
      </div>

    </div>
  );
}

export default UserProfile;
