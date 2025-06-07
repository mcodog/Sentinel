import { Link, useLocation } from "react-router-dom";

const SidebarLink = ({ Icon, text, to }) => {
  const location = useLocation();
  let isActive = false;
  if (location.pathname === "/doctor") {
    isActive = location.pathname === to;
  } else {
    isActive = location.pathname.startsWith(to) && to != "/doctor";
  }

  return (
    <div className="p-2">
      <Link
        to={to}
        className={`flex items-center justify-center p-4 rounded-lg ${
          isActive
            ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
            : ""
        }`}
      >
        <div className="grid grid-cols-[15%_85%] items-center w-full gap-4">
          <div className="flex justify-end">
            <Icon size={19} />
          </div>
          <p className="text-start">{text}</p>
        </div>
      </Link>
    </div>
  );
};

export default SidebarLink;
