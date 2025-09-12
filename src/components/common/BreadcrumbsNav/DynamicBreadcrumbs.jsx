// src/components/common/DynamicBreadcrumbs.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

// Define your custom map for pathnames -> readable labels
const breadcrumbNameMap = {
  "/Dashboard": "DashBoard",
  "/AdminList": "Admin List",
  "/RoleCreate": "Create Role",
  "/RoleList": "All Roles",
  "/UserList": "Customer",
};

function DynamicBreadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <nav className="text-sm text-gray-600 mb-4">
      <ol className="flex flex-wrap items-center">
        {/* Always show Home */}
        <li>
          <Link to="/" className="text-orange-500 hover:underline">
            Home
          </Link>
          {pathnames.length > 0 && <span className="mx-2">/</span>}
        </li>

        {/* Loop through rest of the path */}
        {pathnames.map((name, idx) => {
          const routeTo = `/${pathnames.slice(0, idx + 1).join("/")}`;
          const isLast = idx === pathnames.length - 1;

          // Pick label from map, fallback to capitalized path
          const label =
            breadcrumbNameMap[routeTo] ||
            name.charAt(0).toUpperCase() + name.slice(1);

          return (
            <li key={idx} className="flex items-center">
              {isLast ? (
                <span className="text-gray-800 font-semibold">{label}</span>
              ) : (
                <>
                  <Link
                    to={routeTo}
                    className="text-orange-500 hover:underline"
                  >
                    {label}
                  </Link>
                  <span className="mx-2">/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default DynamicBreadcrumbs;
