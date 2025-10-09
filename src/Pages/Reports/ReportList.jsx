import React, { useEffect, useState } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import { FaSearch } from "react-icons/fa";
import { CiExport } from "react-icons/ci";
import axios from "axios";
import { BASE_URL } from "../../config/Config";
import { toast } from "react-toastify";
import { FiEye } from "react-icons/fi";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import Pagination from "../../components/common/Pagination/Pagination";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { IoFilterSharp } from "react-icons/io5";

function ReportList() {
    const [reports, setReports] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
    });

    const navigate = useNavigate();

    const fetchReports = async (page = 1) => {
        try {
            const authData = JSON.parse(localStorage.getItem("trofi_user"));
            const token = authData?.token;
            if (!token) {
                toast.error("Please login first");
                return;
            }

            const response = await axios.get(
                `${BASE_URL}/admin/restro-reports?page=${page}&limit=10`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setReports(response.data.data);
                setPagination({
                    currentPage: response.data.pagination.page,
                    totalPages: response.data.pagination.pages,
                    totalItems: response.data.pagination.total,
                });
            }
        } catch (error) {
            console.error("Error fetching reports:", error);
            toast.error("Failed to fetch reports");
        }
    };

    useEffect(() => {
        fetchReports(pagination.currentPage);
    }, [pagination.currentPage]);

    const handleExport = () => {
        const exportData = reports.map((r, index) => ({
            SL: index + 1,
            Restaurant: r.restaurantId?.restro_name || "N/A",
            User: r.userId?.name || "N/A",
            Email: r.userId?.email || "N/A",
            Status: r.status,
            Created_At: new Date(r.createdAt).toLocaleString(),
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const fileData = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(fileData, "Reports.xlsx");
    };

    return (
        <div className="main main_page font-Montserrat space-y-4">
            <BreadcrumbsNav customTrail={[{ label: "Reports List", path: "/ReportList" }]} />
            <PageTitle title="Reports" />

            {/* Table Container */}
            <div className="w-full h-auto p-2 mt-2 bg-white rounded-lg">
                <div className="flex justify-between h-[40px] mb-2">
                    {/* Search Bar */}
                    <form className="flex gap-1">
                        <div className="relative flex gap-2 px-3 bg-blue-50 w-[300px] rounded-md">
                            <FaSearch className="absolute opacity-40 top-3" size={15} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search here"
                                className="ml-6 text-[14px] outline-none bg-gray-100 appearance-none w-full"
                            />
                        </div>
                    </form>

                    {/* Filter & Export */}
                    <div className="flex gap-2">
                        {/* <div className="relative w-28 mr-2">
                            <span className="absolute inset-y-0 left-2 flex items-center pointer-events-none text-gray-500">
                                <IoFilterSharp />
                            </span>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="block appearance-none bg-white border border-gray-300 pl-8 pr-2 py-2 rounded-md shadow-sm text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 w-full"
                            >
                                <option value="all">All</option>
                                <option value="active">Active</option>
                                <option value="resolved">Resolved</option>
                            </select>
                        </div> */}

                        <div
                            className="flex gap-2 justify-center items-center rounded px-4 border-[1px] border-gray-300 cursor-pointer"
                            onClick={handleExport}
                        >
                            <CiExport className="text-black" />
                            <span className="text-[14px]">Export</span>
                        </div>
                    </div>
                </div>

                {/* Reports Table */}
                <div className="overflow-x-auto">
                    <table className="mt-2 w-full border-collapse">
                        <thead className="bg-gray-100">
                            <tr className="text-gray-700">
                                {["SN", "Restaurant", "User", "Status", "Action"].map((head, i) => (
                                    <th
                                        key={head}
                                        className={`text-[14px] py-3 ${head === "Action" || head === "Status" ? "px-4 text-center" : "px-8 text-left"
                                            } whitespace-nowrap`}
                                    >
                                        {head}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {reports
                                .filter(
                                    (item) =>
                                        (statusFilter === "all" || item.status === statusFilter) &&
                                        `${item.restaurantId?.restro_name} ${item.userId?.name} ${item.userId?.email}`
                                            .toLowerCase()
                                            .includes(searchQuery.toLowerCase())
                                )
                                .map((item, index) => (
                                    <tr key={item._id} className="border-b border-gray-200">
                                        <td className="text-[14px] px-8 py-3 text-left">
                                            {(pagination.currentPage - 1) * 10 + index + 1}
                                        </td>

                                        <td className="text-[14px] px-8 py-3 text-left font-semibold">
                                            {item.restaurantId?.restro_name || "N/A"}
                                        </td>

                                        <td className="text-[14px] px-8 py-3 text-left">
                                            <div className="font-semibold">{item.userId?.name || "N/A"}</div>
                                            <div className="text-gray-500 text-sm">{item.userId?.email || "N/A"}</div>
                                        </td>

                                        <td className="text-[14px] px-4 py-3 text-center">
                                            <span
                                                className={`px-3 py-1 rounded-full text-[13px] font-semibold ${item.status === "active"
                                                        ? "bg-green-100 text-green-600"
                                                        : "bg-yellow-100 text-yellow-600"
                                                    }`}
                                            >
                                                {item.status}
                                            </span>
                                        </td>

                                        <td className="text-[14px] px-4 py-3 text-center">
                                            <div className="flex justify-center items-center">
                                                <button
                                                    onClick={() => navigate(`/RestroReportDetails/${item._id}`)}
                                                    className="flex justify-center items-center w-8 h-8 rounded-lg bg-blue-500 text-white hover:bg-blue-600 cursor-pointer transition duration-150 ease-in-out"
                                                >
                                                    <FiEye size={16} />
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                ))}

                            {reports.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-4 text-gray-500">
                                        No reports found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <Pagination
                        currentPage={pagination.currentPage}
                        totalItems={pagination.totalItems}
                        itemsPerPage={10}
                        onPageChange={(page) => fetchReports(page)}
                        totalPages={pagination.totalPages}
                        type="backend"
                    />
                </div>
            </div>
        </div>
    );
}

export default ReportList;
