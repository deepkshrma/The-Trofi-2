import React, { useState, useEffect } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import { BASE_URL } from "../../config/Config";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import { toast } from "react-toastify";

function RestroType() {
  const location = useLocation();
  const navigate = useNavigate();

  // ---- Prefill data ----
  const editData = location.state || null;
  const isEdit = Boolean(editData?.id);

  // Fields
  const [type, setType] = useState(editData?.name || "");
  const [iconPreview, setIconPreview] = useState(""); // preview of existing or new
  const [iconFile, setIconFile] = useState(null); // actual file to send

  // If editing, load the current icon URL if provided
  useEffect(() => {
    if (editData?.icon) {
      // assuming backend sends a relative or absolute URL for icon
      setIconPreview(
        editData.icon.startsWith("http")
          ? editData.icon
          : `${BASE_URL}/${editData.icon}`
      );
    }
  }, [editData]);

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!type) {
      
      toast.success("Please enter your type")
      return;
    }

    const formData = new FormData();
    formData.append("name", type);
    if (iconFile) formData.append("icon", iconFile);

    try {
      if (isEdit) {
        const res = await axios.patch(
          `${BASE_URL}/restro/edit-restaurant-type/${editData.id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        if (res.status === 200 || res.data?.status) {
          
          toast.success(res.data?.message || "Updated successfully");
          navigate("/RestroTypeList");
        } else {
          
          toast.error(res.data?.message || "Something went wrong")
        }
      } else {
        const res = await axios.post(
          `${BASE_URL}/restro/create-restro-type`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        if (res.status === 201 || res.data?.status) {
          toast.success(res.data?.message || "Created successfully");
          setType("");
          setIconFile(null);
          setIconPreview("");
        } else {
          

          toast.error(res.data?.message || "Something went wrong")
        }
      }
    } catch (error) {
      console.error(error);

      toast.error("Error while saving Restaurant Type");
    }
  };

  return (
    <div className="main main_page p-6 w-full h-screen duration-900">
      <BreadcrumbsNav
        customTrail={[
          { label: "Restaurant Type List", path: "/RestroTypeList" },
          {
            label: isEdit ? "Update Restaurant Type" : "Restaurant Type",
            path: "/RestroType",
          },
        ]}
      />
      <div className="bg-white rounded-2xl shadow-md p-6">
        <PageTitle
          title={isEdit ? "Update Restaurant Type" : "Restaurant Type"}
        />
        <form onSubmit={handleSubmit} className="space-y-6 mt-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Restaurant Type
            </label>
            <input
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="Enter Restaurant Type"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-700 
                 shadow-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-300 
                 outline-none transition duration-200"
              required
            />
          </div>

          {/* Icon upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Icon
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleIconChange}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 
               file:rounded-lg file:border-0 file:text-sm file:font-semibold 
               file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
            />

            {/* Preview of existing or newly selected icon */}
            {iconPreview && (
              <div className="mt-3 flex flex-col items-center gap-4 p-2 border rounded-lg w-fit">
                {!iconFile && isEdit && (
                  <span className="text-xs text-gray-500">Current icon</span>
                )}
                <img
                  src={iconPreview}
                  alt="Icon Preview"
                  className="w-16 h-16 object-cover rounded-md border"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="px-6 py-2 rounded-xl bg-orange-500 cursor-pointer font-medium text-white 
              shadow-md transition hover:bg-orange-600 hover:shadow-lg 
              focus:ring-2 focus:ring-orange-300 whitespace-nowrap"
          >
            {isEdit ? "Update" : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RestroType;
