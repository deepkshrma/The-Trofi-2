import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config/Config";


function AdminRoleModel({ onClose, adminId, currentStatus,defaultReason, onStatusUpdated }) {
  const [status, setStatus] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    setStatus(currentStatus || ""); 
    setReason(defaultReason || "");
  }, [currentStatus, defaultReason]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!status) {
      toast.error("Please select a status.");
      return;
    }

    try {
      const authData = JSON.parse(localStorage.getItem("broom_auth"));
      const token = authData?.token;

      await axios.put(
        `${BASE_URL}/admin/update-admin-status/${adminId}`,
        {
          status,
          status_reason: reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Status updated successfully!");
      // Optional callback to parent to update local state
      if (onStatusUpdated) {
        onStatusUpdated(status);
      }

      // Close modal
      onClose();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="w-[90%] max-w-md bg-white rounded-xl p-6 shadow-lg relative ">
        {/* Close Icon */}
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-black cursor-pointer">
          <IoMdClose size={20} />
        </button>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <h2 className="text-xl font-semibold text-gray-800">
            Update Admin Status
          </h2>

          {/* Status Options */}
          <div className="flex gap-8">
            {["active", "inactive", "suspended"].map((option) => (
              <label key={option} className="flex items-center gap-2 cursor-pointer capitalize">
                <input
                  type="radio"
                  name="adminStatus"
                  value={option}
                  checked={status === option}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>

          {/* Reason Textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Status Reason 
            </label>
            <textarea
              rows="3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm resize-none"
              placeholder="Enter reason here..."
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm cursor-pointer"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminRoleModel;
