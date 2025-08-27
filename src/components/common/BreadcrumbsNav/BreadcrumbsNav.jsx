import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react";

const BreadcrumbsNav = ({ customTrail = [] }) => {
  return (
    <nav className="mb-4 text-sm font-medium text-gray-600">
      <ol className="flex items-center space-x-2">
        {/* Home Link */}
        <li>
          <RouterLink
            to="/Dashboard"
            className="flex items-center space-x-1 hover:text-primary transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </RouterLink>
        </li>

        {/* Trail Items */}
        {customTrail.map((item, index) => {
          const isLast = index === customTrail.length - 1;

          return (
            <li key={item.label} className="flex items-center space-x-2">
              {/* Separator */}
              <ChevronRight className="w-4 h-4 text-gray-400" />

              {/* Link or current page */}
              {isLast ? (
                <span className="text-gray-800 font-semibold">{item.label}</span>
              ) : (
                <RouterLink
                  to={item.path}
                  className="hover:text-primary transition-colors"
                >
                  {item.label}
                </RouterLink>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default BreadcrumbsNav;
