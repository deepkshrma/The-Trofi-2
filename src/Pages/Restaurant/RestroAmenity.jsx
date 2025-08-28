import React, { useState, useRef } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import { BASE_URL } from "../../config/config";
import axios from "axios";

function RestroAmenity() {
  const [iconName, setIconName] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

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

    if (!iconName || !file) {
      alert("Please provide both icon name and image");
      return;
    }

    const formData = new FormData();
    formData.append("amenity_name", iconName);
    formData.append("amenity_icon", file);

    try {
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
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        alert(res.data?.message || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      alert("Error while creating amenity");
    }
  };

  return (
    <div className="main main_page p-6 w-full">
      <div className="bg-white rounded-2xl shadow-md p-6 ">
        <PageTitle title={"Restaurant Amenity"} />
        <form onSubmit={handleSubmit} className="space-y-6 mt-5">
          {/* Icon Name */}
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
              required
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
              className="w-[10%] rounded-xl bg-orange-500 px-4 py-2 cursor-pointer font-medium text-white 
               shadow-md transition hover:bg-orange-600 hover:shadow-lg 
               focus:ring-2 focus:ring-orange-300"
            >
              Save Icon
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RestroAmenity;
