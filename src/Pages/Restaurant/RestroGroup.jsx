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

const RestroGroup = () => {
    const [groups, setGroups] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const pageSize = 10;
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalRecords: 0,
    });

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);

    const navigate = useNavigate();

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setSelectedGroup(null);
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    async function fetchGroups() {
        setLoading(true);
        setError(null);
        try {
            const authData = JSON.parse(localStorage.getItem("trofi_user"));
            const token = authData?.token;
            if (!token) {
                toast.error("Please login first");
                return;
            }
            const res = await fetch(`${BASE_URL}/admin/restaurant-groups`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const json = await res.json();
            if (!json?.success) throw new Error(json.message || "API Error");

            setGroups(json.data);
            setPagination((p) => ({
                ...p,
                totalRecords: json.data.length,
                totalPages: Math.ceil(json.data.length / pageSize),
            }));
        } catch (err) {
            setError(err.message || "Failed to fetch Groups");
        } finally {
            setLoading(false);
        }
    }

    const confirmDelete = async () => {
        if (!selectedGroup) return;

        try {
            const authData = JSON.parse(localStorage.getItem("trofi_user"));
            const token = authData?.token;
            if (!token) {
                toast.error("Please login first");
                return;
            }

            const payload = {
                id: selectedGroup._id,
                action: "delete",
            };

            const res = await axios.post(
                `${BASE_URL}/admin/restaurant-groups`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (res.data.success) {
                toast.success("Restaurant Group deleted successfully");
                fetchGroups();
            } else {
                toast.error(res.data.message || "Delete failed");
            }
        } catch {
            toast.error("Something went wrong while deleting");
        } finally {
            closeDeleteModal();
        }
    };

    const filtered = groups.filter((g) =>
        g.group_name.toLowerCase().includes(search.toLowerCase())
    );

    const start = (pagination.currentPage - 1) * pageSize;
    const paginated = filtered.slice(start, start + pageSize);

    return (
        <>
            <div className="main main_page p-6 duration-900">
                <BreadcrumbsNav
                    customTrail={[{ label: "Restaurant Groups", path: "/RestroGroup" }]}
                />

                <div className="flex justify-between items-center mb-3">
                    <PageTitle title={"Restaurant Groups"} />
                    <button
                        className="flex items-center gap-2 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg cursor-pointer"
                        style={{ backgroundColor: "#F9832B" }}
                        onClick={() => navigate("/CreateGroup")}
                    >
                        <PlusCircle size={18} /> Add Group
                    </button>
                </div>

                <div className="overflow-x-auto bg-white rounded-2xl shadow-md pb-3 mt-5">
                    <div className="flex justify-between items-center m-3">
                        <input
                            type="text"
                            placeholder="Search by group name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="border border-gray-300 bg-white p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] outline-none w-64"
                        />
                    </div>

                    {loading ? (
                        <div className="text-center p-6">Loading groups…</div>
                    ) : error ? (
                        <div className="text-center p-6 text-red-500">
                            Error: {error}
                        </div>
                    ) : (
                        <>
                            <table className="min-w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-200 text-left text-gray-700">
                                        <th className="p-3 pl-4 text-center">S.No.</th>
                                        <th className="p-3">Group Name</th>
                                        <th className="p-3 text-center">Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {paginated.length > 0 ? (
                                        paginated.map((g, index) => (
                                            <tr
                                                key={g._id}
                                                className="border-b border-gray-300 hover:bg-orange-50 transition"
                                            >
                                                <td className="p-3 pl-4 font-medium text-gray-700 text-center">
                                                    {start + index + 1}
                                                </td>
                                                <td className="p-3 text-gray-700">{g.group_name}</td>

                                                <td className="p-3 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() =>
                                                                navigate(`/GroupInDetail/${g._id}`)
                                                            }
                                                            className="flex justify-center items-center bg-blue-500 hover:bg-blue-600 text-white w-8 h-8 rounded"
                                                        >
                                                            <FaEye size={14} />
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                navigate("/CreateGroup", { state: { rowData: g } })

                                                            }
                                                            className="flex justify-center items-center bg-green-500 hover:bg-green-600 text-white w-8 h-8 rounded"
                                                        >
                                                            <MdEdit size={16} />
                                                        </button>

                                                        <button
                                                            onClick={() => {
                                                                setSelectedGroup(g);
                                                                setShowDeleteModal(true);
                                                            }}
                                                            className="flex justify-center items-center bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded"
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
                                                colSpan="3"
                                                className="text-center p-6 text-gray-500 italic"
                                            >
                                                No Restaurant Group found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

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

            <DeleteModel
                isOpen={showDeleteModal}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
                redbutton="Confirm"
                para="Do you really want to delete this group? This action cannot be undone."
            />
        </>
    );
};

export default RestroGroup;
