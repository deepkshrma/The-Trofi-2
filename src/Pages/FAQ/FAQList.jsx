import React, { useState, useEffect } from "react";
import Pagination from "../../components/common/Pagination/Pagination";
import { BASE_URL } from "../../config/Config";
import { useNavigate } from "react-router-dom";
import DeleteModel from "../../components/common/DeleteModel/DeleteModel";
import PageTitle from "../../components/PageTitle/PageTitle";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import { MdEdit } from "react-icons/md";
import { PlusCircle } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { FaTrash, FaEye } from "react-icons/fa";

const FAQList = () => {
    const [faqs, setFaqs] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const pageSize = 10;
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalRecords: 0,
    });

    // delete modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedFAQ, setSelectedFAQ] = useState(null);

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setSelectedFAQ(null);
    };

    const navigate = useNavigate();

    // Fetch FAQs
    useEffect(() => {
        fetchFAQs();
    }, []);

    async function fetchFAQs() {
        setLoading(true);
        setError(null);
        try {
            const authData = JSON.parse(localStorage.getItem("trofi_user"));
            const token = authData?.token;
            if (!token) {
                toast.error("Please login first");
                return;
            }
            const res = await fetch(`${BASE_URL}/admin/faq`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const json = await res.json();
            if (!json?.success) throw new Error(json.message || "API Error");

            setFaqs(json.data);
            setPagination((p) => ({
                ...p,
                totalRecords: json.data.length,
                totalPages: Math.ceil(json.data.length / pageSize),
            }));
        } catch (err) {
            setError(err.message || "Failed to fetch FAQs");
        } finally {
            setLoading(false);
        }
    }

    // delete confirm handler
    const confirmDelete = async () => {
        if (!selectedFAQ) return;
        try {
            const authData = JSON.parse(localStorage.getItem("trofi_user"));
            const token = authData?.token;
            if (!token) {
                toast.error("Please login first");
                return;
            }

            const payload = {
                id: selectedFAQ._id,
                title: selectedFAQ.title,
                description: selectedFAQ.description,
                status: selectedFAQ.status,
                action: "delete",
            };

            const res = await axios.post(`${BASE_URL}/admin/faq`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (res.data.success) {
                toast.success("FAQ deleted successfully");
                fetchFAQs();
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

    // Search filter
    const filtered = faqs.filter((faq) =>
        faq.title.toLowerCase().includes(search.toLowerCase())
    );

    // Pagination slice
    const start = (pagination.currentPage - 1) * pageSize;
    const paginated = filtered.slice(start, start + pageSize);

    return (
        <>
            <div className="main main_page p-6 duration-900">
                <BreadcrumbsNav
                    customTrail={[{ label: "FAQs List", path: "/FAQList" }]}
                />
                <div className="flex justify-between items-center mb-3">
                    <PageTitle title={"FAQ List"} />
                    <button
                        className="flex items-center gap-2 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg cursor-pointer"
                        style={{ backgroundColor: "#F9832B" }}
                        onClick={() => navigate("/CreateFAQ")}
                    >
                        <PlusCircle size={18} /> Add FAQ
                    </button>
                </div>

                <div className="overflow-x-auto bg-white rounded-2xl shadow-md pb-3 mt-5">
                    {/* 🔍 Search */}
                    <div className="flex justify-between items-center m-3">
                        <input
                            type="text"
                            placeholder="Search by title..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="border border-gray-300 bg-white p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] outline-none w-64"
                        />
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="text-center p-6">Loading FAQs…</div>
                    ) : error ? (
                        <div className="text-center p-6 text-red-500">Error: {error}</div>
                    ) : (
                        <>
                            <table className="min-w-full border-collapse text-sm sm:text-base">
                                <thead>
                                    <tr className="bg-gray-200 text-left text-gray-700">
                                        <th className="p-3 pl-4 text-center">S.No.</th>
                                        <th className="p-3">Title</th>
                                        <th className="p-3">Description</th>
                                        <th className="p-3 text-center">Status</th>
                                        <th className="p-3 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginated.length > 0 ? (
                                        paginated.map((faq, index) => (
                                            <tr
                                                key={faq._id}
                                                className="border-b border-gray-300 hover:bg-orange-50 transition"
                                            >
                                                <td className="p-3 pl-4 font-medium text-gray-700 text-center">
                                                    {start + index + 1}
                                                </td>
                                                <td className="p-3 text-gray-700">{faq.title}</td>
                                                <td className="p-3 text-gray-500">
                                                    {faq.description.replace(/<[^>]+>/g, "").slice(0, 50)}...
                                                </td>
                                                <td className="p-3 text-center">
                                                    <span
                                                        className={`inline-block rounded-full px-3 py-1 text-[13px] sm:text-[14px] capitalize ${faq.status === "active"
                                                            ? "bg-green-100 text-green-600 font-semibold"
                                                            : "bg-red-100 text-red-600 font-semibold"
                                                            }`}
                                                    >
                                                        {faq.status}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-center">
                                                    <div className="flex justify-center gap-2 sm:gap-3">
                                                        <button
                                                            onClick={() => navigate(`/FAQInDetail/${faq._id}`)}
                                                            className="flex justify-center items-center cursor-pointer bg-blue-500 hover:bg-blue-600 text-white w-8 h-8 rounded"
                                                        >
                                                            <FaEye size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                navigate("/CreateFAQ", { state: { faq } })
                                                            }
                                                            className="flex items-center gap-1 justify-center w-8 h-8 rounded-lg bg-green-500 text-white cursor-pointer hover:bg-green-600 whitespace-nowrap"
                                                        >
                                                            <MdEdit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedFAQ(faq);
                                                                setShowDeleteModal(true);
                                                            }}
                                                            className="flex justify-center items-center cursor-pointer bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded"
                                                        >
                                                            <FaTrash size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="5"
                                                className="text-center p-6 text-gray-500 italic"
                                            >
                                                No FAQ found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>


                            {/* Pagination */}
                            <Pagination
                                currentPage={pagination.currentPage}
                                totalItems={filtered.length}
                                itemsPerPage={pageSize}
                                onPageChange={(page) =>
                                    setPagination((p) => ({ ...p, currentPage: page }))
                                }
                                totalPages={pagination.totalPages}
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
                para="Do you really want to delete this FAQ? This action cannot be undone."
            />
        </>
    );
};

export default FAQList;
