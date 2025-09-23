import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-toastify";
import axios from "axios";

import { BASE_URL } from "../../config/Config";

const UserUpdateStatus = ({ userId, status, reason, onClose, onSuccess }) => {
  const [selectedStatus, setSelectedStatus] = useState(status || "");
  const [statusReason, setStatusReason] = useState(reason || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSelectedStatus(status || "");
    setStatusReason(reason || "");
  }, [status, reason]);

  const handleSubmit = async () => {
    if (!selectedStatus || !statusReason) {
      toast.error("Please fill both fields");
      return;
    }

    try {
      setLoading(true);
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;
      if (!token) {
        toast.error("Please login first");
        return;
      }

      const response = await axios.patch(
        `${BASE_URL}/user/update-status/${userId}`,
        {
          status: selectedStatus,
          reason: statusReason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Status updated successfully");
        onSuccess(); // Notify parent
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="w-[90%] max-w-md bg-white rounded-xl p-6 shadow-lg relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-black cursor-pointer"
          onClick={onClose}
        >
          <IoMdClose size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4">Change User Status</h2>

        <div className="mb-4">
          <label className="block font-medium text-gray-700">Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none"
          >
            <option value="">-- Select Status --</option>
            <option value="active">Active</option>
            <option value="spam">Spam</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-700">Reason</label>
          <textarea
            value={statusReason}
            onChange={(e) => setStatusReason(e.target.value)}
            rows="3"
            className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none resize-none"
          ></textarea>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserUpdateStatus;
