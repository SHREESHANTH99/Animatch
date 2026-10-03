import { useState, useEffect } from "react";
import {
  User, Menu, X, Home, Compass, BookOpen,
  Star, TrendingUp, Sparkles, MessageCircle, LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { logo } from "../../assets/animePosters.js";

export default function AniMatchNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Home", icon: Home, href: "/home" },
    { name: "Discover", icon: Compass, href: "/discover" },
    { name: "My List", icon: BookOpen, href: "/library" },
    { name: "Top Rated", icon: Star, href: "/top" },
    { name: "Trending", icon: TrendingUp, href: "/trending" },
    { name: "AI Picks", icon: Sparkles, href: "/ai-recommendations" },
    { name: "Community", icon: MessageCircle, href: "/Community" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled
        ? "bg-[#0d0d1a]/95 backdrop-blur-xl border-b border-white/[0.06] shadow-xl"
        : "bg-[#0d0d1a]/80 backdrop-blur-md border-b border-white/[0.04]"
    }`}>
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-anicrimson-600/50 shadow-lg group-hover:shadow-crimson transition-shadow duration-300">
              <img src={logo.img} alt="AniMatch logo" className="w-full h-full object-cover rounded-xl" />
            </div>
            <span className="text-xl font-black tracking-tight text-white group-hover:text-anicrimson-400 transition-colors duration-200">
              ANI<span className="text-anicrimson-500">MATCH</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.06] transition-all duration-200 text-sm font-medium"
              >
                <item.icon className="h-3.5 w-3.5" />
                <span>{item.name}</span>
              </a>
            ))}
          </div>

          {/* Profile */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/[0.06] transition-all duration-200 border border-white/[0.08]"
              >
                <div className="w-7 h-7 bg-anicrimson-500/20 border border-anicrimson-500/50 rounded-full flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-anicrimson-400" />
                </div>
                <span className="hidden lg:block text-sm font-medium pr-1">
                  {user?.username || "Profile"}
                </span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-[#13131f] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-white/[0.06]">
                    <p className="text-sm text-white font-semibold">
                      {user?.user_metadata?.full_name || user?.username || "User"}
                    </p>
                    <p className="text-xs text-anicrimson-400 mt-0.5">Premium Member</p>
                  </div>
                  <div className="py-1.5">
                    <a href="/profile" className="flex items-center px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors">
                      <User className="h-4 w-4 mr-3 text-white/40" />
                      My Profile
                    </a>
                    <a href="/library" className="flex items-center px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors">
                      <BookOpen className="h-4 w-4 mr-3 text-white/40" />
                      My Watchlist
                    </a>
                    <hr className="my-1 border-white/[0.06]" />
                    {user && (
                      <button
                        onClick={logout}
                        className="w-full flex items-center px-4 py-2.5 text-sm text-anicrimson-400 hover:text-anicrimson-300 hover:bg-anicrimson-500/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#0d0d1a]/98 backdrop-blur-xl border-t border-white/[0.06]">
          <div className="px-3 py-3 space-y-1">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-white/60 hover:text-white hover:bg-white/[0.05] rounded-xl transition-all text-sm font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
