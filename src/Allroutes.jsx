import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import routesConfig from "./routes/routesConfig";
import ProtectedRoute from "./ProtectedRoute";
import ContextApi from "./ContextApi";
import Layout from "./Layout/Layout";
import Login from "./Pages/Login/Login";
import NotFound from "./Pages/NotFound/NotFound";
import { useState, useEffect } from "react";

const Allroutes = () => {
  const [authData, setAuthData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("trofi_user"));
    setAuthData(user);
    setLoading(false);
  }, []);

  if (loading) return null; // prevent 404 flash

  const role = authData?.role;

  return (
    <ContextApi.Provider value={{ authData, setAuthData }}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Login />} />

          {/* Protected */}
          <Route element={<Layout />}>
            <Route element={<ProtectedRoute authData={authData} />}>
              {routesConfig
                .filter((r) => role && r.roles.includes(role))
                .map((r, i) => (
                  <Route key={i} path={r.path} element={r.element} />
                ))}
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ContextApi.Provider>
  );
};

export default Allroutes;
