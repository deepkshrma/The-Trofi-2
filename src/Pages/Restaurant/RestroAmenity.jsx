import React, { useState } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";

function RestroAmenity() {
  const [iconName, setIconName] = useState("");
  const [preview, setPreview] = useState(null);

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Icon Name: ${iconName}`);
    // Here you would send form data to backend (API)
  };
  return (
    <div className="main main_page p-6 w-full">
      <div className="bg-white rounded-2xl shadow-md p-6 ">
        {/* <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Add New Icon
        </h2> */}
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
              className="w-[10%] rounded-xl bg-orange-500 px-4 py-2 font-medium text-white 
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
