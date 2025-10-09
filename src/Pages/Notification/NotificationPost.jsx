// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../config/Config";
import axios from "axios";
import { FiSearch, FiX } from "react-icons/fi";

function NotificationPost() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    image: null,
    title: "",
    message: "",
    send_type: "all_users",
    receiverIds: [],
  });

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // -------- Fetch Users --------
  const fetchUsers = async (pageNum = 1, term = "") => {
    try {
      setLoadingUsers(true);
      const token = JSON.parse(localStorage.getItem("trofi_user"))?.token;
      const res = await axios.get(`${BASE_URL}/admin/get-all-users-dropdown`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: pageNum, limit: 20, search: term },
      });

      if (res.data.success) {
        setUsers(res.data.data.users || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching users");
    } finally {
      setLoadingUsers(false);
    }
  };

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (formData.send_type === "selected_users") fetchUsers(page, searchTerm);
  }, [formData.send_type, page, searchTerm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, image: file }));
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviewImage(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  const handleUserSelect = (userId) => {
    setFormData((prev) => {
      const alreadySelected = prev.receiverIds.includes(userId);
      return {
        ...prev,
        receiverIds: alreadySelected
          ? prev.receiverIds.filter((id) => id !== userId)
          : [...prev.receiverIds, userId],
      };
    });
  };

  const handleSubmit = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("trofi_user"))?.token;
      const data = new FormData();
      if (formData.image) data.append("image", formData.image);
      data.append("title", formData.title);
      data.append("message", formData.message);
      data.append("send_type", formData.send_type);
      if (formData.send_type === "selected_users")
        data.append("receiverIds", JSON.stringify(formData.receiverIds));

      const res = await axios.post(`${BASE_URL}/admin/notification`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        toast.success("Notification posted successfully!");
        navigate("/NotificationList");
      } else {
        toast.error("Failed to post notification");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error posting notification");
    }
  };

  return (
    <div className="main main_page p-6 min-h-screen bg-gray-50 duration-900">
      <BreadcrumbsNav
        customTrail={[
          { label: "Notification Management", path: "/NotificationList" },
          { label: "Post Notification", path: "/NotificationPost" },
        ]}
      />
      <PageTitle title={"Post Notification"} />

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mt-5 max-w-4xl mx-auto">
        {/* Title */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter notification title"
            className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:ring focus:ring-[#F9832B] outline-none"
          />
        </div>

        {/* Message */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Message</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Enter notification message"
            rows={3}
            className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:ring focus:ring-[#F9832B] outline-none"
          />
        </div>

        {/* Image Upload */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Upload Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full border border-gray-300 p-2 rounded-lg"
          />
          {previewImage && (
            <div className="mt-3">
              <img
                src={previewImage}
                alt="Preview"
                className="h-32 rounded-lg border border-gray-200 object-cover"
              />
            </div>
          )}
        </div>

        {/* Send Type */}
        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700">
            Send Type
          </label>
          <select
            name="send_type"
            value={formData.send_type}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:ring focus:ring-[#F9832B] outline-none"
          >
            <option value="all_users">All Users</option>
            <option value="selected_users">Selected Users</option>
            <option value="all_restaurants">All Restaurants</option>
            <option value="selected_restaurants">Selected Restaurants</option>
          </select>
        </div>

        {/* Selected Users */}
        {formData.send_type === "selected_users" && (
          <div className="mb-8 relative" ref={dropdownRef}>
            <label className="block mb-2 font-medium text-gray-700">
              Select Users
            </label>

            {/* Search box */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowUserDropdown(true)}
                className="w-full border border-gray-300 pl-10 p-3 rounded-lg shadow-sm focus:ring focus:ring-[#F9832B] outline-none"
              />
            </div>

            {/* Dropdown list */}
            {showUserDropdown && (
              <div className="absolute mt-2 w-full max-h-64 overflow-y-auto border border-gray-300 bg-white rounded-lg shadow-xl transition-all duration-300 ease-in-out">
                {loadingUsers ? (
                  <p className="p-3 text-gray-500 text-center">Loading...</p>
                ) : users.length === 0 ? (
                  <p className="p-3 text-gray-500 text-center">No users found</p>
                ) : (
                  users.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => handleUserSelect(user._id)}
                      className={`p-2 cursor-pointer flex justify-between items-center hover:bg-gray-100 transition ${
                        formData.receiverIds.includes(user._id)
                          ? "bg-[#F9832B] text-white"
                          : ""
                      }`}
                    >
                      <span>{user.name}</span>
                      {formData.receiverIds.includes(user._id) && <span>✓</span>}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Selected Users Chips */}
            {formData.receiverIds.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {formData.receiverIds.map((id) => {
                  const user = users.find((u) => u._id === id);
                  return (
                    <div
                      key={id}
                      className="flex items-center bg-[#F9832B]/10 text-[#F9832B] px-3 py-1 rounded-full border border-[#F9832B]/20"
                    >
                      <span className="mr-2">{user ? user.name : id}</span>
                      <FiX
                        onClick={() => handleUserSelect(id)}
                        className="cursor-pointer hover:text-red-500"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSubmit}
            className="bg-[#F9832B] text-white px-6 py-3 w-full cursor-pointer rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105"
          >
            Post Notification
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotificationPost;
