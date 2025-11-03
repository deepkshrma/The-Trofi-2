import React, { useEffect, useState } from "react";
import PageTittle from "../../components/PageTitle/PageTitle";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../config/Config";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";

function CreateAdmin() {
  const [profilePicture, setProfilePicture] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminRole = async () => {
      try {
        const authData = JSON.parse(localStorage.getItem("trofi_user"));
        const token = authData?.token;

        if (!token) {
          toast.error("Please login first");
          return;
        }

        const res = await axios.get(`${BASE_URL}/admin/admins-roles`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const roles = res.data?.roles || [];
        const adminRole = roles.find((r) => r.name === "admin");

        if (adminRole) {
          setSelectedRole(adminRole);
        } else {
          toast.error("Admin role not found!");
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
        toast.error("Failed to fetch roles");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminRole();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRole?._id && !selectedRole?.id) {
      toast.error("Role not loaded yet. Please wait.");
      return;
    }

    const authData = JSON.parse(localStorage.getItem("trofi_user"));
    const token = authData?.token;
    if (!token) {
      toast.error("Please login first");
      return;
    }

    const formData = new FormData();
    formData.append("email", e.target.email.value);
    formData.append("password", e.target.password.value);
    formData.append("name", e.target.name.value);
    formData.append("role", selectedRole._id || selectedRole.id);
    formData.append("dob", e.target.dob.value);
    formData.append("gender", e.target.gender.value);
    formData.append("address", e.target.address.value);

    if (profilePicture) {
      formData.append("profile_picture", profilePicture);
    }

    try {
      const res = await axios.post(`${BASE_URL}/admin/create-admin`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        toast.success("Admin created successfully!");
        const newAdminId = res.data.adminId;

        if (newAdminId) {
          navigate(`/PermissionAssign/admin/${newAdminId}`, {
            state: {
              name: res.data.name,
              email: res.data.email,
            },
          });
        } else {
          toast.warn("Admin ID missing, going back to Admin List");
          navigate("/AdminList");
        }
      } else {
        toast.error(res.data.message || "Failed to create admin.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error while creating admin!");
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading role...</p>;

  return (
    <div className="main main_page min-h-screen py-10 px-6 lg:px-20 duration-900">
      <BreadcrumbsNav
        customTrail={[
          { label: "Admin List", path: "/AdminList" },
          { label: "Create Admin", path: "/CreateAdmin" },
        ]}
      />
      <div className="bg-white shadow-lg rounded-2xl p-10">
        <PageTittle title={"Create Admin"} />

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10"
        >
          <div>
            <label className="block text-gray-600 font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-0 focus:ring-orange-400 transition"
              placeholder="Enter email"
              required
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-2">Password</label>
            <input
              type="password"
              name="password"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-0 focus:ring-orange-400 transition"
              placeholder="Enter password"
              required
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-0 focus:ring-orange-400 transition"
              placeholder="Enter full name"
              required
            />
          </div>

          {/* Prefilled Role */}
          <div>
            <label className="block text-gray-600 font-medium mb-2">Role</label>
            <input
              type="text"
              value={selectedRole?.name || "admin"}
              disabled
              className="w-full border border-gray-300 p-3 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-2">Date of Birth</label>
            <input
              type="date"
              name="dob"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-0 focus:ring-orange-400 transition"
              required
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-2">Gender</label>
            <select
              name="gender"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-0 focus:ring-orange-400 transition"
              required
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-600 font-medium mb-2">Address</label>
            <textarea
              name="address"
              rows="3"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-0 focus:ring-orange-400 transition resize-none"
              placeholder="Enter address"
              required
            ></textarea>
          </div>

          {/* Profile Picture */}
          <div className="md:col-span-2">
            <label className="block text-gray-600 font-medium mb-2">Profile Picture</label>
            <input
              id="profilePicture"
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePicture(e.target.files[0])}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => document.getElementById("profilePicture").click()}
              className="px-4 py-2 bg-[#F9832B] text-white rounded-lg cursor-pointer shadow hover:shadow-md"
            >
              Choose File
            </button>

            {profilePicture && (
              <div className="mt-4 flex items-center gap-4">
                <img
                  src={URL.createObjectURL(profilePicture)}
                  alt="Profile preview"
                  className="w-20 h-20 object-cover rounded-lg border"
                />
                <span className="text-gray-700">{profilePicture.name}</span>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-3 cursor-pointer rounded-xl font-semibold hover:bg-orange-600 transition shadow-md text-lg"
            >
              Create Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateAdmin;
