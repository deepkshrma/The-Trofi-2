import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config/Config";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import PageTitle from "../../components/PageTitle/PageTitle";
import Pagination from "../../components/common/Pagination/Pagination";
import { FaEye, FaTrash } from "react-icons/fa";
import DeleteModel from "../../components/common/DeleteModel/DeleteModel";

const AppFeedback = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // search & filter
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("All");

    // pagination
    const pageSize = 10;
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalRecords: 0,
    });

    // delete modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setSelectedFeedback(null);
    };

    const navigate = useNavigate();

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        setLoading(true);
        setError(null);
        try {
            const authData = JSON.parse(localStorage.getItem("trofi_user"));
            const token = authData?.token;
            if (!token) {
                toast.error("Please login first");
                return;
            }

            const res = await axios.get(`${BASE_URL}/admin/app-feedbacks`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.data.success) {
                setFeedbacks(res.data.data);
                setPagination((p) => ({
                    ...p,
                    totalRecords: res.data.data.length,
                    totalPages: Math.ceil(res.data.data.length / pageSize),
                }));
            } else {
                toast.error(res.data.message || "Failed to fetch feedbacks");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to fetch feedbacks");
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!selectedFeedback) return;
        try {
            const authData = JSON.parse(localStorage.getItem("trofi_user"));
            const token = authData?.token;
            if (!token) {
                toast.error("Please login first");
                return;
            }

            const res = await axios.delete(
                `${BASE_URL}/admin/app-feedbacks/${selectedFeedback._id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (res.data.success) {
                toast.success("Feedback deleted successfully");
                fetchFeedbacks();
            } else {
                toast.error(res.data.message || "Delete failed");
            }
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong while deleting");
        } finally {
            closeDeleteModal();
        }
    };

    // filter + search
    const filteredFeedbacks = feedbacks.filter((f) => {
        const matchType =
            filterType === "All" ? true : f.feedbackType.includes(filterType);
        const matchSearch =
            f.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
            f.message?.toLowerCase().includes(search.toLowerCase()) ||
            f.userId?.email?.toLowerCase().includes(search.toLowerCase());
        return matchType && matchSearch;
    });

    // pagination slice
    const start = (pagination.currentPage - 1) * pageSize;
    const paginated = filteredFeedbacks.slice(start, start + pageSize);

    return (
        <>
            <div className="main main_page p-6 duration-900">
                <BreadcrumbsNav
                    customTrail={[{ label: "App Feedbacks", path: "/AppFeedback" }]}
                />

                <div className="flex justify-between items-center mb-3">
                    <PageTitle title="App Feedbacks" />
                </div>

                {/* search + filter */}
                <div className="flex flex-wrap gap-4 mb-5">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by user, email, or message..."
                        className="px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-orange-300 outline-none"
                    />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-orange-300 outline-none"
                    >
                        <option value="All">All Types</option>
                        <option value="AppFeature">App Feature</option>
                        <option value="GeneralFeedback">General Feedback</option>
                        <option value="BugReport">Bug Report</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div className="overflow-x-auto bg-white rounded-2xl shadow-md pb-3">
                    {loading ? (
                        <div className="text-center p-6">Loading Feedbacks…</div>
                    ) : error ? (
                        <div className="text-center p-6 text-red-500">Error: {error}</div>
                    ) : (
                        <>
                            <table className="min-w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-200 text-left text-gray-700">
                                        <th className="p-3 pl-4">S.No.</th>
                                        <th className="p-3">User</th>
                                        <th className="p-3">Email</th>
                                        <th className="p-3">Feedback Type</th>
                                        <th className="p-3">Message</th>
                                        <th className="p-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginated.length > 0 ? (
                                        paginated.map((f, index) => (
                                            <tr
                                                key={f._id}
                                                className="border-b border-gray-300 hover:bg-orange-50 transition"
                                            >
                                                <td className="p-3 pl-4 font-medium text-gray-700">
                                                    {start + index + 1}
                                                </td>
                                                <td className="p-3 text-gray-700">
                                                    {f.userId?.name || "N/A"}
                                                </td>
                                                <td className="p-3 text-gray-500">
                                                    {f.userId?.email || "N/A"}
                                                </td>
                                                <td className="p-3 text-gray-500">
                                                    {f.feedbackType.join(", ")}
                                                </td>
                                                <td className="p-3 text-gray-500 max-w-xs truncate">
                                                    {f.message}
                                                </td>
                                                <td className="flex p-3">
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() =>
                                                                navigate(`/AppFeedback/${f._id}`)
                                                            }
                                                            className="flex justify-center items-center cursor-pointer bg-blue-500 hover:bg-blue-600 text-white w-8 h-8 rounded"
                                                        >
                                                            <FaEye size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedFeedback(f);
                                                                setShowDeleteModal(true);
                                                            }}
                                                            className="flex justify-center items-center cursor-pointer bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded"
                                                        >
                                                            <FaTrash size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="6"
                                                className="text-center p-6 text-gray-500 italic"
                                            >
                                                No Feedbacks found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            <Pagination
                                currentPage={pagination.currentPage}
                                totalItems={filteredFeedbacks.length}
                                itemsPerPage={pageSize}
                                onPageChange={(page) =>
                                    setPagination((p) => ({ ...p, currentPage: page }))
                                }
                                totalPages={Math.ceil(filteredFeedbacks.length / pageSize)}
                                type="frontend"
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Delete Modal */}
            <DeleteModel
                isOpen={showDeleteModal}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
                redbutton="Confirm"
                para="Do you really want to delete this Feedback? This action cannot be undone."
            />
        </>
    );
};

export default AppFeedback;
