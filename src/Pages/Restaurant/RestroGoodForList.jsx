import React, { useState, useEffect, useMemo } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import Pagination from "../../components/common/Pagination/Pagination";
import { useNavigate } from "react-router-dom";
import DeleteModel from "../../components/common/DeleteModel/DeleteModel";

function RestroGoodForList() {
  const API_BASE = "http://trofi-backend.apponedemo.top/api/";
  const FILE_BASE = "http://trofi-backend.apponedemo.top/";
  const PAGE_SIZE = 10;
  const navigate = useNavigate();

  const [goodForList, setGoodForList] = useState([]);
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
  const confirmDelete = () => {};

  useEffect(() => {
    fetchGoodFor();
  }, []);

  async function fetchGoodFor() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}restro/get-good-for`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json?.success) throw new Error(json.message || "API Error");

      const normalized = json.data.map((item) => ({
        id: item._id,
        name: item.name,
        icon: item.icon ? `${FILE_BASE}${item.icon}` : null,
        status: item.status,
      }));

      setGoodForList(normalized);
    } catch (err) {
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

  return (
    <>
      <div className="main main_page p-6 w-full h-screen duration-900">
        <PageTitle title={"Restaurant - Good For"} />

        <div className="bg-white rounded-2xl shadow-md mt-3">
          <div className="overflow-x-auto pb-3">
            {/* Search */}
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
                onClick={fetchGoodFor}
                className="px-3 py-2 rounded-lg bg-[#F9832B] text-white text-sm"
              >
                Refresh
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
                                  className="w-10 h-10 object-cover rounded-full shadow-lg "
                                />
                              ) : (
                                <span className="text-gray-400 italic">
                                  No Icon
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2">
                              <span className="text-gray-700 px-3 py-1 rounded-full text-md">
                                {item.name}
                              </span>
                            </td>
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
                                  className="bg-green-500 text-white px-3 py-1 cursor-pointer rounded text-sm"
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

export default RestroGoodForList;
