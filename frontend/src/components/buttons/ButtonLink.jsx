import { Link } from "react-router-dom";
export default function ButtonLink({
  to,
  children,
  variant = "primary",
  maxWidth = false,
  onClick,
}) {
  const base =
    "px-8 py-3 font-semibold rounded-lg transition-all duration-300 transform hover:-translate-y-1";

  const styles = {
    primary:
      "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl",
    secondary:
      "border-2 border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600",
  };

  return (
    <Link
      onClick={onClick}
      to={to}
      className={`${maxWidth ? "w-full block text-center" : ""} ${base} ${
        styles[variant]
      } `}
    >
      {children}
    </Link>
  );
}
