import React, { useState, useRef, useEffect } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import { BASE_URL } from "../../config/Config";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DynamicBreadcrumbs from "../../components/common/BreadcrumbsNav/DynamicBreadcrumbs";

function RestroDishCategory() {
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const fileInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const editCategory = location.state?.category; // 👈 edit ke liye category object

  // Prefill if editing
  useEffect(() => {
    if (editCategory) {
      setCategoryName(editCategory.category_name || "");
      setDescription(editCategory.description || "");
      if (editCategory.category_icon) {
        setPreview(
          `${BASE_URL.replace("/api", "")}/${editCategory.category_icon}`
        );
      }
    }
  }, [editCategory]);

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

    if (!categoryName || !description || (!file && !editCategory)) {
      toast.error("Please provide category name, description and icon");
      return;
    }

    const formData = new FormData();
    formData.append("category_name", categoryName);
    formData.append("description", description);
    if (file) {
      formData.append("category_icon", file);
    }

    try {
      let res;
      if (editCategory) {
        res = await axios.patch(
          `${BASE_URL}/restro/edit-dish-category/${editCategory._id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        if (res.data?.success) {
          toast.success(res.data?.message || "Category updated successfully");
          navigate("/RestroDishCategoryList");
        } else {
          toast.error(res.data?.message || "Failed to update category");
        }
      } else {
        res = await axios.post(
          `${BASE_URL}/restro/create-dish-category`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        if (res.data?.status) {
          toast.success(res.data?.message || "Category created successfully");
          navigate("/RestroDishCategoryList");
        } else {
          toast.error(res.data?.message || "Failed to create category");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Error while saving dish category");
    }
  };

  return (
    <div className="main main_page p-6 w-full h-screen duration-900">
      <DynamicBreadcrumbs />
      <div className="bg-white rounded-2xl shadow-md p-6 ">
        <PageTitle
          title={editCategory ? "Edit Dish Category" : "Create Dish Category"}
        />
        <form onSubmit={handleSubmit} className="space-y-6 mt-5">
          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Enter Category Name"
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
              Upload Category Icon
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
              // required only if creating new
              required={!editCategory}
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
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-orange-500 cursor-pointer font-medium text-white 
      shadow-md transition hover:bg-orange-600 hover:shadow-lg 
      focus:ring-2 focus:ring-orange-300 whitespace-nowrap"
            >
              {editCategory ? "Update Category" : "Save Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RestroDishCategory;
