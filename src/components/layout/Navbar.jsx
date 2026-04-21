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
            <Link href="/" className="flex items-center gap-2">
              <svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="700 700 620 620" preserveAspectRatio="xMidYMid meet">
                <g fill="#949597FF"><path d="M 874.42 1040.08 C 874.19 1039.85 874.00 990.02 874.00 929.33 L 874.00 819.00 L 999.23 819.00 L 1124.45 819.00 L 1116.48 827.25 C 1112.09 831.79 1104.46 839.66 1099.52 844.75 L 1090.54 854.00 L 999.77 854.00 L 909.00 854.00 L 909.00 930.00 L 909.00 1006.00 L 935.55 1006.00 C 958.14 1006.00 961.98 1006.21 961.30 1007.41 C 960.86 1008.19 953.66 1015.79 945.29 1024.31 L 930.08 1039.79 L 902.46 1040.14 C 887.26 1040.34 874.65 1040.31 874.42 1040.08Z"/></g>
                <g fill="#949597FF"><path d="M 814.11 1236.20 C 813.36 1235.95 813.00 1230.41 813.00 1218.92 L 813.00 1202.00 L 816.75 1201.87 C 818.81 1201.80 888.90 1201.69 972.50 1201.62 L 1124.50 1201.50 L 1124.50 1121.00 L 1124.50 1040.50 L 1044.50 1040.49 C 992.20 1040.48 964.61 1040.14 964.81 1039.49 C 964.98 1038.95 972.35 1031.19 981.19 1022.25 L 997.26 1006.00 L 1078.63 1006.00 L 1160.01 1006.00 L 1159.75 1121.25 L 1159.50 1236.50 L 987.36 1236.54 C 892.68 1236.56 814.72 1236.41 814.11 1236.20Z"/></g>
                <g fill="#B83B35FF"><path d="M 1008.00 995.00 C 1008.00 993.90 1011.93 989.41 1021.87 979.16 C 1025.51 975.40 1040.20 960.02 1054.50 944.99 C 1068.80 929.96 1083.88 914.16 1088.00 909.88 C 1129.34 866.93 1139.94 855.71 1139.97 854.86 C 1140.03 853.50 1134.66 852.98 1127.12 853.61 C 1117.19 854.44 1110.00 853.47 1110.00 851.30 C 1110.00 850.44 1111.01 848.74 1112.25 847.53 C 1113.49 846.32 1120.30 839.42 1127.40 832.19 L 1140.30 819.04 L 1180.25 818.77 C 1202.22 818.62 1220.65 818.79 1221.22 819.13 C 1221.78 819.48 1222.08 820.25 1221.87 820.83 C 1221.67 821.41 1215.42 828.29 1208.00 836.10 C 1200.58 843.92 1193.15 851.74 1191.50 853.49 C 1189.85 855.24 1182.15 863.38 1174.40 871.58 C 1166.64 879.79 1159.21 887.68 1157.90 889.11 C 1154.52 892.79 1125.55 923.34 1112.96 936.49 C 1107.17 942.55 1098.39 951.72 1093.46 956.88 C 1088.53 962.04 1081.14 969.69 1077.04 973.88 C 1072.94 978.07 1067.12 984.20 1064.11 987.50 C 1061.09 990.80 1057.70 994.05 1056.56 994.71 C 1053.94 996.26 1008.00 996.53 1008.00 995.00Z"/></g>
                <g fill="#B83B35FF"><path d="M 824.00 1190.83 C 824.00 1190.18 829.78 1183.77 836.84 1176.58 C 843.89 1169.39 853.23 1159.70 857.59 1155.06 C 861.94 1150.42 866.89 1145.24 868.59 1143.56 C 870.29 1141.88 877.02 1134.88 883.54 1128.00 C 890.06 1121.12 900.83 1109.88 907.46 1103.00 C 914.10 1096.12 927.56 1082.09 937.39 1071.81 C 947.22 1061.53 955.99 1052.84 956.87 1052.49 C 959.31 1051.56 1003.20 1051.80 1004.16 1052.76 C 1004.61 1053.21 1002.40 1056.30 999.24 1059.62 C 992.21 1067.01 978.20 1081.81 960.13 1100.91 C 952.63 1108.84 944.70 1117.18 942.50 1119.44 C 938.59 1123.47 926.65 1135.95 906.60 1157.00 C 901.09 1162.78 891.24 1173.01 884.69 1179.75 L 872.80 1192.00 L 848.40 1192.00 C 830.42 1192.00 824.00 1191.69 824.00 1190.83Z"/></g>
              </svg>
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
