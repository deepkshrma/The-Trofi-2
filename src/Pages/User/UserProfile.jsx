// @ts-nocheck
import React from "react";
import PageTitle from "../../components/PageTitle/PageTitle";

function UserProfile() {
  // Dummy API response (with extra fields)
  const user = {
    _id: "68c2bda448dad81c525ccb0b",
    name: "John",
    email: "john@cena.com",
    country_code: "+91",
    phone: "8398367750",
    fullPhone: "+918398367750",
    profile_picture: "",
    account_status: "active",
    isSpam: false,
    is_social_login: false,
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
    notes: "VIP User. Keep track of his reviews.",
    emailVerified: true,
    phoneVerified: true,
    last_login_at: "2025-09-11T12:16:36.545Z",
    createdAt: "2025-09-11T12:16:36.559Z",
    addresses: [
      {
        _id: "68c2bda548dad81c525ccb0e",
        addressLabel: "current_location",
        address:
          "2, Niwaru Road, Talaiwai Dham, Jhotwara, Jaipur, 302012, Rajasthan, India",
        city: "Jaipur",
        state: "Rajasthan",
        postalCode: "302012",
        country: "India",
        latitude: "26.936533",
        longitude: "75.767451",
        isActive: true,
      },
    ],
    favourites: [{ id: 1, name: "Royal Bites" }],
    ratings: [{ id: 1, restaurant: "Cafe Aroma", stars: 5 }],
    comments: [{ id: 1, text: "Great food at Bake House!" }],
    checkIns: [{ id: 1, place: "Pizza Hub", date: "2025-09-10T10:00:00Z" }],
    devices: [
      {
        _id: "68c2bda5a987708a3c5a0e50",
        deviceId: "device11231",
        lastUsedAt: "2025-09-11T12:16:37.114Z",
        linkedUsers: [
          {
            _id: "68c2bda448dad81c525ccb0b",
            name: "John",
            email: "john@cena.com",
          },
        ],
      },
    ],
  };

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
            {/* <p className="text-sm text-gray-500">
              Login Method:{" "}
              {user.is_social_login ? "Social Login" : "Email/Phone Login"}
            </p> */}
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

      {/* Tier & Points (static since API has no points yet) */}
      {/* <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <h3 className="text-lg font-semibold mb-2" style={{ color: "#F9832B" }}>
          Tier Status
        </h3>
        <p>
          Current Tier: <span className="font-semibold">White</span> 🎖️
        </p>
        <p>
          Points: <span className="font-semibold">0 / 500</span> (Next: Silver)
        </p>
        <div className="w-full bg-gray-200 h-3 rounded-full mt-3">
          <div
            className="h-3 rounded-full"
            style={{ width: `0%`, backgroundColor: "#F9832B" }}
          ></div>
        </div>
      </div> */}

      {/* Admin Notes */}
      {/* <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <h3 className="text-lg font-semibold mb-2" style={{ color: "#F9832B" }}>
          Admin Notes
        </h3>
        <p className="text-sm text-gray-600">
          {user.notes || "No notes added."}
        </p>
      </div> */}

      {/* Addresses */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: "#F9832B" }}>
          Addresses
        </h3>
        {user.addresses.length > 0 ? (
          user.addresses.map((addr) => (
            <div
              key={addr._id}
              className="border border-gray-300 p-4 rounded-lg mb-3 bg-gray-50"
            >
              <p className="font-medium">{addr.addressLabel}</p>
              <p className="text-sm text-gray-600">{addr.address}</p>
              {/* <p className="text-xs text-gray-500">
                {addr.city}, {addr.state}, {addr.country} - {addr.postalCode}
              </p> */}
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
        {user.devices.length > 0 ? (
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
                Linked Users: {dev.linkedUsers.map((u) => u.name).join(", ")}
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
            <p className="text-sm">Ratings: {user.ratings.length}</p>
            {user.ratings.map((r) => (
              <>
                ⭐ {r.stars} at {r.restaurant}
              </>
            ))}
          </div>
          <div>
            <p className="text-sm">Comments: {user.comments.length}</p>
            {user.comments.map((c) => (
              <> 💬 {c.text}</>
            ))}
          </div>
          <div>
            <p className="text-sm">Check-ins: {user.checkIns.length}</p>{" "}
            {user.checkIns.map((c) => (
              <>
                📍 {c.place} on {new Date(c.date).toDateString()}
              </>
            ))}
          </div>
          <div>
            <p className="text-sm">Favourites: {user.favourites.length}</p>{" "}
            {user.favourites.map((f) => (
              <> ❤️ Favorited {f.name}</>
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
