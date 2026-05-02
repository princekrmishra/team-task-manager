import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  const initial = user.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/dashboard" className="text-lg font-semibold text-gray-900">
          Team Task Manager
        </Link>

        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700">
            {initial}
          </div>

          <span className="text-sm text-gray-600">
            {user.name}
          </span>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}