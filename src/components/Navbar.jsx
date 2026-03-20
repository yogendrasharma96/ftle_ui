import { useState, useEffect } from "react";
import { FiSun, FiMoon, FiLogOut, FiUser, FiMenu, FiX } from "react-icons/fi";
import { NavLink, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { logout } from "../slice/authSlice";

export default function Navbar({ onAuthOpen, isDark, toggleTheme }) {
    const { user, role, isAuthenticated } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const location = useLocation();

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Automatically close sidebar when navigation occurs
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

    const handleLogout = async () => {
        await signOut(auth);
        dispatch(logout());
        setIsMenuOpen(false);
    };

    const navLinks = [
        { name: "Dashboard", path: "/dashboard", roles: [null, "USER", "ADMIN"] },
        { name: "All Trades", path: "/trades", roles: [null, "USER", "ADMIN"] },
        { name: "Add Trade", path: "/trade/new", roles: ["ADMIN"] },
        { name: "Authors' View", path: "/admin/view", roles: ["ADMIN"] }
    ];

    return (
        <>
            {/* Main Navigation Bar */}
            <nav className="sticky top-0 z-50 h-16 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
                <div className="mx-auto h-full flex items-center justify-between px-4 lg:px-8">

                    {/* Left: Logo */}
                    <div className="flex items-center gap-8">
                        <NavLink to="/" className="flex items-center gap-3 group">
                            <div className="p-1.5 rounded-xl bg-blue-600/10 group-hover:bg-blue-600/20 transition-colors">
                                <img src="/asset/Logo.png" alt="logo" className="h-7 w-7 object-contain" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Fund<span className="text-blue-600 dark:text-blue-400">Tracker</span>
                            </span>
                        </NavLink>

                        {/* Desktop Links */}
                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => (
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

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90"
                        >
                            {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
                        </button>

                        <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

                        {/* Desktop Auth */}
                        <div className="hidden md:flex items-center gap-3">
                            {isAuthenticated ? (
                                <>
                                    <div className="flex flex-col items-end leading-tight">
                                        <span className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[120px]">
                                            {user.name || user.email?.split('@')[0]}
                                        </span>
                                        <span className="text-[10px] uppercase tracking-wider font-bold text-blue-600 dark:text-blue-400">
                                            {role}
                                        </span>
                                    </div>
                                    {user.photo ? (
                                        <img src={user.photo} className="h-9 w-9 rounded-full ring-2 ring-slate-100 dark:ring-slate-800 object-cover" alt="profile" />
                                    ) : (
                                        <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                            <FiUser size={18} />
                                        </div>
                                    )}
                                    <button onClick={handleLogout} className="p-2.5 text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors">
                                        <FiLogOut size={20} />
                                    </button>
                                </>
                            ) : (
                                <button onClick={onAuthOpen} className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/20">
                                    Sign in
                                </button>
                            )}
                        </div>

                        {/* Hamburger Button */}
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="md:hidden p-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <FiMenu size={24} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Sidebar Overlay */}
            <div
                className={`fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
                    }`}
                onClick={() => setIsMenuOpen(false)}
            />

            {/* Mobile Sidebar Menu */}
            <div
                className={`fixed top-0 right-0 h-screen w-72 z-70 bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${isMenuOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Sidebar Header with Close Button */}
                    <div className="h-16 flex items-center justify-end px-6 border-b border-slate-100 dark:border-slate-800">
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                        >
                            <FiX size={24} />
                        </button>
                    </div>

                    {/* Sidebar Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {/* Profile Section */}
                        {isAuthenticated && (
                            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                                {user.photo ? (
                                    <img src={user.photo} className="h-12 w-12 rounded-full ring-4 ring-blue-600/10" alt="profile" />
                                ) : (
                                    <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                        <FiUser size={24} />
                                    </div>
                                )}
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        {user.name || "Trader"}
                                    </span>
                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                                        {role}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Navigation Links */}
                        <div className="flex flex-col gap-2">
                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-2">
                                Navigation
                            </p>
                            {navLinks.map((link) => (
                                link.roles.includes(role) && (
                                    <NavLink
                                        key={link.name}
                                        to={link.path}
                                        className={({ isActive }) =>
                                            `flex items-center px-4 py-3 rounded-xl text-base font-bold transition-all ${isActive
                                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                                            }`
                                        }
                                    >
                                        {link.name}
                                    </NavLink>
                                )
                            ))}
                        </div>

                        {/* Bottom Action */}
                        <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800">
                            {isAuthenticated ? (
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 font-bold hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all"
                                >
                                    <FiLogOut size={20} />
                                    Sign Out
                                </button>
                            ) : (
                                <button
                                    onClick={() => { onAuthOpen(); setIsMenuOpen(false); }}
                                    className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20 transition-all"
                                >
                                    Sign In
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}