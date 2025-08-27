import React, { useState } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";

function RestroGoodFor() {
  const [iconName, setIconName] = useState("");

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
        <PageTitle title={"Restaurant Good For"} />
        <form onSubmit={handleSubmit} className="space-y-6 mt-5">
          {/* Icon Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Restaurant Good For
            </label>
            <input
              type="text"
              value={iconName}
              onChange={(e) => setIconName(e.target.value)}
              placeholder="Enter Restaurant Good For"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-700 
                 shadow-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-300 
                 outline-none transition duration-200"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-[10%] rounded-xl bg-orange-500 px-4 py-2 font-medium text-white 
               shadow-md transition hover:bg-orange-600 hover:shadow-lg 
               focus:ring-2 focus:ring-orange-300"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
}

export default RestroGoodFor;
