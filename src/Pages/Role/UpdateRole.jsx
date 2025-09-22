import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import PageTitle from "../../components/PageTitle/PageTitle";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";

function UpdateRole() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active",
  });

  const [loading, setLoading] = useState(false);

  // === Fetch Role By Id ===
  const fetchRoleById = async () => {
    try {
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;
      if (!token) {
        toast.error("Please login first");
        return;
      }

      const res = await axios.get(
        `http://trofi-backend.apponedemo.top/api/admin/admins-roles/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const role = res.data.role;
      setFormData({
        name: role.name || "",
        description: role.description || "",
        status: role.status || "inactive",
      });
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to fetch role details."
      );
    }
  };

  useEffect(() => {
    if (id) fetchRoleById();
  }, [id]);

  // === Handle Input Change ===
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // === Update Role ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;

      await axios.patch(
        `http://trofi-backend.apponedemo.top/api/admin/update-admins-roles/${id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Role updated successfully!");
      navigate("/RoleList");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update role.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main main_page w-full h-full font-Montserrat space-y-4 duration-900">
      <BreadcrumbsNav
        customTrail={[
          { label: "Role List", path: "/Roles" },
          { label: "Update Role", path: `/RoleUpdate/${id}` },
        ]}
      />
      <PageTitle title={"Update Role"} />

      <div className="bg-white shadow-lg rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Name */}
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-gray-700 font-medium mb-1"
            >
              Role Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F9832B]"
              required
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-gray-700 font-medium mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F9832B]"
            />
          </div>

          {/* Status */}
          <div className="mb-4">
            <label
              htmlFor="status"
              className="block text-gray-700 font-medium mb-1"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F9832B]"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#F9832B] text-white cursor-pointer font-semibold rounded-lg shadow hover:bg-[#e77620] disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateRole;
