import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ContextApi from "./ContextApi";
import Login from "./Pages/Login/Login";
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";
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
import Sidebar1 from "./components/Sidebar/Sidebar1";
import RestroDishTypeList from "./Pages/Dishes/RestroDishTypeList";
import RestroDishCategoryList from "./Pages/Dishes/RestroDishCategoryList";
import RestroDishSubCategoryList from "./Pages/Dishes/RestroDishSubCategoryList";
import RestaurantReviewList from "./Pages/Reviews/Restaurant/RestaurantReviewList";
import DishReviewList from "./Pages/Reviews/Dishes/DishReviewList";
import RestaurantReview from "./Pages/Reviews/Restaurant/RestaurantReview";

const Allroutes = () => {
  const [authData, setAuthData] = useState(() =>
    JSON.parse(localStorage.getItem("broom_auth"))
  );
  return (
    <ContextApi.Provider value={{ authData, setAuthData }}>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/Login" element={<Login />} />
          <Route element={<Layout />}>
            {/* <Route path="/Sidebar1" element={<Sidebar1 />} /> */}
            <Route path="/Dashboard" element={<Dashboard />} />
            <Route path="/RoleList" element={<RoleList />} />
            <Route path="/RoleCreate" element={<RoleCreate />} />
            <Route path="/AdminProfile" element={<AdminProfile />} />
            <Route path="/AdminList" element={<AdminList />} />
            <Route path="/UserList" element={<UserList />} />
            <Route path="/RestroAdd" element={<RestroAdd />} />
            <Route path="/RestroList" element={<RestroList />} />
            <Route path="/UserProfile" element={<UserProfile />} />
            <Route path="/RestroAmenity" element={<RestroAmenity />} />
            <Route path="/RestroAmenity/:id" element={<RestroAmenity />} />
            <Route path="/RestroType" element={<RestroType />} />
            <Route path="/RestroType/:id" element={<RestroType />} />
            <Route path="/RestroGoodFor" element={<RestroGoodFor />} />
            <Route path="/RestroGoodFor/:id" element={<RestroGoodFor />} />
            <Route path="/RestroCuisine" element={<RestroCuisine />} />
            <Route path="/RestroCuisine/:id" element={<RestroCuisine />} />
            <Route path="/RestroAmenityList" element={<RestroAmenityList />} />
            <Route path="/RestroTypeList" element={<RestroTypeList />} />
            <Route path="/RestroCuisineList" element={<RestroCuisineList />} />
            <Route path="/RestroGoodForList" element={<RestroGoodForList />} />
            <Route path="/AddDishes" element={<AddDishes />} />
            <Route path="/RestroDishType" element={<RestroDishType />} />
            <Route
              path="/RestroDishTypeList"
              element={<RestroDishTypeList />}
            />
            <Route path="/DishesList" element={<DishesList />} />
            <Route path="/RestroProfile" element={<RestroProfile />} />
            <Route
              path="/RestroDishCategory"
              element={<RestroDishCategory />}
            />
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
            <Route path="/DishReviewList" element={<DishReviewList />} />
          </Route>
        </Routes>
      </Router>
    </ContextApi.Provider>
  );
};

export default Allroutes;
