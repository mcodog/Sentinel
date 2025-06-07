import { Link } from "react-router-dom";

export default function HeroButtonLink({ to, children, variant = "solid" }) {
  const base =
    "px-8 py-4 font-bold rounded-lg transition-all duration-300 transform hover:-translate-y-1";

  const styles = {
    solid: "bg-white text-blue-600 hover:bg-gray-50 shadow-lg hover:shadow-xl",
    outline:
      "border-2 border-white text-white hover:bg-white hover:text-blue-600",
  };

  return (
    <Link to={to} className={`${base} ${styles[variant]}`}>
      {children}
    </Link>
  );
}
