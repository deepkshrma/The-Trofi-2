import React from "react";

function RestroDishSubCategoryList() {
  const subCategories = [
    {
      id: 1,
      image: "https://via.placeholder.com/60",
      name: "Veg Starters",
      description: "Crispy, light vegetarian appetizers.",
    },
    {
      id: 2,
      image: "https://via.placeholder.com/60",
      name: "Non-Veg Starters",
      description: "Chicken, fish, and meat-based starters.",
    },
    {
      id: 3,
      image: "https://via.placeholder.com/60",
      name: "Ice Creams",
      description: "Different flavored ice creams and sundaes.",
    },
  ];
  return (
    <div className="p-6 main main_page duration-900">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        Dish Sub Categories
      </h2>
      <div className="overflow-x-auto bg-white rounded-2xl shadow-md">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-orange-500 text-white text-left">
              <th className="p-3 pl-4 rounded-tl-2xl">S.No.</th>
              <th className="p-3">Image</th>
              <th className="p-3">Sub Category Name</th>
              <th className="p-3 rounded-tr-2xl">Description</th>
            </tr>
          </thead>
          <tbody>
            {subCategories.map((sub, index) => (
              <tr
                key={sub.id}
                className="border-b hover:bg-orange-50 transition"
              >
                <td className="p-3 pl-4 font-medium text-gray-700">
                  {index + 1}
                </td>
                <td className="p-3">
                  <img
                    src={sub.image}
                    alt={sub.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                </td>
                <td className="p-3 text-gray-700">{sub.name}</td>
                <td className="p-3 text-gray-500">{sub.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RestroDishSubCategoryList;
