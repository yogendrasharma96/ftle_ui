import { FiSun, FiMoon, FiLogOut, FiUser } from "react-icons/fi";
import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { logout } from "../slice/authSlice";

export default function Navbar({ onAuthOpen, isDark, toggleTheme }) {
    const { user, role, isAuthenticated } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const handleLogout = async () => {
        await signOut(auth);
        dispatch(logout());
    };

    return (
        <nav className="sticky top-0 z-50 h-16 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
            <div className=" mx-auto h-full flex items-center justify-between px-6 lg:px-8">

                {/* Left: Logo Section */}
                <div className="flex items-center gap-10">
                    <NavLink to="/" className="flex items-center gap-3 group">
                        <div className="p-1.5 rounded-xl bg-blue-600/10 group-hover:bg-blue-600/20 transition-colors">
                            <img
                                src="/asset/Logo.png"
                                alt="logo"
                                className="h-7 w-7 object-contain"
                            />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Fund
                            <span className="text-blue-600 dark:text-blue-400">Tracker</span>
                        </span>
                    </NavLink>

                    {/* Center-ish: Nav Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {[
                            { name: "Dashboard", path: "/", roles: [null, "USER", "ADMIN"] },
                            { name: "Add Trade", path: "/addtrade", roles: ["ADMIN"] }
                        ].map((link) => (
                            link.roles.includes(role) && (
                                <NavLink
                                    key={link.name}
                                    to={link.path}
                                    className={({ isActive }) =>
                                        `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                            ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                                        }`
                                    }
                                >
                                    {link.name}
                                </NavLink>
                            )
                        ))}
                    </div>
                </div>

                {/* Right: Actions & Auth Section */}
                <div className="flex items-center gap-3">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90"
                        title="Toggle Theme"
                    >
                        {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
                    </button>

                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

                    {isAuthenticated ? (
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex flex-col items-end leading-tight">
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                    {user.name || user.email?.split('@')[0]}
                                </span>
                                <span className="text-[10px] uppercase tracking-wider font-bold text-blue-600 dark:text-blue-400">
                                    {role}
                                </span>
                            </div>

                            {user.photo ? (
                                <img
                                    src={user.photo}
                                    className="h-9 w-9 rounded-full ring-2 ring-slate-100 dark:ring-slate-800 object-cover"
                                    alt="profile"
                                />
                            ) : (
                                <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                    <FiUser size={18} />
                                </div>
                            )}

                            <button
                                onClick={handleLogout}
                                className="p-2.5 text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
                                title="Logout"
                            >
                                <FiLogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={onAuthOpen}
                            className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                        >
                            Sign in
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}