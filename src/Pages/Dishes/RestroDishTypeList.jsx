import React, { useState, useEffect } from "react";
import Pagination from "../../components/common/Pagination/Pagination";
import { BASE_URL } from "../../config/Config";
import { useNavigate } from "react-router-dom";
import DeleteModel from "../../components/common/DeleteModel/DeleteModel";
import PageTitle from "../../components/PageTitle/PageTitle";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import { MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { FiFilter } from "react-icons/fi";
import { CiExport } from "react-icons/ci";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const RestroDishTypeList = () => {
  const [dishes, setDishes] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const pageSize = 10;
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
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

  // Fetch dish types
  useEffect(() => {
    fetchDishes();
  }, []);

  async function fetchDishes() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/restro/get-dish-type`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json?.success) throw new Error(json.message || "API Error");

      setDishes(json.data);
      setPagination((p) => ({
        ...p,
        totalRecords: json.data.length,
        totalPages: Math.ceil(json.data.length / pageSize),
      }));
    } catch (err) {
      setError(err.message || "Failed to fetch dish types");
    } finally {
      setLoading(false);
    }
  }

  // Search filter
  const filtered = dishes.filter((dish) =>
    dish.name.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination slice
  const start = (pagination.currentPage - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  const handleExport = () => {
      // Prepare data for Excel
      const exportData = reviews.map((rev, index) => ({
        "S.No.": index + 1,
        "User Name": rev.userName,
        "Restaurant Name": rev.restroName,
        "Rating Label": faceStars[rev.star_value - 1]?.label || rev.rating_label,
        Stars: rev.star_value,
        Status: rev.status,
      }));
  
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "RestaurantReviews");
  
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(blob, "RestaurantReviews.xlsx");
    };

  return (
    <>
      <div className="main main_page p-6 duration-900">
        <BreadcrumbsNav
          customTrail={[
            {
              label: "Dish Management",
              path: "/RestroDishTypeList",
            },
          ]}
        />
        <PageTitle title={"Dish Management"} />
        <div className="overflow-x-auto bg-white rounded-2xl shadow-md pb-3 mt-5">
          {/* Search
          <div className="flex flex-wrap gap-3 m-3">
            <input
              type="text"
              placeholder="Search by dish name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination((p) => ({ ...p, currentPage: 1 }));
              }}
              className="border border-gray-300 bg-white p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] outline-none w-64"
            />
          </div> */}

          <div className="flex justify-between items-center m-3">
            {/* 🔍 Search input */}
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 bg-white p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] outline-none w-64"
            />

            {/* 📂 Right-side controls */}
            <div className="flex items-center gap-3">
              {/* 🧮 Filter button */}
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md border border-gray-300 text-gray-600 hover:shadow-lg cursor-pointer"
                onClick={() => {
                  // TODO: open a filter modal / drawer
                  console.log(
                    "Open filter options: cuisine, hygiene, favorites"
                  );
                }}
              >
                <FiFilter size={20} /> Filter
              </button>

              {/* ⬇ Export button */}
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md border border-gray-300 text-gray-600 hover:shadow-lg cursor-pointer"
                onClick={handleExport}
              >
                <CiExport size={20} /> Export
              </button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center p-6">Loading dish types…</div>
          ) : error ? (
            <div className="text-center p-6 text-red-500">Error: {error}</div>
          ) : (
            <>
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200 text-left text-gray-700">
                    <th className="p-3 pl-4">S.No.</th>
                    <th className="p-3">Image</th>
                    <th className="p-3">Dish Type</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length > 0 ? (
                    paginated.map((dish, index) => (
                      <tr
                        key={dish._id}
                        className="border-b border-gray-300 hover:bg-orange-50 transition "
                      >
                        <td className="p-3 pl-4 font-medium text-gray-700">
                          {start + index + 1}
                        </td>
                        <td className="p-3">
                          {dish.icon ? (
                            <img
                              src={`${BASE_URL.replace("/api", "")}/${
                                dish.icon
                              }`}
                              alt={dish.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <span className="text-gray-400">No Image</span>
                          )}
                        </td>

                        <td className="p-3 text-gray-700">{dish.name}</td>
                        <td className="p-3 text-gray-500">
                          {getTextPreview(dish.description, 50)}
                          {dish.description && dish.description.length > 100}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-3">
                            <button
                              onClick={() =>
                                navigate("/RestroDishType", { state: { dish } })
                              }
                              className="flex justify-center items-center bg-green-500 hover:bg-green-600 text-white w-8 h-8  cursor-pointer rounded text-sm"
                            >
                              <MdEdit size={18} />
                            </button>
                            <button
                              onClick={() => setShowDeleteModal(true)}
                              className="flex justify-center items-center bg-red-500 hover:bg-red-600 text-white w-8 h-8  cursor-pointer rounded text-sm"
                            >
                              <MdDelete size={18} />
                            </button>
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
                        No dishes found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              <Pagination
                currentPage={pagination.currentPage}
                totalItems={filtered.length}
                itemsPerPage={pageSize}
                onPageChange={(page) =>
                  setPagination((p) => ({ ...p, currentPage: page }))
                }
                totalPages={pagination.totalPages}
                type="frontend"
              />
            </>
          )}
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

export default RestroDishTypeList;
