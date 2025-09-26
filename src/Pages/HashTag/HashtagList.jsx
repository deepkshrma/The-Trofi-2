import React, { useState, useEffect, useRef } from "react";
import Pagination from "../../components/common/Pagination/Pagination";
import axios from "axios";
import { BASE_URL } from "../../config/Config";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DeleteModel from "../../components/common/DeleteModel/DeleteModel";
import PageTitle from "../../components/PageTitle/PageTitle";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import { MdEdit, MdDelete } from "react-icons/md";
import { PlusCircle } from "lucide-react";
import { STAR_RATINGS } from "../../config/hashtagconfig";
import { Building2, Utensils } from "lucide-react";


/* ------------------ TypeDropdown component ------------------ */
function TypeDropdown({ type, setType, fetchHashtags }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const options = [
    { value: "Restaurant", label: "Restaurant", icon: <Building2 size={18} /> },
    { value: "Dish", label: "Dish", icon: <Utensils size={18} /> },
  ];

  // close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = options.find((opt) => opt.value === type);

  const handleSelect = (val) => {
    setType(val);
    fetchHashtags(1, val);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-48 px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white cursor-pointer"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2 text-sm">
          {selected?.icon}
          {selected?.label}
        </div>
        <span className="text-gray-400">▾</span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm ${type === opt.value ? "bg-orange-50 font-medium" : ""
                }`}
            >
              {opt.icon}
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
/* ------------------ RatingDropdown component ------------------ */
/* Put this right after the imports */
function RatingDropdown({ ratingFilter, setRatingFilter }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = ratingFilter ? STAR_RATINGS[Number(ratingFilter) - 1] : null;

  const handleSelect = (val) => {
    setRatingFilter(val);
    setOpen(false);
  };

  const clear = (e) => {
    e.stopPropagation();
    setRatingFilter("");
    setOpen(false);
  };



  return (
    <div className="relative" ref={ref}>
      {/* Selected area */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-56 md:w-48 lg:w-56 px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white cursor-pointer"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected ? (
          <div className="flex items-center gap-2">
            <img src={selected.img} alt={selected.label} className="w-6 h-6" />
            <span className="text-sm">{`${Number(ratingFilter)} - ${selected.label}`}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-500">All Ratings</span>
        )}

        <div className="flex items-center gap-2">
          {selected && (
            <button
              onClick={clear}
              className="text-gray-400 hover:text-gray-700 text-sm"
              title="Clear"
            >
              ✕
            </button>
          )}
          <span className="text-gray-400">▾</span>
        </div>
      </button>

      {/* Dropdown list */}
      {open && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 w-56 md:w-48 lg:w-56 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-auto"
        >
          <li
            onClick={() => handleSelect("")}
            className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm text-gray-700"
          >
            All Ratings
          </li>

          {STAR_RATINGS.map((star, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(String(idx + 1))}
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100"
            >
              <img src={star.img} alt={star.label} className="w-6 h-6" />
              <span className="text-sm">{`${idx + 1} • ${star.label}`}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
/* ------------------ end RatingDropdown ------------------ */

function HashtagList() {
  const [hashtags, setHashtags] = useState([]);
  const [type, setType] = useState("Restaurant"); // default type
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalRecords: 0,
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedHashtag, setSelectedHashtag] = useState(null);

  const navigate = useNavigate();

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedHashtag(null);
  };

  const fetchHashtags = async (page = 1, selectedType = type) => {
    try {
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;
      if (!token) {
        toast.error("Please login first");
        return;
      }
      const res = await axios.get(
        `${BASE_URL}/restro/get-admin-hashtags?type=${selectedType}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.success) {
        // Flatten the object into an array
        const flattened = Object.keys(res.data.data || {}).flatMap((key) =>
          res.data.data[key].map((item) => ({
            ...item,
            star_value: key,
            type: selectedType,
          }))
        );

        setHashtags(flattened);
        setPagination((prev) => ({
          ...prev,
          currentPage: page,
          totalRecords: flattened.length,
          totalPages: 1,
        }));
      } else {
        toast.error(res.data?.message || "Failed to fetch hashtags");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching hashtags");
    }
  };

  useEffect(() => {
    fetchHashtags(1);
    // eslint-disable-next-line
  }, []);

  // robust filter: coerce star_value to string for comparison
  const filteredHashtags = hashtags.filter((tag) => {
    const matchTitle = tag.hashTagTitle
      .toLowerCase()
      .includes(search.toLowerCase());
    const tagStar = String(tag.star_value);
    const matchStars = ratingFilter ? tagStar === String(ratingFilter) : true;
    return matchTitle && matchStars;
  });

  const confirmDelete = async () => {
    if (!selectedHashtag) return;
    try {
      const authData = JSON.parse(localStorage.getItem("trofi_user"));
      const token = authData?.token;
      if (!token) {
        toast.error("Please login first");
        return;
      }
      const res = await axios.delete(
        `${BASE_URL}/restro/delete-hashtags/${selectedHashtag._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data?.success) {
        toast.success("Hashtag deleted successfully");
        fetchHashtags(pagination.currentPage, type);
      } else {
        toast.error(res.data?.message || "Failed to delete hashtag");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting hashtag");
    } finally {
      closeDeleteModal();
    }
  };

  const handleTypeChange = (e) => {
    const selectedType = e.target.value;
    setType(selectedType);
    fetchHashtags(1, selectedType);
  };

  return (
    <>
      <div className="p-6 main main_page duration-900">
        <BreadcrumbsNav
          customTrail={[{ label: "Hashtags", path: "/HashtagList" }]}
        />

        <div className="flex justify-between items-center mb-3">
          <PageTitle title={"Hashtags"} />
          <button
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg cursor-pointer"
            style={{ backgroundColor: "#F9832B" }}
            onClick={() => navigate("/CreateHashtag")}
          >
            <PlusCircle size={18} /> Add Hashtag
          </button>
        </div>

        <div className="overflow-x-auto bg-white rounded-2xl shadow-md pb-3 mt-5">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 m-3 items-center">
            <TypeDropdown type={type} setType={setType} fetchHashtags={fetchHashtags} />

            <input
              type="text"
              placeholder="Search by hashtag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 bg-white p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] outline-none w-64"
            />

            {/* Replace the plain select with this custom dropdown */}
            <RatingDropdown
              ratingFilter={ratingFilter}
              setRatingFilter={setRatingFilter}
            />
          </div>

          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-gray-700 text-left">
                <th className="p-3 pl-4">S.No.</th>
                <th className="p-3">Type</th>
                <th className="p-3">Star Value</th>
                <th className="p-3">Hashtag</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredHashtags.length > 0 ? (
                filteredHashtags.map((tag, index) => (
                  <tr
                    key={tag._id}
                    className="border-b border-gray-300 hover:bg-orange-50 transition"
                  >
                    <td className="p-3 pl-4 font-medium text-gray-700">
                      {index + 1}
                    </td>
                    <td className="p-3 text-gray-700">{tag.type}</td>
                    <td className="p-3">
                      <img
                        src={
                          STAR_RATINGS[Number(tag.star_value) - 1]?.img
                        }
                        alt={
                          STAR_RATINGS[Number(tag.star_value) - 1]?.label ||
                          "star"
                        }
                        className="w-8 h-8 md:w-10 md:h-10"
                      />
                    </td>

                    <td className="p-3 text-gray-700">{tag.hashTagTitle}</td>
                    <td className="p-3">
                      <div className="flex gap-3">
                        <button
                          onClick={() =>
                            navigate("/CreateHashtag", {
                              state: { rowData: tag },
                            })
                          }
                          className="flex justify-center items-center bg-green-500 hover:bg-green-600 text-white w-8 h-8 cursor-pointer rounded text-sm"
                        >
                          <MdEdit size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedHashtag(tag);
                            setShowDeleteModal(true);
                          }}
                          className="flex justify-center items-center bg-red-500 hover:bg-red-600 text-white w-8 h-8 cursor-pointer rounded text-sm"
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
                    No hashtags found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <Pagination
            currentPage={pagination.currentPage}
            totalItems={pagination.totalRecords}
            itemsPerPage={pagination.pageSize}
            onPageChange={(page) => fetchHashtags(page, type)}
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
        para="Do you really want to delete this hashtag? This action cannot be undone."
      />
    </>
  );
}

export default HashtagList;
