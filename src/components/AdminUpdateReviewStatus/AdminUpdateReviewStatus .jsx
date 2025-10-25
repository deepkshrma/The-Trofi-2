import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-toastify";
import axios from "axios";
import { BASE_URL } from "../../config/Config";
import { useNavigate } from "react-router-dom";

const AdminUpdateReviewStatus = ({ reviewId, currentStatus, notes, onClose, onSuccess }) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus || "pending");
  const [adminNotes, setAdminNotes] = useState(notes || "");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setSelectedStatus(currentStatus || "pending");
    setAdminNotes(notes || "");
  }, [currentStatus, notes]);

  const handleSubmit = async () => {
    if (!selectedStatus) {
      toast.error("Please select a status");
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

      const res = await axios.patch(
        `${BASE_URL}/admin/update-rating-status/${reviewId}`,
        {
          status: selectedStatus,
          notes: adminNotes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        toast.success("Review status updated successfully");
        onSuccess(); // reload parent
        // navigate("/RestaurantReviewList")
      } else {
        toast.error("Failed to update review status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="w-[90%] max-w-md bg-white rounded-xl p-6 shadow-lg relative animate-fadeIn">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-black cursor-pointer"
          onClick={onClose}
        >
          <IoMdClose size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-800">Change Review Status</h2>

        {/* Status Dropdown */}
        <div className="mb-4">
          <label className="block font-medium text-gray-700">Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none cursor-pointer"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="published">Published</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Notes */}
        <div className="mb-4">
          <label className="block font-medium text-gray-700">Admin Notes</label>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows="3"
            placeholder="Write reason or notes here..."
            className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-[#F9832B] text-white rounded-lg hover:bg-[#F9832B] cursor-pointer"
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

export default AdminUpdateReviewStatus;
