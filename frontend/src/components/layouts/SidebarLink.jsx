import { Link, useLocation } from "react-router-dom";

const SidebarLink = ({ Icon, text, to }) => {
  const location = useLocation();
  let isActive = false;
  if (location.pathname === "/admin") {
    isActive = location.pathname === to;
  } else {
    console.log(location.pathname);
    isActive = location.pathname.startsWith(to) && to != "/admin";
  }

  return (
    <Link
      to={to}
      className={`flex items-center justify-center p-4 ${
        isActive ? "bg-[#222831] text-white" : ""
      }`}
    >
      <div className="grid grid-cols-[25%_75%] items-center w-full gap-4">
        <div className="flex justify-end">
          <Icon size={19} />
        </div>
        <p className="text-start">{text}</p>
      </div>
    </Link>
  );
};

export default SidebarLink;
