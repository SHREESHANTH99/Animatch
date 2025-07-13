import React, { useState, useEffect } from 'react';
import { Bell, User, Menu, X, Home, Compass, BookOpen, Star, TrendingUp, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AniMatchNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const {user,logout}=useAuth();
  console.log("User",user)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', icon: Home, href: '/home' },
    { name: 'Discover', icon: Compass, href: '/discover' },
    { name: 'My List', icon: BookOpen, href: 'library' },
    { name: 'Top Rated', icon: Star, href: '/top' },
    { name: 'Trending', icon: TrendingUp, href: '/trending' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300  ${
      isScrolled 
        ? 'bg-gradient-to-r from-indigo-900/95 via-purple-900/95 to-pink-900/95 backdrop-blur-lg shadow-lg' 
        : 'bg-transparent'
    }`}>
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-900/95 via-purple-900/95 to-pink-900/95 backdrop-blur-lg shadow-lg border-gray-600 border-1">
        <div className="flex items-center justify-between h-16 ">
          <div className="flex items-center">
            <div className="flex-shrink-0 group cursor-pointer">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200 shadow-lg shadow-cyan-500/50">
                    <span className="text-white font-bold text-lg">A</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full animate-pulse shadow-lg shadow-pink-500/50"></div>
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
                  AniMatch
                </div>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-1">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="group px-4 py-2 rounded-lg text-gray-100 hover:text-white hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-purple-500/20 transition-all duration-200 flex items-center space-x-2 border border-transparent hover:border-cyan-400/30 hover:shadow-lg hover:shadow-cyan-500/20"
                >
                  <item.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">{item.name}</span>
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-200 hover:text-white hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-purple-500/20 rounded-lg transition-all duration-200 border border-transparent hover:border-cyan-400/30 hover:shadow-lg hover:shadow-cyan-500/20">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full shadow-lg shadow-pink-500/50"></span>
            </button>
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-2 text-gray-200 hover:text-white hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-purple-500/20 rounded-lg transition-all duration-200 border border-transparent hover:border-cyan-400/30 hover:shadow-lg hover:shadow-cyan-500/20"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/50">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="hidden lg:block font-medium text-white">Profile</span>
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gradient-to-br from-indigo-900/95 via-purple-900/95 to-pink-900/95 backdrop-blur-lg rounded-lg shadow-lg shadow-cyan-500/20 border border-cyan-400/20 overflow-hidden">
                  <div className="px-4 py-3 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 border-b border-cyan-400/20">
                    <p className="text-sm text-white font-medium">{user?.username}</p>
                    <p className="text-xs text-cyan-300">Premium Member</p> 
                  </div>
                  <div className="py-1">
                    <a href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-200 hover:text-white hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-purple-500/20 transition-colors">
                      <User className="h-4 w-4 mr-2" />
                      My Profile
                    </a>
                    <a href="/settings" className="flex items-center px-4 py-2 text-sm text-gray-200 hover:text-white hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-purple-500/20 transition-colors">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </a>
                    <a href="/watchlist" className="flex items-center px-4 py-2 text-sm text-gray-200 hover:text-white hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-purple-500/20 transition-colors">
                      <BookOpen className="h-4 w-4 mr-2" />
                      My Watchlist
                    </a>
                    <hr className="my-1 border-cyan-400/20" />
                    {user && <a href onClick={logout} className="flex items-center px-4 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors">
                      <X className="h-4 w-4 mr-2" />
                      Sign Out
                    </a>}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-200 hover:text-white hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-purple-500/20 rounded-lg transition-all duration-200 border border-transparent hover:border-cyan-400/30"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-gradient-to-br from-indigo-900/95 via-purple-900/95 to-pink-900/95 backdrop-blur-lg border-t border-cyan-400/20 shadow-lg shadow-cyan-500/20">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center space-x-2 px-3 py-2 text-gray-200 hover:text-white hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-purple-500/20 rounded-lg transition-all duration-200 border border-transparent hover:border-cyan-400/30"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}