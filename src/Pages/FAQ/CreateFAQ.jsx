import React, { useState, useEffect } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import { BASE_URL } from "../../config/Config";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";



function CreateFAQ() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("active");
    const [editId, setEditId] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();

    const faqData = location.state?.faq;
    // If edit mode (FAQ passed from list page)
    useEffect(() => {
        if (location.state?.faq) {
            const { _id, title, description, status } = location.state.faq;
            setEditId(_id);
            setTitle(title);
            setDescription(description);
            setStatus(status || "active");
        }
    }, [location.state]);

    // Handle Submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title || !description) {
            toast.error("Please provide both Title and Description");
            return;
        }

        const payload = {
            title,
            description,
            status,
        };

        try {
            const authData = JSON.parse(localStorage.getItem("trofi_user"));
            const token = authData?.token;
            if (!token) {
                toast.error("Please login first");
                return;
            }

            if (faqData?.status === "deleted") {
                toast.error("You cannot update status for deleted FAQ");
                return;
            }

            let res;
            if (editId) {
                // Edit mode (PATCH/PUT API if available)
                res = await axios.post(
                    `${BASE_URL}/admin/faq`,
                    { ...payload, id: editId },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
            } else {
                // Create mode
                res = await axios.post(
                    `${BASE_URL}/admin/faq`,
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
            }

            if (res.data.success) {
                toast.success(res.data.message || "FAQ saved successfully");
                navigate("/FAQList");
                if (!editId) {
                    setTitle("");
                    setDescription("");
                    setStatus("active");
                }
            } else {
                toast.error(res.data.message || "Something went wrong");
            }
        } catch (err) {
            console.error("API ERROR:", err);
            toast.error(err.response?.data?.message || "Error while saving FAQ");
        }
    };

    return (
        <div className="main main_page p-6 w-full h-screen duration-900">
            <BreadcrumbsNav
                customTrail={[
                    { label: "FAQs List", path: "/FAQList" },
                    {
                        label: editId ? "Edit FAQ" : "Create FAQ",
                        path: "/CreateFAQ",
                    },
                ]}
            />

            <div className="bg-white rounded-2xl shadow-md p-6">
                <PageTitle title={editId ? "Edit FAQ" : "Create FAQ"} />

                <form onSubmit={handleSubmit} className="space-y-6 mt-5">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter FAQ title"
                            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-700 
                 shadow-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-300 
                 outline-none transition duration-200"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter FAQ description"
                            rows="5"
                            className="w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-700 
                 shadow-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-300 
                 outline-none transition duration-200"
                            required
                        />
                    </div>

                    {/* Status Dropdown */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <div className="relative">
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full appearance-none rounded-xl border border-gray-300 px-4 py-2 pr-10 
                 text-gray-700 shadow-sm focus:border-orange-400 focus:ring-2 
                 focus:ring-orange-300 outline-none transition duration-200
                 bg-white cursor-pointer"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>

                            {/* Custom dropdown arrow */}
                            <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-500">
                                ▼
                            </span>
                        </div>
                    </div>


                    {/* Submit */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="px-6 py-2 rounded-xl bg-orange-500 cursor-pointer font-medium text-white 
                shadow-md transition hover:bg-orange-600 hover:shadow-lg 
                focus:ring-2 focus:ring-orange-300 whitespace-nowrap"
                        >
                            {editId ? "Update" : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateFAQ;
