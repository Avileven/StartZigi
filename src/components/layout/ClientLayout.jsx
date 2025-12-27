"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// FIX: remove /src from imports (Vercel path + you already moved entities)
// was: "@/src/api/entities"
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
    { title: "Home", url: createPageUrl("home"), icon: Home, alwaysActive: true },
    { title: "Dashboard", url: createPageUrl("dashboard"), icon: LayoutDashboard, alwaysActive: true },
    { title: "Beta Page", url: venture ? createPageUrl(`BetaTesting?id=${venture.id}`) : "#", icon: FlaskConical, phases: ["beta", "growth"] },
    { title: "Angel Arena", url: createPageUrl("angel-arena"), icon: Users, phases: ["mvp", "mlp", "beta", "growth"] },
    { title: "VC Marketplace", url: createPageUrl("vcmarketplace"), icon: DollarSign, feature: "vc_marketplace" },
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

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      try {
        // =========================
        // ✅ FIX #1: PUBLIC ROUTES BYPASS
        // למה? כי קודם עשינו bypass רק ל-venture-landing,
        // ואז /register היה נטען לשניה ומיד נשלח ל-/login ע"י guard.
        // =========================
        const isPublicRoute =
          pathname === "/" ||
          pathname.startsWith("/login") ||
          pathname.startsWith("/register") ||
          pathname.startsWith("/reset-password") ||
          pathname.startsWith("/venture-landing");

        if (isPublicRoute) {
          setUser(null);
          setVenture(null);
          setIsLoading(false);
          return;
        }

        // =========================
        // ✅ FIX #2: define currentUser before using it (כבר היה אצלך)
        // =========================
        const currentUser = await User.me();

        // =========================
        // ✅ FIX #3: אם אין סשן → שלח ל-login עם next (ולא סתם /login)
        // למה? כדי לחזור אח"כ לעמוד הנכון + פחות "קפיצות"
        // =========================
        if (!currentUser) {
          router.replace(`/login?next=${encodeURIComponent(pathname)}`);
          setIsLoading(false);
          return;
        }

        setUser(currentUser);

        // NOTE: leaving your original filter logic as-is (created_by).
        // If later you want founders access too, we'll change it deliberately.
        const ventures = await Venture.filter(
          { created_by: currentUser.email },
          "-created_date"
        );
        setVenture(ventures[0] || null);
      } catch (error) {
        console.error("Failed to load user or venture data:", error);
        setUser(null);
        setVenture(null);
      }

      setIsLoading(false);
    };

    loadData();
    // ✅ FIX #4: add router to deps to avoid React warnings and keep behavior stable
  }, [pathname, router]);

  const navigationItems = getNavigationItems(venture);
  const userPhase = venture ? venture.phase : "idea";

  let landingPageItem = {
    url: "#",
    isExternal: false,
    title: "Landing Page",
  };

  if (venture) {
    if (venture.mlp_completed) {
      landingPageItem.url = createPageUrl(`MLPLandingPage?id=${venture.id}`);
      landingPageItem.isExternal = false;
    } else {
      landingPageItem.url = venture.landing_page_url || "#";
      landingPageItem.isExternal = venture.landing_page_url?.startsWith("http") || false;
    }
  }

  // (נשאר) ה-bypass הויזואלי ל-venture-landing — אבל עכשיו הוא לא היחיד (יש גם publicRoutes)
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
                <p className="text-xs text-gray-500">Build your startup</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-2">
            {!isLoading && (
              <>
                <SidebarGroup>
                  <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 py-2">
                    Navigation
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          className={`mb-1 rounded-lg transition-colors duration-200 ${
                            pathname === createPageUrl("Home")
                              ? "bg-indigo-50 text-indigo-700"
                              : "hover:bg-indigo-50 hover:text-indigo-700"
                          }`}
                        >
                          <Link href={createPageUrl("home")} className="flex items-center gap-3 px-3 py-2">
                            <Home className="w-4 h-4 flex-shrink-0" />
                            <span className="font-medium">Home</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          className={`mb-1 rounded-lg transition-colors duration-200 ${
                            pathname === createPageUrl("Dashboard")
                              ? "bg-indigo-50 text-indigo-700"
                              : "hover:bg-indigo-50 hover:text-indigo-700"
                          }`}
                        >
                          <Link href={createPageUrl("dashboard")} className="flex items-center gap-3 px-3 py-2">
                            <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                            <span className="font-medium">Dashboard</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      {landingPageItem && (
                        <SidebarMenuItem>
                          <SidebarMenuButton asChild className="mb-1 rounded-lg transition-colors duration-200 hover:bg-indigo-50 hover:text-indigo-700">
                            {landingPageItem.isExternal ? (
                              <a
                                href={landingPageItem.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 px-3 py-2"
                              >
                                <ExternalLink className="w-4 h-4 flex-shrink-0" />
                                <span className="font-medium">{landingPageItem.title}</span>
                              </a>
                            ) : (
                              <Link href={landingPageItem.url} className="flex items-center gap-3 px-3 py-2">
                                <ExternalLink className="w-4 h-4 flex-shrink-0" />
                                <span className="font-medium">{landingPageItem.title}</span>
                              </Link>
                            )}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )}

                      {navigationItems
                        .filter((item) => !item.alwaysActive)
                        .map((item) => {
                          const Icon = item.icon;
                          const activeStateClasses =
                            pathname === item.url && !item.external
                              ? "bg-indigo-50 text-indigo-700"
                              : "hover:bg-indigo-50 hover:text-indigo-700";

                          return (
                            <SidebarMenuItem key={item.title}>
                              <SidebarMenuButton
                                asChild
                                className={`mb-1 rounded-lg transition-colors duration-200 ${activeStateClasses}`}
                              >
                                {item.external ? (
                                  <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 px-3 py-2"
                                  >
                                    <Icon className="w-4 h-4 flex-shrink-0" />
                                    <span className="font-medium">{item.title}</span>
                                  </a>
                                ) : (
                                  <Link href={item.url} className="flex items-center gap-3 px-3 py-2">
                                    <Icon className="w-4 h-4 flex-shrink-0" />
                                    <span className="font-medium">{item.title}</span>
                                  </Link>
                                )}
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>

                {user && user.role === "admin" && (
                  <SidebarGroup>
                    <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 py-2">
                      Admin
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            asChild
                            className={`mb-1 rounded-lg transition-colors duration-200 ${
                              pathname === createPageUrl("AdminDashboard")
                                ? "bg-red-50 text-red-700"
                                : "hover:bg-red-50 hover:text-red-700"
                            }`}
                          >
                            <Link href={createPageUrl("AdminDashboard")} className="flex items-center gap-3 px-3 py-2">
                              <Shield className="w-4 h-4 flex-shrink-0" />
                              <span className="font-medium">Admin Dashboard</span>
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
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-medium text-sm">
                  {user ? user.email.charAt(0).toUpperCase() : "E"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">
                  {user ? user.email : "Entrepreneur"}
                </p>
                <p className="text-xs text-gray-500 truncate">Phase: {userPhase.replace("_", " ")}</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b border-gray-200 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-semibold">StartZig</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
