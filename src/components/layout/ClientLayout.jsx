"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// ✅ ייבוא נקי - וודא שהקובץ אכן נמצא בנתיב הזה
import { Venture, User } from "@/api/entities";

import {
  LayoutDashboard,
  Home,
  Users,
  DollarSign,
  TrendingUp,
  Shield,
  ExternalLink,
  FlaskConical,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { canAccessFeature } from "@/components/utils/phaseValidation";

const createPageUrl = (path) => `/${path}`;

const getNavigationItems = (venture) => {
  const currentPhase = venture ? venture.phase : "idea";

  const allItems = [
    { title: "Home", url: "/", icon: Home, alwaysActive: true },
    { title: "Dashboard", url: createPageUrl("dashboard"), icon: LayoutDashboard, alwaysActive: true },
    {
      title: "Beta Page",
      url: venture ? `/beta-testing?id=${venture.id}` : "#",
      icon: FlaskConical,
      phases: ["beta", "growth"],
    },
    {
      title: "Angel Arena",
      url: createPageUrl("angel-arena"),
      icon: Users,
      phases: ["mvp", "mlp", "beta", "growth"],
    },
    {
      title: "VC Marketplace",
      url: createPageUrl("vc-marketplace"),
      icon: DollarSign,
      feature: "vc_marketplace",
    },
  ];

  return allItems.filter((item) => {
    if (item.alwaysActive) return true;
    if (item.feature && venture) return canAccessFeature(venture, item.feature);
    if (item.phases && venture) return item.phases.includes(currentPhase);
    return false;
  });
};

export default function ClientLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState(null);
  const [venture, setVenture] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ תיקון לולאת הרינדור: שימוש ב-isMounted ובדיקה חכמה של נתיבים
  useEffect(() => {
    let isMounted = true; // מונע עדכון סטייט על קומפוננטה שפורקה

    const loadData = async () => {
      // אם אנחנו בדפי התחברות, אין טעם לבדוק יוזר/מיזם
      const isAuthPage =
        pathname?.startsWith("/login") ||
        pathname?.startsWith("/register") ||
        pathname?.startsWith("/reset-password") ||
        pathname?.startsWith("/auth");

      const isVentureLanding = pathname?.includes("venture-landing");

      if (isAuthPage || isVentureLanding) {
        if (isMounted) {
          setUser(null);
          setVenture(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        if (isMounted) setIsLoading(true);

        // קבלת פרטי המשתמש מה-API
        const currentUser = await User.me();
        
        if (!isMounted) return;

        if (!currentUser) {
          setUser(null);
          setVenture(null);
          // ⚠️ הערה: המידלוור (middleware.js) יטפל בניתוב החוצה אם הדף חסום
        } else {
          setUser(currentUser);
          
          // טעינת המיזם של המשתמש
          const ventures = await Venture.filter(
            { created_by: currentUser.email },
            "-created_date"
          );
          
          if (isMounted) {
            setVenture(ventures[0] || null);
          }
        }
      } catch (error) {
        console.error("Failed to load layout data:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [pathname]); // ירוץ מחדש רק כשהנתיב משתנה

  const navigationItems = getNavigationItems(venture);
  const userPhase = venture ? venture.phase : "idea";

  // לוגיקת דף נחיתה
  let landingPageItem = { url: "#", isExternal: false, title: "Landing Page" };
  if (venture) {
    if (venture.mlp_completed) {
      landingPageItem.url = `/mlp-landing-page?id=${venture.id}`;
      landingPageItem.isExternal = false;
    } else {
      landingPageItem.url = venture.landing_page_url || "#";
      landingPageItem.isExternal = venture.landing_page_url?.startsWith("http") || false;
    }
  }

  // ✅ מעקף לדפי נחיתה (ללא סרגל צד)
  if (pathname && pathname.includes("venture-landing")) {
    return <div className="min-h-screen bg-white">{children}</div>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar className="border-r border-gray-200">
          <SidebarHeader className="border-b border-gray-200 p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">StartZig</h2>
                <p className="text-xs text-gray-500">Admin/Founder OS</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-2">
            {!isLoading && (
              <>
                <SidebarGroup>
                  <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase px-2 py-2">
                    Main Menu
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {/* כפתור דף הבית */}
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild className={pathname === "/" ? "bg-indigo-50 text-indigo-700" : ""}>
                          <Link href="/" className="flex items-center gap-3 px-3 py-2">
                            <Home className="w-4 h-4" />
                            <span className="font-medium">Home</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      {/* תפריט דינמי לפי שלב המיזם */}
                      {navigationItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild className={pathname === item.url ? "bg-indigo-50 text-indigo-700" : ""}>
                              <Link href={item.url} className="flex items-center gap-3 px-3 py-2">
                                <Icon className="w-4 h-4" />
                                <span className="font-medium">{item.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>

                {/* ✅ חלק המנהל - מופיע רק אם המשתמש אדמין */}
                {user && user.role === "admin" && (
                  <SidebarGroup>
                    <SidebarGroupLabel className="text-xs font-medium text-red-500 uppercase px-2 py-2">
                      System Admin
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        <SidebarMenuItem>
                          <SidebarMenuButton asChild className={pathname === "/admin" ? "bg-red-50 text-red-700" : ""}>
                            <Link href="/admin" className="flex items-center gap-3 px-3 py-2">
                              <Shield className="w-4 h-4" />
                              <span className="font-medium">Global Dashboard</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                )}
              </>
            )}
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">{user?.email || "Guest"}</p>
                <p className="text-xs text-gray-500 capitalize">{venture?.phase || "No Active Venture"}</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white border-b border-gray-200 px-6 py-4 md:hidden flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-xl font-bold italic">StartZig</h1>
          </header>
          <div className="flex-1 overflow-auto bg-white p-4">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}