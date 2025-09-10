import React, { useState, useEffect } from "react";
import Pagination from "../../components/common/Pagination/Pagination";
import axios from "axios";
import { BASE_URL } from "../../config/Config";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function RestroDishSubCategoryList() {
  const [subCategories, setSubCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalRecords: 0,
  });

  const navigate = useNavigate();

  // Fetch Sub Categories
  const fetchSubCategories = async (page = 1) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/restro/get-dish-sub-category?page=${page}&limit=${pagination.pageSize}`
      );

      if (res.data?.success) {
        setSubCategories(res.data?.data || []);
        setPagination((prev) => ({
          ...prev,
          currentPage: page,
          totalRecords: res.data?.totalRecords || res.data?.data.length,
          totalPages: res.data?.totalPages || 1,
        }));
      } else {
        toast.error(res.data?.message || "Failed to fetch sub categories");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching dish sub categories");
    }
  };

  useEffect(() => {
    fetchSubCategories(1);
    // eslint-disable-next-line
  }, []);

  // Filter by search
  const filteredSubCategories = subCategories.filter((subCategory) =>
    subCategory.sub_categ_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 main main_page duration-900">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        Dish Sub Categories
      </h2>
      <div className="overflow-x-auto bg-white rounded-2xl shadow-md pb-3">
        {/* 🔍 Search */}
        <div className="flex flex-wrap gap-3 m-3">
          <input
            type="text"
            placeholder="Search by sub category name..."
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
              <th className="p-3">Sub Category Name</th>
              <th className="p-3">Description</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubCategories.length > 0 ? (
              filteredSubCategories.map((sub, index) => (
                <tr
                  key={sub._id}
                  className="border-b border-gray-300 hover:bg-orange-50 transition"
                >
                  <td className="p-3 pl-4 font-medium text-gray-700">
                    {index + 1}
                  </td>
                  <td className="p-3">
                    <img
                      src={`${BASE_URL.replace("/api", "")}/${sub.icon}`}
                      alt={sub.sub_categ_name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  </td>
                  <td className="p-3 text-gray-700">{sub.sub_categ_name}</td>
                  <td className="p-3 text-gray-500">{sub.description}</td>
                  <td className="p-3">
                    <button
                      onClick={() =>
                        navigate("/RestroDishSubCategory", {
                          state: { rowData: sub },
                        })
                      }
                      className="px-3 py-1 rounded-lg bg-green-500 text-white hover:bg-green-600 cursor-pointer transition"
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
                  No sub categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination
          currentPage={pagination.currentPage}
          totalItems={pagination.totalRecords}
          itemsPerPage={pagination.pageSize}
          onPageChange={(page) => fetchSubCategories(page)}
          totalPages={pagination.totalPages}
          type="backend"
        />
      </div>
    </div>
  );
}

export default RestroDishSubCategoryList;
