import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  selectIsLoggedIn,
  selectUser,
  selectUserRole,
} from "../../features/user/userSelector";
import { clearUser } from "../../features/user/userSlice";

const Header = () => {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const userRole = useSelector(selectUserRole);
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    dispatch(clearUser());
  };

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  return (
    <div className="flex w-[1350px] justify-between items-center p-3">
      <div className="text-xl font-bold uppercase">Sentinel</div>
      <div className="flex gap-4">
        <div>Home</div>
        <div>About</div>
        <div>Assistant</div>
        {userRole === "doctor" && <Link to="/admin">Admin</Link>}
      </div>

      <div className="relative">
        {isLoggedIn ? (
          <div
            className="rounded-full bg-black text-white font-bold text-xl h-10 w-10 flex items-center justify-center cursor-pointer"
            onClick={toggleDropdown}
          >
            {user.firstname.charAt(0).toUpperCase()}
          </div>
        ) : (
          <Link to="/login" className="bg-black text-white p-3 rounded-xl">
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

            <Link
              to="/session"
              className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
              onClick={() => setShowDropdown(false)}
            >
              History Sessions
            </Link>
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
