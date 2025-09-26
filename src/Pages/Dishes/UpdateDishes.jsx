import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageTittle from "../../components/PageTitle/PageTitle";
import Select from "react-select";
import { toast } from "react-toastify";
import axios from "axios";
import { BASE_URL, IMAGE_URL } from "../../config/Config";
import BreadcrumbsNav from "../../components/common/BreadcrumbsNav/BreadcrumbsNav";

function UpdateDishes() {
  const { id } = useParams(); // dish ID from URL
  const navigate = useNavigate();

  // Form states
  const [dishData, setDishData] = useState(null);

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
  const [loading, setLoading] = useState(true);
  const token = JSON.parse(localStorage.getItem("trofi_user"))?.token;
  if (!token) return toast.error("Please login first");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Fetch initial dropdowns and dish data
  useEffect(() => {
    // Fetch restaurants
    axios
      .get(`${BASE_URL}/restro/get-restaurant-list`, config)
      .then((res) => setRestaurants(res.data?.data || []))
      .catch((err) => console.error(err));

    // Fetch categories, subcategories, types, cuisines
    axios
      .get(`${BASE_URL}/restro/get-dish-category`)
      .then((res) => setDishCategories(res.data?.data || []));
    axios
      .get(`${BASE_URL}/restro/get-dish-sub-category`)
      .then((res) => setDishSubCategories(res.data?.data || []));
    axios
      .get(`${BASE_URL}/restro/get-dish-type`)
      .then((res) => setDishTypes(res.data?.data || []));
    axios
      .get(`${BASE_URL}/restro/get-cusine`)
      .then((res) => setCuisines(res.data?.data || []));

    // Fetch the dish by ID
    axios
      .get(`${BASE_URL}/dishes/get-admin-dish-by-id/${id}`)
      .then((res) => {
        if (res.data.success) {
          const d = res.data.data;
          setDishData(d);
          setSelectedRestaurant({
            value: d.restaurantId._id,
            label: d.restaurantId.restro_name,
          });
          setSelectedDishCategory({
            value: d.dish_category._id,
            label: d.dish_category.category_name,
          });
          setSelectedDishSubCategory({
            value: d.dish_sub_category._id,
            label: d.dish_sub_category.sub_categ_name,
          });
          setSelectedDishType({
            value: d.dish_type._id,
            label: d.dish_type.name,
          });
          setSelectedCuisine({
            value: d.cuisines._id,
            label: d.cuisines.name,
          });
          setIngredients(
            d.dish_ingredients.map((ing) => ({
              name: ing.name,
              icon: ing.icon ? { url: `${IMAGE_URL}/${ing.icon}` } : null,
            }))
          );
          setImages(
            d.dish_images.map((img) => ({ url: `${IMAGE_URL}/${img}` }))
          );
        }
      })
      .catch((err) => console.error(err));
  }, [id]);

  const filteredSubCategories = dishSubCategories.filter(
    (sc) => sc.parentCategoryId === selectedDishCategory?.value
  );

  const addIngredient = () => {
    if (ingredient.trim() !== "") {
      setIngredients([
        ...ingredients,
        { name: ingredient, icon: ingredientIcon },
      ]);
      setIngredient("");
      setIngredientIcon(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("restaurantId", selectedRestaurant?.value);
    formData.append("dish_category", selectedDishCategory?.value);
    formData.append("dish_sub_category", selectedDishSubCategory?.value);
    formData.append("dish_type", selectedDishType?.value);
    formData.append("cuisines[0]", selectedCuisine?.value);
    formData.append("dish_name", e.target.dish_name.value);
    formData.append("price", e.target.price.value);
    formData.append("description", e.target.description.value);
    formData.append("isAvailable", e.target.isAvailable.checked);

    // Dish images (file uploads)
    images.forEach((img) => {
      if (img instanceof File) formData.append("dish_images", img);
    });

    // Ingredients
    const ingredientsData = ingredients.map((ing) => ({ name: ing.name }));
    formData.append("dish_ingredients", JSON.stringify(ingredientsData));

    // Ingredient icons
    ingredients.forEach((ing) => {
      if (ing.icon) formData.append("ingredient_icons", ing.icon);
    });

    axios
      .patch(`${BASE_URL}/dishes/update-dish/${id}`, formData, config)
      .then(() => {
        toast.success("Dish updated successfully!");
        navigate("/DishesList");
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to update dish. Please try again.");
      });
  };

  if (!dishData) return <div>Loading...</div>;

  return (
    <div className="main main_page min-h-screen py-10 px-6 lg:px-20 duration-900">
      <BreadcrumbsNav
        customTrail={[
          { label: "Dishes List", path: "/DishesList" },
          { label: "Update Dish", path: `/UpdateDishes/${id}` },
        ]}
      />
      <div className="bg-white shadow-lg rounded-2xl p-10">
        <PageTittle title={"Update Dish"} />
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
              defaultValue={dishData.dish_name}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none"
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
              defaultValue={dishData.price}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-600 font-medium mb-2">
              Description
            </label>
            <textarea
              name="description"
              defaultValue={dishData.description}
              rows="4"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none resize-none"
            ></textarea>
          </div>

          {/* Dropdowns: Restaurant, Category, SubCategory, Type, Cuisine */}
          <div>
            <label className="block text-gray-600  font-medium mb-2">
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
                setSelectedDishSubCategory(null);
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
              isDisabled={!selectedDishCategory}
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-2">Type</label>
            <Select
              options={dishTypes.map((dt) => ({
                value: dt._id,
                label: dt.name,
              }))}
              value={selectedDishType}
              onChange={setSelectedDishType}
              placeholder="Select Type"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-2">
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
            />
          </div>

          {/* Ingredients */}
          <div className="md:col-span-2">
            <label className="block text-gray-600 mb-2 font-medium">
              Ingredients
            </label>

            {/* Add ingredient form */}
            <div className="flex flex-wrap items-center gap-3">
  {/* Ingredient Name Input */}
  <input
    type="text"
    value={ingredient}
    onChange={(e) => setIngredient(e.target.value)}
    className="flex-1 border border-gray-200 rounded-lg focus:outline-none px-4 py-1 mb-2"
    placeholder="Enter ingredient name"
  />

  {/* Hidden File Input */}
  <input
    id="ingredientIcon"
    type="file"
    accept="image/*"
    onChange={(e) => setIngredientIcon(e.target.files[0])}
    className="hidden"
  />

  {/* Choose Icon Button */}
  <button
    type="button"
    onClick={() => document.getElementById("ingredientIcon").click()}
    className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition text-sm"
  >
    Choose Icon
  </button>

  {/* Preview Icon */}
  {ingredientIcon && (
    <img
      src={URL.createObjectURL(ingredientIcon)}
      alt="Preview"
      className="w-8 h-8 rounded-full object-cover border"
    />
  )}

  {/* Add Button */}
  <button
    type="button"
    onClick={addIngredient}
    className="px-4 py-2 rounded-lg bg-orange-500 text-white cursor-pointer hover:bg-orange-600 transition"
  >
    Add
  </button>
</div>


            {/* Ingredient chips */}
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ing, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-2 rounded-full"
                >
                  {ing.icon && (
                    <img
                      src={
                        ing.icon.url ||
                        (ing.icon instanceof File
                          ? URL.createObjectURL(ing.icon)
                          : "/placeholder.svg")
                      }
                      alt={ing.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  )}
                  <span>{ing.name}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setIngredients(ingredients.filter((_, i) => i !== idx))
                    }
                    className="text-red-500 cursor-pointer"
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
              onChange={(e) =>
                setImages([...images, ...Array.from(e.target.files)])
              }
              className="hidden"
              id="dishImage"
            />
            <button
              type="button"
              onClick={() => document.getElementById("dishImage").click()}
              className="px-4 py-2 bg-[#F9832B] text-white cursor-pointer rounded-lg"
            >
              Choose Images
            </button>
            <div className="flex flex-wrap gap-4 mt-4">
              {images.map((img, index) => (
                <div
                  key={index}
                  className="relative w-28 rounded-lg border shadow bg-white p-2 flex flex-col items-center"
                >
                  <p className="text-xs text-gray-600 mb-2 truncate w-full">
                    {img.name || `Image ${index + 1}`}
                  </p>
                  <img
                    src={
                      img.url ||
                      (img instanceof File
                        ? URL.createObjectURL(img)
                        : "/placeholder.svg")
                    }
                    alt={`preview-${index}`}
                    className="w-20 h-20 object-cover rounded-md border"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setImages(images.filter((_, i) => i !== index))
                    }
                    className="absolute -top-2 -right-2 w-6 h-6 flex justify-center items-center bg-red-500 text-white rounded-full text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="flex items-center gap-2 md:col-span-2">
            <input
              type="checkbox"
              name="isAvailable"
              id="isAvailable"
              defaultChecked={dishData.isAvailable}
              className="h-5 w-5 appearance-none rounded-md border border-gray-300 checked:bg-orange-500 checked:before:content-['✔'] checked:before:text-white checked:before:block checked:before:text-center"
            />
            <label htmlFor="isAvailable" className="text-gray-600 font-medium">
              Available
            </label>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-3 rounded-xl  font-semibold hover:bg-orange-600 transition shadow-md cursor-pointer text-lg"
            >
              Update Dish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateDishes;
