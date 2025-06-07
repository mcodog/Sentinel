import { ArrowRight } from "lucide-react";

export default function UserTypeCard({
  selected,
  onClick,
  icon,
  title,
  description,
  color,
  selectedColor,
  hoverColor,
}) {
  return (
    <div
      className={`group cursor-pointer p-8 rounded-2xl border-2 transition-all duration-300 ${
        selected
          ? `border-${selectedColor}-500 bg-${selectedColor}-50 shadow-lg`
          : `border-gray-200 bg-white hover:border-${hoverColor}-300 hover:shadow-md`
      }`}
      onClick={onClick}
    >
      <div className="text-center">
        <div
          className={`w-16 h-16 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
        >
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <div
          className={`flex items-center justify-center text-${color}-600 font-medium`}
        >
          {selected ? "Continue" : "Login to Continue"} <ArrowRight />
        </div>
      </div>
    </div>
  );
}
