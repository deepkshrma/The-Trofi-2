import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { FaStar, FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import { MdRestaurant, MdFastfood } from "react-icons/md";
import BreadcrumbsNav from "../../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import { BASE_URL } from "../../../config/Config";
import starDefault from "../../../assets/images/untitled_folder_6/star0.jfif";
import PageTitle from "../../../components/PageTitle/PageTitle";
import Select from "react-select";
import { STAR_RATINGS } from "../../../config/hashtagconfig";

// Tell Us Questions for Restaurant
const RESTAURANT_QUESTIONS = [
    "Was the staff polite and helpful?",
    "Was the restaurant clean and well maintained?",
    "Did the menu have enough variety?",
];

// Tell Us Questions for Dish
const DISH_QUESTIONS = [
    "Was the staff polite and helpful?",
    "Was the restaurant clean and well maintained?",
    "Did the menu have enough variety?",
];

// Filter Pills Component
const FilterPills = ({ active, onChange, labels }) => (
    <div className="inline-flex items-center rounded-full bg-gray-100 p-1 mb-6">
        {labels.map((label) => (
            <button
                key={label}
                onClick={() => onChange(label)}
                className={`px-4 py-2 text-sm rounded-full transition cursor-pointer font-medium ${active === label
                    ? "bg-orange-500 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                    }`}
                type="button"
            >
                {label}
            </button>
        ))}
    </div>
);

function CreateReview() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Restaurant Reviews");
    const [loading, setLoading] = useState(false);

    // Form State
    const [selectedEntity, setSelectedEntity] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [starRating, setStarRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [selectedHashtags, setSelectedHashtags] = useState([]);
    const [answers, setAnswers] = useState({});
    const [comment, setComment] = useState("");
    const [images, setImages] = useState([]);
    const [displayName, setDisplayName] = useState("");
    const [profileImage, setProfileImage] = useState(null);

    const [restaurantList, setRestaurantList] = useState([]);
    const [selectedRestaurantForDish, setSelectedRestaurantForDish] = useState(null);
    const [dishList, setDishList] = useState([]);
    const [dishSearchTerm, setDishSearchTerm] = useState("");
    const [loadingRestaurants, setLoadingRestaurants] = useState(false);
    const [loadingDishes, setLoadingDishes] = useState(false);

    // Dropdown Data
    const [hashtags, setHashtags] = useState([]);
    const [hashtagsLoading, setHashtagsLoading] = useState(false);

    const fetchRestaurants = async () => {
        try {
            setLoadingRestaurants(true);
            const authData = JSON.parse(localStorage.getItem("trofi_user"));
            const token = authData?.token;
            const res = await axios.get(`${BASE_URL}/restro/get-restaurant-dropdown`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data?.success) {
                setRestaurantList(res.data.data || []);
            }
        } catch (err) {
            console.error("Restaurant fetch error:", err);
        } finally {
            setLoadingRestaurants(false);
        }
    };

    // Fetch dishes by selected restaurant
    const fetchDishesByRestaurant = async (restroId) => {
        try {
            const authData = JSON.parse(localStorage.getItem("trofi_user"));
            const token = authData?.token;

            const res = await axios.get(`${BASE_URL}/dishes/get-all-dishes-admin`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    restaurantId: restroId,
                    limit: 100, // optional limit for dropdown
                    page: 1,
                },
            });

            if (res.data?.success) {
                // get list from data.data.items (that’s how your DishesList gets it)
                setDishList(res.data.data.items);
            } else {
                setDishList([]);
            }
        } catch (err) {
            console.error("Failed to fetch dishes:", err);
            setDishList([]);
        }
    };


    // Get current questions based on tab
    const currentQuestions =
        activeTab === "Restaurant Reviews" ? RESTAURANT_QUESTIONS : DISH_QUESTIONS;

    // Fetch hashtags based on star rating
    useEffect(() => {
        if (starRating > 0) {
            fetchHashtags(starRating);
        } else {
            setHashtags([]);
            setSelectedHashtags([]);
        }
    }, [starRating]);

    const fetchHashtags = async (rating) => {
        try {
            const authData = JSON.parse(localStorage.getItem("trofi_user"));
            const token = authData?.token;

            const type = activeTab === "Restaurant Reviews" ? "Restaurant" : "Dish";

            const res = await axios.get(
                `${BASE_URL}/restro/get-hashtags?type=${type}&rating=${rating}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data?.success) {
                const allHashtags = res.data.data || {};
                const selectedStarTags = allHashtags[rating] || []; // ✅ pick only hashtags for the chosen star rating
                setHashtags(selectedStarTags);
            } else {
                setHashtags([]);
            }

        } catch (err) {
            console.error("Hashtag fetch error:", err);
            setHashtags([]);
        }
    };


    // Search for restaurants/dishes with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm.trim()) {
                handleSearch(searchTerm);
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, activeTab]);

    const handleSearch = async (query = "") => {
        try {
            setLoading(true);
            const authData = JSON.parse(localStorage.getItem("trofi_user"));
            const token = authData?.token;

            const endpoint =
                activeTab === "Restaurant Reviews"
                    ? "restro/get-restaurant-dropdown"
                    : "restro/get-dish-dropdown";

            
            const res = await axios.get(`${BASE_URL}/${endpoint}?search=${query}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data?.success) {
                setSearchResults(res.data.data || []);
            } else {
                setSearchResults([]);
            }
        } catch (err) {
            console.error("Search error:", err);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };


    const handleDropdownOpen = async () => {
        // Only fetch if empty to avoid repeat calls
        if (searchResults.length === 0) {
            await handleSearch(""); // empty term means fetch all
        }
    };


    const handleEntitySelect = (entity) => {
        setSelectedEntity(entity);
        setSearchResults([]);
        setSearchTerm(entity.restro_name || entity.dish_name || "");
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 5) {
            toast.warning("Maximum 5 images allowed");
            return;
        }
        setImages((prev) => [...prev, ...files]);
    };

    const removeImage = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleProfileImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Profile image must be less than 5MB");
                return;
            }
            setProfileImage(file);
        }
    };

    const resetForm = () => {
        setSelectedEntity(null);
        setSearchTerm("");
        setStarRating(0);
        setSelectedHashtags([]);
        setAnswers({});
        setComment("");
        setImages([]);
        setDisplayName("");
        setProfileImage(null);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        resetForm();
    };

    const handleSubmit = async () => {
        // Validation
        if (!selectedEntity) {
            toast.error(`Please select a ${activeTab === "Restaurant Reviews" ? "restaurant" : "dish"}`);
            return;
        }
        if (starRating === 0) {
            toast.error("Please select a star rating");
            return;
        }
        if (selectedHashtags.length === 0) {
            toast.error("Please select at least one hashtag");
            return;
        }
        if (!comment.trim()) {
            toast.error("Please add a comment");
            return;
        }

        try {
            setLoading(true);
            const authData = JSON.parse(localStorage.getItem("trofi_user"));
            const token = authData?.token;

            if (!token) {
                toast.error("Please login first");
                navigate("/login");
                return;
            }

            const formData = new FormData();
            formData.append("type", activeTab === "Restaurant Reviews" ? "Restaurant" : "Dish");
            formData.append("typeId", selectedEntity._id);
            formData.append("star_value", starRating);
            formData.append("rating_label", STAR_RATINGS[starRating - 1]?.label || "");
            formData.append("hashTags", JSON.stringify(selectedHashtags));
            formData.append("reviewComment", comment.trim());

            // Prepare tell_us array
            const tellUsData = Object.entries(answers)
                .filter(([_, value]) => value !== null)
                .map(([question, answer]) => ({
                    question,
                    answer: answer === "up",
                }));

            if (tellUsData.length > 0) {
                formData.append("tell_us", JSON.stringify(tellUsData));
            }

            if (displayName.trim()) {
                formData.append("displayName", displayName.trim());
            }

            if (profileImage) {
                formData.append("displayProfileImage", profileImage);
            }

            images.forEach((img) => formData.append("images", img));

            const res = await axios.post(
                `${BASE_URL}/admin/create-admin-rating`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (res.data?.success) {
                toast.success("Review created successfully! ✅");
                navigate("/RestaurantReviewList");
            } else {
                toast.error(res.data?.message || "Failed to create review");
            }
        } catch (err) {
            console.error("Submit error:", err);
            toast.error(err.response?.data?.message || "Error creating review");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="main main_page p-4 md:p-6 min-h-screen duration-900">
            <BreadcrumbsNav
                customTrail={[
                    // { label: "Admin Reviews", path: "/AdminReview" },
                    { label: "Create Review", path: "/CreateReview" },
                ]}
            />
            <PageTitle title="Create Admin Review" />

            {/* Tab Selection */}
            <FilterPills
                active={activeTab}
                onChange={handleTabChange}
                labels={["Restaurant Reviews", "Dish Reviews"]}
            />

            {/* Main Form */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-md border border-gray-200">
                {/* Select Restaurant / Dish Flow */}
                <div className="mb-6">
                    {activeTab === "Restaurant Reviews" ? (
                        <>
                            {/* 🏨 RESTAURANT REVIEWS - only one dropdown */}
                            <label className="block text-gray-700 font-semibold mb-2">
                                Select Restaurant <span className="text-red-500">*</span>
                            </label>

                            {selectedEntity ? (
                                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                                    <div className="flex items-center gap-3">
                                        <MdRestaurant size={24} className="text-orange-500" />
                                        <div>
                                            <p className="font-semibold text-gray-800">{selectedEntity.restro_name}</p>
                                            {selectedEntity.address && (
                                                <p className="text-sm text-gray-600">{selectedEntity.address}</p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSelectedEntity(null);
                                            setSearchTerm("");
                                        }}
                                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm transition"
                                    >
                                        Change
                                    </button>
                                </div>
                            ) : (
                                <Select
                                    onMenuOpen={handleDropdownOpen}
                                    onInputChange={(val) => setSearchTerm(val)}
                                    options={searchResults.map((item) => ({
                                        value: item._id,
                                        label: item.restro_name,
                                    }))}
                                    onChange={(option) => {
                                        const found = searchResults.find((r) => r._id === option.value);
                                        handleEntitySelect(found);
                                    }}
                                    placeholder="Select or search restaurant..."
                                    isLoading={loading}
                                    className="text-sm"
                                />
                            )}
                        </>
                    ) : (
                        <>
                            {/* 🍛 DISH REVIEWS - first restaurant then dish */}
                            <label className="block text-gray-700 font-semibold mb-2">
                                Select Restaurant <span className="text-red-500">*</span>
                            </label>

                            <Select
                                value={
                                    selectedRestaurantForDish
                                        ? { value: selectedRestaurantForDish._id, label: selectedRestaurantForDish.restro_name }
                                        : null
                                }
                                onChange={(option) => {
                                    const found = restaurantList.find((r) => r._id === option.value);
                                    setSelectedRestaurantForDish(found);
                                    setSelectedEntity(null); // reset dish
                                    fetchDishesByRestaurant(found._id);
                                }}
                                onMenuOpen={fetchRestaurants}
                                placeholder="Select or search restaurant..."
                                isLoading={loadingRestaurants}
                                options={restaurantList.map((r) => ({
                                    value: r._id,
                                    label: r.restro_name,
                                }))}
                            />

                            {selectedRestaurantForDish && (
                                <div className="mt-4">
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Select Dish <span className="text-red-500">*</span>
                                    </label>

                                    {selectedEntity ? (
                                        <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                                            <div className="flex items-center gap-3">
                                                <MdFastfood size={24} className="text-orange-500" />
                                                <div>
                                                    <p className="font-semibold text-gray-800">{selectedEntity.dish_name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        Restaurant: {selectedRestaurantForDish.restro_name}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setSelectedEntity(null)}
                                                className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm transition"
                                            >
                                                Change
                                            </button>
                                        </div>
                                    ) : (
                                        <Select
                                            onInputChange={(val) => setDishSearchTerm(val)}
                                            onMenuOpen={() => fetchDishesByRestaurant(selectedRestaurantForDish._id)}
                                            options={dishList.map((dish) => ({
                                                value: dish._id,
                                                label: dish.dish_name,
                                            }))}
                                            onChange={(option) => {
                                                const found = dishList.find((d) => d._id === option.value);
                                                handleEntitySelect(found);
                                            }}
                                            placeholder="Select or search dish..."
                                            isLoading={loadingDishes}
                                            className="text-sm"
                                        />
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>


                {/* Star Rating */}
                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-3">
                        How would you rate this {activeTab === "Restaurant Reviews" ? "restaurant" : "dish"}?
                        <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="flex items-center justify-center gap-3 md:gap-6 flex-wrap py-4">
                        {STAR_RATINGS.map((star) => (
                            <div
                                key={star.value}
                                onMouseEnter={() => setHoverRating(star.value)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setStarRating(star.value)}
                                className="flex flex-col items-center gap-2 cursor-pointer transition-all duration-200 hover:scale-110"
                            >
                                <div className="relative">
                                    <img
                                        src={star.img}
                                        alt={star.label}
                                        className={`w-14 h-14 md:w-20 md:h-20 object-contain transition-all duration-200 ${(hoverRating || starRating) >= star.value
                                            ? "opacity-100 scale-110 drop-shadow-lg"
                                            : "opacity-40 grayscale"
                                            }`}
                                    />
                                </div>
                                <span
                                    className={`text-xs md:text-sm font-medium text-center transition-colors ${starRating === star.value
                                        ? "text-orange-500 font-bold"
                                        : "text-gray-500"
                                        }`}
                                >
                                    {star.label}
                                </span>
                            </div>
                        ))}
                    </div>
                    {starRating > 0 && (
                        <p className="text-sm text-green-600 mt-3 text-center">
                            ✓ You rated: {STAR_RATINGS[starRating - 1]?.label} ({starRating} star{starRating > 1 ? "s" : ""})
                        </p>
                    )}
                </div>

                {/* Hashtags */}
                {starRating > 0 && (
                    <div className="mb-6">
                        <label className="block text-gray-700 font-semibold mb-3">
                            Select Hashtags <span className="text-red-500">*</span>
                        </label>
                        {hashtagsLoading ? (
                            <div className="text-center py-6">
                                <div className="inline-block w-8 h-8 border-4 border-orange-500 border-dashed rounded-full animate-spin"></div>
                                <p className="text-gray-600 mt-2 text-sm">Loading hashtags...</p>
                            </div>
                        ) : hashtags.length > 0 ? (
                            <div className="flex flex-wrap gap-2 md:gap-3">
                                {hashtags.map((tag) => {
                                    const isSelected = selectedHashtags.includes(tag._id);
                                    return (
                                        <button
                                            key={tag._id}
                                            onClick={() =>
                                                setSelectedHashtags((prev) =>
                                                    isSelected ? prev.filter((id) => id !== tag._id) : [...prev, tag._id]
                                                )
                                            }
                                            className={`px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium shadow-sm transition ${isSelected
                                                ? "bg-orange-500 text-white"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                }`}
                                        >
                                            {tag.hashTagTitle}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic text-sm bg-gray-50 p-4 rounded-lg border border-gray-200">
                                No hashtags available for this rating level
                            </p>
                        )}
                        {selectedHashtags.length > 0 && (
                            <p className="text-sm text-green-600 mt-2">
                                ✓ {selectedHashtags.length} hashtag{selectedHashtags.length > 1 ? "s" : ""} selected
                            </p>
                        )}
                    </div>
                )}

                {/* Tell Us More Section */}
                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-3">Tell us more?</label>
                    <div className="space-y-3">
                        {currentQuestions.map((question, idx) => (
                            <div
                                key={idx}
                                className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200"
                            >
                                <span className="text-gray-700 font-medium text-sm md:text-base">{question}</span>
                                <div className="flex gap-2 self-end md:self-auto">
                                    <button
                                        onClick={() =>
                                            setAnswers((prev) => ({
                                                ...prev,
                                                [question]: prev[question] === "up" ? null : "up",
                                            }))
                                        }
                                        className={`p-2 md:p-3 rounded-lg transition ${answers[question] === "up"
                                            ? "bg-green-500 text-white shadow-md"
                                            : "bg-white text-gray-600 hover:bg-green-100 border border-gray-300"
                                            }`}
                                    >
                                        <FaThumbsUp size={16} />
                                    </button>
                                    <button
                                        onClick={() =>
                                            setAnswers((prev) => ({
                                                ...prev,
                                                [question]: prev[question] === "down" ? null : "down",
                                            }))
                                        }
                                        className={`p-2 md:p-3 rounded-lg transition ${answers[question] === "down"
                                            ? "bg-red-500 text-white shadow-md"
                                            : "bg-white text-gray-600 hover:bg-red-100 border border-gray-300"
                                            }`}
                                    >
                                        <FaThumbsDown size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Comment Section */}
                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">
                        How is this {activeTab === "Restaurant Reviews" ? "restaurant" : "dish"}?
                        <span className="text-red-500 ml-1">*</span>
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience... What did you like? What could be improved?"
                        rows={4}
                        maxLength={350}
                        className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                    />
                    <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-500">Min 10 characters</p>
                        <p className="text-sm text-gray-500">
                            {comment.length} / 350 characters
                        </p>
                    </div>
                </div>

                {/* Display Name */}
                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">
                        Display Name (Optional)
                    </label>
                    <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g., Admin Review, Upendra"
                        maxLength={50}
                        className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        This name will be shown publicly with your review
                    </p>
                </div>

                {/* Profile Image Upload */}
                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">
                        Display Profile Image (Optional)
                    </label>
                    <input
                        id="profileImageInput"
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageUpload}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => document.getElementById("profileImageInput").click()}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg shadow hover:bg-orange-600 cursor-pointer transition"
                    >
                        Choose Profile Image
                    </button>
                    {profileImage && (
                        <div className="mt-3 flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <img
                                src={URL.createObjectURL(profileImage)}
                                alt="Profile"
                                className="w-16 h-16 rounded-full object-cover border-2 border-orange-500"
                            />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-700">{profileImage.name}</p>
                                <p className="text-xs text-gray-500">
                                    {(profileImage.size / 1024).toFixed(1)} KB
                                </p>
                            </div>
                            <button
                                onClick={() => setProfileImage(null)}
                                className="text-red-500 hover:text-red-700 text-sm font-medium"
                            >
                                Remove
                            </button>
                        </div>
                    )}
                </div>

                {/* Upload Photos */}
                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">Upload Photos</label>
                    <input
                        id="imageInput"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => document.getElementById("imageInput").click()}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg shadow hover:bg-orange-600 cursor-pointer transition"
                    >
                        Choose Images ({images.length}/5)
                    </button>
                    <p className="text-xs text-gray-500 mt-1">Maximum 5 images, each under 5MB</p>

                    {images.length > 0 && (
                        <div className="flex gap-3 flex-wrap mt-4">
                            {images.map((file, idx) => (
                                <div
                                    key={idx}
                                    className="relative w-20 md:w-24 text-center border rounded-lg shadow-sm bg-gray-50 p-2"
                                >
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={`upload-${idx}`}
                                        className="w-16 md:w-20 h-16 md:h-20 object-cover rounded-md border mx-auto"
                                    />
                                    <p className="text-xs text-gray-600 truncate mt-1">{file.name}</p>
                                    <button
                                        type="button"
                                        onClick={() => removeImage(idx)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 shadow-md transition"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <div className="flex flex-col md:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                        onClick={() => navigate("/RestaurantReviewList")}
                        className="w-full md:w-auto px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full md:w-auto px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Submitting...
                            </>
                        ) : (
                            "Submit Review"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CreateReview;