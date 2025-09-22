import React, { useEffect, useState } from "react";
import Pagination from "../../components/common/Pagination/Pagination";
import { BASE_URL } from "../../config/Config";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import DeleteModel from "../../components/common/DeleteModel/DeleteModel";
import PageTitle from "../../components/PageTitle/PageTitle";
import DynamicBreadcrumbs from "../../components/common/BreadcrumbsNav/DynamicBreadcrumbs";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import { MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { PlusCircle } from "lucide-react";

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

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    // setSelectedAdmin(null);
  };

  const confirmDelete = async () => {};

  const getTextPreview = (html, limit = 100) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || "";
    return text.length > limit ? text.substring(0, limit) + "..." : text;
  };

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
    <>
      <div className="p-6 main main_page duration-900">
        <BreadcrumbsNav
          customTrail={[
            { label: "Dish Categories", path: "/RestroDishCategoryList" },
          ]}
        />
        <div className="flex justify-between items-center mb-3">
          <PageTitle title={"Dish Categories"} />
          <button
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg cursor-pointer"
            style={{ backgroundColor: "#F9832B" }}
            onClick={() => navigate("/RestroDishCategory")}
          >
            <PlusCircle size={18} /> Add Dish Categories
          </button>
        </div>
        
        <div className="overflow-x-auto bg-white rounded-2xl shadow-md pb-3 mt-5">
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
                    <td className="p-3 text-gray-500">
                      {getTextPreview(cat.description, 50)}
                      {cat.description && cat.description.length > 100}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-3">
                        <button
                          onClick={() =>
                            navigate("/RestroDishCategory", {
                              state: { category: cat },
                            })
                          }
                          className="flex justify-center items-center bg-green-500 hover:bg-green-600 text-white w-8 h-8  cursor-pointer rounded text-sm"
                        >
                          <MdEdit size={18} />
                        </button>
                        {/* <button
                          onClick={() => setShowDeleteModal(true)}
                          className="flex justify-center items-center bg-red-500 hover:bg-red-600 text-white w-8 h-8  cursor-pointer rounded text-sm "
                        >
                          <MdDelete size={18} />
                        </button> */}
                      </div>
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
      <DeleteModel
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        redbutton="Confirm"
        para="Do you really want to delete? This action cannot be undone."
      />
    </>
  );
};

export default RestroDishCategoryList;
