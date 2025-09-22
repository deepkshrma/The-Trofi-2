import React, { useEffect } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { toast } from "react-toastify";

/**
 * ProtectedRoute wraps protected pages. Put it in your routes as a parent.
 * It reads trofi_user from localStorage / sessionStorage.
 */
export default function ProtectedRoute() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem("trofi_user") || sessionStorage.getItem("trofi_user");
    if (!stored) {
      // show toast and redirect to login
      toast.error("Please login first");
      navigate("/login", { replace: true, state: { from: location } });
    }
    // If you want, you can also validate token structure here
  }, [navigate, location]);

  // If user not logged in, effect will navigate away.
  // When logged in, render nested routes via <Outlet />.
  return <Outlet />;
}
