import React, { useState, useEffect, useMemo } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import Pagination from "../../components/common/Pagination/Pagination";
import { useNavigate } from "react-router-dom";
import DeleteModel from "../../components/common/DeleteModel/DeleteModel";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import { MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { CiExport } from "react-icons/ci";
import { PlusCircle } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { BASE_URL } from "../../config/Config";
import axios from "axios";
import { toast } from "react-toastify";

function RestroGoodForList() {
  const FILE_BASE = BASE_URL.replace(/\/api\/?$/, "/");
  const PAGE_SIZE = 10;
  const navigate = useNavigate();
  const authData = JSON.parse(localStorage.getItem("trofi_user"));
  const token = authData?.token;

  const [goodForList, setGoodForList] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: PAGE_SIZE,
    totalPages: 1,
    totalRecords: 0,
  });

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const confirmDelete = () => {};

  useEffect(() => {
    fetchGoodFor();
  }, []);

  async function fetchGoodFor() {
    setLoading(true);
    setError(null);

    if (!token) {
      toast.error("Please login first");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${BASE_URL}/restro/get-good-for`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // ✅ Handle permission denied
      if (res.data?.success === false || res.data?.sucess === false) {
        toast.error(res.data?.message || "Permission denied");
        setGoodForList([]);
        return;
      }

      if (!res.data?.data || !Array.isArray(res.data.data)) {
        throw new Error(res.data?.message || "Invalid response from API");
      }

      const normalized = res.data.data.map((item) => ({
        id: item._id,
        name: item.name,
        icon: item.icon ? `${FILE_BASE}${item.icon}` : null,
        status: item.status,
      }));

      setGoodForList(normalized);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to fetch data");
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return goodForList;
    return goodForList.filter((g) => g.name.toLowerCase().includes(q));
  }, [goodForList, search]);

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
    const exportData = filtered.map((item, index) => ({
      "S.No.": index + 1,
      Name: item.name,
      Icon: item.icon ? item.icon : "No Icon",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "GoodFor");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const fileData = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(fileData, "GoodFor.xlsx");
  };

  return (
    <>
      <div className="main main_page p-6 w-full h-screen duration-900">
        <BreadcrumbsNav
          customTrail={[
            { label: "Restaurant - Good For", path: "/RestroGoodForList" },
          ]}
        />
        <div className="flex justify-between items-center mb-3">
          <PageTitle title={"Restaurant Good For"} />
          <button
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg cursor-pointer"
            style={{ backgroundColor: "#F9832B" }}
            onClick={() => navigate("/RestroGoodFor")}
          >
            <PlusCircle size={18} /> Add Good For
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-md mt-3">
          <div className="overflow-x-auto pb-3">
            {/* Search */}
            <div className="flex justify-between items-center m-3">
              <input
                type="text"
                placeholder="Search by name..."
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
              <div className="text-center py-6 text-red-500">Error: {error}</div>
            ) : (
              <>
                <table className="w-full border border-gray-200 overflow-hidden">
                  <thead className="bg-gray-200 text-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left">S.No.</th>
                      <th className="px-4 py-2 text-left">Icon</th>
                      <th className="px-4 py-2 text-left">Name</th>
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
                            <td className="px-4 py-2">
                              {item.icon ? (
                                <img
                                  src={item.icon}
                                  alt={item.name}
                                  className="w-10 h-10 object-cover rounded-full shadow-lg"
                                />
                              ) : (
                                <span className="text-gray-400 italic">
                                  No Icon
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2 text-gray-700">{item.name}</td>
                            <td className="px-4 py-2">
                              <div className="flex gap-3">
                                <button
                                  onClick={() =>
                                    navigate(`/RestroGoodFor/:id`, {
                                      state: {
                                        id: item.id,
                                        name: item.name,
                                        icon: item.icon,
                                      },
                                    })
                                  }
                                  className="flex items-center gap-1 justify-center w-8 h-8 rounded-lg bg-green-500 text-white cursor-pointer hover:bg-green-600"
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
                          colSpan="4"
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
        onConfirm={confirmDelete}
        redbutton="Confirm"
        para="Do you really want to delete? This action cannot be undone."
      />
    </>
  );
}

export default RestroGoodForList;
