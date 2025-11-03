import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageTitle from "../../components/PageTitle/PageTitle";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import axios from "axios";
import { BASE_URL } from "../../config/Config";
import { toast } from "react-toastify";

function RestroReportDetails() {
    const { id } = useParams();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReportDetails = async () => {
            const authData = JSON.parse(localStorage.getItem("trofi_user"));
            const token = authData?.token;

            if (!token) {
                toast.error("Please login first");
                return;
            }

            try {
                const response = await axios.get(
                    `${BASE_URL}/admin/restro-reports?reportId=${id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.data.success && response.data.data) {
                    setReport(response.data.data);
                } else {
                    toast.error("Report not found");
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to fetch report details");
            } finally {
                setLoading(false);
            }
        };

        fetchReportDetails();
    }, [id]);


    // 🔹 Loader UI
    if (loading)
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] bg-gray-50">
                <div className="w-12 h-12 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600 font-medium text-sm">
                    Fetching report details...
                </p>
            </div>
        );

    if (!report)
        return (
            <div className="flex items-center justify-center h-[70vh]">
                <p className="text-gray-600 text-lg">No report found.</p>
            </div>
        );

    return (
        <div className="main main_page min-h-screen p-6 duration-900">
            <BreadcrumbsNav
                customTrail={[
                    { label: "Reports", path: "/ReportList" },
                    { label: "Report Details", path: `/RestroReportDetails/${id}` },
                ]}
            />
            <PageTitle title="Restaurant Report Details" />

            {/* Report Summary */}
            <div className="bg-white rounded-xl shadow-md p-6 mt-5">
                <h3 className="text-xl font-semibold mb-4 text-[#F9832B]">Report Summary</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Restaurant Name</p>
                        <p className="text-lg font-semibold">
                            {report.restaurantId?.restro_name || "—"}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Reported By</p>
                        <p className="text-lg font-semibold">{report.userId?.name || "—"}</p>
                        <p className="text-sm text-gray-500">{report.userId?.email}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Status</p>
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${report.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                                }`}
                        >
                            {report.status}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Report At</p>
                        <p className="text-gray-700">
                            {new Date(report.createdAt).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Reasons Section */}
            <div className="bg-white rounded-xl shadow-md p-6 mt-6">
                <h3 className="text-lg font-semibold mb-4 text-[#F9832B]">Report Reasons</h3>
                {report.reason && report.reason.length > 0 ? (
                    <div className="space-y-3">
                        {report.reason.map((r, idx) => (
                            <div
                                key={idx}
                                className="border border-gray-200 p-4 rounded-lg bg-gray-50 hover:shadow-sm transition flex justify-between items-center"
                            >
                                <p className="font-medium text-gray-800">{r.question}</p>
                                <span
                                    className={`px-3 py-1 text-xs font-semibold rounded-full ${r.answer
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                        }`}
                                >
                                    {r.answer ? "Selected" : "Not Selected"}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No reasons provided</p>
                )}
            </div>


            {/* Comment Section */}
            <div className="bg-white rounded-xl shadow-md p-6 mt-6">
                <h3 className="text-lg font-semibold mb-4 text-[#F9832B]">Comment</h3>
                <p className="text-gray-700 text-sm">
                    {report.comment || "No comment provided"}
                </p>
            </div>

            {/* Metadata */}
            <div className="bg-white rounded-xl shadow-md p-6 mt-6 mb-10">
                <h3 className="text-lg font-semibold mb-4 text-[#F9832B]">Additional Info</h3>
                <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
                    <p>
                        <span className="font-medium">Updated At:</span>{" "}
                        {new Date(report.updatedAt).toLocaleString()}
                    </p>
                    {/* <p>
            <span className="font-medium">Deleted At:</span>{" "}
            {report.deletedAt
              ? new Date(report.deletedAt).toLocaleString()
              : "—"}
          </p> */}
                    <p>
                        <span className="font-medium">Report ID:</span> {report._id}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default RestroReportDetails;
