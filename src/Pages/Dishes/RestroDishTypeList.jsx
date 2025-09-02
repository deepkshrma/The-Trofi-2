import React from "react";

const RestroDishTypeList = () => {
  const dishes = [
    {
      id: 1,
      image: "https://via.placeholder.com/60",
      type: "Italian Pasta",
      description: "Creamy Alfredo pasta with herbs",
    },
    {
      id: 2,
      image: "https://via.placeholder.com/60",
      type: "Indian Curry",
      description: "Spicy chicken curry with naan bread",
    },
    {
      id: 3,
      image: "https://via.placeholder.com/60",
      type: "Sushi",
      description: "Fresh salmon and avocado rolls",
    },
  ];

  return (
    <div className="main main_page p-6  duration-900">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        Dish Management
      </h2>
      <div className="overflow-x-auto bg-white rounded-2xl shadow-md">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-orange-500 text-white text-left ">
              <th className="p-3 pl-4 rounded-tl-2xl">S.No.</th>
              <th className="p-3">Image</th>
              <th className="p-3">Dish Type</th>
              <th className="p-3 rounded-tr-2xl">Description</th>
            </tr>
          </thead>
          <tbody>
            {dishes.map((dish, index) => (
              <tr
                key={dish.id}
                className="border-b border-gray-300 hover:bg-orange-50 transition "
              >
                <td className="p-3 pl-4 font-medium text-gray-700">
                  {index + 1}
                </td>
                <td className="p-3">
                  <img
                    src={dish.image}
                    alt={dish.type}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                </td>
                <td className="p-3 text-gray-700">{dish.type}</td>
                <td className="p-3 text-gray-500">{dish.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RestroDishTypeList;
