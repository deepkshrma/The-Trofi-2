import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../components/PageTitle/PageTitle";
import Pagination from "../../components/common/Pagination/Pagination";
import DeleteModel from "../../components/common/DeleteModel/DeleteModel";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import { MdEdit } from "react-icons/md";
import { CiExport } from "react-icons/ci";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { PlusCircle } from "lucide-react";
import axios from "axios";
import { BASE_URL } from "../../config/Config";
import { toast } from "react-toastify";

function RestroCuisineList() {
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

  const closeDeleteModal = () => setShowDeleteModal(false);

  const authData = JSON.parse(localStorage.getItem("trofi_user"));
  const token = authData?.token;

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Fetch cuisines
  useEffect(() => {
    fetchCuisines();
  }, []);

  const fetchCuisines = async () => {
    setLoading(true);
    setError(null);
    if (!token) {
      toast.error("Please login first");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${BASE_URL}/restro/get-cusine`, axiosConfig);
      if (res.data?.success) {
        const normalized = res.data.data.map((item) => ({
          id: item._id,
          name: item.name,
        }));
        setCuisines(normalized);
      } else {
        throw new Error(res.data?.message || "Failed to fetch cuisines");
      }
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message || err.message || "Server error while fetching cuisines";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

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
          customTrail={[{ label: "Restaurant - Cuisines", path: "/RestroCuisineList" }]}
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
            {/* Search + Export */}
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
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md border border-gray-300 cursor-pointer text-gray-600 hover:shadow-lg"
                onClick={handleExport}
              >
                <CiExport size={20} /> Export
              </button>
            </div>

            {/* Loading / Error */}
            {loading ? (
              <div className="text-center py-6">Loading...</div>
            ) : error ? (
              <div className="text-center py-6 text-red-500">{error}</div>
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
                              <span className="font-bold text-gray-700 px-3 py-1 rounded-full text-md">
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
                                  className="flex items-center gap-1 justify-center w-8 h-8 rounded-lg bg-green-500 text-white cursor-pointer hover:bg-green-600 whitespace-nowrap"
                                >
                                  <MdEdit size={18} />
                                </button>
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
        onConfirm={() => {}}
        redbutton="Confirm"
        para="Do you really want to delete? This action cannot be undone."
      />
    </>
  );
}

export default RestroCuisineList;
