import React, { useState, useEffect, useRef } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/common/Pagination/Pagination";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import { CiExport } from "react-icons/ci";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";
import { MdEdit } from "react-icons/md";
import { BASE_URL, IMAGE_URL } from "../../config/Config";
import { FaUtensils, FaCheckCircle, FaHourglassHalf, FaTrashAlt, FaCommentDots } from "react-icons/fa";
import { FiFilter } from "react-icons/fi";
import guest from "../../assets/images/guest.png";
import { STAR_RATINGS } from "../../config/hashtagconfig";
import starDefault from "../../assets/images/untitled_folder_6/star0.jfif";


function RatingDropdown({ ratingFilter, setRatingFilter }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // close on outside click
    useEffect(() => {
        function handleClick(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const selected = ratingFilter ? STAR_RATINGS[Number(ratingFilter) - 1] : null;

    const handleSelect = (val) => {
        setRatingFilter(val);
        setOpen(false);
    };

    const clear = (e) => {
        e.stopPropagation();
        setRatingFilter("");
        setOpen(false);
    };



    return (
        <div className="relative" ref={ref}>
            {/* Selected area */}
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex items-center justify-between w-56 md:w-48 lg:w-56 px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white cursor-pointer"
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                {selected ? (
                    <div className="flex items-center gap-2">
                        <img src={selected.img} alt={selected.label} className="w-6 h-6" />
                        <span className="text-sm">{`${Number(ratingFilter)} - ${selected.label}`}</span>
                    </div>
                ) : (
                    <span className="text-sm text-gray-500">All Ratings</span>
                )}

                <div className="flex items-center gap-2">
                    {selected && (
                        <button
                            onClick={clear}
                            className="text-gray-400 hover:text-gray-700 text-sm"
                            title="Clear"
                        >
                            ✕
                        </button>
                    )}
                    <span className="text-gray-400">▾</span>
                </div>
            </button>

            {/* Dropdown list */}
            {open && (
                <ul
                    role="listbox"
                    className="absolute z-50 mt-1 w-56 md:w-48 lg:w-56 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-auto"
                >
                    <li
                        onClick={() => handleSelect("")}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm text-gray-700"
                    >
                        All Ratings
                    </li>

                    {STAR_RATINGS.map((star, idx) => (
                        <li
                            key={idx}
                            onClick={() => handleSelect(String(idx + 1))}
                            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
                        >
                            <img src={star.img} alt={star.label} className="w-6 h-6" />
                            <span className="text-sm">{`${idx + 1} • ${star.label}`}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}


function RestaurantDishes() {
    const navigate = useNavigate();

    // -------- State --------
    const [dishes, setDishes] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [categories, setCategories] = useState([]);
    const [selectedRating, setSelectedRating] = useState("");

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
        totalRecords: 0,
    });

    // -------- Fetch Dishes --------
    const fetchDishes = async (page = 1) => {
        try {
            const authData = JSON.parse(localStorage.getItem("trofi_user"));
            const token = authData?.token;

            if (!token) {
                toast.error("Please login first");
                return;
            }
            setLoading(true);
            const { data } = await axios.get(`${BASE_URL}/restrowner/restrowner-dishes`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: { page, limit: pagination.pageSize },
            });

            setDishes(data.data);
            setPagination((prev) => ({
                ...prev,
                currentPage: page,
                totalPages: Math.ceil(data.count / prev.pageSize),
                totalRecords: data.count,
            }));

            // Extract unique categories for filter dropdown
            const uniqueCategories = [
                ...new Set(data.data.map((dish) => dish.dish_category.category_name)),
            ];
            setCategories(uniqueCategories);
        } catch (err) {
            console.error("Failed to fetch dishes:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDishes(1);
    }, []);

    // -------- Filters --------
    const filteredDishes = dishes
        .filter((dish) =>
            dish.dish_name.toLowerCase().includes(search.toLowerCase())
        )
        .filter((dish) =>
            selectedCategory ? dish.dish_category.category_name === selectedCategory : true
        )
        .filter((dish) =>
            selectedRating ? dish.avgRating >= Number(selectedRating) : true
        );

    // -------- Export --------
    const handleExport = () => {
        const exportData = filteredDishes.map((dish, index) => ({
            "S.No.": (pagination.currentPage - 1) * pagination.pageSize + (index + 1),
            Name: dish.dish_name,
            Category: dish.dish_category.category_name,
            SubCategory: dish.dish_sub_category.sub_categ_name,
            Type: dish.dish_type.name,
            Price: dish.price,
            Rating: dish.avgRating,
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Dishes");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const fileData = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(fileData, "RestaurantDishes.xlsx");
    };

    return (
        <div className="main main_page p-6 min-h-screen duration-900">
            <BreadcrumbsNav customTrail={[{ label: "Restaurant Dishes", path: "/restaurant-dishes" }]} />

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <PageTitle title={"Restaurant Dishes"} />
                <button
                    className="flex items-center gap-2 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg cursor-pointer"
                    style={{ backgroundColor: "#F9832B" }}
                    onClick={() => navigate(`/AddDishesRestro`)}
                >
                    <PlusCircle size={18} /> Add Dish
                </button>
            </div>

            {/* Filters & Search */}
            <div className="flex justify-between items-center mb-4">
                <input
                    type="text"
                    placeholder="Search by dish name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border border-gray-300 bg-white p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] outline-none w-64"
                />

                <div className="flex items-center gap-3">
                    {/* Category Filter */}
                    <select
                        className="border border-gray-300 bg-white p-2 rounded-lg shadow-sm outline-none"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    {/* Rating Filter */}
                    <RatingDropdown
                        ratingFilter={selectedRating}
                        setRatingFilter={setSelectedRating}
                    />

                    {/* Export Button */}
                    <button
                        className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md border border-gray-300 text-gray-600 hover:shadow-lg cursor-pointer"
                        onClick={handleExport}
                    >
                        <CiExport size={20} /> Export
                    </button>
                </div>

            </div>

            {/* Table */}
            <div className="bg-white shadow-md rounded-xl border border-gray-200 overflow-x-auto pb-3">

                {/* Loading State */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 border-4 border-[#F9832B] border-dashed rounded-full animate-spin"></div>
                        <p className="mt-4 text-gray-700 font-medium text-lg">Loading restaurant dishes...</p>
                    </div>
                ) : filteredDishes.length === 0 ? (
                    /* No Dishes Found State */
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500 italic">
                        No dishes found.
                    </div>
                ) : (
                    /* Table with Dishes */
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-200 text-left text-gray-700">
                                <th className="p-3 border-b border-gray-300">S.No.</th>
                                <th className="p-3 border-b border-gray-300">Image</th>
                                <th className="p-3 border-b border-gray-300">Dish Name</th>
                                <th className="p-3 border-b border-gray-300">Category</th>
                                <th className="p-3 border-b border-gray-300">Type</th>
                                <th className="p-3 border-b border-gray-300">Price (₹)</th>
                                <th className="p-3 border-b border-gray-300">Rating</th>
                                <th className="p-3 border-b border-gray-300">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDishes.map((dish, index) => (
                                <tr key={dish._id} className="hover:bg-gray-50 transition text-gray-700">
                                    <td className="p-3 border-b border-gray-200">
                                        {(pagination.currentPage - 1) * pagination.pageSize + (index + 1)}
                                    </td>
                                    <td className="p-3 border-b border-gray-200">
                                        <img
                                            src={`${IMAGE_URL}/${dish.dish_images?.[0] || ""}`}
                                            alt={dish.dish_name}
                                            className="w-12 h-12 rounded-md object-cover"
                                            onError={(e) => (e.target.src = guest)}
                                        />
                                    </td>
                                    <td
                                        className="p-3 border-b border-gray-200 font-medium text-[#F9832B] hover:underline cursor-pointer"
                                        onClick={() => navigate(`/RestroDishDetails/${dish._id}`)}
                                    >
                                        {dish.dish_name}
                                    </td>

                                    <td className="p-3 border-b border-gray-200">{dish.dish_category.category_name}</td>
                                    <td className="p-3 border-b border-gray-200">{dish.dish_type.name}</td>
                                    <td className="p-3 border-b border-gray-200">₹{dish.price}</td>
                                    <td className="p-3 border-b border-gray-200">
                                        <img
                                            src={STAR_RATINGS[Math.round(dish.avgRating) - 1]?.img || starDefault}
                                            alt={STAR_RATINGS[Math.round(dish.avgRating) - 1]?.label || "star"}
                                            className="w-6 h-6 md:w-8 md:h-8"
                                        />
                                    </td>
                                    <td className="p-3 border-b border-gray-200 flex items-center gap-2">
                                        <button
                                            className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500 text-white cursor-pointer hover:bg-green-600"
                                            onClick={() => navigate(`/UpdateDishes/${dish._id}`)}
                                        >
                                            <MdEdit size={16} />
                                        </button>
                                        <button
                                            className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500 text-white cursor-pointer hover:bg-orange-600"
                                            onClick={() => navigate(`/SingleDishReview/${dish._id}`)}
                                            title="View Reviews"
                                        >
                                            <FaCommentDots size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Pagination */}
                {!loading && filteredDishes.length > 0 && (
                    <Pagination
                        currentPage={pagination.currentPage}
                        totalItems={pagination.totalRecords}
                        itemsPerPage={pagination.pageSize}
                        onPageChange={fetchDishes}
                        totalPages={pagination.totalPages}
                        type="backend"
                    />
                )}
            </div>

        </div>
    );
}

export default RestaurantDishes;
