import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { toast } from "react-toastify";

/**
 * ProtectedRoute wraps protected pages.
 * Checks authData + role, then allows / blocks routes accordingly.
 */
export default function ProtectedRoute({ allowedRoles }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored =
      localStorage.getItem("trofi_user") ||
      sessionStorage.getItem("trofi_user");

    if (!stored) {
      toast.error("Please login first");
      navigate("/login", { replace: true, state: { from: location } });
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setUser(parsed);

      if (allowedRoles && !allowedRoles.includes(parsed.role)) {
        toast.error("Unauthorized access");
        navigate("/NotFound", { replace: true });
      }
    } catch (err) {
      localStorage.removeItem("trofi_user");
      sessionStorage.removeItem("trofi_user");
      toast.error("Invalid session, please login again");
      navigate("/login", { replace: true });
    }
  }, [navigate, location, allowedRoles]);

  return <Outlet />;
}
