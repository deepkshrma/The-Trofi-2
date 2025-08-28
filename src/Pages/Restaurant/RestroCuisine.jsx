import React, { useState } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import { BASE_URL } from "../../config/config";
import axios from "axios";

function RestroCuisine() {
  const [cuisine, setCuisine] = useState("");

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cuisine) {
      alert("Please enter a cuisine name");
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/restro/create-cusine`, {
        name: cuisine,
      });

      if (res.status === 201 || res.data?.status) {
        alert(res.data?.message || "Cuisine created successfully");
        setCuisine("");
      } else {
        alert(res.data?.message || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      alert("Error while creating cuisine");
    }
  };

  return (
    <div className="main main_page p-6 w-full">
      <div className="bg-white rounded-2xl shadow-md p-6 ">
        <PageTitle title={"Restaurant Cuisine"} />
        <form onSubmit={handleSubmit} className="space-y-6 mt-5">
          {/* Icon Name */}
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
            className="w-[10%] rounded-xl bg-orange-500 px-4 py-2 cursor-pointer font-medium text-white 
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

export default RestroCuisine;
