// src/components/common/DynamicBreadcrumbs.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

const breadcrumbNameMap = {
  "/Dashboard": "DashBoard",
  "/AdminList": "Admin List",
  "/AdminProfile": "Admin Profile",
  "/RoleCreate": "Create Role",
  "/RoleList": "All Roles",
  "/UserList": "Customer",
  "/UserProfile": "User Profile",
  "/RestroAdd": "Add New Restaurant",
  "/RestroList": "Restaurant List",
  "/RestroAmenity": "Restaurant Amenity",
  "/RestroAmenityList": "Restaurant Amenities List",
  "/RestroType": "Restaurant Type",
  "/RestroType/:id": "Update Type",
  "/RestroTypeList": "Restaurant Type List",
  "/RestroGoodFor": "Restaurant Good For",
  "/RestroGoodFor/:id": "Update Restaurant Good For",
  "/RestroGoodForList": "Restaurant - Good For",
  "/RestroAmenity/:id": "Update Amenity",
  "/RestroCuisine": "Restaurant Cuisine",
  "/RestroCuisine/:id": "Update Restaurant Cuisine",
  "/UpdateRestaurant/:id": "Update Restaurant",
  "/RestroCuisineList": "Restaurant - Cuisines",
  "/AddDishes": "Add New Dish",
  "/DishesList": "Dishes List",
  "/RestroDishType": "Restaurant Dish Type",
  "/RestroDishTypeList": "Dish Management",
  "/RestroDishCategory": "Create Dish Category",
  "/RestroDishCategoryList": "Dish Category List",
  "/RestroDishSubCategory": "Create Restaurant Dish Sub Category",
  "/RestroDishSubCategoryList": "Dish Sub Categories",
  "/RestaurantReviewList": "Restaurant Reviews List",
  "/RestaurantReview": "Restaurant Reviews",
  "/DishReviewList": "Dish Reviews List",
  "/DishReview": "Dish Reviews",
  "/RestroProfile": "Restaurant Profile",
  "/RestroProfile/:id": "Restaurant Profile",
};

// Utility: resolve labels including dynamic routes
const getLabel = (route) => {
  if (breadcrumbNameMap[route]) return breadcrumbNameMap[route];

  const dynamicMatch = Object.keys(breadcrumbNameMap).find((path) => {
    if (path.includes(":")) {
      const base = path.split("/:")[0];
      return route.startsWith(base + "/");
    }
    return false;
  });

  if (dynamicMatch) return breadcrumbNameMap[dynamicMatch];

  return route.split("/").pop();
};

// Utility: if route matches a ":id", find its list page
const getListParent = (route) => {
  const dynamicMatch = Object.keys(breadcrumbNameMap).find((path) => {
    if (path.includes(":")) {
      const base = path.split("/:")[0];
      return route.startsWith(base + "/");
    }
    return false;
  });

  if (dynamicMatch) {
    const base = dynamicMatch.split("/:")[0]; // e.g. "/RestroAmenity"
    const listRoute = `${base}List`; // e.g. "/RestroAmenityList"
    if (breadcrumbNameMap[listRoute]) {
      return listRoute;
    }
  }
  return null;
};

function DynamicBreadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <nav className="text-sm text-gray-600 mb-4">
      <ol className="flex flex-wrap items-center">
        {/* Always show Home */}
        <li>
          <Link to="/Dashboard" className="text-orange-500 hover:underline">
            Home
          </Link>
          {pathnames.length > 0 && <span className="mx-2">/</span>}
        </li>

        {pathnames.map((name, idx) => {
          let routeTo = `/${pathnames.slice(0, idx + 1).join("/")}`;
          const isLast = idx === pathnames.length - 1;

          // If this is a dynamic detail page, insert its List parent instead
          const listParent = getListParent(routeTo);
          if (listParent && !isLast) {
            routeTo = listParent;
          }

          const label = getLabel(routeTo);

          return (
            <li key={idx} className="flex items-center">
              {isLast ? (
                <span className="text-gray-500 font-semibold">{label}</span>
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
