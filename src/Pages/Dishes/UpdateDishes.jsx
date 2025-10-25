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

  const [restaurantId, setRestaurantId] = useState(null);

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

  // -------------------------
  // Fetch restaurants and dish data
  // -------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1️⃣ Fetch restaurants
        const resRest = await axios.get(`${BASE_URL}/restro/get-restaurant-dropdown`, config);
        const restaurantsData = resRest.data?.data || [];
        setRestaurants(restaurantsData);

        // 2️⃣ Fetch the dish
        const resDish = await axios.get(`${BASE_URL}/dishes/get-admin-dish-by-id/${id}`, config);
        if (resDish.data.success) {
          const d = resDish.data.data;
          setDishData(d);
          setRestaurantId(d.restaurantId?._id);
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
          setImages(d.dish_images.map((img) => ({ url: `${IMAGE_URL}/${img}` })));
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const authData = JSON.parse(localStorage.getItem("trofi_user"));
        const token = authData?.token;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Categories
        const catRes = await axios.get(`${BASE_URL}/restro/get-dish-category`, { headers });
        setDishCategories(catRes.data?.data || []);

        // SubCategories
        const subCatRes = await axios.get(`${BASE_URL}/restro/get-dish-sub-category`, { headers });
        setDishSubCategories(subCatRes.data?.data || []);

        // Cuisines
        const cusRes = await axios.get(`${BASE_URL}/restro/get-cusine`, { headers });
        setCuisines(cusRes.data?.data || []);
      } catch (err) {
        console.error("Dropdown fetch error:", err);
        toast.error("Failed to load dropdowns.");
      }
    };

    fetchDropdownData();
  }, []);


  // -------------------------
  // Set dish types after both dishData and restaurants are loaded
  // -------------------------
  useEffect(() => {
    if (dishData && restaurants.length > 0) {
      const selectedRestro = restaurants.find(
        (r) => r._id === dishData.restaurantId._id
      );
      if (selectedRestro) {
        const types = selectedRestro.dish_types.map((dt) => ({
          value: dt._id,
          label: dt.name,
        }));
        setDishTypes(types);

        setSelectedDishType({
          value: dishData.dish_type._id,
          label: dishData.dish_type.name,
        });
      }
    }
  }, [dishData, restaurants]);



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

  const handleAvailabilityToggle = (e) => {
    const checked = e.target.checked;

    // Only validate when making it available
    if (checked) {
      const validDishType = dishTypes.some(
        (dt) => dt.value === selectedDishType?.value
      );

      if (!validDishType) {
        e.preventDefault(); // Stop the checkbox change
        toast.error("Current dish type is no longer available for this restaurant. Please select a valid type before activating the dish.");
        return;
      }
    }
  };


  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   const formData = new FormData();

  //   formData.append("restaurantId", selectedRestaurant?.value);
  //   formData.append("dish_category", selectedDishCategory?.value);
  //   formData.append("dish_sub_category", selectedDishSubCategory?.value);
  //   formData.append("dish_type", selectedDishType?.value);
  //   formData.append("cuisines[0]", selectedCuisine?.value);
  //   formData.append("dish_name", e.target.dish_name.value);
  //   formData.append("price", e.target.price.value);
  //   formData.append("description", e.target.description.value);
  //   formData.append("isAvailable", e.target.isAvailable.checked);

  //   // ✅ Dish images (old + new)
  //   images.forEach((img) => {
  //     if (img instanceof File) {
  //       formData.append("dish_images", img); // new uploads
  //     } else if (img.url) {
  //       formData.append("existing_dish_images", img.url.replace(IMAGE_URL + "/", "")); // keep old ones
  //     }
  //   });

  //   const ingredientsData = ingredients.map((ing) => {
  //     if (ing.icon instanceof File) {
  //       // new upload — backend will get via ingredient_icons[]
  //       return { name: ing.name, icon: "" };
  //     } else if (ing.icon?.url) {
  //       // existing icon — keep its relative path
  //       return { name: ing.name, icon: ing.icon.url.replace(IMAGE_URL + "/", "") };
  //     } else {
  //       return { name: ing.name, icon: "" };
  //     }
  //   });



  //   formData.append("dish_ingredients", JSON.stringify(ingredientsData));

  //   ingredients.forEach((ing) => {
  //     if (ing.icon instanceof File) {
  //       formData.append("ingredient_icons", ing.icon);
  //     } else {
  //       formData.append("ingredient_icons", "");
  //     }
  //   });



  //   axios
  //     .patch(`${BASE_URL}/dishes/update-dish/${id}`, formData, config)
  //     .then(() => {
  //       toast.success("Dish updated successfully!");
  //       navigate(`/DishesList/${restaurantId}`);
  //     })
  //     .catch((err) => {
  //       console.error(err);
  //       toast.error("Failed to update dish. Please try again.");
  //     });
  // };
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

    // ✅ Dish images (old + new)
    images.forEach((img) => {
      if (img instanceof File) {
        formData.append("dish_images", img); // new uploads
      } else if (img.url) {
        formData.append("existing_dish_images", img.url.replace(IMAGE_URL + "/", "")); // keep old ones
      }
    });

    // ✅ Prepare ingredients data with proper icon handling
    const ingredientsData = ingredients.map((ing) => {
      if (ing.icon instanceof File) {
        // New upload - backend will fill this from ingredient_icons array
        return { name: ing.name, icon: "" };
      } else if (ing.icon?.url) {
        // Existing icon - keep its path
        return { name: ing.name, icon: ing.icon.url.replace(IMAGE_URL + "/", "") };
      } else {
        // No icon
        return { name: ing.name, icon: "" };
      }
    });

    formData.append("dish_ingredients", JSON.stringify(ingredientsData));

    // ✅ ONLY append actual File objects (no empty strings!)
    ingredients.forEach((ing) => {
      if (ing.icon instanceof File) {
        formData.append("ingredient_icons", ing.icon);
      }
    });

    axios
      .patch(`${BASE_URL}/dishes/update-dish/${id}`, formData, config)
      .then(() => {
        toast.success("Dish updated successfully!");
        navigate(`/DishesList/${restaurantId}`);
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
          { label: "Restaurant List", path: "/RestroList" },
          {
            label: "Dishes List",
            path: restaurantId ? `/DishesList/${restaurantId}` : "#",
          },
          { label: "Update Dish", path: `/UpdateDishes/:id` },
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
              isDisabled
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
              options={dishTypes}
              value={selectedDishType}
              onChange={setSelectedDishType}
              placeholder="Select Type"
              styles={{
                menu: (provided) => ({ ...provided, zIndex: 9999 }),
                singleValue: (provided) => ({ ...provided, color: "#000" }),
              }}
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
              onChange={handleAvailabilityToggle}
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
