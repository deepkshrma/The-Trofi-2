import React, { useState, useEffect, useRef } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import { BASE_URL } from "../../config/Config";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import { toast } from "react-toastify";

function RestroType() {
  const location = useLocation();
  const navigate = useNavigate();
  const editData = location.state || null;

  const isEdit = Boolean(editData?.id);

  const [type, setType] = useState(editData?.name || "");
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState(
    editData?.icon
      ? `${BASE_URL.replace(/\/api\/?$/, "/")}${editData.icon}`
      : null
  );

  const fileInputRef = useRef(null);

  // Reset form whenever we navigate with different state
  useEffect(() => {
    if (isEdit) {
      setType(editData.name || "");
      setIconPreview(
        editData.icon
          ? `${BASE_URL.replace(/\/api\/?$/, "/")}${editData.icon}`
          : null
      );
      setIconFile(null);
    } else {
      setType("");
      setIconFile(null);
      setIconPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [editData, isEdit]);

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
      toast.error("Please enter restaurant type");
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
          toast.success(res.data?.message || "Restaurant Type updated");
          navigate("/RestroTypeList");
        } else {
          toast.error(res.data?.message || "Something went wrong");
        }
      } else {
        const res = await axios.post(
          `${BASE_URL}/restro/create-restro-type`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        if (res.status === 201 || res.data?.status) {
          toast.success(res.data?.message || "Restaurant Type created");
          setType("");
          setIconFile(null);
          setIconPreview(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        } else {
          toast.error(res.data?.message || "Something went wrong");
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
          {/* Type Name */}
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

          {/* Icon Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Icon
            </label>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleIconChange}
              className="w-full cursor-pointer rounded-xl border border-gray-300 bg-gray-50 
                 px-3 py-2 text-sm text-gray-700 shadow-sm file:mr-4 file:rounded-lg 
                 file:border-0 file:bg-orange-500 file:px-4 file:py-2 file:text-white 
                 file:cursor-pointer hover:file:bg-orange-600 focus:ring-2 
                 focus:ring-orange-300 transition"
            />

            {iconPreview && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Preview:</p>
                <img
                  src={iconPreview}
                  alt="icon preview"
                  className="h-24 w-24 object-cover rounded-xl border border-gray-300 shadow-md"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-orange-500 cursor-pointer font-medium text-white 
                shadow-md transition hover:bg-orange-600 hover:shadow-lg 
                focus:ring-2 focus:ring-orange-300 whitespace-nowrap"
            >
              {isEdit ? "Update Restaurant Type" : "Create Restaurant Type"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RestroType;
