import { useState } from "react";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";

const Pagination = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  type = "frontend", // "frontend" | "backend"
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const [jumpPage, setJumpPage] = useState("");

  const PaginationButton = ({ onClick, icon, label, active }) => (
    <div
      onClick={onClick}
      className={`flex justify-center items-center w-[30px] h-[30px] rounded cursor-pointer transition transform 
  shadow-md active:scale-95
  ${
    active
      ? "bg-[#F9832B] text-white"
      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
  }`}
    >
      {icon || label}
    </div>
  );

  const getPaginationRange = () => {
    if (totalPages <= 3) return [...Array(totalPages)].map((_, i) => i + 1);
    if (currentPage === 1) return [1, 2, 3];
    if (currentPage === totalPages)
      return [totalPages - 2, totalPages - 1, totalPages];
    return [currentPage - 1, currentPage, currentPage + 1];
  };

  const handleJump = () => {
    const page = Number(jumpPage);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      setJumpPage("");
    }
  };

  return (
    <div className="flex items-center justify-end gap-2 mt-4 text-sm px-4">
      {/* Previous Button */}
      <PaginationButton
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        icon={<FaCaretLeft />}
      />

      {/* Page Buttons */}
      {getPaginationRange().map((page) => (
        <PaginationButton
          key={page}
          onClick={() => onPageChange(page)}
          label={page}
          active={currentPage === page}
        />
      ))}

      {/* Next Button */}
      <PaginationButton
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        icon={<FaCaretRight />}
      />

      {/* Direct Jump Input */}
      <div className="flex items-center gap-1">
        <input
          type="number"
          placeholder="Page"
          value={jumpPage}
          onChange={(e) => setJumpPage(e.target.value)}
          className="w-[50px] text-center font-serif border border-gray-300 rounded py-1.5 text-sm outline-none shadow-sm"
        />
        <button
          onClick={handleJump}
          className="bg-[#F9832B] hover:bg-[#e67220] text-white font-bold px-4 py-2 rounded text-xs shadow-md active:scale-95 transition transform cursor-pointer"
        >
          Go
        </button>
      </div>
    </div>
  );
};

export default Pagination;
