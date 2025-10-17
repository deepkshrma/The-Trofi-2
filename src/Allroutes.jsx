import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ContextApi from "./ContextApi";
import Login from "./Pages/Login/Login";
import Layout from "./Layout/Layout";
import Dashboard from "./Pages/Dashboard/Dashboard";
import RoleList from "./Pages/Role/RoleLIst";
import AdminProfile from "./Pages/Admin/AdminProfile";
import RestroAdd from "./Pages/Restaurant/RestroAdd";
import RoleCreate from "./Pages/Role/RoleCreate";
import AdminList from "./Pages/Admin/AdminList";
import UserList from "./Pages/User/UserLIst";
import RestroList from "./Pages/Restaurant/RestroList";
import UserProfile from "./Pages/User/UserProfile";
import RestroAmenity from "./Pages/Restaurant/RestroAmenity";
import RestroType from "./Pages/Restaurant/RestroType";
import RestroGoodFor from "./Pages/Restaurant/RestroGoodFor";
import RestroCuisine from "./Pages/Restaurant/RestroCuisine";
import RestroAmenityList from "./Pages/Restaurant/RestroAmenityList";
import RestroTypeList from "./Pages/Restaurant/RestroTypeList";
import RestroCuisineList from "./Pages/Restaurant/RestroCuisineList";
import RestroGoodForList from "./Pages/Restaurant/RestroGoodForList";
import AddDishes from "./Pages/Dishes/AddDishes";
import RestroDishType from "./Pages/Dishes/RestroDishType";
import RestroDishCategory from "./Pages/Dishes/RestroDishCategory";
import RestroDishSubCategory from "./Pages/Dishes/RestroDishSubCategory";
import DishesList from "./Pages/Dishes/DishesList";
import RestroProfile from "./Pages/Restaurant/RestroProfile";
import RestroDishTypeList from "./Pages/Dishes/RestroDishTypeList";
import RestroDishCategoryList from "./Pages/Dishes/RestroDishCategoryList";
import RestroDishSubCategoryList from "./Pages/Dishes/RestroDishSubCategoryList";
import RestaurantReviewList from "./Pages/Reviews/Restaurant/RestaurantReviewList";
import DishReviewList from "./Pages/Reviews/Dishes/DishReviewList";
import RestaurantReview from "./Pages/Reviews/Restaurant/RestaurantReview";
import UpdateRestaurant from "./Pages/Restaurant/UpdateRestaurant";
import DishReview from "./Pages/Reviews/Dishes/DishReview";
import RestroOwnerDashboard from "./Pages/Dashboard/RestroOwnerDashboard";
import ProtectedRoute from "./ProtectedRoute";
import UpdateRole from "./Pages/Role/UpdateRole";
import CreateAdmin from "./Pages/Admin/CreateAdmin";
import UpdateAdmin from "./Pages/Admin/UpdateAdmin";
import UpdateDishes from "./Pages/Dishes/UpdateDishes";
import HashtagList from "./Pages/HashTag/HashtagList";
import CreateHashtag from "./Pages/HashTag/CreateHashtag";
import FAQList from "./Pages/FAQ/FAQList";
import CreateFAQ from "./Pages/FAQ/CreateFAQ";
import NotFound from "./Pages/NotFound/NotFound";
import QueryFAQ from "./Pages/FAQ/QueryFAQ";
import FAQInDetail from "./Pages/FAQ/FAQInDetail";
import QueryFAQSee from "./Pages/FAQ/QueryFAQSee";
import Policies from "./Pages/Policies/Policies";
import PoliciesList from "./Pages/Policies/PoliciesList";
import CreatePolicy from "./Pages/Policies/CreatePolicy";
import AppFeedback from "./Pages/FAQ/AppFeedback";
import AppFeedbackSee from "./Pages/FAQ/AppFeedbackSee";
import RestroOwnerProfile from "./Pages/RestroOwner/RestroOwnerProfile";
import RestaurantProfile from "./Pages/RestroOwner/RestaurantProfile";
import RestaurantDishes from "./Pages/RestroOwner/RestaurantDishes";
import RestaurantReviews from "./Pages/RestroOwner/RestaurantReviews";
import SingleDishReview from "./Pages/RestroOwner/SingleDishReview";
import NotificationList from "./Pages/Notification/NotificationList";
import NotificationView from "./Pages/Notification/NotificationView";
import NotificationPost from "./Pages/Notification/NotificationPost";
import ReportList from "./Pages/Reports/ReportList";
import RestroReportDetails from "./Pages/Reports/RestroReportDetails";
import PermissionAssign from "./Pages/Permission/PermissionAssign";
import DishDetails from "./Pages/Dishes/DishDetails";

const Allroutes = () => {
  const [authData, setAuthData] = useState(() =>
    JSON.parse(localStorage.getItem("trofi_user"))
  );

  return (
    <ContextApi.Provider value={{ authData, setAuthData }}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/Login" element={<Login />} />

          {/* Protected Routes for admin + superadmin */}
          <Route element={<Layout />}>
            <Route
              element={
                <ProtectedRoute allowedRoles={["admin", "superadmin"]} />
              }
            >
              <Route path="/Dashboard" element={<Dashboard />} />
              <Route path="/RoleList" element={<RoleList />} />
              <Route path="/RoleCreate" element={<RoleCreate />} />
              <Route path="/PermissionAssign/:type/:id" element={<PermissionAssign />} />

              <Route path="/AdminProfile" element={<AdminProfile />} />
              <Route path="/CreateAdmin" element={<CreateAdmin />} />
              <Route path="/UpdateAdmin/:id" element={<UpdateAdmin />} />
              <Route path="/AdminList" element={<AdminList />} />
              <Route path="/UserList" element={<UserList />} />
              <Route path="/RestroAdd" element={<RestroAdd />} />
              <Route path="/RestroList" element={<RestroList />} />
              <Route path="/UserProfile" element={<UserProfile />} />
              <Route path="/UserProfile/:id" element={<UserProfile />} />
              <Route path="/RestroAmenity" element={<RestroAmenity />} />
              <Route path="/RestroAmenity/:id" element={<RestroAmenity />} />
              <Route path="/RestroType" element={<RestroType />} />
              <Route path="/RestroType/:id" element={<RestroType />} />
              <Route path="/RestroGoodFor" element={<RestroGoodFor />} />
              <Route path="/RestroGoodFor/:id" element={<RestroGoodFor />} />
              <Route path="/RestroCuisine" element={<RestroCuisine />} />
              <Route path="/RestroCuisine/:id" element={<RestroCuisine />} />
              <Route
                path="/RestroAmenityList"
                element={<RestroAmenityList />}
              />
              <Route path="/RestroTypeList" element={<RestroTypeList />} />
              <Route path="/RestroCuisineList" element={<RestroCuisineList />} />
              <Route
                path="/RestroGoodForList"
                element={<RestroGoodForList />}
              />
              <Route
                path="/UpdateRestaurant/:id"
                element={<UpdateRestaurant />}
              />
              <Route path="/UpdateRestaurant" element={<UpdateRestaurant />} />
              <Route path="/AddDishes/:restaurantId" element={<AddDishes />} />
              <Route path="/UpdateDishes/:id" element={<UpdateDishes />} />
              <Route path="/AddDishes/:id" element={<AddDishes />} />
              <Route path="/DishDetails/:id" element={<DishDetails />} />
              <Route path="/RestroDishType" element={<RestroDishType />} />
              <Route path="/RestroDishTypeList" element={<RestroDishTypeList />} />
              <Route path="/DishesList/:restaurantId" element={<DishesList />} />
              <Route path="/RestroProfile" element={<RestroProfile />} />
              <Route path="/RestroDishCategory" element={<RestroDishCategory />} />
              <Route
                path="/RestroDishCategoryList"
                element={<RestroDishCategoryList />}
              />
              <Route
                path="/RestroDishSubCategory"
                element={<RestroDishSubCategory />}
              />
              <Route
                path="/RestroDishSubCategoryList"
                element={<RestroDishSubCategoryList />}
              />
              <Route path="/RestroProfile/:id" element={<RestroProfile />} />
              <Route
                path="/RestaurantReviewList"
                element={<RestaurantReviewList />}
              />
              <Route path="/RestaurantReview" element={<RestaurantReview />} />
              <Route
                path="/RestaurantReview/:id"
                element={<RestaurantReview />}
              />
              <Route path="/DishReviewList" element={<DishReviewList />} />
              <Route path="/DishReview" element={<DishReview />} />
              <Route path="/DishReview/:id" element={<DishReview />} />
              <Route path="/HashtagList" element={<HashtagList />} />
              <Route path="/CreateHashtag" element={<CreateHashtag />} />
              <Route path="/RoleUpdate/:id" element={<UpdateRole />} />
              <Route path="/FAQList" element={<FAQList />} />
              <Route path="/CreateFAQ" element={<CreateFAQ />} />
              <Route path="/FAQInDetail/:id" element={<FAQInDetail />} />
              <Route path="/QueryFAQ" element={<QueryFAQ />} />
              <Route path="/QueryFAQSee/:id" element={<QueryFAQSee />} />
              <Route path="/Policies/:id" element={<Policies />} />
              <Route path="/PoliciesList" element={<PoliciesList />} />
              <Route path="/CreatePolicy" element={<CreatePolicy />} />
              <Route path="/AppFeedback" element={<AppFeedback />} />
              <Route path="/AppFeedback/:id" element={<AppFeedbackSee />} />
              <Route path="/NotificationList" element={<NotificationList />} />
              <Route path="/NotificationView/:id" element={<NotificationView />} />
              <Route path="/NotificationPost" element={<NotificationPost />} />
              <Route path="/ReportList" element={<ReportList />} />
              <Route path="/RestroReportDetails/:id" element={<RestroReportDetails />} />
            </Route>
          </Route>

          {/* Protected Routes for restaurant_owner */}
          <Route element={<Layout />}>
            <Route
              element={<ProtectedRoute allowedRoles={["restaurant_owner"]} />}
            >
              <Route
                path="/RestroOwnerDashboard"
                element={<RestroOwnerDashboard />}
              />
              <Route path="/RestroOwnerProfile" element={<RestroOwnerProfile />} />
              <Route path="/RestaurantProfile" element={<RestaurantProfile />} />
              <Route path="/RestaurantDishes" element={<RestaurantDishes />} />
              <Route path="/RestaurantReviews" element={<RestaurantReviews />} />
              <Route path="/SingleDishReview/:id" element={<SingleDishReview />} />
            </Route>
          </Route>

          {/* Fallback 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ContextApi.Provider>
  );
};

export default Allroutes;
