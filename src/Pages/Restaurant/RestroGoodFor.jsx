import React, { useState } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import { BASE_URL } from "../../config/config";
import axios from "axios";

function RestroGoodFor() {
  const [goodFor, setGoodFor] = useState("");

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!goodFor) {
      alert("Please enter a value");
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/restro/create-good-for`, {
        name: goodFor,
      });

      if (res.status === 201 || res.data?.status) {
        alert(res.data?.message || "Good For created successfully");
        setGoodFor("");
      } else {
        alert(res.data?.message || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      alert("Error while creating Good For");
    }
  };

  return (
    <div className="main main_page p-6 w-full duration-900">
      <div className="bg-white rounded-2xl shadow-md p-6 ">
        <PageTitle title={"Restaurant Good For"} />
        <form onSubmit={handleSubmit} className="space-y-6 mt-5">
          {/* Restaurant Good Input */}
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

export default RestroGoodFor;
