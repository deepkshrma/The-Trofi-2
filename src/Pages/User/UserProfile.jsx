import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageTitle from "../../components/PageTitle/PageTitle";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL, IMAGE_URL } from "../../config/Config";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import guest from "../../assets/images/guest.png";
import UserUpdateStatus from "../../components/UserUpdateStatus/UserUpdateStatus";

function UserProfile() {
  const [user, setUser] = useState(null);
  // Separate states for each search input
  const [favSearchRestaurants, setFavSearchRestaurants] = useState("");
  const [favSearchDishes, setFavSearchDishes] = useState("");
  const [ratingSearchRestaurants, setRatingSearchRestaurants] = useState("");
  const [ratingSearchDishes, setRatingSearchDishes] = useState("");
  const [bannedList, setBannedList] = useState([]);
  const [checkinSearch, setCheckinSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isLoadingDishes, setIsLoadingDishes] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const [showBanModal, setShowBanModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [banReason, setBanReason] = useState("");
  const [isBanAction, setIsBanAction] = useState(true); // true = Ban, false = Unban


  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [userAddress, setUserAddress] = useState([]);
  const { id } = useParams();
  const tierTableRef = useRef(null);



  const handleBanToggle = async (addr) => {
    const { postalCode, country, address, city, state, reason } = addr;

    // ✅ Fix: Compare with user_id._id (it's an object in response)
    const isAlreadyBanned = bannedList.some(
      (b) =>
        (b.user_id?._id || b.user_id) === user._id && // ✅ Handle both object and string
        b.postalCode === postalCode &&
        b.country === country &&
        !b.isDeleted
    );

    try {
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;
      if (!token) return toast.error("Please login first");

      let res;
      if (isAlreadyBanned) {
        // UNBAN
        res = await axios.post(
          `${BASE_URL}/admin/unban-location`,
          {
            userId: user._id,
            postalCode,
            country
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // BAN
        res = await axios.post(
          `${BASE_URL}/admin/ban-location`,
          {
            userId: user._id,
            postalCode,
            country,
            address,
            city,
            state,
            reason
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      if (res.data.success) {
        toast.success(res.data.message);
        // ✅ Refresh ban list filtered by this user
        const updated = await axios.get(
          `${BASE_URL}/admin/banned-locations?userId=${user._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBannedList(updated.data.data || []);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };



  // Tier-based gradient configuration
  const getTierGradient = (tier) => {
    const gradients = {
      Sapphire: "linear-gradient(135deg, #E67300 0%, #F39324 25%, #FFB347 50%, #E67300 100%)",
      Gold: "linear-gradient(135deg, #C1A875 0%, #A78B3F 20%, #BDA452 40%, #F4E683 60%, #BDA452 80%, #A78B3F 100%)",
      Silver: "linear-gradient(135deg, #7A96AC 0%, #EAEFF3 15%, #C2D4E1 30%, #FFFFFF 50%, #D4DEE5 70%, #C0CED7 85%, #BCCAD7 100%)",
      White: "linear-gradient(135deg, #D1D2D2 0%, #FFFFFF 50%, #D1D2D2 100%)",
      Red: "linear-gradient(135deg, #DC2626 0%, #EF4444 25%, #FCA5A5 50%, #DC2626 100%)",
    };
    return gradients[tier] || gradients.White;
  };

  const userTier = user?.tier?.tier || "White";
  const tierGradient = getTierGradient(userTier);

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
    const fetchBannedList = async () => {
      try {
        const authData = JSON.parse(localStorage.getItem("trofi_user"));
        const token = authData?.token;
        if (!token || !user?._id) return; // ✅ Wait for user to load

        // ✅ Fetch bans only for this specific user
        const res = await axios.get(
          `${BASE_URL}/admin/banned-locations?userId=${user._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) setBannedList(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch banned list:", err);
      }
    };

    if (user?._id) {
      fetchBannedList(); // ✅ Only fetch when user is loaded
    }
  }, [user?._id]); // ✅ Add user._id as dependency


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
        {/* Profile + Status Card */}
        <div className="flex flex-col lg:flex-row place-items-center lg:items-start gap-6 w-full lg:w-1/2 lg:pr-6">
          {/* Profile Image */}


          <div
            className="relative w-32 h-32 rounded-full flex-shrink-0 cursor-pointer transition-transform duration-300 hover:scale-105"
            onClick={openImageModal}
          >
            {/* Gradient Border Layer */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: tierGradient,
                padding: "4px", // This creates the border thickness
              }}
            >
              {/* Inner Content Container */}
              <div className="w-full h-full rounded-full overflow-hidden  flex items-center justify-center text-3xl font-bold bg-gray-100 text-gray-600 relative">
                {user.profile_picture ? (
                  <img
                    src={user.profile_picture ? `${IMAGE_URL}/${user.profile_picture}` : guest}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials
                )}
                {user.profile_picture && (
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-sm font-medium transition-opacity">
                    View Profile
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Info + Status */}
          <div className="flex-1 w-full">
            {/* Basic Info */}
            <div className="text-center lg:text-left mb-4">
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
              <p className="text-gray-600 mt-1">{user.email}</p>
              <p className="text-gray-500">
                {user.country_code} {user.phone}
              </p>
            </div>

            {/* Account Status Control Panel */}
            <div className="rounded-xl p-4  shadow-lg relative overflow-hidden"

            >
              {/* Gradient overlay on left side */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1 opacity-80"
                style={{ background: tierGradient }}
              ></div>

              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-gray-700">Account Status</h4>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium text-black shadow-sm"
                    style={{ background: tierGradient }}
                  >
                    {userTier} Tier
                  </span>
                </div>
                <button
                  onClick={() => setShowStatusModal(true)}
                  className="text-xs font-medium underline cursor-pointer transition-colors"
                  style={{ color: "#F9832B" }}
                  onMouseEnter={(e) => e.target.style.color = "#e67600"}
                  onMouseLeave={(e) => e.target.style.color = "#F9832B"}
                >
                  Change Status
                </button>
              </div>

              <div className="flex items-center gap-3 relative z-10">
                <div
                  onClick={() => setShowStatusModal(true)}
                  className={`cursor-pointer px-4 py-2 inline-flex justify-center items-center text-sm font-semibold rounded-lg hover:opacity-90 transition shadow-sm ${user.account_status === "active"
                    ? "bg-green-500 text-white"
                    : user.account_status === "suspended"
                      ? "bg-yellow-500 text-white"
                      : user.account_status === "spam"
                        ? "bg-orange-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  title="Click to change status"
                >
                  {user.account_status.toUpperCase()}
                </div>

                {user.status_reason && (
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Reason:</p>
                    <p className="text-xs text-gray-700 bg-white px-3 py-1.5 rounded-lg border border-gray-200 line-clamp-2">
                      {user.status_reason}
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Action Hint */}
              <p className="text-xs text-gray-400 mt-3 italic relative z-10">
                Click status badge or "Change Status" to suspend, ban, or activate user
              </p>
            </div>
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

                {/* Ban / Unban Controls */}
                {(() => {
                  // ✅ Fix: Compare with user_id._id (it's an object in response)
                  const ban = bannedList.find(
                    (b) =>
                      (b.user_id?._id || b.user_id) === user._id &&  // ✅ Handle both object and string
                      b.postalCode === addr.postalCode &&
                      b.country === addr.country &&
                      !b.isDeleted
                  );

                  if (ban) {
                    return (
                      <div className="mt-3 bg-red-50 border border-red-300 p-3 rounded-lg text-sm text-red-700">
                        <p className="font-semibold">🚫 Location Banned for This User</p>
                        <p>Reason: {ban.reason || "—"}</p>
                        <p>Banned By: {ban.bannedBy?.name || "Admin"}</p>
                        <p>Banned At: {new Date(ban.bannedAt).toLocaleString()}</p>
                        <button
                          onClick={() => {
                            setSelectedAddress(addr);
                            setIsBanAction(false);
                            setShowBanModal(true);
                          }}
                          className="mt-2 px-3 py-1 bg-green-600 text-white cursor-pointer rounded hover:bg-green-700"
                        >
                          ✅ Unban
                        </button>
                      </div>
                    );
                  } else {
                    return (
                      <button
                        onClick={() => {
                          setSelectedAddress(addr);
                          setIsBanAction(true);
                          setBanReason("");
                          setShowBanModal(true);
                        }}
                        className="mt-3 px-4 py-2 text-sm bg-red-500 text-white cursor-pointer rounded-lg hover:bg-red-600 transition"
                      >
                        🚫 Ban this Location for This User
                      </button>
                    );
                  }
                })()}



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
                placeholder="Search rated restaurants..."
                value={ratingSearchRestaurants}
                onChange={(e) => setRatingSearchRestaurants(e.target.value)}
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
                      .includes(ratingSearchRestaurants.toLowerCase())
                  ).length > 0 ? (
                  user?.ratings
                    ?.filter((r) => r.type === "Restaurant")
                    ?.filter((r) =>
                      r.typeId?.restro_name
                        ?.toLowerCase()
                        .includes(ratingSearchRestaurants.toLowerCase())
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
                placeholder="Search rated dishes..."
                value={ratingSearchDishes}
                onChange={(e) => setRatingSearchDishes(e.target.value)}
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
                      .includes(ratingSearchDishes.toLowerCase())
                  ).length > 0 ? (
                  user?.ratings
                    ?.filter((r) => r.type === "Dish")
                    ?.filter((r) =>
                      r.typeId?.dish_name
                        ?.toLowerCase()
                        .includes(ratingSearchDishes.toLowerCase())
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
              placeholder="Search favourite restaurants..."
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
              placeholder="Search favourite dishes..."
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

      {/* Ban / Unban Modal */}
      {showBanModal && selectedAddress && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative animate-fadeIn">
            {/* Close */}
            <button
              onClick={() => setShowBanModal(false)}
              className="absolute top-3 right-3 text-gray-600 cursor-pointer hover:text-red-600 text-xl font-bold"
            >
              ×
            </button>

            <h2 className="text-xl font-semibold mb-2 text-gray-800">
              {isBanAction ? "Ban this Location" : "Unban this Location"}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Postal Code: <span className="font-medium">{selectedAddress.postalCode}</span> <br />
              Country: <span className="font-medium">{selectedAddress.country}</span> <br />
              Address: <span className="font-medium">{selectedAddress.address}</span>
            </p>

            {isBanAction && (
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Reason for Ban
                </label>
                <textarea
                  rows={3}
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Enter reason (optional)"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none text-sm"
                />
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">
              <button
                onClick={() => setShowBanModal(false)}
                className="flex-1 sm:flex-none px-4 py-2 rounded-lg border  border-gray-300 text-gray-600 cursor-pointer hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  await handleBanToggle({
                    ...selectedAddress,
                    reason: isBanAction ? (banReason.trim() || "Manual action by admin") : selectedAddress.reason,
                  });
                  setShowBanModal(false);
                }}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-white cursor-pointer font-medium transition ${isBanAction ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                  }`}
              >
                {isBanAction ? "Confirm Ban" : "Confirm Unban"}
              </button>
            </div>
          </div>

          {/* Fade-in animation */}
          <style>{`
      .animate-fadeIn {
        animation: fadeInModal 0.3s ease-in-out;
      }
      @keyframes fadeInModal {
        from {opacity:0; transform: translateY(-10px);}
        to {opacity:1; transform: translateY(0);}
      }
    `}</style>
        </div>
      )}


      {/* Status Update Modal */}
      {showStatusModal && user && (
        <UserUpdateStatus
          userId={user._id}
          status={user.account_status}
          reason={user.status_reason || ""}
          onClose={() => setShowStatusModal(false)}
          onSuccess={() => {
            // Refresh user data after status update
            window.location.reload(); // Simple way, or call fetchUser() if you extract it
            setShowStatusModal(false);
          }}
        />
      )}

      {isImageModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-4">
          {/* Blurred Background */}
          <div
            className="absolute inset-0 backdrop-blur-sm"
            onClick={closeImageModal}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl max-h-[90vh] w-auto z-10 overflow-hidden">
            {/* Close Button */}
            <button
              onClick={closeImageModal}
              className="absolute top-3 right-3 z-20 bg-white/90 hover:bg-red-600 hover:text-white text-gray-700 rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold shadow-lg transition-colors"
            >
              ✕
            </button>

            {/* Image Container */}
            <div className="flex items-center justify-center p-4 max-h-[90vh]">
              <img
                src={`${IMAGE_URL}/${user.profile_picture}`}
                alt="Profile"
                className="max-w-full max-h-[85vh] w-auto h-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}



    </div>

  );
}

export default UserProfile;
