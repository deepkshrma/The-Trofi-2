import React, { useState } from "react";

function AddDishes() {
  const [ingredients, setIngredients] = useState([""]);
  const [images, setImages] = useState([]);

  // Add ingredient field
  const addIngredient = () => setIngredients([...ingredients, ""]);
  const updateIngredient = (value, index) => {
    const updated = [...ingredients];
    updated[index] = value;
    setIngredients(updated);
  };

  // Handle file upload
  const handleFileChange = (e) => {
    setImages([...e.target.files]);
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted ✅");
  };

  return (
    <div className="main main_page min-h-screen bg-gray-50 py-10 px-6 lg:px-20">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-2xl p-10">
        <h2 className="text-4xl font-bold text-orange-500 mb-10 text-center">
          🍴 Add New Dish
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Dish Name */}
          <div className="relative">
            <input
              type="text"
              name="dish_name"
              className="peer w-full border border-gray-200 rounded-xl px-3 pt-5 pb-2 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
              placeholder=" "
              required
            />
            <label className="absolute left-3 top-2.5 text-gray-400 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-500 peer-placeholder-shown:text-base peer-focus:top-2.5 peer-focus:text-sm peer-focus:text-orange-500">
              Dish Name
            </label>
          </div>

          {/* Price */}
          <div className="relative">
            <input
              type="number"
              name="price"
              className="peer w-full border border-gray-200 rounded-xl px-3 pt-5 pb-2 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
              placeholder=" "
              required
            />
            <label className="absolute left-3 top-2.5 text-gray-400 text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-500 peer-placeholder-shown:text-base peer-focus:top-2.5 peer-focus:text-sm peer-focus:text-orange-500">
              Price
            </label>
          </div>

          {/* Description */}
          <div className="relative md:col-span-2">
            <textarea
              name="description"
              rows="4"
              className="peer w-full border border-gray-200 rounded-xl px-3 pt-5 pb-2 focus:outline-none focus:ring-2 focus:ring-orange-400 transition resize-none"
              placeholder=" "
            ></textarea>
            <label className="absolute left-3 top-2.5 text-gray-400 text-sm transition-all peer-placeholder-shown:top-6 peer-placeholder-shown:text-gray-500 peer-placeholder-shown:text-base peer-focus:top-2.5 peer-focus:text-sm peer-focus:text-orange-500">
              Description
            </label>
          </div>

          {/* Cuisine */}
          <div className="relative">
            <select
              name="cuisine"
              className="w-full border border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 transition bg-white"
            >
              <option value="">Select Cuisine</option>
            </select>
          </div>

          {/* Category */}
          <div className="relative">
            <select
              name="category"
              className="w-full border border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 transition bg-white"
            >
              <option value="">Select Category</option>
            </select>
          </div>

          {/* Sub Category */}
          <div className="relative">
            <select
              name="subCategory"
              className="w-full border border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 transition bg-white"
            >
              <option value="">Select Sub Category</option>
            </select>
          </div>

          {/* Dish Type */}
          <div className="relative">
            <select
              name="type"
              className="w-full border border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 transition bg-white"
            >
              <option value="">Select Type</option>
            </select>
          </div>

          {/* Ingredients */}
          <div className="md:col-span-2">
            <label className="block text-gray-600 mb-2 font-medium">
              Ingredients
            </label>
            {ingredients.map((ing, index) => (
              <input
                key={index}
                type="text"
                value={ing}
                onChange={(e) => updateIngredient(e.target.value, index)}
                className="w-full mb-2 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder={`Ingredient ${index + 1}`}
              />
            ))}
            <button
              type="button"
              onClick={addIngredient}
              className="text-sm text-orange-500 hover:underline"
            >
              + Add Ingredient
            </button>
          </div>

          {/* Images */}
          <div className="md:col-span-2">
            <label className="block text-gray-600 mb-2 font-medium">
              Dish Images
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Availability */}
          <div className="flex items-center gap-2 md:col-span-2">
            <input
              type="checkbox"
              name="isAvailable"
              id="isAvailable"
              className="h-5 w-5 accent-orange-500"
            />
            <label htmlFor="isAvailable" className="text-gray-600 font-medium">
              Available
            </label>
          </div>

          {/* Submit */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold hover:bg-orange-600 transition shadow-md text-lg"
            >
              ➕ Add Dish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddDishes;
