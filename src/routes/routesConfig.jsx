// routesConfig.js
import Dashboard from "../Pages/Dashboard/Dashboard";
import RestroOwnerDashboard from "../Pages/Dashboard/RestroOwnerDashboard";

// Roles
import RoleList from "../Pages/Role/RoleLIst";
import RoleCreate from "../Pages/Role/RoleCreate";
import UpdateRole from "../Pages/Role/UpdateRole";

// Admin Management
import AdminList from "../Pages/Admin/AdminList";
import CreateAdmin from "../Pages/Admin/CreateAdmin";
import UpdateAdmin from "../Pages/Admin/UpdateAdmin";
import AdminProfile from "../Pages/Admin/AdminProfile";

// Users
import UserList from "../Pages/User/UserLIst";
import UserProfile from "../Pages/User/UserProfile";

// Restaurants
import RestroList from "../Pages/Restaurant/RestroList";
import RestroAdd from "../Pages/Restaurant/RestroAdd";
import RestroProfile from "../Pages/Restaurant/RestroProfile";
import UpdateRestaurant from "../Pages/Restaurant/UpdateRestaurant";

// Restaurant Meta
import RestroAmenity from "../Pages/Restaurant/RestroAmenity";
import RestroAmenityList from "../Pages/Restaurant/RestroAmenityList";
import RestroType from "../Pages/Restaurant/RestroType";
import RestroTypeList from "../Pages/Restaurant/RestroTypeList";
import RestroCuisine from "../Pages/Restaurant/RestroCuisine";
import RestroCuisineList from "../Pages/Restaurant/RestroCuisineList";
import RestroGoodFor from "../Pages/Restaurant/RestroGoodFor";
import RestroGoodForList from "../Pages/Restaurant/RestroGoodForList";

// Dishes
import AddDishes from "../Pages/Dishes/AddDishes";
import UpdateDishes from "../Pages/Dishes/UpdateDishes";
import DishesList from "../Pages/Dishes/DishesList";
import RestroDishType from "../Pages/Dishes/RestroDishType";
import RestroDishTypeList from "../Pages/Dishes/RestroDishTypeList";
import RestroDishCategory from "../Pages/Dishes/RestroDishCategory";
import RestroDishCategoryList from "../Pages/Dishes/RestroDishCategoryList";
import RestroDishSubCategory from "../Pages/Dishes/RestroDishSubCategory";
import RestroDishSubCategoryList from "../Pages/Dishes/RestroDishSubCategoryList";

// Reviews
import RestaurantReviewList from "../Pages/Reviews/Restaurant/RestaurantReviewList";
import RestaurantReview from "../Pages/Reviews/Restaurant/RestaurantReview";
import DishReviewList from "../Pages/Reviews/Dishes/DishReviewList";
import DishReview from "../Pages/Reviews/Dishes/DishReview";

// Hashtags
import HashtagList from "../Pages/HashTag/HashtagList";
import CreateHashtag from "../Pages/HashTag/CreateHashtag";

// FAQs
import FAQList from "../Pages/FAQ/FAQList";
import CreateFAQ from "../Pages/FAQ/CreateFAQ";
import FAQInDetail from "../Pages/FAQ/FAQInDetail";
import QueryFAQ from "../Pages/FAQ/QueryFAQ";
import QueryFAQSee from "../Pages/FAQ/QueryFAQSee";
import AppFeedback from "../Pages/FAQ/AppFeedback";
import AppFeedbackSee from "../Pages/FAQ/AppFeedbackSee";

// Policies
import Policies from "../Pages/Policies/Policies";
import PoliciesList from "../Pages/Policies/PoliciesList";
import CreatePolicy from "../Pages/Policies/CreatePolicy";

const routesConfig = [
  // ========= DASHBOARDS =========
  { path: "/Dashboard", element: <Dashboard />, roles: ["admin", "superadmin"] },
  { path: "/RestroOwnerDashboard", element: <RestroOwnerDashboard />, roles: ["admin", "superadmin","restaurant_owner"] },

  
  // ========= ROLES =========
  { path: "/RoleList", element: <RoleList />, roles: ["superadmin"] },
  { path: "/RoleCreate", element: <RoleCreate />, roles: ["superadmin"] },
  { path: "/RoleUpdate/:id", element: <UpdateRole />, roles: ["superadmin"] },

  // ========= ADMINS =========
  { path: "/AdminList", element: <AdminList />, roles: ["superadmin"] },
  { path: "/CreateAdmin", element: <CreateAdmin />, roles: ["superadmin"] },
  { path: "/UpdateAdmin/:id", element: <UpdateAdmin />, roles: ["superadmin"] },
  { path: "/AdminProfile", element: <AdminProfile />, roles: ["admin", "superadmin"] },

  // ========= USERS =========
  { path: "/UserList", element: <UserList />, roles: ["admin", "superadmin"] },
  { path: "/UserProfile", element: <UserProfile />, roles: ["admin", "superadmin"] },
  { path: "/UserProfile/:id", element: <UserProfile />, roles: ["admin", "superadmin"] },

  // ========= RESTAURANTS =========
  { path: "/RestroList", element: <RestroList />, roles: ["admin", "superadmin"] },
  { path: "/RestroAdd", element: <RestroAdd />, roles: ["admin", "superadmin"] },
  { path: "/RestroProfile", element: <RestroProfile />, roles: ["restaurant_owner", "admin", "superadmin"] },
  { path: "/RestroProfile/:id", element: <RestroProfile />, roles: ["admin", "superadmin"] },
  { path: "/UpdateRestaurant/:id", element: <UpdateRestaurant />, roles: ["admin", "superadmin"] },
  { path: "/UpdateRestaurant", element: <UpdateRestaurant />, roles: ["admin", "superadmin"] },

  // ========= RESTAURANT META =========
  { path: "/RestroAmenity", element: <RestroAmenity />, roles: ["admin", "superadmin"] },
  { path: "/RestroAmenity/:id", element: <RestroAmenity />, roles: ["admin", "superadmin"] },
  { path: "/RestroAmenityList", element: <RestroAmenityList />, roles: ["admin", "superadmin"] },

  { path: "/RestroType", element: <RestroType />, roles: ["admin", "superadmin"] },
  { path: "/RestroType/:id", element: <RestroType />, roles: ["admin", "superadmin"] },
  { path: "/RestroTypeList", element: <RestroTypeList />, roles: ["admin", "superadmin"] },

  { path: "/RestroCuisine", element: <RestroCuisine />, roles: ["admin", "superadmin"] },
  { path: "/RestroCuisine/:id", element: <RestroCuisine />, roles: ["admin", "superadmin"] },
  { path: "/RestroCuisineList", element: <RestroCuisineList />, roles: ["admin", "superadmin"] },

  { path: "/RestroGoodFor", element: <RestroGoodFor />, roles: ["admin", "superadmin"] },
  { path: "/RestroGoodFor/:id", element: <RestroGoodFor />, roles: ["admin", "superadmin"] },
  { path: "/RestroGoodForList", element: <RestroGoodForList />, roles: ["admin", "superadmin"] },

  // ========= DISHES =========
  { path: "/AddDishes", element: <AddDishes />, roles: ["admin", "superadmin","restaurant_owner"] },
  { path: "/AddDishes/:id", element: <AddDishes />, roles: ["admin", "superadmin","restaurant_owner"] },
  { path: "/UpdateDishes/:id", element: <UpdateDishes />, roles: ["admin", "superadmin","restaurant_owner"] },
  { path: "/DishesList", element: <DishesList />, roles: ["admin", "superadmin","restaurant_owner"] },

  { path: "/RestroDishType", element: <RestroDishType />, roles: ["admin", "superadmin","restaurant_owner"] },
  { path: "/RestroDishTypeList", element: <RestroDishTypeList />, roles: ["admin", "superadmin","restaurant_owner"] },

  { path: "/RestroDishCategory", element: <RestroDishCategory />, roles: ["admin", "superadmin","restaurant_owner"] },
  { path: "/RestroDishCategoryList", element: <RestroDishCategoryList />, roles: ["admin", "superadmin","restaurant_owner"] },

  { path: "/RestroDishSubCategory", element: <RestroDishSubCategory />, roles: ["admin", "superadmin","restaurant_owner"] },
  { path: "/RestroDishSubCategoryList", element: <RestroDishSubCategoryList />, roles: ["admin", "superadmin","restaurant_owner"] },

  // ========= REVIEWS =========
  { path: "/RestaurantReviewList", element: <RestaurantReviewList />, roles: ["admin", "superadmin"] },
  { path: "/RestaurantReview", element: <RestaurantReview />, roles: ["admin", "superadmin"] },
  { path: "/DishReviewList", element: <DishReviewList />, roles: ["restaurant_owner", "admin", "superadmin"] },
  { path: "/DishReview", element: <DishReview />, roles: ["restaurant_owner", "admin", "superadmin"] },

  // ========= HASHTAGS =========
  { path: "/HashtagList", element: <HashtagList />, roles: ["admin", "superadmin"] },
  { path: "/CreateHashtag", element: <CreateHashtag />, roles: ["admin", "superadmin"] },

  // ========= FAQ =========
  { path: "/FAQList", element: <FAQList />, roles: ["admin", "superadmin"] },
  { path: "/CreateFAQ", element: <CreateFAQ />, roles: ["admin", "superadmin"] },
  { path: "/FAQInDetail/:id", element: <FAQInDetail />, roles: ["admin", "superadmin"] },
  { path: "/QueryFAQ", element: <QueryFAQ />, roles: ["admin", "superadmin"] },
  { path: "/QueryFAQSee/:id", element: <QueryFAQSee />, roles: ["admin", "superadmin"] },

  // ========= POLICIES =========
  { path: "/PoliciesList", element: <PoliciesList />, roles: ["admin", "superadmin"] },
  { path: "/CreatePolicy", element: <CreatePolicy />, roles: ["admin", "superadmin"] },
  { path: "/Policies/:id", element: <Policies />, roles: ["admin", "superadmin"] },

  // ========= FEEDBACK =========
  { path: "/AppFeedback", element: <AppFeedback />, roles: ["admin", "superadmin"] },
  { path: "/AppFeedback/:id", element: <AppFeedbackSee />, roles: ["admin", "superadmin"] },
];

export default routesConfig;
