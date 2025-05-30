import React from "react";
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

  const handleLogout = () => {
    dispatch(clearUser());
  };
  return (
    <div className="flex w-[1350px] justify-between bg-white">
      <div className="text-xl font-bold uppercase">Sentinel</div>
      <div className="flex gap-4">
        <div>Home</div>
        <div>About</div>
        <div>Assistant</div>

        {userRole === "doctor" && <Link to="/admin">Admin</Link>}
        {isLoggedIn ? (
          <div className="cursor-pointer" onClick={handleLogout}>
            Logout
          </div>
        ) : (
          <Link to="/login">Sign In</Link>
        )}
      </div>
    </div>
  );
};

export default Header;
