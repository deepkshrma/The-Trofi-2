import React, { useState, useEffect, useMemo } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import Pagination from "../../components/common/Pagination/Pagination";
import { useNavigate } from "react-router-dom";
import DeleteModel from "../../components/common/DeleteModel/DeleteModel";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import { MdEdit, MdDelete } from "react-icons/md";
import { CiExport } from "react-icons/ci";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { PlusCircle } from "lucide-react";

function RestroTypeList() {
  const API_BASE = "http://trofi-backend.apponedemo.top/api/";
  const PAGE_SIZE = 10;
  const navigate = useNavigate();

  const [types, setTypes] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: PAGE_SIZE,
    totalPages: 1,
    totalRecords: 0,
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const closeDeleteModal = () => setShowDeleteModal(false);

  const confirmDelete = async () => {
    // implement delete logic here
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  async function fetchTypes() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}restro/get-restaurant-types`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json?.success) throw new Error(json.message || "API Error");

      const normalized = json.data.map((t) => ({
        id: t._id,
        name: t.name,
        icon: t.icon,
      }));

      setTypes(normalized);
    } catch (err) {
      setError(err.message || "Failed to fetch types");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return types;
    return types.filter((t) => t.name.toLowerCase().includes(q));
  }, [types, search]);

  useEffect(() => {
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    setPagination((p) => ({
      ...p,
      totalRecords: total,
      totalPages,
      currentPage: Math.min(p.currentPage, totalPages),
    }));
  }, [filtered]);

  const paginated = useMemo(() => {
    const start = (pagination.currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, pagination.currentPage]);

  const handleExport = () => {
    const exportData = filtered.map((type, index) => ({
      "S.No.": index + 1,
      "Restaurant Type": type.name,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "RestaurantTypes");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const fileData = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(fileData, "RestaurantTypes.xlsx");
  };

  return (
    <>
      <div className="main main_page p-6 w-full h-full duration-900">
        <BreadcrumbsNav
          customTrail={[{ label: "Restaurant Type List", path: "/RestroTypeList" }]}
        />
        <div className="flex justify-between items-center mb-3">
          <PageTitle title="Restaurant Type List" />
          <button
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg cursor-pointer"
            style={{ backgroundColor: "#F9832B" }}
            onClick={() => navigate("/RestroType")}
          >
            <PlusCircle size={18} /> Add Type List
          </button>
        </div>
        

        <div className="bg-white rounded-2xl shadow-md mt-3">
          <div className="pb-3 overflow-x-auto">
            {/* Search + Export */}
            <div className="flex justify-between items-center m-3">
              <input
                type="text"
                placeholder="Search by type..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination((p) => ({ ...p, currentPage: 1 }));
                }}
                className="border border-gray-300 bg-white p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] outline-none w-64"
              />
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md border border-gray-300 cursor-pointer text-gray-600 hover:shadow-lg"
                onClick={handleExport}
              >
                <CiExport size={20} /> Export
              </button>
            </div>

            {loading ? (
              <div className="text-center py-6">Loading types…</div>
            ) : error ? (
              <div className="text-center py-6 text-red-500">Error: {error}</div>
            ) : (
              <>
                <table className="w-full border border-gray-200 overflow-hidden">
                  <thead className="bg-gray-200 text-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left">S.No.</th>
                      <th className="px-4 py-2 text-left">Icon</th>
                      <th className="px-4 py-2 text-left">Restaurant Type</th>
                      <th className="px-4 py-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.length > 0 ? (
                      paginated.map((type, index) => {
                        const serial =
                          (pagination.currentPage - 1) * PAGE_SIZE + index + 1;
                        return (
                          <tr
                            key={type.id}
                            className="border-b border-gray-300 hover:bg-gray-50 transition"
                          >
                            <td className="px-4 py-2">{serial}</td>

                            {/* Icon column */}
                            <td className="px-4 py-2">
                              {type.icon ? (
                                <img
                                  src={`${API_BASE.replace(/\/api\/?$/, "/")}${type.icon}`}
                                  alt={type.name}
                                  className="w-10 h-10 object-cover rounded-md border border-gray-300"
                                />
                              ) : (
                                <span className="text-gray-400 text-sm italic">No Icon</span>
                              )}
                            </td>

                            <td className="px-4 py-2">
                              <span className="text-gray-700 px-3 py-1 rounded-full text-md">
                                {type.name}
                              </span>
                            </td>

                            <td className="px-4 py-2">
                              <div className="flex gap-3">
                                <button
                                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500 text-white cursor-pointer hover:bg-green-600"
                                  onClick={() =>
                                    navigate(`/RestroType/:id`, {
                                      state: {
                                        id: type.id,
                                        name: type.name,
                                        icon: type.icon,
                                      },
                                    })
                                  }
                                >
                                  <MdEdit size={16} />
                                </button>
                                <button
                                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500 text-white cursor-pointer hover:bg-red-600"
                                  onClick={() => setShowDeleteModal(true)}
                                >
                                  <MdDelete size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="text-center py-4 text-gray-500 italic"
                        >
                          No results found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="mt-3 px-3">
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalItems={pagination.totalRecords}
                    itemsPerPage={PAGE_SIZE}
                    onPageChange={(page) =>
                      setPagination((p) => ({ ...p, currentPage: page }))
                    }
                    totalPages={pagination.totalPages}
                    type="frontend"
                  />
                </div>
              </>
            )}
          </div>
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
}

export default RestroTypeList;
