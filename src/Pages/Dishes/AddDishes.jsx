import React, { useState } from "react";
import PageTittle from "../../components/PageTitle/PageTitle";

function AddDishes() {
  const [ingredient, setIngredient] = useState("");
  const [ingredients, setIngredients] = useState([]);

  const [images, setImages] = useState([]);

  // Add ingredient field
  const addIngredient = () => {
    if (ingredient.trim() !== "") {
      setIngredients([...ingredients, ingredient]);
      setIngredient(""); // clear after adding
    }
  };

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
    <div className="main main_page min-h-screen py-10 px-6 lg:px-20 duration-900">
      <div className=" bg-white shadow-lg rounded-2xl p-10">
        {/* <h2 className="text-4xl font-bold text-orange-500 mb-10 text-center">
          🍴 Add New Dish
        </h2> */}
        <PageTittle title={"Add New Dish"} />

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10"
        >
          {/* Dish Name */}
          <div>
            <label className="block text-gray-600 font-medium mb-2">
              Dish Name
            </label>
            <input
              type="text"
              name="dish_name"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-0 focus:ring-orange-400 transition"
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
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-0 focus:ring-orange-400 transition"
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
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-0 focus:ring-orange-400 transition resize-none"
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
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-0 focus:ring-orange-400 transition bg-white"
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
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-0 focus:ring-orange-400 transition bg-white"
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
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-0 focus:ring-orange-400 transition bg-white"
            >
              <option value="">Select Sub Category</option>
            </select>
          </div>

          {/* Dish Type */}
          <div>
            <label className="block text-gray-600 font-medium mb-2">Type</label>
            <select
              name="type"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-0 focus:ring-orange-400 transition bg-white"
            >
              <option value="">Select Type</option>
            </select>
          </div>

          {/* Ingredients */}
          <div className="md:col-span-2">
            <label className="block text-gray-600 mb-2 font-medium">
              Ingredients
            </label>

            {/* Input + Add button */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={ingredient}
                onChange={(e) => setIngredient(e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-0 focus:ring-orange-400"
                placeholder="Enter ingredient"
              />
              <button
                type="button"
                onClick={addIngredient}
                className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition"
              >
                Add
              </button>
            </div>

            {/* Show ingredients as tags */}
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ing, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full"
                >
                  <span>{ing}</span>
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
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
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-0 focus:ring-orange-400"
            />
          </div>

          {/* Availability */}
          <div className="flex items-center gap-2 md:col-span-2">
            <input
              type="checkbox"
              name="isAvailable"
              id="isAvailable"
              className="h-5 w-5 appearance-none rounded-md border border-gray-300 checked:bg-orange-500 checked:before:content-['✔'] checked:before:text-white checked:before:block checked:before:text-center"
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
              Add Dish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddDishes;
