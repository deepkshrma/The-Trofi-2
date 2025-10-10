import React, { useEffect, useState } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL, IMAGE_URL } from "../../config/Config";

function RestroOwnerProfile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;

      if (!token) {
        toast.error("Please login first");
        return;
      }

      try {
        const response = await axios.get(`${BASE_URL}/admin/admin-profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setProfile(response.data.data);
        } else {
          toast.error("Failed to fetch profile");
        }
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong while fetching profile");
      }
    };

    fetchProfile();
  }, []);

  if (!profile)
    return (
      <div className="p-6 min-h-screen flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-xl shadow-md border border-gray-200">
          <p className="text-gray-500 italic">Loading profile...</p>
        </div>
      </div>
    );

  const initials = profile.restro_name
    ? profile.restro_name.charAt(0).toUpperCase()
    : "R";

  return (
    <div className="main main_page min-h-screen p-6 duration-900 space-y-6">
      {/* Breadcrumbs */}
      <BreadcrumbsNav
        customTrail={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Profile", path: "/RestroOwnerProfile" },
        ]}
      />

      {/* Page Title */}
      <PageTitle title="Restaurant Owner Profile" />

      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-28 h-28 rounded-full border-4 border-[#F9832B] shadow-md flex items-center justify-center text-3xl font-bold bg-gray-100 text-gray-600 overflow-hidden">
            {profile.profile_picture || profile.restaurant_images?.length > 0 ? (
              <img
                src={`${IMAGE_URL}/${profile.profile_picture || profile.restaurant_images[0]}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              initials
            )}
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
              {profile.restro_name}
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded capitalize">
                {profile.role?.name || "Restaurant Owner"}
              </span>
            </h2>
            <p className="text-gray-600">{profile.email}</p>
            <p className="text-gray-500">{profile.phone}</p>
            <p className="text-sm text-gray-500">
              Status:{" "}
              <span
                className={`font-medium ${profile.status === "active" || profile.account_status === "active"
                    ? "text-green-600"
                    : "text-red-600"
                  }`}
              >
                {profile.status || profile.account_status}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Restaurant Details */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-[#F9832B]">Restaurant Details</h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <p>
            <span className="font-medium text-gray-500">Restaurant:</span> {profile.restro_name}
          </p>
          <p>
            <span className="font-medium text-gray-500">Email:</span> {profile.email}
          </p>
          <p>
            <span className="font-medium text-gray-500">Phone:</span> {profile.phone}
          </p>
          <p>
            <span className="font-medium text-gray-500">Address:</span>{" "}
            {profile.address}, {profile.city}, {profile.state}, {profile.country} -{" "}
            {profile.postalCode}
          </p>
          <p>
            <span className="font-medium text-gray-500">Food Type:</span> {profile.food_type || "—"}
          </p>
          <p>
            <span className="font-medium text-gray-500">Avg Rating:</span> ⭐ {profile.avgRating || "—"}
          </p>
          <p>
            <span className="font-medium text-gray-500">Timings:</span> {profile.time || "—"}
          </p>
          <p>
            <span className="font-medium text-gray-500">Open Days:</span> {profile.days || "—"}
          </p>
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-[#F9832B]">Restaurant Info</h3>
        <p className="text-sm text-gray-600">Description: {profile.description || "—"}</p>
        <p className="text-sm text-gray-600">Long Description: {profile.long_description || "—"}</p>
        <p className="text-sm text-gray-600">Hygiene Status: {profile.hygiene_status || "—"}</p>

        {profile.restaurant_images?.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-800 mb-2">Images</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {profile.restaurant_images.map((img, idx) => (
                <img
                  key={idx}
                  src={`${IMAGE_URL}/${img}`}
                  alt={`restaurant-${idx}`}
                  className="rounded-lg shadow-sm object-cover w-full h-32"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-[#F9832B]">Account Info</h3>
        <p className="text-sm text-gray-600">Created At: {new Date(profile.createdAt).toDateString()}</p>
        <p className="text-sm text-gray-600">Updated At: {new Date(profile.updatedAt).toDateString()}</p>
        <p className="text-sm text-gray-600">
          Last Login: {profile.last_login_at ? new Date(profile.last_login_at).toLocaleString() : "—"}
        </p>
      </div>
    </div>
  );
}

export default RestroOwnerProfile;
