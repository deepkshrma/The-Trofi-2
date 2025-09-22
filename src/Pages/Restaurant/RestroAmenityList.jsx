import React, { useState, useEffect, useMemo } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import pizza from "../../assets/images/pending.png";
import Pagination from "../../components/common/Pagination/Pagination";
import { useNavigate } from "react-router-dom";
import DeleteModel from "../../components/common/DeleteModel/DeleteModel";
import { MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { Eye, PlusCircle } from "lucide-react";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import { CiExport } from "react-icons/ci";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function RestroAmenityList() {
  const API_BASE = "http://trofi-backend.apponedemo.top/api/";
  const FILE_BASE = API_BASE.replace(/\/api\/?$/, "/");
  const PAGE_SIZE = 10;
  const navigate = useNavigate();

  const [amenities, setAmenities] = useState([]);
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
  };

  const confirmDelete = async () => {};

  useEffect(() => {
    fetchAmenities();
  }, []);

  async function fetchAmenities() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}restro/get-amenity`);
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      if (!json || !Array.isArray(json.data)) {
        throw new Error(json?.message || "Invalid response from API");
      }

      const normalized = json.data.map((it) => ({
        id: it._id,
        name: it.amenity_name ?? "—",
        icon: it.amenity_icon ?? null,
      }));

      setAmenities(normalized);
    } catch (err) {
      setError(err.message || "Failed to fetch amenities");
      toast.error(err.message || "Failed to fetch amenities");
    } finally {
      setLoading(false);
    }
  }

  const filteredAmenities = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return amenities;
    return amenities.filter((a) => a.name.toLowerCase().includes(q));
  }, [amenities, search]);

  useEffect(() => {
    const total = filteredAmenities.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    setPagination((p) => ({
      ...p,
      totalRecords: total,
      totalPages,
      currentPage: Math.min(p.currentPage, totalPages),
    }));
  }, [filteredAmenities]);

  const paginatedAmenities = useMemo(() => {
    const start = (pagination.currentPage - 1) * PAGE_SIZE;
    return filteredAmenities.slice(start, start + PAGE_SIZE);
  }, [filteredAmenities, pagination.currentPage]);

  const getImageUrl = (icon) => {
    if (!icon) return pizza;
    if (/^https?:\/\//i.test(icon)) return icon;
    return `${FILE_BASE}${icon}`;
  };

  const handleExport = () => {
    const exportData = filteredAmenities.map((amenity, index) => ({
      "S.No.": index + 1,
      "Amenity Name": amenity.name,
      Icon: getImageUrl(amenity.icon), // export icon URL
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Amenities");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const fileData = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(fileData, "Amenities.xlsx");
  };

  return (
    <>
      <div className="main main_page p-6 w-full min-h-screen duration-900">
        <BreadcrumbsNav
          customTrail={[
            {
              label: "Restaurant Amenities List",
              path: "/RestroAmenityList",
            },
          ]}
        />
        <div className="flex justify-between items-center mb-3">
          <PageTitle title={"Restaurant Amenities List"} />
          <button
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg cursor-pointer"
            style={{ backgroundColor: "#F9832B" }}
            onClick={() => navigate("/RestroAmenity")}
          >
            <PlusCircle size={18} /> Add Amenity
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-md mt-3">
          <div className="overflow-x-auto pb-3">
            {/* Search + Refresh */}
            <div className="flex justify-between items-center m-3">
              <input
                type="text"
                placeholder="Search by Amenities name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination((p) => ({ ...p, currentPage: 1 }));
                }}
                className="border border-gray-300 bg-white p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] outline-none w-64"
              />
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md border border-gray-300 cursor-pointer  text-gray-600 hover:shadow-lg"
                // style={{ backgroundColor: "#F9832B" }}
                onClick={handleExport}
              >
                <CiExport size={20} /> Export
              </button>
            </div>

            {/* Loading / Error */}
            {loading ? (
              <div className="text-center py-6">Loading amenities…</div>
            ) : error ? (
              <div className="text-center py-6 text-red-500">
                Error: {error}
              </div>
            ) : (
              <>
                <table className="w-full border border-gray-200 overflow-hidden">
                  <thead className="bg-gray-200 text-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left">S.No</th>
                      <th className="px-4 py-2 text-left">Icon</th>
                      <th className="px-4 py-2 text-left">Amenity Name</th>

                      <th className="px-4 py-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAmenities.length > 0 ? (
                      paginatedAmenities.map((amenity, index) => {
                        const serial =
                          (pagination.currentPage - 1) * PAGE_SIZE + index + 1;
                        return (
                          <tr
                            key={amenity.id}
                            className="border-b border-gray-300 hover:bg-gray-50 transition"
                          >
                            <td className="px-4 py-2">{serial}</td>
                            <td className="px-4 py-2">
                              <img
                                src={getImageUrl(amenity.icon)}
                                alt={amenity.name}
                                className="h-12 w-12 object-cover rounded-full "
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = pizza;
                                }}
                              />
                            </td>
                            <td className="px-4 py-2">{amenity.name}</td>

                            <td className="px-4 py-2">
                              {/* <div className="flex gap-3">
                                <button
                                  onClick={() =>
                                    navigate(`/RestroAmenity/:id`, {
                                      state: {
                                        id: amenity.id,
                                        name: amenity.name,
                                        icon: amenity.icon,
                                      },
                                    })
                                  }
                                  className="bg-green-500 text-white  cursor-pointer px-3 py-1 rounded text-sm"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => setShowDeleteModal(true)}
                                  className="bg-red-500 text-white  cursor-pointer px-3 py-1 rounded text-sm"
                                >
                                  Delete
                                </button>
                              </div> */}
                              <div className="flex gap-3">
                                {/* <button
                                  className="flex justify-center w-8 h-8 items-center gap-1 rounded-lg bg-blue-500 text-white cursor-pointer hover:bg-blue-600 whitespace-nowrap"
                                  onClick={() =>
                                    navigate(`/RestroProfile/${restro._id}`)
                                  }
                                >
                                  <Eye size={16} />
                                </button> */}
                                <button
                                  className="flex items-center gap-1 justify-center w-8 h-8 rounded-lg bg-green-500 text-white cursor-pointer hover:bg-green-600 whitespace-nowrap"
                                  onClick={() =>
                                    navigate(`/RestroAmenity/:id`, {
                                      state: {
                                        id: amenity.id,
                                        name: amenity.name,
                                        icon: amenity.icon,
                                      },
                                    })
                                  }
                                >
                                  <MdEdit size={16} />
                                </button>
                                <button
                                  className="flex items-center gap-1 justify-center w-8 h-8 rounded-lg bg-red-500 text-white cursor-pointer hover:bg-red-600 whitespace-nowrap"
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

export default RestroAmenityList;
