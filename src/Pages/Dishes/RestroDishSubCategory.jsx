import React, { useState, useRef, useEffect } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import { BASE_URL } from "../../config/Config";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DynamicBreadcrumbs from "../../components/common/BreadcrumbsNav/DynamicBreadcrumbs";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";

function RestroDishSubCategory() {
  const [parentCategories, setParentCategories] = useState([]);
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Agar edit button se aaye hain
  const editData = location.state?.rowData || null;
  const isEdit = Boolean(editData?._id);

  // Fetch parent categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/restro/get-dish-category`);
        if (res.status === 200) {
          setParentCategories(res.data?.data || []); // store fetched categories
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Agar edit mode hai to form prefill karo
  useEffect(() => {
    if (isEdit) {
      setParentCategoryId(editData.parentCategoryId || "");
      setSubCategoryName(editData.sub_categ_name || "");
      setDescription(editData.description || "");
      if (editData.icon) {
        setPreview(`${BASE_URL.replace("/api", "")}/${editData.icon}`);
      }
    }
  }, [isEdit, editData]);

  // File change
  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!parentCategoryId || !subCategoryName || !description) {
      toast.error("Please provide all fields");
      return;
    }

    const formData = new FormData();
    formData.append("parentCategoryId", parentCategoryId);
    formData.append("sub_categ_name", subCategoryName);
    formData.append("description", description);
    if (file) formData.append("icon", file);

    try {
      let res;
      if (isEdit) {
        // UPDATE
        res = await axios.patch(
          `${BASE_URL}/restro/edit-dish-sub-category/${editData._id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        // CREATE
        res = await axios.post(
          `${BASE_URL}/restro/create-dish-sub-category`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

      if (res.status === 200 || res.status === 201) {
        toast.success(res.data?.message || "Success");
        navigate("/RestroDishSubCategoryList"); // back to list
      } else {
        toast.error(res.data?.message || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error while saving sub-category");
    }
  };

  return (
    <div className="main main_page p-6 w-full h-screen duration-900">
      <BreadcrumbsNav
        customTrail={[
          {
            label: "Dish Sub Categories",
            path: "/RestroDishSubCategoryList",
          },
          {
            label: isEdit
              ? "Edit Restaurant Dish Sub Category"
              : "Create Restaurant Dish Sub Category",
            path: "/RestroDishSubCategory",
          },
        ]}
      />
      <div className="bg-white rounded-2xl shadow-md p-6 ">
        <PageTitle
          title={
            isEdit
              ? "Edit Restaurant Dish Sub Category"
              : "Create Restaurant Dish Sub Category"
          }
        />
        <form onSubmit={handleSubmit} className="space-y-6 mt-5">
          {/* Parent Category Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Parent Category
            </label>
            <select
              value={parentCategoryId}
              onChange={(e) => setParentCategoryId(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-700 
                shadow-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-300 
                outline-none transition duration-200"
              required
            >
              <option value="">-- Select Parent Category --</option>
              {parentCategories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>

          {/* Sub Category Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sub Category Name
            </label>
            <input
              type="text"
              value={subCategoryName}
              onChange={(e) => setSubCategoryName(e.target.value)}
              placeholder="Enter Sub Category Name"
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
              Upload Sub Category Icon
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
              required={!isEdit} // create requires file, edit optional
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
              {isEdit ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RestroDishSubCategory;
