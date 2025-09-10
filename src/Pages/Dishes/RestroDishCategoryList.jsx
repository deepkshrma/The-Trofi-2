import React, { useEffect, useState } from "react";
import Pagination from "../../components/common/Pagination/Pagination";
import { BASE_URL } from "../../config/Config";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const RestroDishCategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalRecords: 0,
  });

  const navigate = useNavigate();

  // Fetch categories
  const fetchCategories = async (page = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/restro/get-dish-category`);
      if (res.data?.success) {
        setCategories(res.data.data);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          pageSize: 10,
          totalRecords: res.data.data.length,
        });
      } else {
        toast.error(res.data?.message || "Failed to fetch categories");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Apply search
  const filteredCategories = categories.filter((category) =>
    category.category_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 main main_page duration-900">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        Dish Categories
      </h2>
      <div className="overflow-x-auto bg-white rounded-2xl shadow-md pb-3">
        {/* 🔍 Search */}
        <div className="flex flex-wrap gap-3 m-3">
          <input
            type="text"
            placeholder="Search by category name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 bg-white p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] outline-none w-64"
          />
        </div>

        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 text-gray-700 text-left">
              <th className="p-3 pl-4">S.No.</th>
              <th className="p-3">Image</th>
              <th className="p-3">Category Name</th>
              <th className="p-3">Description</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center p-6 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : filteredCategories.length > 0 ? (
              filteredCategories.map((cat, index) => (
                <tr
                  key={cat._id}
                  className="border-b border-gray-300 hover:bg-orange-50 transition"
                >
                  <td className="p-3 pl-4 font-medium text-gray-700">
                    {index + 1}
                  </td>
                  <td className="p-3">
                    <img
                      src={`${BASE_URL.replace("/api", "")}/${
                        cat.category_icon
                      }`}
                      alt={cat.category_name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  </td>
                  <td className="p-3 text-gray-700">{cat.category_name}</td>
                  <td className="p-3 text-gray-500">{cat.description}</td>
                  <td className="p-3">
                    <button
                      onClick={() =>
                        navigate("/RestroDishCategory", {
                          state: { category: cat },
                        })
                      }
                      className="px-3 py-1 rounded-lg bg-green-500 text-white text-sm shadow-md hover:bg-green-600"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center p-6 text-gray-500 italic"
                >
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <Pagination
          currentPage={pagination.currentPage}
          totalItems={pagination.totalRecords}
          itemsPerPage={pagination.pageSize}
          onPageChange={(page) => fetchCategories(page)}
          totalPages={pagination.totalPages}
          type="backend"
        />
      </div>
    </div>
  );
};

export default RestroDishCategoryList;
