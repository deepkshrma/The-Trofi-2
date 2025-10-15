import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import PageTitle from "../../components/PageTitle/PageTitle";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import ToggleButton from "../../components/common/Togglebutton/ToggleButton";
import { BASE_URL } from "../../config/Config";

function PermissionAssign() {
  const [modules, setModules] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [targetType, setTargetType] = useState("admin");
  const [targetId, setTargetId] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch permission modules
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/get-all-permission-modules`);
        if (res.data.success) {
          const list = res.data.data;
          setModules(list);

          // initialize empty permissions
          const init = {};
          list.forEach((mod) => {
            init[mod._id] = {
              permissionModuleId: mod._id,
              is_view: false,
              is_create: false,
              is_update: false,
              is_delete: false,
            };
          });
          setPermissions(init);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch permission modules");
      }
    };

    fetchModules();
  }, []);

  // handle toggle
  const handleToggle = (moduleId, key) => {
    setPermissions((prev) => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [key]: !prev[moduleId][key],
      },
    }));
  };

  // handle save
  const handleSave = async () => {
    if (!targetId.trim()) {
      toast.error("Please enter valid ID");
      return;
    }

    const finalPermissions = Object.values(permissions).filter(
      (p) => p.is_view || p.is_create || p.is_update || p.is_delete
    );

    if (finalPermissions.length === 0) {
      toast.error("Please select at least one permission");
      return;
    }

    const payload = {
      [targetType === "admin" ? "adminId" : "restroId"]: targetId,
      permissions: finalPermissions,
    };

    try {
      setLoading(true);
      const endpoint =
        targetType === "admin"
          ? `${BASE_URL}/api/admin/update-admin-permissions`
          : `${BASE_URL}/api/restro/update-restro-permissions`;

      const res = await axios.post(endpoint, payload);

      if (res.data.success) {
        toast.success("Permissions saved successfully");
      } else {
        toast.error(res.data.message || "Something went wrong");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save permissions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main main_page min-h-screen p-6 duration-900">
      <BreadcrumbsNav
        customTrail={[
          { label: "Permissions List", path: "/Permissions" },
          { label: "Assign Permission", path: "/PermissionAssign" },
        ]}
      />
      <PageTitle title="Assign Permissions" />

      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        {/* Target Select */}
        <div className="flex items-center gap-6 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="admin"
              checked={targetType === "admin"}
              onChange={() => setTargetType("admin")}
            />
            Admin
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="restaurant"
              checked={targetType === "restaurant"}
              onChange={() => setTargetType("restaurant")}
            />
            Restaurant
          </label>

          <input
            type="text"
            placeholder={
              targetType === "admin" ? "Enter Admin ID" : "Enter Restaurant ID"
            }
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 w-80 focus:ring-2 focus:ring-[#F9832B] outline-none"
          />
        </div>

        {/* Permissions Table */}
        <h3 className="text-lg font-semibold mb-3 text-[#F9832B]">
          Permission Modules
        </h3>

        {modules.length === 0 ? (
          <p className="text-gray-500">No permission modules found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-[#F9832B]/10 text-[#F9832B] text-left">
                  <th className="px-6 py-3 font-semibold">Module</th>
                  <th className="px-6 py-3 font-semibold text-center">View</th>
                  <th className="px-6 py-3 font-semibold text-center">Create</th>
                  <th className="px-6 py-3 font-semibold text-center">Update</th>
                  <th className="px-6 py-3 font-semibold text-center">Delete</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((mod) => (
                  <tr key={mod._id} className="border-t border-gray-200">
                    <td className="px-6 py-3 font-medium text-gray-700">
                      {mod.moduleName}
                    </td>
                    {["is_view", "is_create", "is_update", "is_delete"].map(
                      (key) => (
                        <td
                          key={key}
                          className="px-6 py-3 text-center"
                        >
                          <ToggleButton
                            isOn={permissions[mod._id]?.[key] || false}
                            onToggle={() => handleToggle(mod._id, key)}
                          />
                        </td>
                      )
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end mt-8">
          <button
            onClick={handleSave}
            disabled={loading}
            className={`${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#F9832B] hover:shadow-lg"
            } text-white font-semibold px-8 py-2 rounded-lg transition`}
          >
            {loading ? "Saving..." : "Save Permissions"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PermissionAssign;

