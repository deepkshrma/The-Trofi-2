import React, { useState, useRef, useEffect } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import { BASE_URL } from "../../config/Config";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

function RestroDishCategory() {
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { id } = useParams(); // edit mode if id exists

  // Fetch data if edit mode
  useEffect(() => {
    if (id) {
      axios
        .get(`${BASE_URL}/restro/get-dish-category`)
        .then((res) => {
          const category = res.data?.data.find((c) => c._id === id);
          if (category) {
            setCategoryName(category.category_name);
            setDescription(category.description);
            setPreview(`${BASE_URL.replace("/api", "")}/${category.category_icon}`);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [id]);

  // Handle file input change
  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryName || !description || (!file && !id)) {
      toast.error("Please provide category name, description and icon");
      return;
    }

    const formData = new FormData();
    formData.append("category_name", categoryName);
    formData.append("description", description);
    if (file) formData.append("category_icon", file);

    try {
      let res;
      if (id) {
        res = await axios.patch(
          `${BASE_URL}/restro/edit-dish-category/${id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        res = await axios.post(
          `${BASE_URL}/restro/create-dish-category`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

      if (res.data?.status || res.data?.success) {
        toast.success(res.data?.message || "Saved successfully");
        navigate("/RestroDishCategoryList"); 
      } else {
        toast.error(res.data?.message || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error while saving category");
    }
  };

  return (
    <div className="main main_page p-6 w-full h-screen duration-900">
      <div className="bg-white rounded-2xl shadow-md p-6 ">
        <PageTitle title={"Restaurant Dish Category"} />
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
              required={!id}
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
              {id ? "Update Category" : "Save Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RestroDishCategory;
