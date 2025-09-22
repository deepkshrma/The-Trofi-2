import React, { useEffect, useState } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config/Config";

function UserProfile() {
  const [user, setUser] = useState(null);
  const userID = "68d0e3826aad22d8b7553476"; // Replace with dynamic userID if needed

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
          `${BASE_URL}/admin/get-all-users?userID=${userID}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          setUser(response.data.data);
        } else {
          toast.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong while fetching user data");
      }
    };

    fetchUser();
  }, [userID, BASE_URL]);

  if (!user) return <p className="p-6">Loading user data...</p>;

  const initials = user.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="main main_page min-h-screen p-6 duration-900 ">
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
                className={`font-medium ${
                  user.account_status === "active"
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
        {user.addresses && user.addresses.length > 0 ? (
          user.addresses.map((addr, idx) => (
            <div
              key={addr._id || idx}
              className="border border-gray-300 p-4 rounded-lg mb-3 bg-gray-50"
            >
              <p className="font-medium">{addr.addressLabel || "Address"}</p>
              <p className="text-sm text-gray-600">{addr.address || "N/A"}</p>
            </div>
          ))
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
          user.devices.map((dev) => (
            <div
              key={dev._id}
              className="border border-gray-300 p-4 rounded-lg mb-3 bg-gray-50"
            >
              <p className="font-medium">Device ID: {dev.deviceId}</p>
              <p className="text-sm text-gray-600">
                Last Used: {new Date(dev.lastUsedAt).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                Linked Users:{" "}
                {dev.linkedUsers
                  ? dev.linkedUsers.map((u) => u.name).join(", ")
                  : "None"}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No devices linked</p>
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
    </div>
  );
}

export default UserProfile;
