"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false); // State חדש לדרופדאון

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      }
    };
    checkUser();
  }, []);

  const handleLogin = () => {
    const next = window.location.pathname + window.location.search;
    window.location.href = `/login?next=${encodeURIComponent(next)}`;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-gradient-to-b from-indigo-500 to-black to-75%">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          <div className="flex-shrink-0">
            <Link href="/">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent cursor-pointer">
                StartZig
              </span>
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white p-2"
            >
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-4 border-r border-white/10 pr-4">
              <Link href="/why-startzig" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Why StartZig
              </Link>
              <Link href="/community" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Community
              </Link>
              <Link href="/pricing" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Pricing
              </Link>

              {/* Resources Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setIsResourcesOpen(true)}
                onMouseLeave={() => setIsResourcesOpen(false)}
              >
                <button className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center">
                  Resources 
                  <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isResourcesOpen && (
                  <div className="absolute top-full left-0 w-48 bg-black/90 border border-white/10 rounded-md py-2 shadow-xl">
                    <Link href="/blog" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10">
                      Blog
                    </Link>
                    <Link href="/how-it-works" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10">
                      How it Works
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link href="/dashboard">
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                      Go to dashboard
                    </button>
                  </Link>
                  <button onClick={handleLogout} className="text-white hover:bg-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleLogin} className="text-white hover:bg-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                    Login
                  </button>
                  <Link href="/register">
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                      Sign Up
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 border-b border-white/10 px-4 pt-2 pb-6 space-y-2">
          <Link href="/why-startzig" onClick={() => setIsMenuOpen(false)} className="block text-gray-300 hover:text-white px-3 py-3 rounded-md text-base font-medium">
            Why StartZig
          </Link>
          <Link href="/community" onClick={() => setIsMenuOpen(false)} className="block text-gray-300 hover:text-white px-3 py-3 rounded-md text-base font-medium">
            Community
          </Link>
          <Link href="/pricing" onClick={() => setIsMenuOpen(false)} className="block text-gray-300 hover:text-white px-3 py-3 rounded-md text-base font-medium">
            Pricing
          </Link>
          
          <div className="text-gray-500 px-3 py-2 text-xs font-bold uppercase">Resources</div>
          <Link href="/blog" onClick={() => setIsMenuOpen(false)} className="block text-gray-300 hover:text-white px-6 py-2 rounded-md text-base font-medium">
            Blog
          </Link>
          <Link href="/how-it-works" onClick={() => setIsMenuOpen(false)} className="block text-gray-300 hover:text-white px-6 py-2 rounded-md text-base font-medium">
            How it Works
          </Link>

          <div className="pt-4 border-t border-white/10 flex flex-col space-y-3">
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="w-full">
                  <button className="w-full bg-indigo-600 text-white py-3 rounded-md font-medium">Go to dashboard</button>
                </Link>
                <button onClick={handleLogout} className="w-full text-white bg-gray-700 hover:bg-gray-600 py-3 rounded-md font-medium">Logout</button>
              </>
            ) : (
              <>
                <button onClick={handleLogin} className="w-full text-white bg-gray-700 hover:bg-gray-600 py-3 rounded-md font-medium">Login</button>
                <Link href="/register" onClick={() => setIsMenuOpen(false)} className="w-full">
                  <button className="w-full bg-indigo-600 text-white py-3 rounded-md font-medium">Sign Up</button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}