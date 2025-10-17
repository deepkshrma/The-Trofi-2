// import React, { useState, useEffect } from "react";
// import PageTitle from "../../components/PageTitle/PageTitle";
// import { Eye, PlusCircle } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import Pagination from "../../components/common/Pagination/Pagination";
// import axios from "axios";
// import { BASE_URL, IMAGE_URL } from "../../config/Config";
// import { MdAdminPanelSettings, MdEdit, MdRestaurantMenu } from "react-icons/md";
// import { MdDelete } from "react-icons/md";
// import DeleteModel from "../../components/common/DeleteModel/DeleteModel";
// import DynamicBreadcrumbs from "../../components/common/BreadcrumbsNav/DynamicBreadcrumbs";
// import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
// import staticimg from "../../assets/images/logo.jpg";
// import { CiExport } from "react-icons/ci";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";
// import { FiFilter } from "react-icons/fi";
// import { FaTriangleExclamation } from "react-icons/fa6";
// import RestaurantFilterModal from "../../components/common/locationFilter/RestaurantFilterModal";

// import {
//   FaUtensils,
//   FaLeaf,
//   FaDrumstickBite,
//   FaShieldAlt,
//   FaConciergeBell,
// } from "react-icons/fa";
// import { toast } from "react-toastify";

// function RestroList() {
//   const [restaurants, setRestaurants] = useState([]);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(false);

//   const [isImageModalOpen, setIsImageModalOpen] = useState(false);
//   const [selectedImage, setSelectedImage] = useState(null);

//   const [showFilterModal, setShowFilterModal] = useState(false);
//   const [appliedFilters, setAppliedFilters] = useState({});

//   const [selectedRestaurant, setSelectedRestaurant] = useState(null);



//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     totalPages: 1,
//     pageSize: 10,
//     totalRecords: 0,
//   });
//   const [kpi, setKpi] = useState({
//     total: 0,
//     veg: 0,
//     nonVeg: 0,
//     both: 0,
//     hygiene: 0,
//     general: 0,
//   });

//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const closeDeleteModal = () => {
//     setShowDeleteModal(false);

//   };

//   const confirmDelete = async () => {
//     if (!selectedRestaurant) return;

//     try {
//       const authData = JSON.parse(localStorage.getItem("trofi_user"));
//       const token = authData?.token;
//       if (!token) {
//         toast.error("Please login first");
//         return;
//       }

//       const res = await axios.delete(
//         `${BASE_URL}/restro/delete-restaurant/${selectedRestaurant._id}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       if (res.data.success) {
//         toast.success("Restaurant deleted successfully");
//         fetchRestaurants(pagination.currentPage); // refresh current page
//       } else {
//         toast.error(res.data.message || "Delete failed");
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Something went wrong while deleting");
//     } finally {
//       setShowDeleteModal(false);
//       setSelectedRestaurant(null);
//     }
//   };


//   const navigate = useNavigate();

//   const truncateDescription = (text, wordLimit = 10) => {
//     if (!text) return "";

//     let plainText = String(text);
//     plainText = plainText.replace(/<\/?[^>]+(>|$)/g, "");
//     plainText = plainText.replace(/\s+/g, " ").trim();

//     const words = plainText.split(" ");
//     if (words.length > wordLimit) {
//       return words.slice(0, wordLimit).join(" ") + "...";
//     }

//     return plainText;
//   };


//   const openImageModal = (imageUrl) => {
//     setSelectedImage(imageUrl);
//     setIsImageModalOpen(true);
//   };

//   const closeImageModal = () => {
//     setSelectedImage(null);
//     setIsImageModalOpen(false);
//   };







//   const authData = JSON.parse(localStorage.getItem("trofi_user"));
//   const token = authData?.token;
//   if (!token) {
//     toast.error("Please login first");
//     return;
//   }

//   // Fetch restaurants with pagination
//   const fetchRestaurants = async (page = 1, searchTerm = "", filters = appliedFilters) => {
//     try {
//       setLoading(true);

//       const response = await axios.get(`${BASE_URL}/restro/get-restaurant-list`, {
//         headers: { Authorization: `Bearer ${token}` },
//         params: {
//           page,
//           limit: pagination.pageSize,
//           search: searchTerm,
//           ...filters,
//         },
//       });

//       const { data, pagination: backendPagination, kpi: backendKpi } = response.data;

//       setRestaurants(data);
//       setPagination((prev) => ({
//         ...prev,
//         currentPage: backendPagination.page,
//         totalPages: backendPagination.totalPages,
//         totalRecords: backendPagination.total,
//       }));

//       // Update KPI counts
//       const foodCounts = { veg: 0, nonVeg: 0, both: 0 };
//       backendKpi.foodTypeCounts.forEach((item) => {
//         if (item._id === "veg") foodCounts.veg = item.count;
//         else if (item._id === "non-veg") foodCounts.nonVeg = item.count;
//         else if (item._id === "both") foodCounts.both = item.count;
//       });


//       const hygieneCounts = { hygiene: 0, general: 0 };
//       backendKpi.hygieneCounts.forEach((item) => {
//         hygieneCounts[item._id] = item.count;
//       });

//       setKpi({
//         total: backendPagination.total,
//         ...foodCounts,
//         ...hygieneCounts,
//       });
//     } catch (error) {
//       console.error("Error fetching restaurants:", error);
//       if (error.response && error.response.data?.message) {
//         toast.error(error.response.data.message);
//       } else {
//         toast.error("Something went wrong while fetching restaurants");
//       }
//     }
//     finally {
//       setLoading(false);
//     }
//   };


//   useEffect(() => {
//     fetchRestaurants(1);
//   }, []);

//   // Search filter (frontend only)
//   const filteredRestaurants = restaurants.filter((restro) =>
//     restro.restro_name?.toLowerCase().includes(search.toLowerCase())
//   );

//   const handleExport = () => {
//     const exportData = filteredRestaurants.map((restro, index) => ({
//       "S.No.": (pagination.currentPage - 1) * pagination.pageSize + (index + 1),
//       Name: restro.restro_name,
//       Type: restro.food_type,
//       Description: restro.description || "N/A",
//       Logo: restro.restaurant_images?.[0]
//         ? `${IMAGE_URL}/${restro.restaurant_images[0]}`
//         : "N/A",
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(exportData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Restaurants");

//     const excelBuffer = XLSX.write(workbook, {
//       bookType: "xlsx",
//       type: "array",
//     });
//     const fileData = new Blob([excelBuffer], {
//       type: "application/octet-stream",
//     });
//     saveAs(fileData, "Restaurants.xlsx");
//   };

//   return (
//     <>
//       <div className="main main_page p-6 min-h-screen duration-900">
//         <BreadcrumbsNav
//           customTrail={[{ label: "Restaurant List", path: "RestroList" }]}
//         />
//         {/* Header */}
//         <div className="flex justify-between items-center mb-6">
//           <PageTitle title={"Restaurant List"} />
//           <button
//             className="flex items-center gap-2 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg cursor-pointer"
//             style={{ backgroundColor: "#F9832B" }}
//             onClick={() => navigate("/RestroAdd")}
//           >
//             <PlusCircle size={18} /> Add Restaurant
//           </button>
//         </div>

//         <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

//           {/* Total Restaurants */}
//           <div className="bg-blue-900 p-3 rounded-xl text-white h-[100px] flex justify-between">
//             <div>
//               <h4 className="text-[14px]">Total Restaurants</h4>
//               <p className="text-[22px] font-semibold">{kpi.total}</p>
//             </div>
//             <div>
//               <div className="w-15 h-15 bg-white/20 rounded-3xl flex justify-center items-center">
//                 <FaUtensils size={35} className="text-white" />
//               </div>
//             </div>
//           </div>

//           {/* Veg Restaurants */}
//           <div className="bg-[#4BAA31] p-3 rounded-xl text-white h-[100px] flex justify-between">
//             <div>
//               <h4 className="text-[14px]">Veg Restaurants</h4>
//               <p className="text-[22px] font-semibold">{kpi.veg}</p>
//             </div>
//             <div>
//               <div className="w-15 h-15 bg-white/20 rounded-3xl flex justify-center items-center">
//                 <FaLeaf size={35} className="text-white" />
//               </div>
//             </div>
//           </div>

//           {/* Non-Veg Restaurants */}
//           <div className="bg-[#D35400] p-3 rounded-xl text-white h-[100px] flex justify-between">
//             <div>
//               <h4 className="text-[14px]">Non-Veg Restaurants</h4>
//               <p className="text-[22px] font-semibold">{kpi.nonVeg}</p>
//             </div>
//             <div>
//               <div className="w-15 h-15 bg-white/20 rounded-3xl flex justify-center items-center">
//                 <FaDrumstickBite size={35} className="text-white" />
//               </div>
//             </div>
//           </div>

//           {/* Hygiene Restaurants */}
//           <div className="p-3 rounded-xl text-white h-[100px] flex justify-between bg-gradient-to-r from-[#4BAA31] to-[#1C8300]">
//             <div>
//               <h4 className="text-[14px]">Hygiene Restaurants</h4>
//               <p className="text-[22px] font-semibold">{kpi.hygiene}</p>
//             </div>
//             <div>
//               <div className="w-15 h-15 bg-white/20 rounded-3xl flex justify-center items-center">
//                 <FaShieldAlt size={35} className="text-white" />
//               </div>
//             </div>
//           </div>

//         </div>



//         {/* Table */}
//         <div className="mt-2 bg-white shadow-md rounded-xl border border-gray-200 overflow-x-auto pb-3">
//           <div className="flex justify-between items-center m-3">
//             {/* 🔍 Search input */}
//             <input
//               type="text"
//               placeholder="Search by Restaurant Name"
//               value={search}
//               onChange={(e) => {
//                 setSearch(e.target.value);
//                 fetchRestaurants(1, e.target.value); // call backend on search
//               }}
//               className="border border-gray-300 bg-white p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] outline-none w-64"
//             />


//             {/* 📂 Right-side controls */}
//             <div className="flex items-center gap-3">
//               {/* 🧮 Filter button */}
//               <button
//                 className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md border border-gray-300 text-gray-600 hover:shadow-lg cursor-pointer"
//                 onClick={() => setShowFilterModal(true)}
//               >
//                 <FiFilter size={20} /> Filter
//               </button>


//               {/* ⬇ Export button */}
//               <button
//                 className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md border border-gray-300 text-gray-600 hover:shadow-lg cursor-pointer"
//                 onClick={handleExport}
//               >
//                 <CiExport size={20} /> Export
//               </button>
//             </div>
//           </div>

//           <table className="w-full border-collapse">
//             <thead>
//               <tr className="bg-gray-200 text-left text-gray-700">
//                 <th className="p-3 border-b border-gray-300">S.No.</th>
//                 <th className="p-3 border-b border-gray-300">Logo</th>
//                 <th className="p-3 border-b border-gray-300">Name</th>
//                 {/* <th className="p-3 border-b border-gray-300">Type</th> */}
//                 <th className="p-3 border-b border-gray-300">Description</th>
//                 <th className="p-3 border-b border-gray-300 text-center">Permission</th>

//                 <th className="p-3 border-b border-gray-300">Dishes</th>

//                 <th className="p-3 border-b border-gray-300 text-center">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {loading
//                 ? [...Array(pagination.pageSize)].map((_, idx) => (
//                   <tr key={idx} className="animate-pulse">
//                     <td className="p-3 border-b border-gray-200">
//                       <div className="bg-gray-300 h-6 w-8 rounded"></div>
//                     </td>
//                     <td className="p-3 border-b border-gray-200">
//                       <div className="bg-gray-300 h-10 w-10 rounded-full"></div>
//                     </td>
//                     <td className="p-3 border-b border-gray-200">
//                       <div className="bg-gray-300 h-6 w-32 rounded"></div>
//                     </td>
//                     <td className="p-3 border-b border-gray-200">
//                       <div className="bg-gray-300 h-6 w-16 rounded"></div>
//                     </td>
//                     <td className="p-3 border-b border-gray-200">
//                       <div className="bg-gray-300 h-6 w-full rounded"></div>
//                     </td>
//                     <td className="p-3 border-b border-gray-200">
//                       <div className="bg-gray-300 h-6 w-full rounded"></div>
//                     </td>
//                     <td className="p-3 border-b border-gray-200">
//                       <div className="bg-gray-300 h-6 w-24 rounded mx-auto"></div>
//                     </td>
//                   </tr>
//                 ))
//                 : filteredRestaurants.length > 0
//                   ? filteredRestaurants.map((restro, index) => (
//                     <tr key={restro._id} className="hover:bg-gray-50 transition text-gray-700">
//                       <td className="p-3 border-b border-gray-200">
//                         {(pagination.currentPage - 1) * pagination.pageSize + (index + 1)}
//                       </td>
//                       <td className="p-3 border-b border-gray-200">
//                         <img
//                           src={
//                             restro.restaurant_images?.[0]
//                               ? `${IMAGE_URL}/${restro.restaurant_images[0]}`
//                               : staticimg
//                           }
//                           alt={restro.restro_name}
//                           className="w-10 h-10 rounded-full object-cover cursor-pointer"
//                           onClick={() =>
//                             openImageModal(
//                               restro.restaurant_images?.[0]
//                                 ? `${IMAGE_URL}/${restro.restaurant_images[0]}`
//                                 : staticimg
//                             )
//                           }
//                         />

//                       </td>
//                       <td className="p-3 border-b border-gray-200 font-medium">
//                         {restro.restro_name}
//                       </td>
//                       {/* <td className="p-3 border-b border-gray-200">{restro.food_type}</td> */}
//                       <td className="p-3 border-b border-gray-200">
//                         {truncateDescription(restro.description)}
//                       </td>
//                       <td className="p-3 border-b border-gray-200 text-center">
//                         <button
//                           title="Assign Permissions"
//                           className="flex items-center justify-center w-8 h-8 cursor-pointer rounded-lg bg-[#F9832B] text-white hover:bg-[#ba580e] transition mx-auto"
//                           onClick={() =>
//                             navigate(`/PermissionAssign/restaurant/${restro._id}`, {
//                               state: { name: restro.restro_name, email: restro.email },
//                             })
//                           }
//                         >
//                           <MdAdminPanelSettings size={16} />
//                         </button>
//                       </td>

//                       <td className="p-3 border-b border-gray-200 text-center">
//                         <button
//                           className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500 text-white cursor-pointer hover:bg-purple-600 mx-auto"
//                           onClick={() => navigate(`/DishesList/${restro._id}`)}
//                           title="View Dishes"
//                         >
//                           <MdRestaurantMenu size={16} />
//                         </button>
//                       </td>



//                       <td className="p-3 border-b border-gray-200">
//                         <div className="flex justify-center items-center">
//                           <div className="flex gap-3">
//                             <button
//                               className="flex justify-center w-8 h-8 items-center gap-1 rounded-lg bg-blue-500 text-white cursor-pointer hover:bg-blue-600 whitespace-nowrap"
//                               onClick={() => navigate(`/RestroProfile/${restro._id}`)}
//                             >
//                               <Eye size={16} />
//                             </button>
//                             <button
//                               className="flex items-center gap-1 justify-center w-8 h-8 rounded-lg bg-green-500 text-white cursor-pointer hover:bg-green-600 whitespace-nowrap"
//                               onClick={() => navigate(`/UpdateRestaurant/${restro._id}`)}
//                             >
//                               <MdEdit size={16} />
//                             </button>
//                             <button
//                               className="flex justify-center items-center cursor-pointer bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded"
//                               onClick={() => {
//                                 setSelectedRestaurant(restro);
//                                 setShowDeleteModal(true);
//                               }}
//                               title="Delete Restaurant"
//                             >
//                               <MdDelete size={16} />
//                             </button>

//                           </div>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                   : (
//                     <tr>
//                       <td colSpan="6" className="text-center p-6 text-gray-500 italic">
//                         No restaurants found.
//                       </td>
//                     </tr>
//                   )}
//             </tbody>
//           </table>

//           <DeleteModel
//             isOpen={showDeleteModal}
//             onClose={() => setShowDeleteModal(false)}
//             onConfirm={confirmDelete}
//             redbutton="Confirm"
//             para="Are you sure you want to delete this restaurant? Deleting it will permanently remove all its data, including dishes, menus, and related records from the App. This action cannot be undone."
//           />

//           {/* ✅ Fixed Pagination */}
//           <Pagination
//             currentPage={pagination.currentPage}
//             totalItems={pagination.totalRecords}
//             itemsPerPage={pagination.pageSize}
//             onPageChange={(page) => fetchRestaurants(page)}
//             totalPages={pagination.totalPages}
//             type="backend"
//           />
//         </div>
//       </div>
//       {isImageModalOpen && selectedImage && (
//         <div className="fixed inset-0 flex items-center justify-center z-50">
//           {/* Blurred Background */}
//           <div
//             className="absolute inset-0 bg-black/40 backdrop-blur-sm"
//             onClick={closeImageModal}
//           ></div>

//           {/* Modal Content */}
//           <div className="relative bg-white rounded-xl shadow-lg max-w-md w-11/12 p-4 z-10">
//             {/* Close Button */}
//             <button
//               onClick={closeImageModal}
//               className="absolute top-3 right-3 text-gray-700 text-xl font-bold hover:text-red-600 cursor-pointer"
//             >
//               ✕
//             </button>

//             {/* Image */}
//             <img
//               src={selectedImage}
//               alt="Restaurant Logo"
//               className="w-full h-auto object-contain rounded-lg"
//             />
//           </div>
//         </div>
//       )}

//       <RestaurantFilterModal
//         isOpen={showFilterModal}
//         onClose={() => setShowFilterModal(false)}
//         onApply={(filters) => {
//           setAppliedFilters(filters);
//           fetchRestaurants(1, search, filters);
//         }}
//       />




//     </>
//   );
// }

// export default RestroList;

import React, { useState, useEffect } from "react";
import PageTitle from "../../components/PageTitle/PageTitle";
import { Eye, PlusCircle, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/common/Pagination/Pagination";
import axios from "axios";
import { BASE_URL, IMAGE_URL } from "../../config/Config";
import { MdAdminPanelSettings, MdEdit, MdRestaurantMenu, MdDelete } from "react-icons/md";
import DeleteModel from "../../components/common/DeleteModel/DeleteModel";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";
import staticimg from "../../assets/images/logo.jpg";
import { CiExport } from "react-icons/ci";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FiFilter, FiX } from "react-icons/fi";
import {
  FaUtensils,
  FaLeaf,
  FaDrumstickBite,
  FaShieldAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";

function RestroList() {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});

  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalRecords: 0,
  });

  const [kpi, setKpi] = useState({
    total: 0,
    veg: 0,
    nonVeg: 0,
    both: 0,
    hygiene: 0,
    general: 0,
  });

  const [filterOptions, setFilterOptions] = useState({
    dishTypes: [],
    hygieneStatuses: [],
    accountStatuses: [],
  });

  const navigate = useNavigate();

  const authData = JSON.parse(localStorage.getItem("trofi_user"));
  const token = authData?.token;

  if (!token) {
    toast.error("Please login first");
    return null;
  }

  // Fetch restaurants with pagination and filters
  const fetchRestaurants = async (
    page = 1,
    searchTerm = "",
    filters = appliedFilters
  ) => {
    try {
      setLoading(true);

      const params = {
        page,
        limit: pagination.pageSize,
        searchName: searchTerm,
      };

      // Build filters object
      if (Object.keys(filters).length > 0) {
        params.filters = filters;
      }

      const response = await axios.get(
        `${BASE_URL}/restro/get-restaurant-list`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );

      const {
        data,
        pagination: backendPagination,
        kpi: backendKpi,
      } = response.data;

      setRestaurants(data);
      setPagination((prev) => ({
        ...prev,
        currentPage: backendPagination.page,
        totalPages: backendPagination.totalPages,
        totalRecords: backendPagination.total,
      }));

      // Update KPI counts
      const foodCounts = { veg: 0, nonVeg: 0, both: 0 };
      backendKpi.foodTypeCounts.forEach((item) => {
        if (item._id === "veg") foodCounts.veg = item.count;
        else if (item._id === "non-veg") foodCounts.nonVeg = item.count;
        else if (item._id === "both") foodCounts.both = item.count;
      });

      const hygieneCounts = { hygiene: 0, general: 0 };
      backendKpi.hygieneCounts.forEach((item) => {
        hygieneCounts[item._id] = item.count;
      });

      setKpi({
        total: backendPagination.total,
        ...foodCounts,
        ...hygieneCounts,
      });

      // Extract filter options from KPI data
      if (backendKpi.dishTypeCounts) {
        setFilterOptions((prev) => ({
          ...prev,
          dishTypes: backendKpi.dishTypeCounts,
        }));
      }

      if (backendKpi.hygieneCounts) {
        setFilterOptions((prev) => ({
          ...prev,
          hygieneStatuses: backendKpi.hygieneCounts,
        }));
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong while fetching restaurants");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants(1);
  }, []);

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const confirmDelete = async () => {
    if (!selectedRestaurant) return;

    try {
      const res = await axios.delete(
        `${BASE_URL}/restro/delete-restaurant/${selectedRestaurant._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        toast.success("Restaurant deleted successfully");
        fetchRestaurants(pagination.currentPage, search, appliedFilters);
      } else {
        toast.error(res.data.message || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while deleting");
    } finally {
      setShowDeleteModal(false);
      setSelectedRestaurant(null);
    }
  };

  const truncateText = (text, limit = 30) => {
    if (!text) return "N/A";
    const plainText = String(text).replace(/<\/?[^>]+(>|$)/g, "").trim();
    return plainText.length > limit ? plainText.slice(0, limit) + "..." : plainText;
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setIsImageModalOpen(false);
  };

  const handleExport = () => {
    const exportData = restaurants.map((restro, index) => ({
      "S.No.": (pagination.currentPage - 1) * pagination.pageSize + (index + 1),
      Name: restro.restro_name,
      "Food Type": restro.food_type,
      "Dish Types": restro.dishTypes?.map((d) => d.name).join(", ") || "N/A",
      "Avg Rating": restro.avgRating || 0,
      "Price Per Person": restro.price || 0,
      "Hygiene Status": restro.hygiene_status || "N/A",
      "Account Status": restro.account_status,
      Address: restro.address || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Restaurants");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const fileData = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(fileData, "Restaurants.xlsx");
  };

  return (
    <>
      <div className="main main_page p-6 min-h-screen duration-900">
        <BreadcrumbsNav
          customTrail={[{ label: "Restaurant List", path: "RestroList" }]}
        />

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <PageTitle title={"Restaurant List"} />
          <button
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg cursor-pointer transition"
            style={{ backgroundColor: "#F9832B" }}
            onClick={() => navigate("/RestroAdd")}
          >
            <PlusCircle size={18} /> Add Restaurant
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-900 p-4 rounded-xl text-white shadow-lg hover:shadow-xl transition">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xs md:text-sm font-medium opacity-90">
                  Total Restaurants
                </h4>
                <p className="text-2xl md:text-3xl font-bold mt-1">{kpi.total}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex justify-center items-center flex-shrink-0">
                <FaUtensils size={24} className="text-white" />
              </div>
            </div>
          </div>

          <div className="bg-green-600 p-4 rounded-xl text-white shadow-lg hover:shadow-xl transition">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xs md:text-sm font-medium opacity-90">
                  Veg Restaurants
                </h4>
                <p className="text-2xl md:text-3xl font-bold mt-1">{kpi.veg}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex justify-center items-center flex-shrink-0">
                <FaLeaf size={24} className="text-white" />
              </div>
            </div>
          </div>

          <div className="bg-orange-600 p-4 rounded-xl text-white shadow-lg hover:shadow-xl transition">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xs md:text-sm font-medium opacity-90">
                  Non-Veg Restaurants
                </h4>
                <p className="text-2xl md:text-3xl font-bold mt-1">{kpi.nonVeg}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex justify-center items-center flex-shrink-0">
                <FaDrumstickBite size={24} className="text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-teal-600 p-4 rounded-xl text-white shadow-lg hover:shadow-xl transition">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xs md:text-sm font-medium opacity-90">
                  Hygiene Certified
                </h4>
                <p className="text-2xl md:text-3xl font-bold mt-1">{kpi.hygiene}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex justify-center items-center flex-shrink-0">
                <FaShieldAlt size={24} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <input
              type="text"
              placeholder="Search by Restaurant Name"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                fetchRestaurants(1, e.target.value, appliedFilters);
              }}
              className="w-full lg:w-72 border border-gray-300 bg-white px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-[#F9832B] outline-none transition"
            />

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <button
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg shadow-md border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer transition flex-1 sm:flex-none"
                onClick={() => setShowFilterModal(true)}
              >
                <FiFilter size={18} /> Filter
              </button>

              <button
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg shadow-md border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer transition flex-1 sm:flex-none"
                onClick={handleExport}
              >
                <CiExport size={18} /> Export
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {Object.keys(appliedFilters).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600 font-medium">Active Filters:</span>
              {Object.entries(appliedFilters).map(([key, value]) => (
                <div
                  key={key}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {Array.isArray(value) ? value.join(", ") : value}
                  <button
                    onClick={() => {
                      const newFilters = { ...appliedFilters };
                      delete newFilters[key];
                      setAppliedFilters(newFilters);
                      fetchRestaurants(1, search, newFilters);
                    }}
                    className="hover:text-red-600 transition"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  setAppliedFilters({});
                  fetchRestaurants(1, search, {});
                }}
                className="text-sm text-red-600 hover:text-red-700 underline cursor-pointer transition"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs md:text-sm font-semibold text-gray-700">
                    S.No.
                  </th>
                  <th className="px-4 py-3 text-left text-xs md:text-sm font-semibold text-gray-700">
                    Logo
                  </th>
                  <th className="px-4 py-3 text-left text-xs md:text-sm font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs md:text-sm font-semibold text-gray-700">
                    Dish Types
                  </th>
                  <th className="px-4 py-3 text-center text-xs md:text-sm font-semibold text-gray-700">
                    Avg Rating
                  </th>
                  <th className="px-4 py-3 text-center text-xs md:text-sm font-semibold text-gray-700">
                    Permission
                  </th>
                  <th className="px-4 py-3 text-center text-xs md:text-sm font-semibold text-gray-700">
                    Dishes
                  </th>
                  <th className="px-4 py-3 text-center text-xs md:text-sm font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? [...Array(pagination.pageSize)].map((_, idx) => (
                    <tr key={idx} className="border-b border-gray-200 animate-pulse">
                      <td className="px-4 py-4">
                        <div className="h-4 bg-gray-300 rounded w-8"></div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 bg-gray-300 rounded w-32"></div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 bg-gray-300 rounded w-24"></div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 bg-gray-300 rounded w-16 mx-auto"></div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-8 w-8 bg-gray-300 rounded mx-auto"></div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-8 w-8 bg-gray-300 rounded mx-auto"></div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-8 w-24 bg-gray-300 rounded mx-auto"></div>
                      </td>
                    </tr>
                  ))
                  : restaurants.length > 0
                    ? restaurants.map((restro, index) => (
                      <tr
                        key={restro._id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition text-gray-700"
                      >
                        <td className="px-4 py-4 text-sm font-medium">
                          {(pagination.currentPage - 1) * pagination.pageSize +
                            (index + 1)}
                        </td>
                        <td className="px-4 py-4">
                          <img
                            src={
                              restro.restaurant_images?.[0]
                                ? `${IMAGE_URL}/${restro.restaurant_images[0]}`
                                : staticimg
                            }
                            alt={restro.restro_name}
                            className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition"
                            onClick={() =>
                              openImageModal(
                                restro.restaurant_images?.[0]
                                  ? `${IMAGE_URL}/${restro.restaurant_images[0]}`
                                  : staticimg
                              )
                            }
                          />
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-medium text-gray-900">
                            {truncateText(restro.restro_name, 25)}
                          </p>
                        </td>
                        {/* <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1">
                            {restro.dishTypes && restro.dishTypes.length > 0
                              ? restro.dishTypes.slice(0, 2).map((dt) => (
                                <span
                                  key={dt._id}
                                  className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium"
                                >
                                  {dt.name}
                                </span>
                              ))
                              : <span className="text-xs text-gray-500">N/A</span>}
                            {restro.dishTypes && restro.dishTypes.length > 2 && (
                              <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full font-medium">
                                +{restro.dishTypes.length - 2}
                              </span>
                            )}
                          </div>
                        </td> */}
                         <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2 items-center">
                            {restro.dishTypes && restro.dishTypes.length > 0
                              ? restro.dishTypes.slice(0, 4).map((dt) => (
                                  <div
                                    key={dt._id}
                                    className="relative group"
                                    title={dt.name}
                                  >
                                    <img
                                      src={
                                        dt.icon
                                          ? `${IMAGE_URL}/${dt.icon}`
                                          : staticimg
                                      }
                                      alt={dt.name}
                                      className="w-6 h-6 object-cover rounded-md hover:scale-110 transition cursor-pointer"
                                    />
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition z-10 pointer-events-none">
                                      {dt.name}
                                    </div>
                                  </div>
                                ))
                              : <span className="text-xs text-gray-500">N/A</span>}
                            {restro.dishTypes && restro.dishTypes.length > 4 && (
                              <div className="relative group">
                                <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-300 text-gray-700 text-xs font-bold rounded-md cursor-pointer hover:bg-gray-400 transition">
                                  +{restro.dishTypes.length - 4}
                                </span>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition z-10 pointer-events-none">
                                  {restro.dishTypes
                                    .slice(4)
                                    .map((dt) => dt.name)
                                    .join(", ")}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-sm font-semibold text-yellow-600">
                              ★
                            </span>
                            <span className="text-sm font-medium">
                              {(restro.avgRating || 0).toFixed(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            title="Assign Permissions"
                            className="w-8 h-8 rounded-lg bg-[#F9832B] text-white hover:bg-[#ba580e] transition mx-auto flex items-center justify-center cursor-pointer"
                            onClick={() =>
                              navigate(`/PermissionAssign/restaurant/${restro._id}`, {
                                state: {
                                  name: restro.restro_name,
                                  email: restro.email,
                                },
                              })
                            }
                          >
                            <MdAdminPanelSettings size={16} />
                          </button>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            className="w-8 h-8 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition mx-auto flex items-center justify-center cursor-pointer"
                            onClick={() => navigate(`/DishesList/${restro._id}`)}
                            title="View Dishes"
                          >
                            <MdRestaurantMenu size={16} />
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              className="w-8 h-8 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition flex items-center justify-center cursor-pointer"
                              onClick={() =>
                                navigate(`/RestroProfile/${restro._id}`)
                              }
                              title="View"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              className="w-8 h-8 rounded-lg bg-green-500 text-white hover:bg-green-600 transition flex items-center justify-center cursor-pointer"
                              onClick={() =>
                                navigate(`/UpdateRestaurant/${restro._id}`)
                              }
                              title="Edit"
                            >
                              <MdEdit size={16} />
                            </button>
                            <button
                              className="w-8 h-8 rounded-lg bg-red-500 text-white hover:bg-red-600 transition flex items-center justify-center cursor-pointer"
                              onClick={() => {
                                setSelectedRestaurant(restro);
                                setShowDeleteModal(true);
                              }}
                              title="Delete"
                            >
                              <MdDelete size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                    : (
                      <tr>
                        <td colSpan="8" className="px-4 py-8 text-center">
                          <p className="text-gray-500 text-sm">No restaurants found.</p>
                        </td>
                      </tr>
                    )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {restaurants.length > 0 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalItems={pagination.totalRecords}
              itemsPerPage={pagination.pageSize}
              onPageChange={(page) =>
                fetchRestaurants(page, search, appliedFilters)
              }
              totalPages={pagination.totalPages}
              type="backend"
            />
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteModel
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        redbutton="Confirm"
        para="Are you sure you want to delete this restaurant? Deleting it will permanently remove all its data, including dishes, menus, and related records from the App. This action cannot be undone."
      />

      {/* Image Modal */}
      {isImageModalOpen && selectedImage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeImageModal}
          ></div>

          <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 z-10">
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-600 cursor-pointer transition text-2xl font-bold"
            >
              ✕
            </button>

            <img
              src={selectedImage}
              alt="Restaurant Logo"
              className="w-full h-auto object-contain rounded-lg max-h-96"
            />
          </div>
        </div>
      )}

      {/* Filter Modal */}
      <RestaurantFilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={(filters) => {
          setAppliedFilters(filters);
          fetchRestaurants(1, search, filters);
        }}
        filterOptions={filterOptions}
      />
    </>
  );
}

// Filter Modal Component
function RestaurantFilterModal({
  isOpen,
  onClose,
  onApply,
  filterOptions,
}) {
  const [tempFilters, setTempFilters] = useState({
    hygieneStatus: [],
    dishType: [],
    accountStatus: [],
    minPrice: "",
    maxPrice: "",
    minRating: "",
    maxRating: "",
    priceSort: "",
    ratingSort: "",
  });

  const accountStatusOptions = [
    { _id: "active", label: "Active" },
    { _id: "inactive", label: "Inactive" },
    { _id: "suspended", label: "Suspended" },
  ];

  const handleCheckboxChange = (filterKey, value) => {
    setTempFilters((prev) => {
      const current = prev[filterKey] || [];
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [filterKey]: updated };
    });
  };

  const handleInputChange = (key, value) => {
    setTempFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApply = () => {
    const filters = {};

    if (tempFilters.hygieneStatus.length > 0) {
      filters.hygieneStatus = tempFilters.hygieneStatus;
    }
    if (tempFilters.dishType.length > 0) {
      filters.dishType = tempFilters.dishType;
    }
    if (tempFilters.accountStatus.length > 0) {
      filters.accountStatus = tempFilters.accountStatus;
    }
    if (tempFilters.minPrice) {
      filters.minPrice = parseFloat(tempFilters.minPrice);
    }
    if (tempFilters.maxPrice) {
      filters.maxPrice = parseFloat(tempFilters.maxPrice);
    }
    if (tempFilters.minRating) {
      filters.minRating = parseFloat(tempFilters.minRating);
    }

    // Handle sorting
    if (tempFilters.priceSort) {
      filters.sort = tempFilters.priceSort;
    }
    if (tempFilters.ratingSort) {
      filters.sort = tempFilters.ratingSort;
    }

    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setTempFilters({
      hygieneStatus: [],
      dishType: [],
      accountStatus: [],
      minPrice: "",
      maxPrice: "",
      minRating: "",
      maxRating: "",
      priceSort: "",
      ratingSort: "",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="sticky top-0 bg-gray-100 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Advanced Filters</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-600 cursor-pointer text-2xl font-bold transition"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Hygiene Status Filter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FaShieldAlt size={16} /> Hygiene Status
            </h3>
            <div className="space-y-2">
              {filterOptions.hygieneStatuses?.map((status) => (
                <label key={status._id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempFilters.hygieneStatus.includes(status._id)}
                    onChange={() =>
                      handleCheckboxChange("hygieneStatus", status._id)
                    }
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">
                    {status._id} ({status.count})
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Dish Type Filter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FaUtensils size={16} /> Dish Types
            </h3>
            <div className="space-y-2">
              {filterOptions.dishTypes?.map((dishType) => (
                <label key={dishType._id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempFilters.dishType.includes(dishType._id)}
                    onChange={() =>
                      handleCheckboxChange("dishType", dishType._id)
                    }
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">
                    {dishType.name} ({dishType.count})
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Account Status Filter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Account Status
            </h3>
            <div className="space-y-2">
              {accountStatusOptions.map((status) => (
                <label key={status._id} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempFilters.accountStatus.includes(status._id)}
                    onChange={() =>
                      handleCheckboxChange("accountStatus", status._id)
                    }
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">{status.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Price Per Person (₹)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Min Price"
                value={tempFilters.minPrice}
                onChange={(e) => handleInputChange("minPrice", e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#F9832B] outline-none"
              />
              <input
                type="number"
                placeholder="Max Price"
                value={tempFilters.maxPrice}
                onChange={(e) => handleInputChange("maxPrice", e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#F9832B] outline-none"
              />
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Minimum Rating
            </h3>
            <input
              type="number"
              placeholder="Min Rating (0-5)"
              min="0"
              max="5"
              step="0.1"
              value={tempFilters.minRating}
              onChange={(e) => handleInputChange("minRating", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#F9832B] outline-none"
            />
          </div>

          {/* Price Sort */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Sort by Price
            </h3>
            <select
              value={tempFilters.priceSort}
              onChange={(e) => handleInputChange("priceSort", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#F9832B] outline-none"
            >
              <option value="">Select Sort</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {/* Rating Sort */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Sort by Rating
            </h3>
            <select
              value={tempFilters.ratingSort}
              onChange={(e) => handleInputChange("ratingSort", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#F9832B] outline-none"
            >
              <option value="">Select Sort</option>
              <option value="rating_desc">Rating: High to Low</option>
              <option value="rating_asc">Rating: Low to High</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer transition font-medium"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2 rounded-lg text-white cursor-pointer transition font-medium"
            style={{ backgroundColor: "#F9832B" }}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}

export default RestroList;