// @ts-nocheck
import React from "react";
import PageTitle from "../../components/PageTitle/PageTitle";

function UserProfile() {
  const user = {
    name: "John stephen",
    email: "john@example.com",
    phone: "+91 9876543210",
    points: 1800,
    tier: "Silver",
    nextTier: "Gold",
    nextTierPoints: 2500,
    feedbackCount: 34,
    avgRating: 4.3,
    favorites: 12,
    hygieneSeals: 8,
    profileImage: "https://i.pravatar.cc/150?img=41",
  };

  return (
    <div className="main main_page min-h-screen  p-6 duration-900">
      <PageTitle title="My Profile" />

      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-5 flex items-center justify-between">
        {/* Left: Profile Image */}
        <div className="flex items-center gap-6">
          <img
            src={user.profileImage}
            alt="Profile"
            className="w-28 h-28 rounded-full border-4 border-[#F9832B] shadow-md"
          />
          {/* Center: Details */}
          <div>
            <h2 className="text-2xl font-semibold">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-gray-500">{user.phone}</p>
          </div>
        </div>

        {/* Right: Edit Button */}
        {/* <button
          className="px-5 py-2 rounded-lg text-white font-medium shadow-md hover:shadow-lg"
          style={{ backgroundColor: "#F9832B" }}
        >
          Edit Profile
        </button> */}
      </div>

      {/* Tier + Points */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <h3 className="text-lg font-semibold mb-2" style={{ color: "#F9832B" }}>
          Tier Status
        </h3>
        <p>
          Current Tier: <span className="font-semibold">{user.tier}</span> 🎖️
        </p>
        <p>
          Points:{" "}
          <span className="font-semibold">
            {user.points} / {user.nextTierPoints}
          </span>{" "}
          (Next: {user.nextTier})
        </p>
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-3 rounded-full mt-3">
          <div
            className="h-3 rounded-full"
            style={{
              width: `${(user.points / user.nextTierPoints) * 100}%`,
              backgroundColor: "#F9832B",
            }}
          ></div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-5 rounded-xl shadow-md text-center">
          <p className="text-gray-600">Feedback Given</p>
          <h3 className="text-2xl font-bold">{user.feedbackCount}</h3>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md text-center">
          <p className="text-gray-600">Avg Rating</p>
          <h3 className="text-2xl font-bold">{user.avgRating} ⭐</h3>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md text-center">
          <p className="text-gray-600">Favorites</p>
          <h3 className="text-2xl font-bold">{user.favorites}</h3>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md text-center">
          <p className="text-gray-600">Hygiene Seals</p>
          <h3 className="text-2xl font-bold">{user.hygieneSeals}</h3>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: "#F9832B" }}>
          Recent Activity
        </h3>
        <ul className="space-y-2 text-gray-700">
          <li>✔️ Gave feedback to *Cafe Aroma* (5⭐)</li>
          <li>✔️ Favorited *Royal Bites*</li>
          <li>✔️ Earned Hygiene Seal at *Bake House*</li>
        </ul>
      </div>
    </div>
  );
}

export default UserProfile;
