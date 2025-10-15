import React, { useState, useEffect } from "react";
import { Country, State, City } from "country-state-city";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

function RestaurantFilterModal({ isOpen, onClose, onApply }) {
    const [selectedCountry, setSelectedCountry] = useState("");
    const [selectedState, setSelectedState] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [foodType, setFoodType] = useState("");
    const [hygieneStatus, setHygieneStatus] = useState("");
    const [status, setStatus] = useState("");

    // Reset when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSelectedCountry("");
            setSelectedState("");
            setSelectedCity("");
            setFoodType("");
            setHygieneStatus("");
            setStatus("");
        }
    }, [isOpen]);

    const handleApply = () => {
        onApply({
            country: selectedCountry,
            state: selectedState,
            city: selectedCity,
            food_type: foodType,
            hygiene_status: hygieneStatus,
            status,
        });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 relative"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-700">
                                Filter Restaurants
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-red-500"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* Country */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-600 mb-1">Country</label>
                            <select
                                value={selectedCountry}
                                onChange={(e) => {
                                    setSelectedCountry(e.target.value);
                                    setSelectedState("");
                                    setSelectedCity("");
                                }}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none"
                            >
                                <option value="">Select Country</option>
                                {Country.getAllCountries().map((c) => (
                                    <option key={c.isoCode} value={c.name}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* State */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-600 mb-1">State</label>
                            <select
                                value={selectedState}
                                onChange={(e) => {
                                    setSelectedState(e.target.value);
                                    setSelectedCity("");
                                }}
                                disabled={!selectedCountry}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none disabled:opacity-50"
                            >
                                <option value="">Select State</option>
                                {selectedCountry &&
                                    State.getStatesOfCountry(
                                        Country.getAllCountries().find(
                                            (c) => c.name === selectedCountry
                                        )?.isoCode
                                    ).map((s) => (
                                        <option key={s.isoCode} value={s.name}>
                                            {s.name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {/* City */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-600 mb-1">City</label>
                            <select
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                                disabled={!selectedState}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none disabled:opacity-50"
                            >
                                <option value="">Select City</option>
                                {selectedState &&
                                    City.getCitiesOfState(
                                        Country.getAllCountries().find(
                                            (c) => c.name === selectedCountry
                                        )?.isoCode,
                                        State.getStatesOfCountry(
                                            Country.getAllCountries().find(
                                                (c) => c.name === selectedCountry
                                            )?.isoCode
                                        ).find((s) => s.name === selectedState)?.isoCode
                                    ).map((city) => (
                                        <option key={city.name} value={city.name}>
                                            {city.name}
                                        </option>
                                    ))}
                            </select>
                        </div>
                        {/* 
            
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">
                Hygiene Status
              </label>
              <select
                value={hygieneStatus}
                onChange={(e) => setHygieneStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none"
              >
                <option value="">Select</option>
                <option value="hygiene">Hygiene</option>
                <option value="general">General</option>
              </select>
            </div> */}

                        {/* Status */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-600 mb-1">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#F9832B] outline-none"
                            >
                                <option value="">Select</option>
                                <option value="active">Active</option>
                                <option value="suspended">Suspended</option>
                                <option value="banned">Banned</option>
                            </select>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApply}
                                className="px-4 py-2 rounded-lg bg-[#F9832B] text-white hover:bg-[#e67600] cursor-pointer"
                            >
                                Apply Filter
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default RestaurantFilterModal;
