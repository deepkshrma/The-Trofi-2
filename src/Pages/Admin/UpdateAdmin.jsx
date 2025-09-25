import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { BASE_URL } from "../../config/Config";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import PageTittle from "../../components/PageTitle/PageTitle";
import { Listbox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";

function UpdateAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const adminData = state?.admin; // <-- comes from navigate()

  // refs for live preview
  const imgPreviewRef = useRef();

  const [profilePicture, setProfilePicture] = useState(null);
  const [selectedRole, setSelectedRole] = useState({
    id: adminData?.role_id || "",
    name: adminData?.role || "",
  });
  const [formValues, setFormValues] = useState({
    name: adminData?.name || "",
    dob: adminData?.dob?.split("T")[0] || "",
    gender: adminData?.gender || "",
    address: adminData?.address || "",
  });

  // Prefill image without extra API call
  const [existingImage] = useState(adminData?.profilePhoto || "");

  const handleChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = JSON.parse(localStorage.getItem("trofi_user"))?.token;
    if (!token) return toast.error("Please login first");

    const formData = new FormData();
    formData.append("name", formValues.name);
    formData.append("role", selectedRole?.id || "");
    formData.append("dob", formValues.dob);
    formData.append("gender", formValues.gender);
    formData.append("address", formValues.address);
    if (profilePicture) {
      formData.append("profile_picture", profilePicture);
    }

    try {
      const res = await axios.patch(
        `${BASE_URL}/admin/update-admin/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (res.data.success) {
        toast.success("Admin updated successfully!");
        navigate("/AdminList");
      } else {
        toast.error("Failed to update admin.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error while updating admin!");
    }
  };

  return (
    <div className="main main_page min-h-screen py-10 px-6 lg:px-20 duration-900">
      <BreadcrumbsNav
        customTrail={[{ label: "Admin List", path: "/AdminList" }, { label: "Update Admin", path: `/UpdateAdmin/${id}` }]}
      />
      <div className="bg-white shadow-lg rounded-2xl p-10">
        <PageTittle title={"Update Admin"} />

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10"
        >
          <div>
            <label className="block text-gray-600 font-medium mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formValues.name}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-0 focus:ring-orange-400 transition"
              placeholder="Enter full name"
              required
            />
          </div>

          {/* Role dropdown */}
          <div>
            <label className="block text-gray-600 font-medium mb-2">Role</label>
            <Listbox value={selectedRole} onChange={setSelectedRole}>
              {({ open }) => (
                <div className="relative">
                  <Listbox.Button
                    className="w-full cursor-pointer rounded-xl border border-gray-300
                     bg-white px-4 py-3 text-left focus:outline-none
                     focus:ring-2 focus:ring-orange-400"
                  >
                    <span>
                      {selectedRole ? selectedRole.name : "Select role"}
                    </span>
                    <ChevronUpDownIcon className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                  </Listbox.Button>

                  {open && (
                    <Listbox.Options
                      className="absolute z-10 mt-1 w-full rounded-xl bg-white shadow-lg
                       ring-1 ring-black ring-opacity-5 focus:outline-none"
                    >
                      {roles.map((role) => (
                        <Listbox.Option
                          key={role.id}
                          value={role}
                          className={({ active }) =>
                            `cursor-pointer select-none px-4 py-2 rounded-xl ${active
                              ? "bg-orange-100 text-orange-700"
                              : "text-gray-900"
                            }`
                          }
                        >
                          {({ selected }) => (
                            <div className="flex justify-between">
                              <span>{role.name}</span>
                              {selected && (
                                <CheckIcon className="h-5 w-5 text-orange-500" />
                              )}
                            </div>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  )}
                </div>
              )}
            </Listbox>
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              name="dob"
              value={formValues.dob}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-0 focus:ring-orange-400 transition"
              required
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-2">
              Gender
            </label>
            <select
              name="gender"
              value={formValues.gender}
              onChange={handleChange}
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
            <label className="block text-gray-600 font-medium mb-2">
              Address
            </label>
            <textarea
              name="address"
              value={formValues.address}
              onChange={handleChange}
              rows="3"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-0 focus:ring-orange-400 transition resize-none"
              placeholder="Enter address"
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-2">
              Profile Picture
            </label>
            <input
              id="profilePicture"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                setProfilePicture(file);
                if (file && imgPreviewRef.current) {
                  imgPreviewRef.current.src = URL.createObjectURL(file);
                }
              }}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => document.getElementById("profilePicture").click()}
              className="px-4 py-2 bg-[#F9832B] text-white rounded-lg cursor-pointer shadow"
            >
              Choose File
            </button>

            {/* Show preview: new file OR existing */}
            <div className="mt-4">
              <img
                ref={imgPreviewRef}
                src={existingImage}
                alt="Profile"
                className="w-20 h-20 object-cover rounded-lg border"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-3 cursor-pointer rounded-xl font-semibold hover:bg-orange-600 transition shadow-md text-lg"
            >
              Update Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateAdmin;
