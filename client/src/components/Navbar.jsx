import { Link, useLocation, useNavigate } from "react-router-dom";
import { HiOutlineBookOpen } from "react-icons/hi";
import { HiOutlineArrowRightOnRectangle, HiOutlineHome, HiOutlineGlobeAlt, HiOutlineRectangleStack } from "react-icons/hi2";
import useAuthStore from "../store/authStore";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-primary-700 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <HiOutlineBookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold font-serif text-surface-800">
              BookAudio
            </span>
          </Link>

          {/* Center Nav — Glassmorphism Pill */}
          <div className="hidden sm:flex items-center gap-1 px-2 py-1.5 rounded-full bg-white/70 backdrop-blur-xl border border-surface-300/50 shadow-sm">
            <Link
              to="/"
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive("/")
                ? "bg-primary-700 text-white shadow-sm"
                : "text-surface-600 hover:text-surface-800 hover:bg-surface-200/50"
                }`}
            >
              Home
            </Link>
            <a
              href="/#explore"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 text-surface-600 hover:text-surface-800 hover:bg-surface-200/50"
            >
              Explore
            </a>
            {user && (
              <Link
                to="/dashboard"
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive("/dashboard")
                  ? "bg-primary-700 text-white shadow-sm"
                  : "text-surface-600 hover:text-surface-800 hover:bg-surface-200/50"
                  }`}
              >
                My Books
              </Link>
            )}
          </div>

          {/* Right: Auth */}
          <div className="flex items-center gap-2">
            {/* Mobile Nav Links */}
            <div className="flex sm:hidden items-center gap-1">
              <Link
                to="/"
                className={`p-2 rounded-xl transition-colors ${isActive("/") ? "text-primary-700 bg-primary-100" : "text-surface-500"}`}
              >
                <HiOutlineHome className="w-5 h-5" />
              </Link>
              <a
                href="/#explore"
                className={`p-2 rounded-xl transition-colors text-surface-500`}
              >
                <HiOutlineGlobeAlt className="w-5 h-5" />
              </a>
              {user && (
                <Link
                  to="/dashboard"
                  className={`p-2 rounded-xl transition-colors ${isActive("/dashboard") ? "text-primary-700 bg-primary-100" : "text-surface-500"}`}
                >
                  <HiOutlineRectangleStack className="w-5 h-5" />
                </Link>
              )}
            </div>

            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-xl border border-surface-300/50 hover:bg-white transition-all shadow-sm">
                  <div className="w-7 h-7 rounded-full bg-primary-700 flex items-center justify-center text-white text-xs font-bold">
                    {user.email?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="hidden sm:inline text-surface-600 max-w-[120px] truncate text-xs">
                    {user.email}
                  </span>
                </button>
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-56 py-2 bg-white/95 backdrop-blur-xl border border-surface-300/50 rounded-xl shadow-lg shadow-surface-900/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="px-4 py-2 border-b border-surface-200">
                    <p className="text-xs text-surface-500">Signed in as</p>
                    <p className="text-sm text-surface-800 truncate mt-0.5">{user.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2.5 mt-1 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/auth"
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-primary-700 text-white text-sm font-medium hover:bg-primary-600 transition-all shadow-sm"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
