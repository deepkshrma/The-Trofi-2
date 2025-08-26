import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config/Config";


function AdminRoleChangeModal({
  onClose,
  adminId,
  currentRole,
  onRoleUpdated,
}) {
  const [selectedRole, setSelectedRole] = useState("");
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setSelectedRole(currentRole || "");

    const fetchRoles = async () => {
      try {
        const authData = JSON.parse(localStorage.getItem("broom_auth"));
        const token = authData?.token;

        const response = await axios.get(`${BASE_URL}/admin/get-all-roles`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setRoles(response.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch roles:", error);
        toast.error("Unable to load roles.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [currentRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRole) {
      toast.error("Please select a role.");
      return;
    }

    try {
      const authData = JSON.parse(localStorage.getItem("broom_auth"));
      const token = authData?.token;

      await axios.patch(
        `${BASE_URL}/admin/update-admin-role/${adminId}`,
        { newRoleId: selectedRole },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Admin role updated successfully!");

      if (onRoleUpdated) {
        onRoleUpdated(selectedRole);
      }

      onClose();
    } catch (error) {
      console.error("Role update failed:", error);
      toast.error("Failed to update role.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="w-[90%] max-w-md bg-white rounded-xl p-6 shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          <IoMdClose size={20} />
        </button>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <h2 className="text-xl font-semibold text-gray-800">
            Change Admin Role
          </h2>

          {/* Roles Radio List */}
          <div className="flex flex-col gap-3 max-h-60 overflow-y-auto">
            {loading ? (
              <div className="text-sm text-gray-500 text-center">
                Loading roles...
              </div>
            ) : roles.length === 0 ? (
              <div className="text-sm text-red-500 text-center">
                No roles found.
              </div>
            ) : (
              roles.map((role) => (
                <label
                  key={role._id}
                  className="flex items-center gap-2 cursor-pointer capitalize"
                >
                  <input
                    type="radio"
                    name="adminRole"
                    value={role._id}
                    checked={selectedRole === role._id}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700">{role.name}</span>
                </label>
              ))
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-4">
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

export default AdminRoleChangeModal;
