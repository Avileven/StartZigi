// ClientLayout 150526 CHANGE MOBILE
"use client";

import { supabase } from '@/lib/supabase';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// ✅ FIX: remove /src from imports (Vercel path + you already moved entities)
// was: "@/src/api/entities"
import { Venture, User } from "@/api/entities";
import PhaseCompletionModal from "@/components/ventures/PhaseCompletionModal";

import {
  LayoutDashboard,
  Home,
  Users,
  DollarSign,
  TrendingUp,
  Shield,
  ExternalLink,
  FlaskConical,
  UserCircle,
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
  useSidebar,
} from "@/components/ui/sidebar";

import { canAccessFeature } from "@/components/utils/phaseValidation";

const createPageUrl = (path) => `/${path}`;

const getNavigationItems = (venture) => {
  const currentPhase = venture ? venture.phase : "idea";

  const allItems = [
    
// ✅ FIX: Home route is "/" (you deleted app/home)
{ title: "Home", url: "/", icon: Home, alwaysActive: true },


    { title: "Dashboard", url: createPageUrl("dashboard"), icon: LayoutDashboard, alwaysActive: true },
    {
      title: "Beta Page",
      // ✅ FIX: folder is /beta-testing
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
      // ✅ FIX: folder is /vc-marketplace
url: createPageUrl("vc-marketplace"),

      icon: DollarSign,
      feature: "vc_marketplace",
    },
  ];

  return allItems.filter((item) => {
    if (item.alwaysActive) return true;
    // [ADDED] Hide VC Marketplace from nav once venture has received VC investment
    if (item.feature === 'vc_marketplace' && venture?.vc_funded) return false;
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
  // [ONBOARDING] Listens for the step broadcast from the Dashboard's first-time walkthrough
  const [onboardingStep, setOnboardingStep] = useState(-1);

  useEffect(() => {
    const handler = (e) => setOnboardingStep(e.detail.step);
    window.addEventListener('onboardingStep', handler);
    return () => window.removeEventListener('onboardingStep', handler);
  }, []);
  
  // Phase completion modal state
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [completedPhase, setCompletedPhase] = useState(null);
  // [CREDITS] קרדיטים של המשתמש
  const [credits, setCredits] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      try {
        // ✅ FIX 1: never run auth/user loading inside auth pages or auth callback (prevents flicker loops)
        const isAuthPage =
          pathname?.startsWith("/login") ||
          pathname?.startsWith("/register") ||
          pathname?.startsWith("/reset-password") ||
          pathname?.startsWith("/auth"); // callback routes

        // ✅ FIX 2: keep bypass for venture-landing and beta-testing (public / anonymous)
        const isVentureLanding = pathname?.includes("venture-landing");
        const isBetaTesting = pathname?.includes("beta-testing");

        if (isAuthPage || isVentureLanding || isBetaTesting) {
          setUser(null);
          setVenture(null);
          setIsLoading(false);
          return;
        }

        // ✅ FIX 3: DO NOT redirect from layout (middleware handles protection)
        // If no session → User.me() should return null; we just show as logged-out.
        const currentUser = await User.me();
        setUser(currentUser || null);

        if (!currentUser) {
          // not logged in; let middleware handle redirects on protected pages
          setVenture(null);
          setIsLoading(false);
          return;
        }

        // ✅ NOTE: keep original behavior (ventures owned by created_by)
        // If you later want "co-founder ventures" too, we’ll change this intentionally.
        const ventures = await Venture.filter(
          { created_by: currentUser.email },
          "-created_date"
        );
        setVenture(ventures[0] || null);
        
        // [CREDITS] טעינת קרדיטים של המשתמש
        if (currentUser) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('credits_used, credits_limit, plan')
            .eq('id', currentUser.id)
            .single();
          if (profile) setCredits(profile);
        }
        
        // ✨ Check for phase change and show completion modal
        if (ventures[0]) {
          const currentPhase = ventures[0].phase;

          // [PHASE MODAL] קריאת last_seen_phase מה-DB במקום localStorage
          const { data: profilePhase } = await supabase
            .from('user_profiles')
            .select('last_seen_phase')
            .eq('id', currentUser.id)
            .single();

          const lastSeenPhase = profilePhase?.last_seen_phase || null;

          // אם השלב השתנה - מציגים את המודל
          if (lastSeenPhase && lastSeenPhase !== currentPhase) {
            setCompletedPhase(lastSeenPhase);
            setShowPhaseModal(true);
          }

          // עדכון last_seen_phase ב-DB
          await supabase
            .from('user_profiles')
            .update({ last_seen_phase: currentPhase })
            .eq('id', currentUser.id);
        }
      } catch (error) {
        console.error("Failed to load user or venture data:", error);
        setUser(null);
        setVenture(null);
      }

      setIsLoading(false);
    };

    loadData();
  }, [pathname]);

  const navigationItems = getNavigationItems(venture);
  const userPhase = venture ? venture.phase : "idea";

  let landingPageItem = {
    url: "#",
    isExternal: false,
    title: "Landing Page",
  };

  if (venture) {
    if (venture.mlp_completed) {
      // ✅ FIX: folder is /mlp-landing-page
landingPageItem.url = `/mlp-landing-page?id=${venture.id}`;
      landingPageItem.isExternal = false;
    } else {
      landingPageItem.url = venture.landing_page_url || "#";
      landingPageItem.isExternal = venture.landing_page_url?.startsWith("http") || false;
    }
  }

  // ✅ keep bypass render for public pages (no sidebar)
  if (pathname && (pathname.includes("venture-landing") || pathname.includes("beta-testing"))) {
    return <div className="min-h-screen bg-white">{children}</div>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar className="border-r border-gray-200 z-[100] bg-white">
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

          <SidebarContent className="p-2" onClick={() => { if (typeof window !== 'undefined' && window.innerWidth < 768) { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); } }}>
            {!isLoading && (
              <>
                <SidebarGroup className="relative">
                  {onboardingStep === 0 && (
                    <div className="absolute -inset-1 rounded-xl border-2 border-indigo-400 pointer-events-none z-20"></div>
                  )}
                  <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 py-2">
                    Navigation
                  </SidebarGroupLabel>

                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          className={`mb-1 rounded-lg transition-colors duration-200 ${
                            
// ✅ FIX: Home active state
pathname === "/"

                              ? "bg-indigo-50 text-indigo-700"
                              : "hover:bg-indigo-50 hover:text-indigo-700"
                          }`}
                        >
                          <Link
                            href="/"
                            className="flex items-center gap-3 px-3 py-2"
                          >
                            <Home className="w-4 h-4 flex-shrink-0" />
                            <span className="font-medium">Home</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          className={`mb-1 rounded-lg transition-colors duration-200 ${
                            pathname === createPageUrl("dashboard")
                              ? "bg-indigo-50 text-indigo-700"
                              : "hover:bg-indigo-50 hover:text-indigo-700"
                          }`}
                        >
                          <Link
                            href={createPageUrl("dashboard")}
                            className="flex items-center gap-3 px-3 py-2"
                          >
                            <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                            <span className="font-medium">Dashboard</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      {/* ========================================
                          🆕 EXIT PATH - ADDED FOR M&A FEATURE
                          ======================================== */}
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          className={`mb-1 rounded-lg transition-colors duration-200 ${
                            pathname === "/ma"
                              ? "bg-indigo-50 text-indigo-700"
                              : "hover:bg-indigo-50 hover:text-indigo-700"
                          }`}
                        >
                          <Link
                            href="/ma"
                            className="flex items-center gap-3 px-3 py-2"
                          >
                            <TrendingUp className="w-4 h-4 flex-shrink-0" />
                            <span className="font-medium">Exit Path</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      {/* ======================================== */}

                      {landingPageItem && (
                        <SidebarMenuItem className="relative">
                          {onboardingStep === 4 && (
                            <div className="absolute -inset-1 rounded-lg border-2 border-indigo-400 pointer-events-none z-20"></div>
                          )}
                          <SidebarMenuButton
                            asChild
                            className="mb-1 rounded-lg transition-colors duration-200 hover:bg-indigo-50 hover:text-indigo-700"
                          >
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
                              <Link
                                href={landingPageItem.url}
                                className="flex items-center gap-3 px-3 py-2"
                              >
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
                                  <Link
                                    href={item.url}
                                    className="flex items-center gap-3 px-3 py-2"
                                  >
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

                {/* [MY ACCOUNT] לינק לדף החשבון - זמין מכל שלב */}
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          className={`mb-1 rounded-lg transition-colors duration-200 ${
                            pathname === "/my-account"
                              ? "bg-indigo-50 text-indigo-700"
                              : "hover:bg-indigo-50 hover:text-indigo-700"
                          }`}
                        >
                          <Link href="/my-account" className="flex items-center gap-3 px-3 py-2">
                            <UserCircle className="w-4 h-4 flex-shrink-0" />
                            <span className="font-medium">My Account</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
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
                              pathname === createPageUrl("admin")
                                ? "bg-red-50 text-red-700"
                                : "hover:bg-red-50 hover:text-red-700"
                            }`}
                          >
                            <Link
                              href={createPageUrl("admin")}
                              className="flex items-center gap-3 px-3 py-2"
                            >
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
                  {user?.email ? user.email.charAt(0).toUpperCase() : "E"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">
                  {user?.email || "Entrepreneur"}
                </p>
                
                {/* [CREDITS] תצוגת תכנית וקרדיטים - ברירת מחדל Free */}
                <p className="text-xs truncate mt-0.5">
                  <span className="text-indigo-500 font-medium capitalize">
                    {credits?.plan || 'Free'} Plan
                  </span>
                </p>
                
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden w-full">
          <header className="bg-white border-b border-gray-200 px-4 py-3 md:hidden">
            <div className="flex items-center justify-center gap-3">
              <SidebarTrigger className="flex items-center justify-center gap-2 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 w-36 h-9">
                Navigation
              </SidebarTrigger>
              <button
                className="flex items-center justify-center gap-2 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 w-36 h-9"
                onClick={() => { window.dispatchEvent(new CustomEvent('openToolbox')); }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                Toolbox
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-auto">{children}</div>
        </main>
      </div>
      
      {/* Phase Completion Modal */}
      {/* [DISABLED — 22/07/2026] Presentation content is outdated / conflicting with Dashboard's copy. Re-enable once updated. */}
      <PhaseCompletionModal
        isOpen={false}
        onClose={() => {
          setShowPhaseModal(false);
          // Mark as seen - update localStorage to current phase
          if (venture) {
            localStorage.setItem('lastSeenPhase', venture.phase);
          }
        }}
        completedPhase={completedPhase}
      />
    </SidebarProvider>
  );
}




