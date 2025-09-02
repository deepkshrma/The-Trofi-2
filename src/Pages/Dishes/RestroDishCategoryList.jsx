import React from "react";

const RestroDishCategoryList = () => {
  const categories = [
    {
      id: 1,
      image: "https://via.placeholder.com/60",
      name: "Starters",
      description: "Light dishes to start your meal, like soups and salads.",
    },
    {
      id: 2,
      image: "https://via.placeholder.com/60",
      name: "Main Course",
      description: "Hearty meals including rice, curries, and breads.",
    },
    {
      id: 3,
      image: "https://via.placeholder.com/60",
      name: "Desserts",
      description: "Sweet dishes such as cakes, ice creams, and puddings.",
    },
  ];

  return (
    <div className="p-6 main main_page duration-900">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        Dish Categories
      </h2>
      <div className="overflow-x-auto bg-white rounded-2xl shadow-md">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-orange-500 text-white text-left">
              <th className="p-3 pl-4 rounded-tl-2xl">S.No.</th>
              <th className="p-3">Image</th>
              <th className="p-3">Category Name</th>
              <th className="p-3 rounded-tr-2xl">Description</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, index) => (
              <tr
                key={cat.id}
                className="border-b border-gray-300 hover:bg-orange-50 transition"
              >
                <td className="p-3 pl-4 font-medium text-gray-700">
                  {index + 1}
                </td>
                <td className="p-3">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                </td>
                <td className="p-3 text-gray-700">{cat.name}</td>
                <td className="p-3 text-gray-500">{cat.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RestroDishCategoryList;
