import React, { useState } from "react";

function AddDishes() {
  const [ingredients, setIngredients] = useState([""]);
  const [images, setImages] = useState([]);

  // Add ingredient field
  const addIngredient = () => setIngredients([...ingredients, ""]);

  // Update ingredient field
  const updateIngredient = (value, index) => {
    const updated = [...ingredients];
    updated[index] = value;
    setIngredients(updated);
  };

  // Remove ingredient field
  const removeIngredient = (index) => {
    const updated = ingredients.filter((_, i) => i !== index);
    setIngredients(updated);
  };

  // Handle file upload
  const handleFileChange = (e) => {
    setImages([...e.target.files]);
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted ✅", { ingredients, images });
  };

  return (
    <div className="main main_page min-h-screen bg-gray-50 py-10 px-6 lg:px-20 duration-900">
      <div className=" bg-white shadow-lg rounded-2xl p-10">
        <h2 className="text-4xl font-bold text-orange-500 mb-10 text-center">
          🍴 Add New Dish
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Dish Name */}
          <div>
            <label className="block text-gray-600 font-medium mb-2">
              Dish Name
            </label>
            <input
              type="text"
              name="dish_name"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
              placeholder="Enter dish name"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-gray-600 font-medium mb-2">
              Price
            </label>
            <input
              type="number"
              name="price"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
              placeholder="Enter price"
              required
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-gray-600 font-medium mb-2">
              Description
            </label>
            <textarea
              name="description"
              rows="4"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 transition resize-none"
              placeholder="Enter dish description"
            ></textarea>
          </div>

          {/* Cuisine */}
          <div>
            <label className="block text-gray-600 font-medium mb-2">
              Cuisine
            </label>
            <select
              name="cuisine"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 transition bg-white"
            >
              <option value="">Select Cuisine</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-gray-600 font-medium mb-2">
              Category
            </label>
            <select
              name="category"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 transition bg-white"
            >
              <option value="">Select Category</option>
            </select>
          </div>

          {/* Sub Category */}
          <div>
            <label className="block text-gray-600 font-medium mb-2">
              Sub Category
            </label>
            <select
              name="subCategory"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 transition bg-white"
            >
              <option value="">Select Sub Category</option>
            </select>
          </div>

          {/* Dish Type */}
          <div>
            <label className="block text-gray-600 font-medium mb-2">Type</label>
            <select
              name="type"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 transition bg-white"
            >
              <option value="">Select Type</option>
            </select>
          </div>

          {/* Ingredients */}
          <div className="md:col-span-2">
            <label className="block text-gray-600 mb-2 font-medium">
              Ingredients
            </label>

            <div className="flex flex-wrap gap-3">
              {ingredients.map((ing, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                >
                  <input
                    type="text"
                    value={ing}
                    onChange={(e) => updateIngredient(e.target.value, index)}
                    className="w-28 sm:w-40 border-none bg-transparent focus:outline-none focus:ring-0"
                    placeholder={`Ingredient ${index + 1}`}
                  />
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="text-red-500 hover:text-red-700"
                      title="Remove"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addIngredient}
              className="mt-4 px-4 py-2 rounded-lg bg-orange-100 text-orange-600 hover:bg-orange-200 transition text-sm font-medium"
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
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
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
