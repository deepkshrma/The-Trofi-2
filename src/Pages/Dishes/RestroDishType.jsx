import React, { useState, useRef, useEffect } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import { BASE_URL } from "../../config/Config";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DynamicBreadcrumbs from "../../components/common/BreadcrumbsNav/DynamicBreadcrumbs";

function RestroDishType() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editId, setEditId] = useState(null);

  const fileInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Check if edit mode (id passed via state from list page)
  useEffect(() => {
    if (location.state?.dish) {
      const { _id, name, description, icon } = location.state.dish;
      setEditId(_id);
      setName(name);
      setDescription(description);
      if (icon) {
        setPreview(`${BASE_URL.replace("/api", "")}/${icon}`);
      }
    }
  }, [location.state]);

  // Handle file input change
  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !description) {
      toast.error("Please provide name and description");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    if (file) formData.append("icon", file);

    try {
      let res;
      if (editId) {
        res = await axios.patch(
          `${BASE_URL}/restro/edit-dish-type/${editId}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        res = await axios.post(
          `${BASE_URL}/restro/create-dish-type`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

      console.log("API RESPONSE:", res);

      if ([200, 201].includes(res.status)) {
        toast.success(res.data?.message || "Dish Type saved successfully");
        navigate("/RestroDishTypeList");

        if (!editId) {
          setName("");
          setDescription("");
          setFile(null);
          setPreview(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      } else {
        toast.error(res.data?.message || "Something went wrong");
      }
    } catch (err) {
      console.error("API ERROR:", err);
      toast.error(
        err.response?.data?.message || "Error while saving dish type"
      );
    }
  };

  return (
    <div className="main main_page p-6 w-full h-screen duration-900">
      <DynamicBreadcrumbs />
      <div className="bg-white rounded-2xl shadow-md p-6 ">
        <PageTitle
          title={editId ? "Edit Restaurant Dish Type" : "Restaurant Dish Type"}
        />
        <form onSubmit={handleSubmit} className="space-y-6 mt-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dish Type Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter Dish Type Name"
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
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter Description"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-700 
                 shadow-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-300 
                 outline-none transition duration-200"
              required
            />
          </div>

          {/* Icon Upload */}
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

          {/* Preview */}
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

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-orange-500 cursor-pointer font-medium text-white 
      shadow-md transition hover:bg-orange-600 hover:shadow-lg 
      focus:ring-2 focus:ring-orange-300 whitespace-nowrap"
            >
              {editId ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RestroDishType;
