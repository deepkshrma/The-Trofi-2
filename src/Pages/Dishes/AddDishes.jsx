import { useState, useEffect } from "react";
import PageTittle from "../../components/PageTitle/PageTitle";
import Select from "react-select";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../config/Config";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";

function AddDishes() {
  const [ingredient, setIngredient] = useState("");
  const [ingredientIcon, setIngredientIcon] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [images, setImages] = useState([]);

  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const [dishCategories, setDishCategories] = useState([]);
  const [selectedDishCategory, setSelectedDishCategory] = useState(null);

  const [dishSubCategories, setDishSubCategories] = useState([]);
  const [selectedDishSubCategory, setSelectedDishSubCategory] = useState(null);

  const [dishTypes, setDishTypes] = useState([]);
  const [selectedDishType, setSelectedDishType] = useState(null);

  const [cuisines, setCuisines] = useState([]);
  const [selectedCuisine, setSelectedCuisine] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("trofi_user"))?.token;
    if (!token) return toast.error("Please login first");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios
      .get(`${BASE_URL}/restro/get-restaurant-list`, config)
      .then((res) => {
        console.log("Restaurant API Response:", res.data);
        setRestaurants(res.data?.data || []); // Adjust based on actual data shape
      })
      .catch((err) => console.error(err));

    axios
      .get(`${BASE_URL}/restro/get-dish-category`)
      .then((res) => setDishCategories(res.data?.data || []))
      .catch((err) => console.error(err));

    axios
      .get(`${BASE_URL}/restro/get-dish-sub-category`)
      .then((res) => setDishSubCategories(res.data?.data || []))
      .catch((err) => console.error(err));

    axios
      .get(`${BASE_URL}/restro/get-dish-type`)
      .then((res) => setDishTypes(res.data?.data || []))
      .catch((err) => console.error(err));

    axios
      .get(`${BASE_URL}/restro/get-cusine`)
      .then((res) => setCuisines(res.data?.data || []))
      .catch((err) => console.error(err));

    axios
      .get(`${BASE_URL}/dishes/get-dishes-categories`)
      .then((res) => {
        if (res.data.success) {
          setDishCategories(res.data.data.categories || []);
          setDishSubCategories(res.data.data.subCategories || []);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const filteredSubCategories = dishSubCategories.filter(
    (sc) => sc.parentCategoryId === selectedDishCategory?.value
  );

  const addIngredient = () => {
    if (ingredient.trim() !== "") {
      const newIngredient = {
        name: ingredient,
        icon: ingredientIcon,
      };
      setIngredients([...ingredients, newIngredient]);
      setIngredient("");
      setIngredientIcon(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();

    // Basic fields
    formData.append("restaurantId", selectedRestaurant?.value);
    formData.append("dish_category", selectedDishCategory?.value);
    formData.append("dish_sub_category", selectedDishSubCategory?.value);
    formData.append("dish_type", selectedDishType?.value);
    formData.append("cuisines[0]", selectedCuisine?.value); // match Postman key
    formData.append("dish_name", e.target.dish_name.value);
    formData.append("price", e.target.price.value);
    formData.append("description", e.target.description.value);
    formData.append("isAvailable", e.target.isAvailable.checked);

    // ---------- Dish images (separate) ----------
    images.forEach((img) => {
      formData.append("dish_images", img);
    });

    // ---------- Ingredients ----------
    const ingredientsData = ingredients.map((ing) => ({
      name: ing.name,
      // don’t include file object here, just name
    }));
    formData.append("dish_ingredients", JSON.stringify(ingredientsData));

    // Ingredient icons, each file appended under the same key
    ingredients.forEach((ing) => {
      if (ing.icon) {
        formData.append("ingredient_icons", ing.icon);
      }
    });

    axios
      .post(`${BASE_URL}/dishes/create-dish`, formData)
      .then(() => {
        toast.success("Dish created successfully!");
        navigate("/DishesList");
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to create dish. Please try again.");
      });
  };

  return (
    <div className="main main_page min-h-screen py-10 px-6 lg:px-20 duration-900">
      <BreadcrumbsNav
        customTrail={[{ label: "Dishes List", path: "/DishesList" }, { label: "Add New Dish", path: "/AddDishes" }]}
      />
      <div className=" bg-white shadow-lg rounded-2xl p-10">
        <PageTittle title={"Add New Dish"} />

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10"
        >
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

          <div>
            <label className="block text-gray-600 font-medium mb-2">
              Price
            </label>
            <input
              type="number"
              name="price"
              min={0}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-0 focus:ring-orange-400 transition"
              placeholder="Enter price"
              required
            />
          </div>

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

          <div>
            <label className="block text-gray-600 font-medium mb-2">
              Restaurant
            </label>
            <Select
              options={restaurants.map((r) => ({
                value: r._id,
                label: r.restro_name,
              }))}
              value={selectedRestaurant}
              onChange={setSelectedRestaurant}
              placeholder="Select Restaurant"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-2">
              Category
            </label>
            <Select
              options={dishCategories.map((c) => ({
                value: c._id,
                label: c.category_name,
              }))}
              value={selectedDishCategory}
              onChange={(cat) => {
                setSelectedDishCategory(cat);
                setSelectedDishSubCategory(null); // reset subcategory when category changes
              }}
              placeholder="Select Category"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-2">
              Sub Category
            </label>
            <Select
              options={filteredSubCategories.map((sc) => ({
                value: sc._id,
                label: sc.sub_categ_name,
              }))}
              value={selectedDishSubCategory}
              onChange={setSelectedDishSubCategory}
              placeholder="Select Sub Category"
              isDisabled={!selectedDishCategory} // disable until category selected
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-2 font-medium">Type</label>
            <Select
              options={dishTypes.map((dt) => ({
                value: dt._id,
                label: dt.name,
              }))}
              value={selectedDishType}
              onChange={setSelectedDishType}
              placeholder="Select Type"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-2 font-medium">
              Cuisine
            </label>
            <Select
              options={cuisines.map((cu) => ({
                value: cu._id,
                label: cu.name,
              }))}
              value={selectedCuisine}
              onChange={setSelectedCuisine}
              placeholder="Select Cuisine"
              className="w-full"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-600 mb-2 font-medium">
              Ingredients
            </label>

            <div className="space-y-4 mb-4">
              {/* name + icon + add in one row */}
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={ingredient}
                  onChange={(e) => setIngredient(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addIngredient();
                    }
                  }}
                  className="flex-1 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-0 focus:ring-orange-400"
                  placeholder="Enter ingredient name"
                />

                {/* icon choose button */}
                <input
                  id="ingredientIcon"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setIngredientIcon(e.target.files[0])}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById("ingredientIcon").click()}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition text-sm"
                >
                  Choose Icon
                </button>

                {/* add button */}
                <button
                  type="button"
                  onClick={addIngredient}
                  className="px-4 py-2 rounded-lg bg-orange-500 text-white cursor-pointer hover:bg-orange-600 transition"
                >
                  Add
                </button>
              </div>

              {/* icon preview (inline if you like) */}
              {ingredientIcon && (
                <div className="flex items-center gap-2 mt-2">
                  <img
                    src={URL.createObjectURL(ingredientIcon)}
                    alt="ingredient icon preview"
                    className="w-8 h-8 object-cover rounded border"
                  />
                  <span className="text-sm text-gray-600">{ingredientIcon.name}</span>
                  <button
                    type="button"
                    onClick={() => setIngredientIcon(null)}
                    className="text-red-500 hover:text-red-700 cursor-pointer text-sm"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* list of added ingredients */}
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ing, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-2 rounded-full"
                >
                  {ing.icon && (
                    <img
                      src={URL.createObjectURL(ing.icon)}
                      alt={`${ing.name} icon`}
                      className="w-5 h-5 object-cover rounded-full"
                    />
                  )}
                  <span>{ing.name}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setIngredients(ingredients.filter((_, i) => i !== index))
                    }
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>


          <div className="md:col-span-2">
            <label className="block text-gray-600 mb-2 font-medium">
              Dish Images
            </label>
            <input
              id="dishImage"
              type="file"
              multiple
              accept="image/*"
              onChange={(e) =>
                setImages((prev) => [...prev, ...Array.from(e.target.files)])
              }
              className="hidden"
            />
            <button
              type="button"
              onClick={() => document.getElementById("dishImage").click()}
              className="px-4 py-2 bg-[#F9832B] text-white rounded-lg cursor-pointer shadow hover:shadow-md"
            >
              Choose Images
            </button>

            {images.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-4">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className="relative w-28 rounded-lg border shadow bg-white p-2 flex flex-col items-center"
                  >
                    <p className="text-xs text-gray-600 mb-2 text-center truncate w-full">
                      {img.name}
                    </p>
                    <img
                      src={URL.createObjectURL(img) || "/placeholder.svg"}
                      alt={`preview-${index}`}
                      className="w-20 h-20 object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setImages(images.filter((_, i) => i !== index))
                      }
                      className="absolute -top-2 -right-2 w-6 h-6 flex justify-center cursor-pointer items-center bg-red-500 text-white rounded-full text-xs hover:bg-red-600 shadow-md"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

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

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-3 cursor-pointer rounded-xl font-semibold hover:bg-orange-600 transition shadow-md text-lg"
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
