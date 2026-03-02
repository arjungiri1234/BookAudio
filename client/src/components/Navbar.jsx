import { Link, useLocation } from "react-router-dom";
import { HiOutlineBookOpen, HiOutlineChat, HiOutlineHome } from "react-icons/hi";
import { HiOutlineArrowRightOnRectangle } from "react-icons/hi2";
import useAuthStore from "../store/authStore";

export default function Navbar() {
  const location = useLocation();
  const { user, signOut } = useAuthStore();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-surface-900/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center shadow-lg shadow-primary-600/20 group-hover:shadow-primary-600/40 transition-shadow">
              <HiOutlineBookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-white to-surface-200 bg-clip-text text-transparent">
              BookAudio
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            <Link
              to="/"
              className={`btn-ghost text-sm ${isActive("/") ? "text-white bg-white/5" : ""
                }`}
            >
              <HiOutlineHome className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>

            {user && (
              <Link
                to="/dashboard"
                className={`btn-ghost text-sm ${isActive("/dashboard") ? "text-white bg-white/5" : ""
                  }`}
              >
                <HiOutlineChat className="w-4 h-4" />
                <span className="hidden sm:inline">My Books</span>
              </Link>
            )}

            {user ? (
              <button onClick={signOut} className="btn-ghost text-sm text-red-400 hover:text-red-300">
                <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            ) : (
              <Link to="/auth" className="btn-primary text-sm">
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
