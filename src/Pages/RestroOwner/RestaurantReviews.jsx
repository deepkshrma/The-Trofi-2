// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";
// import { BASE_URL, IMAGE_URL } from "../../config/Config";
// import PageTitle from "../../components/PageTitle/PageTitle";
// import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
// import { STAR_RATINGS } from "../../config/hashtagconfig";
// import { toast } from "react-toastify";
// import Pagination from "../../components/common/Pagination/Pagination";
// import guest from "../../assets/images/guest.png";
// import starDefault from "../../assets/images/untitled_folder_6/star0.jfif";

// // Filter Pills Component
// const FilterPills = ({ active, onChange, labels = ["Restaurant Reviews", "Dish Reviews"], counts = {} }) => (
//   <div className="inline-flex items-center rounded-full bg-gray-100 p-1 mb-6">
//     {labels.map((label) => (
//       <button
//         key={label}
//         onClick={() => onChange(label)}
//         className={`px-4 py-2 text-sm rounded-full transition cursor-pointer font-medium ${
//           active === label
//             ? "bg-orange-500 text-white shadow-md"
//             : "text-gray-600 hover:text-gray-900"
//         }`}
//         type="button"
//       >
//         {label} ({counts[label] || 0})
//       </button>
//     ))}
//   </div>
// );

// // Review Card Component (Reusable)
// const ReviewCard = ({ review }) => {
//   const ratingIndex = Math.max(0, (review.star_value || 1) - 1);

//   return (
//     <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl transition duration-300 flex flex-col lg:flex-row gap-6">
//       {/* Left Column: User info + review comment */}
//       <div className="flex flex-col lg:w-1/2 gap-4">
//         {/* User Info */}
//         <div className="flex items-center gap-3">
//           <img
//             src={guest}
//             alt="Anonymous"
//             className="w-12 h-12 rounded-full object-cover"
//           />
//           <div>
//             <h3 className="font-medium text-gray-800">Anonymous</h3>
//             <p className="text-gray-500 text-sm">
//               {new Date(review.createdAt).toLocaleDateString()} •{" "}
//               {new Date(review.createdAt).toLocaleTimeString([], {
//                 hour: "2-digit",
//                 minute: "2-digit",
//               })}
//             </p>
//           </div>
//         </div>

//         {/* Star Rating */}
//         {review.is_rating_view && (
//           <div className="flex items-center gap-2">
//             <img
//               src={STAR_RATINGS[ratingIndex]?.img || starDefault}
//               alt={STAR_RATINGS[ratingIndex]?.label || "star"}
//               className="w-6 h-6"
//             />
//             <span className="text-gray-700 font-medium">
//               {review.star_value || 0} • {review.rating_label || "No label"}
//             </span>
//           </div>
//         )}

//         {/* Review Comment (User Notes) */}
//         {review.is_comment_view && review.reviewComment && (
//           <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
//             <h4 className="font-medium text-gray-700 mb-1">User Notes:</h4>
//             <p className="text-gray-700">{review.reviewComment}</p>
//           </div>
//         )}

//         {/* Admin Notes */}
//         {review.notes && (
//           <div className="bg-gray-100 p-3 rounded-lg border border-gray-200">
//             <h4 className="font-medium text-gray-700 mb-1">Admin Notes:</h4>
//             <p className="text-gray-700">{review.notes}</p>
//           </div>
//         )}
//       </div>

//       {/* Right Column: Hashtags, Tell Us, Images */}
//       <div className="flex flex-col lg:w-1/2 gap-4">
//         {/* Hashtags */}
//         {review.is_hashtag_view && review.hashTags?.length > 0 && (
//           <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
//             <h4 className="font-medium text-gray-700 mb-2">Hashtags:</h4>
//             <div className="flex flex-wrap gap-2">
//               {review.hashTags.map((tag) => (
//                 <span
//                   key={tag._id}
//                   className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm"
//                 >
//                   {tag.hashTagTitle}
//                 </span>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Tell Us Q&A */}
//         {review.tell_us?.length > 0 && (
//           <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
//             <h4 className="font-medium text-gray-700 mb-2">Tell Us:</h4>
//             {review.tell_us.map((q, idx) => (
//               <div
//                 key={idx}
//                 className="flex items-center justify-between text-gray-700 mb-1"
//               >
//                 <span className="font-medium">{q.question}</span>
//                 <span
//                   className={
//                     q.answer
//                       ? "text-green-600 font-medium"
//                       : "text-red-500 font-medium"
//                   }
//                 >
//                   {q.answer ? "Yes" : "No"}
//                 </span>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Review Images */}
//         {review.images?.length > 0 && (
//           <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
//             <h4 className="font-medium text-gray-700 mb-2">Review Images:</h4>
//             <div className="flex flex-wrap gap-3">
//               {review.images.map((img) => (
//                 <img
//                   key={img._id}
//                   src={`${IMAGE_URL}/${img.image}`}
//                   alt="review"
//                   className="w-28 h-28 md:w-32 md:h-32 rounded-lg object-cover border border-gray-200"
//                 />
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// function RestaurantReviews() {
//   const { restroId } = useParams();
//   const [activeTab, setActiveTab] = useState("Restaurant Reviews");
//   const [restroReviews, setRestroReviews] = useState([]);
//   const [dishReviews, setDishReviews] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [counts, setCounts] = useState({ "Restaurant Reviews": 0, "Dish Reviews": 0 });
//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     totalPages: 1,
//     pageSize: 5,
//     totalRecords: 0,
//   });

//   const fetchReviews = async (page = 1, type = "Restaurant") => {
//     try {
//       setLoading(true);
//       const authData = JSON.parse(localStorage.getItem("trofi_user"));
//       const token = authData?.token;

//       if (!token) {
//         toast.error("Please login first");
//         return;
//       }

//       const { data } = await axios.get(`${BASE_URL}/restrowner/restrowner-ratings`, {
//         headers: { Authorization: `Bearer ${token}` },
//         params: {
//           type,
//           typeId: restroId,
//           page,
//           limit: pagination.pageSize,
//         },
//       });

//       if (type === "Restaurant") {
//         setRestroReviews(data.data);
//         setCounts((prev) => ({ ...prev, "Restaurant Reviews": data.count }));
//       } else {
//         setDishReviews(data.data);
//         setCounts((prev) => ({ ...prev, "Dish Reviews": data.count }));
//       }

//       setPagination((prev) => ({
//         ...prev,
//         currentPage: page,
//         totalPages: Math.ceil(data.count / prev.pageSize),
//         totalRecords: data.count,
//       }));
//     } catch (err) {
//       console.error("Failed to fetch reviews:", err);
//       toast.error("Error fetching reviews");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     // Fetch both types on component mount
//     fetchReviews(1, "Restaurant");
//     fetchReviews(1, "Dish");
//   }, [restroId]);

//   const handleTabChange = (tab) => {
//     setActiveTab(tab);
//     setPagination((prev) => ({ ...prev, currentPage: 1 }));
//     fetchReviews(1, tab === "Restaurant Reviews" ? "Restaurant" : "Dish");
//   };

//   const handlePageChange = (page) => {
//     const type = activeTab === "Restaurant Reviews" ? "Restaurant" : "Dish";
//     fetchReviews(page, type);
//   };

//   const currentReviews = activeTab === "Restaurant Reviews" ? restroReviews : dishReviews;

//   return (
//     <div className="main main_page p-6 min-h-screen duration-900">
//       <BreadcrumbsNav customTrail={[{ label: "Reviews", path: "/reviews" }]} />
//       <PageTitle title="Reviews" />

//       {/* Filter Pills - Toggle between Restaurant and Dish Reviews */}
//       <FilterPills
//         active={activeTab}
//         onChange={handleTabChange}
//         labels={["Restaurant Reviews", "Dish Reviews"]}
//         counts={counts}
//       />

//       {loading ? (
//         <div className="flex items-center justify-center min-h-[50vh]">
//           <div className="flex flex-col items-center">
//             <div className="w-16 h-16 border-4 border-[#F9832B] border-dashed rounded-full animate-spin"></div>
//             <p className="mt-4 text-gray-700 font-bold text-lg">Loading reviews...</p>
//           </div>
//         </div>
//       ) : currentReviews.length === 0 ? (
//         <div className="text-center p-6 text-gray-500 italic">
//           No {activeTab.toLowerCase()} found.
//         </div>
//       ) : (
//         <div className="grid gap-6 mt-6">
//           {currentReviews.map((review) => (
//             <ReviewCard key={review._id} review={review} />
//           ))}

//           {/* Pagination */}
//           <Pagination
//             currentPage={pagination.currentPage}
//             totalItems={pagination.totalRecords}
//             itemsPerPage={pagination.pageSize}
//             onPageChange={handlePageChange}
//             totalPages={pagination.totalPages}
//             type="backend"
//           />
//         </div>
//       )}
//     </div>
//   );
// }

// export default RestaurantReviews;

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL, IMAGE_URL } from "../../config/Config";
import PageTitle from "../../components/PageTitle/PageTitle";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import { STAR_RATINGS } from "../../config/hashtagconfig";
import { toast } from "react-toastify";
import Pagination from "../../components/common/Pagination/Pagination";
import guest from "../../assets/images/guest.png";
import starDefault from "../../assets/images/untitled_folder_6/star0.jfif";
import { FiFilter } from "react-icons/fi";
import { CiExport } from "react-icons/ci";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaStar, FaEye } from "react-icons/fa";

// Filter Pills Component
const FilterPills = ({ active, onChange, labels = ["Restaurant Reviews", "Dish Reviews"], counts = {} }) => (
  <div className="inline-flex items-center rounded-full bg-gray-100 p-1 mb-6">
    {labels.map((label) => (
      <button
        key={label}
        onClick={() => onChange(label)}
        className={`px-4 py-2 text-sm rounded-full transition cursor-pointer font-medium ${
          active === label
            ? "bg-orange-500 text-white shadow-md"
            : "text-gray-600 hover:text-gray-900"
        }`}
        type="button"
      >
        {label} ({counts[label] || 0})
      </button>
    ))}
  </div>
);

function RestaurantReviews() {
  const { restroId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Restaurant Reviews");
  const [restroReviews, setRestroReviews] = useState([]);
  const [dishReviews, setDishReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({ "Restaurant Reviews": 0, "Dish Reviews": 0 });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalRecords: 0,
  });

  // Filter states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedStars, setSelectedStars] = useState([]);
  const [search, setSearch] = useState("");

  const fetchReviews = async (page = 1, type = "Restaurant") => {
    try {
      setLoading(true);
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;

      if (!token) {
        toast.error("Please login first");
        return;
      }

      const params = {
        type,
        typeId: restroId,
        page,
        limit: pagination.pageSize,
      };

      // Add filters
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (selectedStars.length > 0) params.stars = selectedStars.join(",");
      if (search) params.search = search;

      const { data } = await axios.get(`${BASE_URL}/restrowner/restrowner-ratings`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      if (type === "Restaurant") {
        setRestroReviews(data.data);
        setCounts((prev) => ({ ...prev, "Restaurant Reviews": data.count }));
      } else {
        setDishReviews(data.data);
        setCounts((prev) => ({ ...prev, "Dish Reviews": data.count }));
      }

      setPagination((prev) => ({
        ...prev,
        currentPage: page,
        totalPages: Math.ceil(data.count / prev.pageSize),
        totalRecords: data.count,
      }));
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      toast.error("Error fetching reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1, "Restaurant");
    fetchReviews(1, "Dish");
  }, [restroId]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    fetchReviews(1, tab === "Restaurant Reviews" ? "Restaurant" : "Dish");
  };

  const handlePageChange = (page) => {
    const type = activeTab === "Restaurant Reviews" ? "Restaurant" : "Dish";
    fetchReviews(page, type);
  };

  const handleApplyFilters = () => {
    setShowFilterModal(false);
    const type = activeTab === "Restaurant Reviews" ? "Restaurant" : "Dish";
    fetchReviews(1, type);
  };

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSelectedStars([]);
    setSearch("");
    setShowFilterModal(false);
    const type = activeTab === "Restaurant Reviews" ? "Restaurant" : "Dish";
    fetchReviews(1, type);
  };

  const handleStarToggle = (star) => {
    setSelectedStars((prev) =>
      prev.includes(star) ? prev.filter((s) => s !== star) : [...prev, star]
    );
  };

  const handleExport = () => {
    const currentReviews = activeTab === "Restaurant Reviews" ? restroReviews : dishReviews;
    const exportData = currentReviews.map((review, index) => ({
      "S.No.": (pagination.currentPage - 1) * pagination.pageSize + (index + 1),
      "Date": new Date(review.createdAt).toLocaleDateString(),
      "Rating": review.star_value || "N/A",
      "Comment": review.reviewComment || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reviews");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const fileData = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(fileData, `${activeTab}_Reviews.xlsx`);
  };

  const currentReviews = activeTab === "Restaurant Reviews" ? restroReviews : dishReviews;

  return (
    <div className="main main_page p-6 min-h-screen duration-900">
      <BreadcrumbsNav customTrail={[{ label: "Reviews", path: "/reviews" }]} />
      <PageTitle title="Reviews" />

      <FilterPills
        active={activeTab}
        onChange={handleTabChange}
        labels={["Restaurant Reviews", "Dish Reviews"]}
        counts={counts}
      />

      {/* Search & Filter Bar */}
      <div className="bg-white shadow-md rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex w-full md:w-auto gap-2">
            <input
              type="text"
              placeholder="Search by comment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const type = activeTab === "Restaurant Reviews" ? "Restaurant" : "Dish";
                  fetchReviews(1, type);
                }
              }}
              className="border border-gray-300 bg-white p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] outline-none w-full md:w-64"
            />
            <button
              onClick={() => {
                const type = activeTab === "Restaurant Reviews" ? "Restaurant" : "Dish";
                fetchReviews(1, type);
              }}
              className="px-4 py-2 rounded-lg bg-[#F9832B] text-white cursor-pointer hover:bg-[#e67600] shadow-md"
            >
              Search
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md border border-gray-300 text-gray-600 hover:shadow-lg cursor-pointer"
              onClick={() => setShowFilterModal(true)}
            >
              <FiFilter size={20} /> Filter
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md border border-gray-300 text-gray-600 hover:shadow-lg cursor-pointer"
              onClick={handleExport}
            >
              <CiExport size={20} /> Export
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-md rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-[#F9832B] border-dashed rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-700 font-bold text-lg">Loading reviews...</p>
            </div>
          </div>
        ) : currentReviews.length === 0 ? (
          <div className="text-center p-6 text-gray-500 italic">
            No {activeTab.toLowerCase()} found.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200 text-left text-gray-700">
                    <th className="p-3 border-b border-gray-300">S.No.</th>
                    <th className="p-3 border-b border-gray-300">Image</th>
                    <th className="p-3 border-b border-gray-300">Rating</th>
                    <th className="p-3 border-b border-gray-300">Comments</th>
                    <th className="p-3 border-b border-gray-300">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentReviews.map((review, index) => {
                    const ratingIndex = Math.max(0, (review.star_value || 1) - 1);
                    const firstImage = review.images?.[0]?.image;
                    
                    return (
                      <tr
                        key={review._id}
                        className="hover:bg-gray-50 transition text-gray-700 border-b border-gray-100"
                      >
                        <td className="p-3">
                          {(pagination.currentPage - 1) * pagination.pageSize + (index + 1)}
                        </td>
                        <td className="p-3">
                          {firstImage ? (
                            <img
                              src={`${IMAGE_URL}/${firstImage}`}
                              alt="Review"
                              className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                              onError={(e) => (e.target.src = guest)}
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No Image</span>
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          {review.is_rating_view && (
                            <div className="flex items-center gap-2">
                              <img
                                src={STAR_RATINGS[ratingIndex]?.img || starDefault}
                                alt="rating"
                                className="w-8 h-8"
                              />
                              <div>
                                <div className="font-semibold text-gray-800">
                                  {review.star_value || 0} Star
                                </div>
                                <div className="text-xs text-gray-500">
                                  {review.rating_label || "No label"}
                                </div>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="p-3 max-w-md">
                          {review.is_comment_view && review.reviewComment ? (
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {review.reviewComment}
                            </p>
                          ) : (
                            <span className="text-gray-400 italic text-sm">No comment</span>
                          )}
                        </td>
                        <td className="p-3">
                          <button
                            className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500 text-white cursor-pointer hover:bg-blue-600 transition"
                            onClick={() => navigate(`/ReviewDetails/${review._id}`)}
                            title="View Details"
                          >
                            <FaEye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={pagination.currentPage}
              totalItems={pagination.totalRecords}
              itemsPerPage={pagination.pageSize}
              onPageChange={handlePageChange}
              totalPages={pagination.totalPages}
              type="backend"
            />
          </>
        )}
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Apply Filters</h2>

              <div className="space-y-4">
                {/* Date Range */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none"
                  />
                </div>

                {/* Star Rating Filter */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Star Rating</label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleStarToggle(star)}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg border cursor-pointer transition ${
                          selectedStars.includes(star)
                            ? "bg-orange-500 text-white border-orange-500"
                            : "bg-white text-gray-700 border-gray-300 hover:border-orange-500"
                        }`}
                      >
                        <FaStar size={14} />
                        <span className="text-sm font-medium">{star}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer"
                  onClick={handleClearFilters}
                >
                  Clear
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-[#F9832B] text-white hover:bg-[#e67600] cursor-pointer"
                  onClick={handleApplyFilters}
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

export default RestaurantReviews;