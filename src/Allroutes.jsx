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
            <Route path="/RestroType" element={<RestroType />} />
            <Route path="/RestroGoodFor" element={<RestroGoodFor />} />
            <Route path="/RestroCuisine" element={<RestroCuisine />} />
          </Route>
        </Routes>
      </Router>
    </ContextApi.Provider>
  );
};

export default Allroutes;
