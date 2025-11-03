// @ts-nocheck
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageTitle from "../../components/PageTitle/PageTitle";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL, IMAGE_URL } from "../../config/Config";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import guest from "../../assets/images/guest.png";

function DeletedUserDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");

    const openImageModal = () => setIsImageModalOpen(true);
    const closeImageModal = () => setIsImageModalOpen(false);

    useEffect(() => {
        const fetchDeletedUser = async () => {
            setLoading(true);
            try {
                const authData = JSON.parse(localStorage.getItem("trofi_user"));
                const token = authData?.token;
                if (!token) {
                    toast.error("Please login first");
                    return;
                }

                const { data } = await axios.get(
                    `${BASE_URL}/admin/self-deleted-users/${id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (data.success) {
                    setUser(data.data);
                } else {
                    toast.error(data.message || "Failed to fetch deleted user details");
                }
            } catch (error) {
                console.error(error);
                toast.error("Error fetching deleted user details");
            } finally {
                setLoading(false);
            }
        };

        fetchDeletedUser();
    }, [id]);

    if (loading)
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-[#F9832B] border-dashed rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-700 font-semibold">
                        Loading deleted user details...
                    </p>
                </div>
            </div>
        );

    if (!user)
        return (
            <div className="text-center text-gray-500 mt-10">
                Deleted user not found
            </div>
        );

    const tabs = [
        { id: "overview", label: "Overview", count: null },
        { id: "addresses", label: "Addresses", count: user.addresses?.length || 0 },
        { id: "ratings", label: "Ratings", count: user.ratings?.length || 0 },
        { id: "checkins", label: "Check-ins", count: (user.activeCheckIns?.length || 0) + (user.pastCheckIns?.length || 0) },
        { id: "favourites", label: "Favourites", count: (user.favourites?.restaurants?.length || 0) + (user.favourites?.dishes?.length || 0) },
        { id: "tier", label: "Tier Info", count: null },
    ];

    return (
        <div className="main main_page p-4 md:p-6 space-y-4 bg-gray-50 min-h-screen">
            <BreadcrumbsNav
                customTrail={[
                    { label: "Deleted Users", path: "/DeletedUserList" },
                    { label: "Deleted User Details", path: `/DeletedUserDetails/${id}` },
                ]}
            />
            <PageTitle title="Deleted User Details" />

            {/* Profile Header Card */}
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-2xl shadow-lg">
                <div className="flex flex-col lg:flex-row items-center gap-6">
                    {/* Profile Picture */}
                    <div
                        className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#F9832B] overflow-hidden cursor-pointer shadow-xl hover:scale-105 transition-transform duration-300"
                        onClick={openImageModal}
                    >
                        <img
                            src={
                                user.profile_picture
                                    ? `${IMAGE_URL}/${user.profile_picture}`
                                    : guest
                            }
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* User Info */}
                    <div className="flex-1 text-center lg:text-left">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                                    {user.deleted_name || user.name || "N/A"}
                                </h2>
                                <p className="text-gray-600 text-sm md:text-base mt-1">
                                    {user.deleted_email || user.email || "N/A"}
                                </p>
                                <p className="text-gray-600 text-sm md:text-base">
                                    {user.deleted_phone || user.fullPhone || "N/A"}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2 justify-center lg:justify-end">
                                <span className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg shadow">
                                    🗑️ Deleted Account
                                </span>
                                <span className={`px-4 py-2 text-sm font-semibold rounded-lg shadow ${user.account_status === 'banned' ? 'bg-red-600 text-white' :
                                        user.account_status === 'suspended' ? 'bg-yellow-500 text-white' :
                                            'bg-green-500 text-white'
                                    }`}>
                                    {user.account_status?.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                            <div className="bg-white p-3 rounded-lg shadow text-center">
                                <p className="text-2xl font-bold text-[#F9832B]">{user.ratings?.length || 0}</p>
                                <p className="text-xs text-gray-600">Ratings</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg shadow text-center">
                                <p className="text-2xl font-bold text-[#F9832B]">
                                    {(user.activeCheckIns?.length || 0) + (user.pastCheckIns?.length || 0)}
                                </p>
                                <p className="text-xs text-gray-600">Check-ins</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg shadow text-center">
                                <p className="text-2xl font-bold text-[#F9832B]">
                                    {(user.favourites?.restaurants?.length || 0) + (user.favourites?.dishes?.length || 0)}
                                </p>
                                <p className="text-xs text-gray-600">Favourites</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg shadow text-center">
                                <p className="text-2xl font-bold text-[#F9832B]">{user.tier?.tier || "White"}</p>
                                <p className="text-xs text-gray-600">Tier</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white rounded-xl shadow-md overflow-x-auto">
                <div className="flex border-b">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 min-w-max px-4 py-3 text-sm md:text-base font-medium cursor-pointer transition-colors ${activeTab === tab.id
                                    ? "border-b-2 border-[#F9832B] text-[#F9832B] bg-orange-50"
                                    : "text-gray-600 hover:text-[#F9832B] hover:bg-gray-50"
                                }`}
                        >
                            {tab.label}
                            {tab.count !== null && (
                                <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 rounded-full">
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-4">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                    <>
                        {/* Deletion Info */}
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "#F9832B" }}>
                                <span>🗑️</span> Deletion Information
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">Deleted At</p>
                                    <p className="text-gray-800 font-semibold">
                                        {new Date(user.deletedAt).toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">Reason</p>
                                    <p className="text-gray-800 font-semibold">
                                        {user.status_reason || "User deleted their account"}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">Original Email</p>
                                    <p className="text-gray-800 font-semibold">
                                        {user.deleted_email || "—"}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">Original Phone</p>
                                    <p className="text-gray-800 font-semibold">
                                        {user.deleted_phone || "—"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Account Details */}
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "#F9832B" }}>
                                <span>👤</span> Account Summary
                            </h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">Created At</p>
                                    <p className="text-gray-800 font-semibold text-sm">
                                        {new Date(user.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">Last Login</p>
                                    <p className="text-gray-800 font-semibold text-sm">
                                        {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : "—"}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">Email Verified</p>
                                    <span className={`inline-block px-3 py-1 text-sm font-semibold rounded ${user.emailVerified ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                        }`}>
                                        {user.emailVerified ? "✓ Yes" : "✗ No"}
                                    </span>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">Phone Verified</p>
                                    <span className={`inline-block px-3 py-1 text-sm font-semibold rounded ${user.phoneVerified ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                        }`}>
                                        {user.phoneVerified ? "✓ Yes" : "✗ No"}
                                    </span>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">Birth Year</p>
                                    <p className="text-gray-800 font-semibold">{user.birth_year || "—"}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">Social Login</p>
                                    <span className={`inline-block px-3 py-1 text-sm font-semibold rounded ${user.is_social_login ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-700"
                                        }`}>
                                        {user.is_social_login ? "✓ Yes" : "✗ No"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Device & Notification Info */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-white p-6 rounded-xl shadow-md">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "#F9832B" }}>
                                    <span>📱</span> Device Info
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm text-gray-600">Device ID</span>
                                        <span className="text-sm font-semibold text-gray-800">{user.deviceId || "—"}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm text-gray-600">Device Type</span>
                                        <span className="text-sm font-semibold text-gray-800 uppercase">
                                            {user.device_type || "—"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-md">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "#F9832B" }}>
                                    <span>🔔</span> Notification Settings
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm text-gray-600">Push Notifications</span>
                                        <span className={`px-3 py-1 text-xs font-semibold rounded ${user.is_push_notification ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                            }`}>
                                            {user.is_push_notification ? "Enabled" : "Disabled"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm text-gray-600">Email Notifications</span>
                                        <span className={`px-3 py-1 text-xs font-semibold rounded ${user.is_email_notification ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                            }`}>
                                            {user.is_email_notification ? "Enabled" : "Disabled"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {user.notes && (
                            <div className="bg-white p-6 rounded-xl shadow-md">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "#F9832B" }}>
                                    <span>📝</span> Notes
                                </h3>
                                <p className="text-gray-700 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                                    {user.notes}
                                </p>
                            </div>
                        )}
                    </>
                )}

                {/* Addresses Tab */}
                {activeTab === "addresses" && (
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "#F9832B" }}>
                            <span>📍</span> User Addresses ({user.addresses?.length || 0})
                        </h3>
                        {user.addresses && user.addresses.length > 0 ? (
                            <div className="grid md:grid-cols-2 gap-4">
                                {user.addresses.map((addr, idx) => (
                                    <div key={addr._id} className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#F9832B] transition-colors">
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="font-semibold text-gray-800">
                                                {addr.addressLabel ? addr.addressLabel.replace(/_/g, ' ').toUpperCase() : `Address ${idx + 1}`}
                                            </h4>
                                            {addr.isActive && (
                                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-700 mb-2">{addr.address}</p>
                                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                            <p><span className="font-medium">City:</span> {addr.city}</p>
                                            <p><span className="font-medium">State:</span> {addr.state}</p>
                                            <p><span className="font-medium">Postal:</span> {addr.postalCode}</p>
                                            <p><span className="font-medium">Country:</span> {addr.country}</p>
                                        </div>
                                        {addr.latitude && addr.longitude && (
                                            <p className="text-xs text-gray-500 mt-2">
                                                📌 {parseFloat(addr.latitude).toFixed(6)}, {parseFloat(addr.longitude).toFixed(6)}
                                            </p>
                                        )}
                                        {addr.isDeleted && (
                                            <div className="mt-2 text-xs text-red-600">
                                                Deleted on: {new Date(addr.deletedAt).toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p className="text-4xl mb-2">📭</p>
                                <p>No addresses found</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Ratings Tab */}
                {activeTab === "ratings" && (
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "#F9832B" }}>
                            <span>⭐</span> User Ratings ({user.ratings?.length || 0})
                        </h3>
                        {user.ratings && user.ratings.length > 0 ? (
                            <div className="space-y-4">
                                {user.ratings.map((rating) => (
                                    <div key={rating._id} className="p-4 border-2 border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
                                            <div>
                                                <h4 className="font-bold text-lg text-gray-800">
                                                    {rating.typeId?.restro_name || rating.typeId?.dish_name || "N/A"}
                                                </h4>
                                                <p className="text-sm text-gray-500">Type: {rating.type}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1 bg-[#F9832B] text-white px-3 py-1 rounded-lg font-bold">
                                                    <span>⭐</span>
                                                    <span>{rating.star_value}/5</span>
                                                </div>
                                                <span className={`px-3 py-1 text-xs font-semibold rounded ${rating.status === 'published' ? 'bg-green-100 text-green-700' :
                                                        rating.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                                                            rating.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {rating.status?.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                        {rating.reviewComment && (
                                            <p className="text-sm text-gray-700 mb-2 p-3 bg-gray-50 rounded italic">
                                                "{rating.reviewComment}"
                                            </p>
                                        )}
                                        {rating.hashTags && rating.hashTags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {rating.hashTags.map((tag) => (
                                                    <span key={tag._id} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                                        #{tag.hashTagTitle}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <div className="text-xs text-gray-500 mt-2">
                                            Created: {new Date(rating.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p className="text-4xl mb-2">⭐</p>
                                <p>No ratings found</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Check-ins Tab */}
                {activeTab === "checkins" && (
                    <div className="space-y-4">
                        {/* Active Check-ins */}
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "#F9832B" }}>
                                <span>✅</span> Active Check-ins ({user.activeCheckIns?.length || 0})
                            </h3>
                            {user.activeCheckIns && user.activeCheckIns.length > 0 ? (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {user.activeCheckIns.map((checkin) => (
                                        <div key={checkin._id} className="p-4 border-2 border-green-200 bg-green-50 rounded-lg">
                                            <h4 className="font-bold text-gray-800 mb-2">
                                                {checkin.restaurantId?.restro_name || "N/A"}
                                            </h4>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {checkin.restaurantId?.address}
                                            </p>
                                            <div className="text-xs text-gray-500">
                                                <p>Checked in: {new Date(checkin.createdAt).toLocaleString()}</p>
                                                {checkin.timer_end_time && (
                                                    <p>Cooldown ends: {new Date(checkin.timer_end_time).toLocaleString()}</p>
                                                )}
                                            </div>
                                            {checkin.dishRating && checkin.dishRating.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-green-300">
                                                    <p className="text-xs font-semibold text-gray-700 mb-1">Dish Ratings:</p>
                                                    {checkin.dishRating.map((dish, idx) => (
                                                        <p key={idx} className="text-xs text-gray-600">
                                                            • {dish.dishId?.dish_name || "N/A"} {dish.hasDishRated ? "✓" : ""}
                                                        </p>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <p className="text-4xl mb-2">✅</p>
                                    <p>No active check-ins</p>
                                </div>
                            )}
                        </div>

                        {/* Past Check-ins */}
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "#F9832B" }}>
                                <span>📅</span> Past Check-ins ({user.pastCheckIns?.length || 0})
                            </h3>
                            {user.pastCheckIns && user.pastCheckIns.length > 0 ? (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {user.pastCheckIns.map((checkin) => (
                                        <div key={checkin._id} className="p-4 border-2 border-gray-200 rounded-lg">
                                            <h4 className="font-bold text-gray-800 mb-2">
                                                {checkin.restaurantId?.restro_name || "N/A"}
                                            </h4>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {checkin.restaurantId?.address}
                                            </p>
                                            <div className="text-xs text-gray-500">
                                                <p>Checked in: {new Date(checkin.createdAt).toLocaleString()}</p>
                                            </div>
                                            {checkin.dishRating && checkin.dishRating.length > 0 && (
                                                <div className="mt-3 pt-3 border-t">
                                                    <p className="text-xs font-semibold text-gray-700 mb-1">Dish Ratings:</p>
                                                    {checkin.dishRating.map((dish, idx) => (
                                                        <p key={idx} className="text-xs text-gray-600">
                                                            • {dish.dishId?.dish_name || "N/A"} {dish.hasDishRated ? "✓" : ""}
                                                        </p>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <p className="text-4xl mb-2">📅</p>
                                    <p>No past check-ins</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Favourites Tab */}
                {activeTab === "favourites" && (
                    <div className="space-y-4">
                        {/* Favorite Restaurants */}
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "#F9832B" }}>
                                <span>🍽️</span> Favorite Restaurants ({user.favourites?.restaurants?.length || 0})
                            </h3>
                            {user.favourites?.restaurants && user.favourites.restaurants.length > 0 ? (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {user.favourites.restaurants.map((fav) => (
                                        <div key={fav._id} className="p-4 border-2 border-orange-200 bg-orange-50 rounded-lg hover:shadow-lg transition-shadow">
                                            <h4 className="font-bold text-gray-800 mb-2">
                                                {fav.restaurantId?.restro_name || "N/A"}
                                            </h4>
                                            <p className="text-sm text-gray-600 mb-1">
                                                {fav.restaurantId?.address}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Added: {new Date(fav.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <p className="text-4xl mb-2">🍽️</p>
                                    <p>No favorite restaurants</p>
                                </div>
                            )}
                        </div>

                        {/* Favorite Dishes */}
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "#F9832B" }}>
                                <span>🍕</span> Favorite Dishes ({user.favourites?.dishes?.length || 0})
                            </h3>
                            {user.favourites?.dishes && user.favourites.dishes.length > 0 ? (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {user.favourites.dishes.map((fav) => (
                                        <div key={fav._id} className="p-4 border-2 border-purple-200 bg-purple-50 rounded-lg hover:shadow-lg transition-shadow">
                                            <h4 className="font-bold text-gray-800 mb-2">
                                                {fav.dishId?.dish_name || "N/A"}
                                            </h4>
                                            {fav.dishId?.description && (
                                                <p className="text-sm text-gray-600 mb-1">
                                                    {fav.dishId.description}
                                                </p>
                                            )}
                                            {fav.dishId?.price && (
                                                <p className="text-sm font-semibold text-[#F9832B] mb-1">
                                                    ₹{fav.dishId.price}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500">
                                                Added: {new Date(fav.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <p className="text-4xl mb-2">🍕</p>
                                    <p>No favorite dishes</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tier Tab */}
                {activeTab === "tier" && (
                    <div className="space-y-4">
                        {/* Current Tier */}
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "#F9832B" }}>
                                <span>🏆</span> Current Tier Status
                            </h3>
                            {user.tier ? (
                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="p-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg text-center">
                                        <p className="text-sm text-gray-600 mb-1">Tier</p>
                                        <p className="text-3xl font-bold text-[#F9832B]">{user.tier.tier}</p>
                                    </div>
                                    <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg text-center">
                                        <p className="text-sm text-gray-600 mb-1">Points</p>
                                        <p className="text-3xl font-bold text-blue-700">{user.tier.points}</p>
                                    </div>
                                    <div className="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-lg text-center">
                                        <p className="text-sm text-gray-600 mb-1">Reviews</p>
                                        <p className="text-3xl font-bold text-green-700">{user.tier.reviewCount}</p>
                                    </div>
                                    <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg text-center">
                                        <p className="text-sm text-gray-600 mb-1">Active Days</p>
                                        <p className="text-3xl font-bold text-purple-700">{user.tier.activeDays}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-1">Professional Feedback</p>
                                        <p className="text-xl font-bold text-gray-800">{user.tier.professionalFeedbackCount}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600 mb-1">Rejected Feedback</p>
                                        <p className="text-xl font-bold text-gray-800">{user.tier.rejectedFeedbackCount}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
                                        <p className="text-sm text-gray-600 mb-1">Last Active</p>
                                        <p className="text-sm font-semibold text-gray-800">
                                            {user.tier.lastActiveAt ? new Date(user.tier.lastActiveAt).toLocaleString() : "Never"}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <p className="text-4xl mb-2">🏆</p>
                                    <p>No tier information available</p>
                                </div>
                            )}
                        </div>

                        {/* Tier History */}
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: "#F9832B" }}>
                                <span>📊</span> Tier History ({user.tierHistory?.length || 0})
                            </h3>
                            {user.tierHistory && user.tierHistory.length > 0 ? (
                                <div className="space-y-3">
                                    {user.tierHistory.map((history) => (
                                        <div key={history._id} className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#F9832B] transition-colors">
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded">
                                                        {history.oldTier || "N/A"}
                                                    </span>
                                                    <span className="text-gray-400">→</span>
                                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded">
                                                        {history.newTier}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold text-[#F9832B]">{history.points} Points</p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(history.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-700 mt-2">
                                                <span className="font-medium">Reason:</span> {history.reason}
                                            </p>
                                            {history.changedBy && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Changed by: {history.changedBy.name} ({history.changedBy.email})
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <p className="text-4xl mb-2">📊</p>
                                    <p>No tier history available</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Image Modal */}
            {isImageModalOpen && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-4"
                    onClick={closeImageModal}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-4 relative animate-fadeIn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={closeImageModal}
                            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-red-500 text-white cursor-pointer rounded-full text-xl font-bold hover:bg-red-600 transition-colors shadow-lg"
                        >
                            ✕
                        </button>
                        <img
                            src={
                                user.profile_picture
                                    ? `${IMAGE_URL}/${user.profile_picture}`
                                    : guest
                            }
                            alt="Profile"
                            className="w-full h-auto object-contain rounded-lg"
                        />
                        <div className="mt-4 text-center">
                            <p className="text-gray-700 font-semibold">
                                {user.deleted_name || user.name || "User"}
                            </p>
                            <p className="text-sm text-gray-500">Profile Picture</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DeletedUserDetails;