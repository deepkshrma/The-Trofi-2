import React, { useState, useRef, useEffect } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import { BASE_URL } from "../../config/Config";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

function RestroAmenity() {
  const location = useLocation();
  const navigate = useNavigate();
  const editData = location.state || null;

  const [iconName, setIconName] = useState(editData?.name || "");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(
    editData?.icon ? `${BASE_URL.replace(/\/api\/?$/, "/")}${editData.icon}` : null
  );
  const fileInputRef = useRef(null);

  const isEdit = Boolean(editData?.id);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!iconName) {
      alert("Please provide amenity name");
      return;
    }

    const formData = new FormData();
    formData.append("amenity_name", iconName);
    if (file) {
      formData.append("amenity_icon", file);
    }

    try {
      if (isEdit) {
        const res = await axios.patch(
          `${BASE_URL}/restro/edit-amenity/${editData.id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        if (res.status === 200 || res.data?.status) {
          alert(res.data?.message || "Amenity updated successfully");
          navigate("/RestroAmenityList");
        } else {
          alert(res.data?.message || "Something went wrong");
        }
      } else {
        const res = await axios.post(
          `${BASE_URL}/restro/create-amenity`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        if (res.status === 201 || res.data?.status) {
          alert(res.data?.message || "Amenity created successfully");
          setIconName("");
          setFile(null);
          setPreview(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        } else {
          alert(res.data?.message || "Something went wrong");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error while saving amenity");
    }
  };

  return (
    <div className="main main_page p-6 w-full h-screen duration-900">
      <div className="bg-white rounded-2xl shadow-md p-6 ">
        <PageTitle title={isEdit ? "Update Amenity" : "Restaurant Amenity"} />
        <form onSubmit={handleSubmit} className="space-y-6 mt-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon Name
            </label>
            <input
              type="text"
              value={iconName}
              onChange={(e) => setIconName(e.target.value)}
              placeholder="Enter icon name"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-700 
                 shadow-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-300 
                 outline-none transition duration-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Icon Image
            </label>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="w-full cursor-pointer rounded-xl border border-gray-300 bg-gray-50 
                 px-3 py-2 text-sm text-gray-700 shadow-sm file:mr-4 file:rounded-lg 
                 file:border-0 file:bg-orange-500 file:px-4 file:py-2 file:text-white 
                 file:cursor-pointer hover:file:bg-orange-600 focus:ring-2 
                 focus:ring-orange-300 transition"
            />
          </div>

          {preview && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Preview:</p>
              <img
                src={preview}
                alt="preview"
                className="h-24 w-24 object-cover rounded-xl border border-gray-300 shadow-md"
              />
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-orange-500 cursor-pointer font-medium text-white 
      shadow-md transition hover:bg-orange-600 hover:shadow-lg 
      focus:ring-2 focus:ring-orange-300 whitespace-nowrap"
            >
              {isEdit ? "Update Amenity" : "Save Icon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RestroAmenity;
