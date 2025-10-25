import React, { useState, useEffect } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import { BASE_URL } from "../../config/Config";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";

function CreateGroup() {
  const navigate = useNavigate();
  const location = useLocation();

  const editData = location.state?.rowData || null;
  const isEdit = Boolean(editData?._id);

  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Prefill data on edit
  useEffect(() => {
    if (isEdit) {
      setGroupName(editData.group_name || "");
      setDescription(editData.description || "");
      setIsActive(editData.is_active ?? true);
    }
  }, [isEdit, editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const authData = JSON.parse(localStorage.getItem("trofi_user"));
    const token = authData?.token;

    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }

    const payload = {
      group_name: groupName.trim(),
      description,
      is_active: isActive
    };

    try {
      const res = await axios[isEdit ? "patch" : "post"](
        isEdit
          ? `${BASE_URL}/admin/restaurant-group/${editData._id}`
          : `${BASE_URL}/admin/restaurant-group`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (res.data?.success) {
        toast.success(res.data.message);
        navigate("/RestroGroup");
      } else {
        toast.error(res.data.message || "Something went wrong");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Server error");
    }
  };

  return (
    <div className="main main_page p-6 duration-900">
      <BreadcrumbsNav
        customTrail={[
          { label: "Restaurant Groups", path: "/RestroGroup" },
          {
            label: isEdit ? "Edit Group" : "Create Group",
            path: "/CreateGroup"
          }
        ]}
      />

      <div className="bg-white rounded-2xl shadow-md p-6">
        <PageTitle title={isEdit ? "Edit Restaurant Group" : "Create Restaurant Group"} />

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">

          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter Group Name"
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
              placeholder="Enter Description"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-700
                shadow-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-300 
                outline-none transition duration-200"
              rows={3}
            ></textarea>
          </div>

          {/* Status toggle only in edit */}
          {isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={isActive ? "active" : "inactive"}
                onChange={(e) => setIsActive(e.target.value === "active")}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-700
                shadow-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-300 
                outline-none transition duration-200"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/RestroGroup")}
              className="px-5 py-2 rounded-xl bg-gray-200 text-gray-700 cursor-pointer
                shadow-sm hover:bg-gray-300 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-orange-500 cursor-pointer font-medium text-white
                shadow-md transition hover:bg-orange-600 hover:shadow-lg 
                focus:ring-2 focus:ring-orange-300 whitespace-nowrap"
            >
              {isEdit ? "Update" : "Save"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default CreateGroup;
