import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../components/PageTitle/PageTitle";
import Pagination from "../../components/common/Pagination/Pagination";
import DeleteModel from "../../components/common/DeleteModel/DeleteModel";
import DynamicBreadcrumbs from "../../components/common/BreadcrumbsNav/DynamicBreadcrumbs";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import { Label } from "recharts";
import { MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { CiExport } from "react-icons/ci";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { PlusCircle } from "lucide-react";

function RestroCuisineList() {
  const API_BASE = "http://trofi-backend.apponedemo.top/api/";
  const PAGE_SIZE = 10;
  const navigate = useNavigate();

  const [cuisines, setCuisines] = useState([]);
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
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    // setSelectedAdmin(null);
  };

  const confirmDelete = async () => {};

  // Fetch cuisines
  useEffect(() => {
    fetchCuisines();
  }, []);

  async function fetchCuisines() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}restro/get-cusine`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json?.success) throw new Error(json.message || "API Error");

      const normalized = json.data.map((item) => ({
        id: item._id,
        name: item.name,
      }));

      setCuisines(normalized);
    } catch (err) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }

  // Filter by search
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return cuisines;
    return cuisines.filter((c) => c.name.toLowerCase().includes(q));
  }, [cuisines, search]);

  // Update pagination
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

  // Slice for current page
  const paginated = useMemo(() => {
    const start = (pagination.currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, pagination.currentPage]);

  const handleExport = () => {
    const exportData = filtered.map((cuisine, index) => ({
      "S.No.": index + 1,
      "Cuisine Name": cuisine.name,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cuisines");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const fileData = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(fileData, "Cuisines.xlsx");
  };

  return (
    <>
      <div className="main main_page p-6 w-full h-screen duration-900">
        <BreadcrumbsNav
          customTrail={[
            { label: "Restaurant - Cuisines", path: "/RestroCuisineList" },
          ]}
        />
        <div className="flex justify-between items-center mb-3">
          <PageTitle title={"Restaurant Cuisines"} />
          <button
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg cursor-pointer"
            style={{ backgroundColor: "#F9832B" }}
            onClick={() => navigate("/RestroCuisine")}
          >
            <PlusCircle size={18} /> Add Cuisines
          </button>
        </div>
        

        <div className="bg-white rounded-2xl shadow-md mt-3">
          <div className="overflow-x-auto pb-3">
            {/* Search */}
            <div className="flex justify-between items-center m-3">
              <input
                type="text"
                placeholder="Search cuisine..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination((p) => ({ ...p, currentPage: 1 }));
                }}
                className="border border-gray-300 bg-white p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] outline-none w-64"
              />
              {/* Export button (right) */}
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md border border-gray-300 cursor-pointer text-gray-600 hover:shadow-lg"
                // style={{ backgroundColor: "#F9832B" }}
                onClick={handleExport}
              >
                <CiExport size={20} /> Export
              </button>
            </div>

            {/* Loading / Error */}
            {loading ? (
              <div className="text-center py-6">Loading...</div>
            ) : error ? (
              <div className="text-center py-6 text-red-500">
                Error: {error}
              </div>
            ) : (
              <>
                <table className="w-full border border-gray-200 overflow-hidden">
                  <thead className="bg-gray-200 text-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left">S.No.</th>
                      <th className="px-4 py-2 text-left">Cuisine Name</th>
                      <th className="px-4 py-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.length > 0 ? (
                      paginated.map((item, index) => {
                        const serial =
                          (pagination.currentPage - 1) * PAGE_SIZE + index + 1;
                        return (
                          <tr
                            key={item.id}
                            className="border-b border-gray-300 hover:bg-gray-50 transition"
                          >
                            <td className="px-4 py-2">{serial}</td>
                            <td className="px-2 py-2">
                              <span className=" font-bold text-gray-700 px-3 py-1 rounded-full text-md">
                                {item.name}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex gap-3">
                                <button
                                  onClick={() =>
                                    navigate(`/RestroCuisine/${item.id}`, {
                                      state: { name: item.name },
                                    })
                                  }
                                  className="flex justify-center items-center bg-green-500 hover:bg-green-600 text-white w-8 h-8  cursor-pointer rounded text-sm"
                                >
                                  <MdEdit size={18} />
                                </button>
                                {/* <button
                                  onClick={() => setShowDeleteModal(true)}
                                  className="flex justify-center items-center bg-red-500 hover:bg-red-600 text-white w-8 h-8  cursor-pointer rounded text-sm"
                                >
                                  <MdDelete size={18} />
                                </button> */}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="3"
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

export default RestroCuisineList;
