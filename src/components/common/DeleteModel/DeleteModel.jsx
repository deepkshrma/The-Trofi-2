import React from "react";
import { IoMdClose } from "react-icons/io";
import { AiOutlineExclamationCircle } from "react-icons/ai";

function DeleteModel({ isOpen, onClose, onConfirm, redbutton, para }) {
  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/60 flex justify-center items-center z-50">
      <div className="w-[90%] max-w-md bg-white rounded-lg p-6 relative">
        {/* Close button */}
        <div className="absolute top-2 right-2">
          <button onClick={onClose}>
            <IoMdClose className="text-gray-600 text-xl hover:text-red-500" />
          </button>
        </div>

        {/* Modal content */}
        <div className="flex flex-col items-center">
          <AiOutlineExclamationCircle
            size={60}
            className="text-blue-500 mb-4"
          />
          <h2 className="text-lg font-semibold mb-2">Are you sure?</h2>
          <p className="text-sm text-gray-600 mb-6 text-center">{para}</p>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded cursor-pointer"
            >
              {redbutton}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteModel;
