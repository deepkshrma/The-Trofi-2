import React, { useState, useEffect } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import { BASE_URL } from "../../config/Config";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";

function CreateHashtag() {
  const [type, setType] = useState("Restaurant"); // default
  const [starValue, setStarValue] = useState(1);
  const [hashTagTitle, setHashTagTitle] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const editData = location.state?.rowData || null;
  const isEdit = Boolean(editData?._id);

  useEffect(() => {
    if (isEdit) {
      setType(editData.type || "Restaurant");
      setStarValue(editData.star_value || 1);
      setHashTagTitle(editData.hashTagTitle || "");
    }
  }, [isEdit, editData]);

  const authData = JSON.parse(localStorage.getItem("trofi_user"));
  const token = authData?.token;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Please login first");
      return;
    }

    if (!hashTagTitle || !hashTagTitle.startsWith("#")) {
      toast.error("Hashtag must start with #");
      return;
    }

    const payload = {
      type,
      star_value: Number(starValue),
      hashTagTitle,
    };

    try {
      let res;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`, // <-- attach token
        },
      };

      if (isEdit) {
        res = await axios.patch(
          `${BASE_URL}/restro/update-hashtags/${editData._id}`,
          payload,
          config
        );
      } else {
        res = await axios.post(
          `${BASE_URL}/restro/create-hashtags`,
          payload,
          config
        );
      }
      if (res.status === 200 || res.status === 201) {
        toast.success(res.data?.message || "Success");
        navigate("/HashtagList"); // redirect to hashtag list page
      } else {
        toast.error(res.data?.message || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error while saving hashtag");
    }
  };

  return (
    <div className="main main_page p-6 w-full h-screen duration-900">
      <BreadcrumbsNav
        customTrail={[
          { label: "Hashtags", path: "/HashtagList" },
          {
            label: isEdit ? "Edit Hashtag" : "Create Hashtag",
            path: "/CreateHashtag",
          },
        ]}
      />
      <div className="bg-white rounded-2xl shadow-md p-6 ">
        <PageTitle title={isEdit ? "Edit Hashtag" : "Create Hashtag"} />
        <form onSubmit={handleSubmit} className="space-y-6 mt-5">
          {/* Type Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-700
                 shadow-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-300 
                 outline-none transition duration-200"
            >
              <option value="Restaurant">Restaurant</option>
              <option value="Dish">Dish</option>
            </select>
          </div>

          {/* Star Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Star Value
            </label>
            <input
              type="number"
              min={1}
              max={5}
              value={starValue}
              onChange={(e) => setStarValue(e.target.value)}
              placeholder="Enter Star Value (1-5)"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-700
                 shadow-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-300 
                 outline-none transition duration-200"
              required
            />
          </div>

          {/* Hashtag Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hashtag
            </label>
            <input
              type="text"
              value={hashTagTitle}
              onChange={(e) => setHashTagTitle(e.target.value)}
              placeholder="#BestFood"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-700
                 shadow-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-300 
                 outline-none transition duration-200"
              required
            />
          </div>

          {/* Submit Button */}
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

export default CreateHashtag;
