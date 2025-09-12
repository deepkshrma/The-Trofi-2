import React, { useState, useEffect, useMemo } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import pizza from "../../assets/images/pending.png"; // placeholder
import Pagination from "../../components/common/Pagination/Pagination";
import { useNavigate } from "react-router-dom";
import DeleteModel from "../../components/common/DeleteModel/DeleteModel";
import DynamicBreadcrumbs from "../../components/common/BreadcrumbsNav/DynamicBreadcrumbs";

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
    // setSelectedAdmin(null);
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

  return (
    <>
      <div className="main main_page p-6 w-full min-h-screen duration-900">
        <DynamicBreadcrumbs />
        <PageTitle title={"Restaurant Amenities List"} />

        <div className="bg-white rounded-2xl shadow-md mt-3">
          <div className="overflow-x-auto pb-3">
            {/* Search + Refresh */}
            <div className="flex flex-wrap gap-3 m-3 items-center">
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
                onClick={fetchAmenities}
                className="px-3 py-2 rounded-lg bg-[#F9832B] text-white text-sm"
              >
                Refresh
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
                              <div className="flex gap-3">
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
