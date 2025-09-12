import React, { useState } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import { BASE_URL } from "../../config/Config";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import DynamicBreadcrumbs from "../../components/common/BreadcrumbsNav/DynamicBreadcrumbs";

function RestroType() {
  const location = useLocation();
  const navigate = useNavigate();

  const editData = location.state || null;
  const [type, setType] = useState(editData?.name || "");
  const isEdit = Boolean(editData?.id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!type) {
      alert("Please enter a type");
      return;
    }

    try {
      if (isEdit) {
        const res = await axios.patch(
          `${BASE_URL}/restro/edit-restaurant-type/${editData.id}`,
          { name: type }
        );

        if (res.status === 200 || res.data?.status) {
          alert(res.data?.message || "Updated successfully");
          navigate("/RestroTypeList");
        } else {
          alert(res.data?.message || "Something went wrong");
        }
      } else {
        const res = await axios.post(
          `${BASE_URL}/restro/create-restaurant-type`,
          {
            name: type,
          }
        );

        if (res.status === 201 || res.data?.status) {
          alert(res.data?.message || "Created successfully");
          setType("");
        } else {
          alert(res.data?.message || "Something went wrong");
        }
      }
    } catch (error) {
      console.error(error);
      alert("Error while saving Restaurant Type");
    }
  };

  return (
    <div className="main main_page p-6 w-full h-screen duration-900">
      <DynamicBreadcrumbs />
      <div className="bg-white rounded-2xl shadow-md p-6 ">
        <PageTitle
          title={isEdit ? "Update Restaurant Type" : "Restaurant Type"}
        />
        <form onSubmit={handleSubmit} className="space-y-6 mt-5">
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

export default RestroType;
