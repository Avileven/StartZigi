"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
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
              <div className="flex items-center gap-3 cursor-pointer">
                <img src="data:image/png;base64,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" alt="StartZig" style={{width: 44, height: 44, imageRendering: 'pixelated'}} />
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  StartZig
                </span>
              </div>
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
                    <Link href="/community" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10">
                      Community
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
