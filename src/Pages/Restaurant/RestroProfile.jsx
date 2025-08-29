// @ts-nocheck
import React, { useContext } from "react";
import { Star } from "lucide-react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { LayoutContext } from "../../Layout/Layout";
import banner1 from "../../assets/images/banner1.jpg";
import banner2 from "../../assets/images/banner2.jpg";
import banner3 from "../../assets/images/banner3.jpg";
import profileImg from "../../assets/images/profileImg.jpg";
import profileImg1 from "../../assets/images/profileImg1.jpg";
import profileImg2 from "../../assets/images/profileImg2.jpg";

function RestroProfile() {
  const { isToggle, setIs_Toggle } = useContext(LayoutContext);
  // 🔹 Sample banner images
  const banners = [banner1, banner2, banner3];

  // 🔹 Sample restaurant data
  const restaurant = {
    logo: "https://via.placeholder.com/100",
    name: "Cafe Aroma",
    rating: 4.3,
    totalReviews: 128,
    menus: [
      {
        id: 1,
        image: profileImg,
        name: "Margherita Pizza",
        price: "₹250",
      },
      {
        id: 2,
        image: profileImg1,
        name: "Pasta Alfredo",
        price: "₹300",
      },
      {
        id: 3,
        image: profileImg2,
        name: "Chocolate Cake",
        price: "₹150",
      },
    ],
  };

  return (
    <div
      className={`w-[100%] pt-[1.5rem]  pb-[1rem] ${
        isToggle ? "pl-[19.3rem]" : ""
      } duration-900 min-h-screen bg-gray-50`}
    >
      {/* 🔹 Banner Carousel */}
      <div className="relative w-full h-100">
        <Carousel
          autoPlay
          infiniteLoop
          showThumbs={false}
          showStatus={false}
          interval={4000}
        >
          {banners.map((banner, i) => (
            <div key={i} className="relative">
              <img
                src={banner}
                alt={`Banner-${i}`}
                className="w-full h-100 object-cover"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/20 bg-opacity-30 z-0"></div>
            </div>
          ))}
        </Carousel>

        {/* Logo & Name (always on top of carousel) */}
        <div className="absolute bottom-4 left-6 flex items-center gap-4 z-10">
          <img
            src={restaurant.logo}
            alt="Logo"
            className="w-20 h-20 rounded-full border-4 border-white shadow-md"
          />
          <div className="text-white">
            <h1 className="text-2xl font-bold">{restaurant.name}</h1>
            <div className="flex items-center gap-1">
              <Star className="text-yellow-400 w-5 h-5 fill-yellow-400" />
              <span className="font-medium">{restaurant.rating}</span>
              <span className="text-gray-200">
                ({restaurant.totalReviews} reviews)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 Menu Section */}
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Our Menu</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {restaurant.menus.map((menu) => (
            <div
              key={menu.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-3"
            >
              <img
                src={menu.image}
                alt={menu.name}
                className="w-full h-40 object-cover rounded-lg"
              />
              <div className="mt-3">
                <h3 className="text-lg font-semibold text-gray-700">
                  {menu.name}
                </h3>
                <p className="text-[#F9832B] font-bold">{menu.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RestroProfile;
