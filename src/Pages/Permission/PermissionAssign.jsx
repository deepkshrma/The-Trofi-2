import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import PageTitle from "../../components/PageTitle/PageTitle";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import ToggleButton from "../../components/common/Togglebutton/ToggleButton";
import { BASE_URL } from "../../config/Config";
import { FaSearch } from "react-icons/fa";

function PermissionAssign() {
  const { type, id } = useParams();
  const [modules, setModules] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { name, email } = location.state || {};

  useEffect(() => {
    const fetchModulesAndPermissions = async () => {
      try {
        setLoading(true);
        const authData = JSON.parse(localStorage.getItem("trofi_user"));
        const token = authData?.token;
        if (!token) {
          toast.error("Please login first");
          return;
        }

        const [modulesRes, permRes] = await Promise.allSettled([
          axios.get(`${BASE_URL}/admin/get-module`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/admin/get-permissions?adminId=${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        let moduleList = [];
        if (modulesRes.status === "fulfilled" && modulesRes.value.data.success) {
          moduleList = modulesRes.value.data.data;
          setModules(moduleList);
        }

        const init = {};
        moduleList.forEach((mod) => {
          init[mod._id] = {
            permissionModuleId: mod._id,
            moduleName: mod.moduleName,
            enabled: false,
            is_view: false,
            is_create: false,
            is_update: false,
            is_delete: false,
          };
        });

        if (
          permRes.status === "fulfilled" &&
          permRes.value.data.success &&
          Array.isArray(permRes.value.data.data)
        ) {
          permRes.value.data.data.forEach((p) => {
            if (init[p.moduleId]) {
              init[p.moduleId] = {
                ...init[p.moduleId],
                enabled:
                  p.is_view || p.is_create || p.is_update || p.is_delete,
                is_view: p.is_view,
                is_create: p.is_create,
                is_update: p.is_update,
                is_delete: p.is_delete,
              };
            }
          });
        }

        setPermissions(init);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load permissions");
      } finally {
        setLoading(false);
      }
    };

    fetchModulesAndPermissions();
  }, [id]);

  const handleToggle = (moduleId, key) => {
    setPermissions((prev) => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [key]: !prev[moduleId][key],
      },
    }));
  };

  const handleEnableModule = (moduleId) => {
    setPermissions((prev) => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        enabled: !prev[moduleId].enabled,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;
      if (!token) {
        toast.error("Please login first");
        return;
      }

      const payloads = Object.values(permissions)
        .filter((p) => p.enabled)
        .map((p) => ({
          permissionModuleId: p.permissionModuleId,
          is_view: p.is_view,
          is_create: p.is_create,
          is_update: p.is_update,
          is_delete: p.is_delete,
        }));

      if (payloads.length === 0) {
        toast.warn("Please select at least one module.");
        return;
      }

      const body = {
        ...(type === "admin" ? { adminId: id } : { restroId: id }),
        permissions: payloads,
      };

      await axios.post(`${BASE_URL}/admin/create-permission`, body, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success("Permissions assigned successfully");
      navigate("/AdminList");

    } catch (err) {
      console.error(err);
      toast.error("Failed to assign permissions");
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Filter modules based on search term
  const filteredModules = modules.filter((mod) =>
    mod.moduleName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="main main_page min-h-screen p-6 duration-900">
      <BreadcrumbsNav
        customTrail={[
          { label: "Admin List", path: "/AdminList" },
          { label: "Assign Permission", path: `/PermissionAssign/${type}/${id}` },
        ]}
      />
      <PageTitle
        title={`Assign Permissions for ${type === "admin" ? "Admin" : "Restaurant"}`}
      />

      {/* Header with Name & ID */}
      <div className="bg-white rounded-xl shadow-md p-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h3 className="text-xl font-semibold text-[#F9832B]">{name || "Unknown Admin"}</h3>
          <p className="text-gray-500 text-sm">{email || "Restaurant"}</p>
        </div>
        <div className="mt-3 sm:mt-0">
          {/* <span className="text-gray-600 text-sm mr-1">ID:</span>
          <span className="bg-[#F9832B]/10 text-[#F9832B] px-3 py-1 rounded-md font-medium">
            {id}
          </span> */}
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className={`${loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#F9832B] hover:shadow-lg"
            } text-white font-semibold px-6 py-2 cursor-pointer rounded-lg transition w-full sm:w-auto`}
        >
          {loading ? "Saving..." : "Save Permissions"}
        </button>
      </div>

      {/* 🔍 Search Bar */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="w-full sm:w-1/2 relative">
          <input
            type="text"
            placeholder="Search modules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F9832B] transition"
          />
          <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
        </div>
        {/* <button
          onClick={handleSave}
          disabled={loading}
          className={`${loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#F9832B] hover:shadow-lg"
            } text-white font-semibold px-6 py-2 cursor-pointer rounded-lg transition w-full sm:w-auto`}
        >
          {loading ? "Saving..." : "Save Permissions"}
        </button> */}
      </div>

      {/* Permissions Grid */}
      <div className="bg-white rounded-xl shadow-md p-6">
        {loading ? (
          <p className="text-gray-500">Loading permissions...</p>
        ) : filteredModules.length === 0 ? (
          <p className="text-gray-500 text-center">No matching modules found.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredModules.map((mod) => {
              const perm = permissions[mod._id] || {};
              return (
                <div
                  key={mod._id}
                  className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-[17px] font-semibold text-gray-800">
                      {mod.moduleName}
                    </h4>
                    <label className="text-sm flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={perm.enabled}
                        onChange={() => handleEnableModule(mod._id)}
                      />
                      <span className="text-gray-600">Enable</span>
                    </label>
                  </div>
                  {perm.enabled && (
                    <>
                      <hr className="border-gray-200 mb-3" />
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {["is_view", "is_create", "is_update", "is_delete"].map(
                          (key) => (
                            <div key={key} className="flex flex-col items-center">
                              <span className="capitalize text-gray-700 text-sm mb-1">
                                {key.replace("is_", "")}
                              </span>
                              <ToggleButton
                                isOn={perm[key] || false}
                                onToggle={() => handleToggle(mod._id, key)}
                              />
                            </div>
                          )
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default PermissionAssign;
