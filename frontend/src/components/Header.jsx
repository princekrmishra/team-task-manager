import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/dashboard" className="text-lg font-semibold text-gray-900">
          Team Task Manager
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
