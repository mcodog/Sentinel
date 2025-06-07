import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  selectIsLoggedIn,
  selectUser,
  selectUserRole,
} from "@/features/user/userSelector";
import { clearUser } from "@/features/user/userSlice";
import { Heart } from "../Icons/Icons";
import Swal from "sweetalert2";

const Header = () => {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const userRole = useSelector(selectUserRole);
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: "You are logged out",
      text: "Redirecting to log in...",
      icon: "success",
    });
    setTimeout(() => {
      dispatch(clearUser());
      navigate("/login");
    }, 700);
  };

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  return (
    <div className="flex w-[1350px] justify-between items-center p-3">
      <div
        className="flex items-center space-x-2 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Heart className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Sentinel
        </span>
      </div>
      <div className="flex gap-4">
        <button
          onClick={() => navigate("/")}
          className="text-gray-600 cursor-pointer hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          About
        </button>
        <button
          onClick={() => navigate("/")}
          className="text-gray-600 cursor-pointer hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Security
        </button>
        <button
          onClick={() => navigate("/")}
          className="text-gray-600 cursor-pointer hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Contact
        </button>
      </div>

      <div className="relative">
        {isLoggedIn ? (
          <div
            className="rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-xl h-10 w-10 flex items-center justify-center cursor-pointer"
            onClick={toggleDropdown}
          >
            {user.firstname.charAt(0).toUpperCase()}
          </div>
        ) : (
          <Link to="/login" className=" text-blue-500 p-3 rounded-xl">
            Sign In
          </Link>
        )}

        {/* Dropdown menu */}
        {showDropdown && isLoggedIn && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
            <Link
              to="/profile"
              className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
              onClick={() => setShowDropdown(false)}
            >
              Profile
            </Link>
            {userRole === "doctor" ? (
              <Link
                to="/doctor"
                className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                onClick={() => setShowDropdown(false)}
              >
                Admin Dashboard
              </Link>
            ) : (
              <Link
                to="/session"
                className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                onClick={() => setShowDropdown(false)}
              >
                History Sessions
              </Link>
            )}

            <div
              onClick={() => {
                handleLogout();
                setShowDropdown(false);
              }}
              className="block px-4 py-2 text-red-600 hover:bg-gray-100 cursor-pointer"
            >
              Logout
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
