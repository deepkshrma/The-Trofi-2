// src/components/common/DynamicBreadcrumbs.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

// Define your custom map for pathnames -> readable labels
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
