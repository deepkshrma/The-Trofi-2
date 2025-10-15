import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageTitle from "../../components/PageTitle/PageTitle";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL, IMAGE_URL } from "../../config/Config";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import guest from "../../assets/images/guest.png"

function UserProfile() {
  const [user, setUser] = useState(null);
  const [favSearchRestaurants, setFavSearchRestaurants] = useState("");
  const [favSearchDishes, setFavSearchDishes] = useState("");
  const [checkinSearch, setCheckinSearch] = useState("");
  const [loading, setLoading] = useState(true);


  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [userAddress, setUserAddress] = useState([]);
  const { id } = useParams();
  const tierTableRef = useRef(null);

  // Filter restaurants
  const filteredRestaurants = useMemo(() => {
    return user?.favourites?.restaurants?.filter((r) =>
      r.restaurantId?.restro_name.toLowerCase().includes(favSearchRestaurants.toLowerCase())
    ) || [];
  }, [user, favSearchRestaurants]);

  const filteredDishes = useMemo(() => {
    return user?.favourites?.dishes?.filter((d) =>
      d.dishId?.dish_name.toLowerCase().includes(favSearchDishes.toLowerCase())
    ) || [];
  }, [user, favSearchDishes]);


  const scrollToTierTable = () => {
    tierTableRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const openImageModal = () => setIsImageModalOpen(true);
  const closeImageModal = () => setIsImageModalOpen(false);


  useEffect(() => {
    if (favSearchDishes !== "") {
      setIsLoadingDishes(true);

      const timer = setTimeout(() => {
        setIsLoadingDishes(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [favSearchDishes]);


  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true); // start loader
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;
      if (!token) {
        toast.error("Please login first");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${BASE_URL}/admin/get-all-users?userID=${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          const userData = response.data.data;
          setUser(userData);
          setUserAddress(userData.addresses || []);
        } else {
          toast.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong while fetching user data");
      } finally {
        setLoading(false); // stop loader
      }
    };

    fetchUser();
  }, [id]);


  if (loading)
    return (
      <div className="flex items-center justify-start min-h-screen">
        <div className="flex flex-col items-center justify-center ml-64 w-full">
          <div className="w-16 h-16 border-4 border-[#F9832B] border-dashed rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-700 font-bold text-lg">Loading user details...</p>
        </div>
      </div>
    );




  const initials = user.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="main main_page min-h-screen p-6 duration-900 ">
      <BreadcrumbsNav
        customTrail={[{ label: "Users List", path: "/UserList" }, { label: "User Profile", path: "/UserProfile" }]}
      />
      <PageTitle title="User Profile" />

      {/* Profile + Tier Summary */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-5 flex flex-col lg:flex-row gap-6 items-center lg:items-start animate-fadeIn">
        {/* Left: Profile */}
        <div className="flex flex-col lg:flex-row place-items-center mt-8 lg:items-start gap-10 w-full lg:w-1/2 lg:pr-6">
          {/* Profile Image */}
          <div
            className="w-50 h-50 rounded-full border-4 border-[#F9832B] shadow-md flex items-center justify-center text-3xl font-bold bg-gray-100 text-gray-600 overflow-hidden transition-transform duration-300 hover:scale-105 relative cursor-pointer"
            onClick={openImageModal}
          >
            {user.profile_picture ? (
              <img
                src={user.profile_picture ? `${IMAGE_URL}/${user.profile_picture}` : guest}
                alt="Profile"
                className="w-full h-full object-cover"
              />

            ) : (
              initials
            )}
            {/* Hover overlay */}
            {user.profile_picture && (
              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-sm font-medium transition-opacity">
                Click to see profile
              </div>
            )}
          </div>


          {/* Profile Info */}
          <div className="text-center mt-8 lg:text-left">
            <h2 className="text-2xl font-semibold flex flex-wrap items-center gap-2 justify-center lg:justify-start">
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
            <p className="text-sm text-gray-500 mt-1">
              Status:{" "}
              <span
                className={`font-medium px-2 py-1 rounded ${user.account_status === "active"
                  ? "bg-green-100 text-green-600"
                  : user.account_status === "suspended"
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-red-100 text-red-600"
                  }`}
              >
                {user.account_status}
              </span>
            </p>
          </div>
        </div>


        {/* Right: Tier Summary */}
        {user.tier && (
          <div className="w-full lg:w-1/2 bg-gray-50 rounded-xl p-6 flex flex-col gap-4 text-gray-800 shadow-md">
            <h3 className="text-xl font-semibold mb-4">Tier Summary</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              {["Tier", "Points", "Last Active"].map((title, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-white rounded-lg shadow-sm hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <p className="text-sm text-gray-800">{title}</p>
                  <p className="text-lg font-semibold">
                    {title === "Tier"
                      ? user.tier.tier
                      : title === "Points"
                        ? user.tier.points
                        : user.tier.lastActiveAt
                          ? new Date(user.tier.lastActiveAt).toLocaleString()
                          : "N/A"}
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={scrollToTierTable}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-[#F9832B] to-[#F9A33B] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              View Full Tier Details
            </button>
          </div>
        )}
      </div>

      {/* Add animation */}
      <style>
        {`
  .animate-fadeIn {
    animation: fadeIn 0.8s ease-in-out;
  }
  @keyframes fadeIn {
    0% { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
`}
      </style>






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


      {/* Activity & Ratings */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: "#F9832B" }}>
          Activity & Ratings
        </h3>

        {/* --- Check-ins --- */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xl font-bold">Check-ins</p>
            <input
              type="text"
              placeholder="Search Check-ins by restaurant..."
              value={checkinSearch}
              onChange={(e) => setCheckinSearch(e.target.value)}
              className="border border-gray-300 bg-white mt-1 mr-1 p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] outline-none w-64"
            />
          </div>

          {((user.activeCheckIns?.length || 0) + (user.pastCheckIns?.length || 0)) > 0 ? (
            <div className="grid gap-3">
              {/* Active Check-ins */}
              {user.activeCheckIns
                ?.filter((c) =>
                  c.restaurantId?.restro_name
                    ?.toLowerCase()
                    .includes(checkinSearch.toLowerCase())
                )
                ?.map((c) => (
                  <div
                    key={c._id}
                    className="border border-gray-200 p-4 rounded-lg bg-green-50 shadow-sm hover:shadow-md transition"
                  >
                    <p className="text-sm font-medium">
                      Active Check-in: {c.restaurantId?.restro_name || "N/A"}
                    </p>
                    {c.notes && <p className="text-gray-600 text-sm mt-1">Notes: {c.notes}</p>}
                    <p className="text-xs text-gray-500 mt-1">
                      {c.createdAt ? new Date(c.createdAt).toLocaleString() : "—"}
                    </p>
                  </div>
                ))}

              {/* Past Check-ins */}
              {user.pastCheckIns
                ?.filter((c) =>
                  c.restaurantId?.restro_name
                    ?.toLowerCase()
                    .includes(checkinSearch.toLowerCase())
                )
                ?.map((c) => (
                  <div
                    key={c._id}
                    className="border border-gray-200 p-4 rounded-lg bg-gray-50 shadow-sm hover:shadow-md transition"
                  >
                    <p className="text-sm font-medium">
                      Past Check-in: {c.restaurantId?.restro_name || "N/A"}
                    </p>
                    {c.notes && <p className="text-gray-600 text-sm mt-1">Notes: {c.notes}</p>}
                    <p className="text-xs text-gray-500 mt-1">
                      Date: {c.createdAt ? new Date(c.createdAt).toLocaleString() : "—"}
                    </p>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500">No check-ins available</p>
          )}
        </div>

        {/* --- Ratings (Restaurant + Dish) --- */}
        <div className="mb-6">
          {/* Restaurant Ratings */}
          <div className="overflow-x-auto mb-6">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xl font-bold">Restaurant Ratings</p>
              <input
                type="text"
                placeholder="Search Restaurants..."
                value={favSearchRestaurants}
                onChange={(e) => setFavSearchRestaurants(e.target.value)}
                className="border border-gray-300 bg-white mt-1 mr-1 p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] outline-none w-64"
              />
            </div>

            <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-[#F9832B]/10 text-[#F9832B] text-left">
                  <th className="px-6 py-3 font-semibold">Restaurant</th>
                  <th className="px-6 py-3 font-semibold">Rating</th>
                  <th className="px-6 py-3 font-semibold">Comment</th>
                  <th className="px-6 py-3 font-semibold">Tags</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Rating Date</th>
                </tr>
              </thead>
              <tbody>
                {user?.ratings
                  ?.filter((r) => r.type === "Restaurant")
                  ?.filter((r) =>
                    r.typeId?.restro_name
                      ?.toLowerCase()
                      .includes(favSearchRestaurants.toLowerCase())
                  ).length > 0 ? (
                  user?.ratings
                    ?.filter((r) => r.type === "Restaurant")
                    ?.filter((r) =>
                      r.typeId?.restro_name
                        ?.toLowerCase()
                        .includes(favSearchRestaurants.toLowerCase())
                    )
                    .map((r) => (
                      <tr
                        key={r._id}
                        className="border-t border-gray-200 hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-3">{r.typeId?.restro_name || "—"}</td>
                        <td className="px-6 py-3">⭐ {r.star_value} ({r.rating_label})</td>
                        <td className="px-6 py-3">{r.reviewComment || "—"}</td>
                        <td className="px-6 py-3 text-xs">
                          {r.hashTags?.map((h) => h.hashTagTitle).join(", ") || "—"}
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${r.status === "published"
                              ? "bg-green-100 text-green-700"
                              : r.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                              }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="px-6 py-3">{new Date(r.createdAt).toLocaleString()}</td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-3 text-gray-500 text-center">
                      No restaurant ratings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Dish Ratings */}
          <div className="overflow-x-auto">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xl font-bold">Dish Ratings</p>
              <input
                type="text"
                placeholder="Search Dishes..."
                value={favSearchDishes}
                onChange={(e) => setFavSearchDishes(e.target.value)}
                className="border border-gray-300 bg-white mt-1 mr-1 p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] outline-none w-64"
              />
            </div>

            <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-[#F9832B]/10 text-[#F9832B] text-left">
                  <th className="px-6 py-3 font-semibold">Dish</th>
                  <th className="px-6 py-3 font-semibold">Rating</th>
                  <th className="px-6 py-3 font-semibold">Comment</th>
                  <th className="px-6 py-3 font-semibold">Tags</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Rating Date</th>
                </tr>
              </thead>
              <tbody>
                {user?.ratings
                  ?.filter((r) => r.type === "Dish")
                  ?.filter((r) =>
                    r.typeId?.dish_name
                      ?.toLowerCase()
                      .includes(favSearchDishes.toLowerCase())
                  ).length > 0 ? (
                  user?.ratings
                    ?.filter((r) => r.type === "Dish")
                    ?.filter((r) =>
                      r.typeId?.dish_name
                        ?.toLowerCase()
                        .includes(favSearchDishes.toLowerCase())
                    )
                    .map((r) => (
                      <tr
                        key={r._id}
                        className="border-t border-gray-200 hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-3">{r.typeId?.dish_name || "—"}</td>
                        <td className="px-6 py-3">⭐ {r.star_value} ({r.rating_label})</td>
                        <td className="px-6 py-3">{r.reviewComment || "—"}</td>
                        <td className="px-6 py-3 text-xs">
                          {r.hashTags?.map((h) => h.hashTagTitle).join(", ") || "—"}
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${r.status === "published"
                              ? "bg-green-100 text-green-700"
                              : r.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                              }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="px-6 py-3">{new Date(r.createdAt).toLocaleString()}</td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-3 text-gray-500 text-center">
                      No dish ratings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>



      {/* Favourites Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: "#F9832B" }}>
          Favourites
        </h3>

        {/* Restaurants Table with Search */}
        <div className="overflow-x-auto mb-6">
          <div className="flex items-center justify-between mb-1">
            <p className="  text-xl font-bold">Restaurants</p>
            <input
              type="text"
              placeholder="Search Restaurants..."
              value={favSearchRestaurants}
              onChange={(e) => setFavSearchRestaurants(e.target.value)}
              className="border border-gray-300 bg-white mt-1 mr-1 p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] outline-none w-64"
            />
          </div>

          <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-[#F9832B]/10 text-[#F9832B] text-left">
                <th className="px-6 py-3 font-semibold">Name</th>
                <th className="px-6 py-3 font-semibold">Address</th>
                <th className="px-6 py-3 font-semibold">Added At</th>
              </tr>
            </thead>
            <tbody>
              {filteredRestaurants && filteredRestaurants.length > 0 ? (
                filteredRestaurants.map((f) => (
                  <tr key={f._id} className="border-t border-gray-200 hover:bg-gray-50 transition">
                    <td className="px-6 py-3">{f.restaurantId?.restro_name || "—"}</td>
                    <td className="px-6 py-3">{f.restaurantId?.address || "—"}</td>
                    <td className="px-6 py-3">{new Date(f.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-3 text-gray-500 text-center">
                    No restaurants found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dishes Table with Search */}
        <div className="overflow-x-auto">
          <div className="flex items-center justify-between mb-1 ">
            <p className=" text-xl font-bold">Dishes</p>
            <input
              type="text"
              placeholder="Search Dishes..."
              value={favSearchDishes}
              onChange={(e) => setFavSearchDishes(e.target.value)}
              className="border border-gray-300 bg-white mt-1 mr-1 p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] outline-none w-64"
            />
          </div>

          <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-[#F9832B]/10 text-[#F9832B] text-left">
                <th className="px-6 py-3 font-semibold">Dish Name</th>
                <th className="px-6 py-3 font-semibold">Added At</th>
              </tr>
            </thead>
            <tbody>
              {filteredDishes && filteredDishes.length > 0 ? (
                filteredDishes.map((f) => (
                  <tr key={f._id} className="border-t border-gray-200 hover:bg-gray-50 transition">
                    <td className="px-6 py-3">{f.dishId?.dish_name || "—"}</td>
                    <td className="px-6 py-3">{new Date(f.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="px-6 py-3 text-gray-500 text-center">
                    No dishes found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tier Section */}
      {/* Tier Table */}
      {user.tier && (
        <div ref={tierTableRef} className="bg-white rounded-xl shadow-md p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: "#F9832B" }}>
            Tier & Points
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition">
              <p className="text-sm text-gray-500">Tier</p>
              <p className="text-lg font-semibold">{user.tier.tier}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition">
              <p className="text-sm text-gray-500">Points</p>
              <p className="text-lg font-semibold">{user.tier.points}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition">
              <p className="text-sm text-gray-500">Review Count</p>
              <p className="text-lg font-semibold">{user.tier.reviewCount}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition">
              <p className="text-sm text-gray-500">Professional Feedback</p>
              <p className="text-lg font-semibold">{user.tier.professionalFeedbackCount}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition">
              <p className="text-sm text-gray-500">Rejected Feedback</p>
              <p className="text-lg font-semibold">{user.tier.rejectedFeedbackCount}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition">
              <p className="text-sm text-gray-500">Last Active</p>
              <p className="text-lg font-semibold">
                {user.tier.lastActiveAt
                  ? new Date(user.tier.lastActiveAt).toLocaleString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Optional Tier History Table */}
      {user.tierHistory?.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: "#F9832B" }}>
            Tier History
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-[#F9832B]/10 text-[#F9832B] text-left">
                  <th className="px-4 py-3 font-semibold">Old Tier</th>
                  <th className="px-4 py-3 font-semibold">New Tier</th>
                  <th className="px-4 py-3 font-semibold">Points</th>
                  <th className="px-4 py-3 font-semibold">Reason</th>
                  <th className="px-4 py-3 font-semibold">Changed By</th>
                  <th className="px-4 py-3 font-semibold">Changed At</th>
                </tr>
              </thead>
              <tbody>
                {user.tierHistory.map((th, idx) => (
                  <tr key={th._id || idx} className="border-t border-gray-200 hover:bg-gray-50 transition">
                    <td className="px-4 py-3">{th.oldTier || "—"}</td>
                    <td className="px-4 py-3">{th.newTier}</td>
                    <td className="px-4 py-3">{th.points}</td>
                    <td className="px-4 py-3">{th.reason}</td>
                    <td className="px-4 py-3">{th.changedBy?.name || "System"}</td>
                    <td className="px-4 py-3">{new Date(th.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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

      {isImageModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Blurred Background */}
          <div
            className="absolute inset-0 bg-opacity-50 bg-opacity-50 backdrop-blur-sm"
            onClick={closeImageModal} // Clicking on background closes modal
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-xl shadow-lg max-w-md w-11/12 p-4 z-10">
            {/* Close Button */}
            <button
              onClick={closeImageModal}
              className="absolute top-3 right-3 text-gray-700 text-xl font-bold hover:text-red-600 cursor-pointer"
            >
              ✕
            </button>

            {/* Image */}
            <img
              src={`${IMAGE_URL}/${user.profile_picture}`}
              alt="Profile"
              className="w-100 h-100  object-contain"
            />
          </div>
        </div>
      )}



    </div>

  );
}

export default UserProfile;
