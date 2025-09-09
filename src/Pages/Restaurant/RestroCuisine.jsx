import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import PageTitle from "../../components/PageTitle/PageTitle";
import { BASE_URL } from "../../config/Config";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function RestroCuisine() {
  const { id } = useParams(); // check if edit mode
  const location = useLocation();
  const [cuisine, setCuisine] = useState("");
  const navigate = useNavigate();

  // Prefill if edit mode
  useEffect(() => {
    if (id && location.state?.name) {
      setCuisine(location.state.name);
    }
  }, [id, location]);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cuisine) {
      alert("Please enter a cuisine name");
      return;
    }

    try {
      let res;
      if (id) {
        // Update mode
        res = await axios.patch(`${BASE_URL}/restro/edit-cusine/${id}`, {
          name: cuisine,
        });
      } else {
        // Create mode
        res = await axios.post(`${BASE_URL}/restro/create-cusine`, {
          name: cuisine,
        });
      }

      if (res.status === 200 || res.status === 201 || res.data?.status) {
        alert(res.data?.message || (id ? "Cuisine updated" : "Cuisine created"));
        if (!id) setCuisine(""); // clear only in create
        navigate('/RestroCuisineList')
      } else {
        alert(res.data?.message || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      alert("Error while saving cuisine");
    }
  };

  return (
    <div className="main main_page p-6 w-full h-screen duration-900">
      <div className="bg-white rounded-2xl shadow-md p-6 ">
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
