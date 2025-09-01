import React, { useState } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import { BASE_URL } from "../../config/Config";
import axios from "axios";
function RestroType() {
  const [type, setType] = useState("");

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!type) {
      alert("Please enter a type");
    }

    try {
      const res = await axios.post(`${BASE_URL}/restro/create-restro-type`, {
        name: type,
      });
      if (res.status === 201 || res.data?.status) {
        alert(res.data?.message || "Restro-Type created successfully");
        setType("");
      } else {
        alert(res.data?.message || "Something went wrong");
      }
    } catch (error) {
      console.error(error);
      alert("Error while creating Restro-Type");
    }
  };

  return (
    <div className="main main_page p-6 w-full h-screen duration-900">
      <div className="bg-white rounded-2xl shadow-md p-6 ">
        {/* <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Add New Icon
        </h2> */}
        <PageTitle title={"Restaurant Type"} />
        <form onSubmit={handleSubmit} className="space-y-6 mt-5">
          {/* Type Name */}
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

export default RestroType;
