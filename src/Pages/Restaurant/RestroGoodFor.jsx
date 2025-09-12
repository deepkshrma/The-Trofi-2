import React, { useState, useEffect } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import { BASE_URL } from "../../config/Config";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import DynamicBreadcrumbs from "../../components/common/BreadcrumbsNav/DynamicBreadcrumbs";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";

function RestroGoodFor() {
  const location = useLocation();
  const navigate = useNavigate();

  const editData = location.state || null;
  const [goodFor, setGoodFor] = useState(editData?.name || "");
  const [icon, setIcon] = useState(null);
  const [preview, setPreview] = useState(editData?.icon || null);

  const isEdit = Boolean(editData?.id);

  // handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setIcon(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!goodFor) {
      alert("Please enter a value");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", goodFor);
      if (icon) formData.append("icon", icon);

      if (isEdit) {
        // Update
        const res = await axios.patch(
          `${BASE_URL}/restro/edit-good-for/${editData.id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        if (res.status === 200 || res.data?.status) {
          alert(res.data?.message || "Updated successfully");
          navigate("/RestroGoodForList");
        } else {
          alert(res.data?.message || "Something went wrong");
        }
      } else {
        // Create
        const res = await axios.post(
          `${BASE_URL}/restro/create-good-for`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        if (res.status === 201 || res.data?.status) {
          alert(res.data?.message || "Created successfully");
          setGoodFor("");
          setIcon(null);
          setPreview(null);
        } else {
          alert(res.data?.message || "Something went wrong");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error while saving Good For");
    }
  };

  return (
    <div className="main main_page p-6 w-full h-screen duration-900">
      <BreadcrumbsNav
        customTrail={[
          { label: "Restaurant - Good For", path: "/RestroGoodForList" },
          {
            label: isEdit ? "Update Good For" : "Restaurant Good For",
            path: "/RestroGoodFor",
          },
        ]}
      />
      <div className="bg-white rounded-2xl shadow-md p-6 ">
        <PageTitle title={isEdit ? "Update Good For" : "Restaurant Good For"} />
        <form onSubmit={handleSubmit} className="space-y-6 mt-5">
          {/* Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Restaurant Good For
            </label>
            <input
              type="text"
              value={goodFor}
              onChange={(e) => setGoodFor(e.target.value)}
              placeholder="Enter Restaurant Good For"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-700 
                 shadow-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-300 
                 outline-none transition duration-200"
              required
            />
          </div>

          {/* Icon Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full"
            />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="mt-3 w-20 h-20 object-cover rounded-full shadow-md"
              />
            )}
          </div>

          {/* Submit */}
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

export default RestroGoodFor;
