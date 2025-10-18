import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import PageTitle from "../../components/PageTitle/PageTitle";
import { BASE_URL } from "../../config/Config";
import axios from "axios";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import { toast } from "react-toastify";

function RestroCuisine() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [cuisine, setCuisine] = useState("");

  // Prefill data if editing
  useEffect(() => {
    if (id && location.state?.name) {
      setCuisine(location.state.name);
    }
  }, [id, location]);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cuisine.trim()) {
      toast.error("Please enter a cuisine name");
      return;
    }

    const authData = JSON.parse(localStorage.getItem("trofi_user"));
    const token = authData?.token;

    if (!token) {
      toast.error("Please login first");
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      let res;
      if (id) {
        // Update mode
        res = await axios.patch(
          `${BASE_URL}/restro/edit-cusine/${id}`,
          { name: cuisine },
          config
        );
      } else {
        // Create mode
        res = await axios.post(
          `${BASE_URL}/restro/create-cusine`,
          { name: cuisine },
          config
        );
      }

      if (res.data?.success || res.status === 200 || res.status === 201) {
        toast.success(res.data?.message || (id ? "Cuisine updated" : "Cuisine created"));
        if (!id) setCuisine("");
        navigate("/RestroCuisineList");
      } else {
        toast.error(res.data?.message || "Something went wrong");
      }
    } catch (err) {
      console.error("Error while saving cuisine:", err);
      if (err.response?.data?.message) {
        // Handle backend errors (like permission denied)
        toast.error(err.response.data.message);
      } else {
        toast.error("Server error, please try again later");
      }
    }
  };

  return (
    <div className="main main_page p-6 w-full h-screen duration-900">
      <BreadcrumbsNav
        customTrail={[
          { label: "Restaurant - Cuisines", path: "/RestroCuisineList" },
          {
            label: id ? "Update Cuisine" : "Restaurant Cuisine",
            path: "/RestroCuisine",
          },
        ]}
      />
      <div className="bg-white rounded-2xl shadow-md p-6">
        <PageTitle title={id ? "Update Cuisine" : "Restaurant Cuisine"} />
        <form onSubmit={handleSubmit} className="space-y-6 mt-5">
          {/* Cuisine Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Restaurant Cuisine
            </label>
            <input
              type="text"
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              placeholder="Enter Restaurant Cuisine"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-700 
                 shadow-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-300 
                 outline-none transition duration-200"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="px-6 py-2 rounded-xl bg-orange-500 cursor-pointer font-medium text-white 
      shadow-md transition hover:bg-orange-600 hover:shadow-lg 
      focus:ring-2 focus:ring-orange-300 whitespace-nowrap"
          >
            {id ? "Update" : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RestroCuisine;
