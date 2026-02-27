"use client";

import ClientLayout from "./ClientLayout";
import Footer from "./Footer";
import Navbar from "./Navbar";
import { usePathname } from "next/navigation";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  // דפים שצריכים פוטר (דף הבית ודפי תוכן)
  const marketingPages = [
    "/",
    "/why-startzig",
    "/pricing",
    "/community",
    "/how-it-works",
    "/terms",
    "/privacypolicy",
    "/disclaimer",
    "/createventure",
    "/ideas",
    "/blog"    
  ];

  // דפי כניסה/הרשמה - נשארים נקיים לגמרי כמו במקור (בלי לעטוף ב-DIV)
  if (pathname === "/login" || pathname === "/register") {
    return <>{children}</>;
  }

  // דפי שיווק - מקבלים Navbar + פוטר
  if (marketingPages.includes(pathname)) {
    return (
      <>
        <Navbar />
        <div className="pt-20">
          {children}
        </div>
        <Footer />
      </>
    );
  }

  // כל השאר (Dashboard)
  return <ClientLayout>{children}</ClientLayout>;
}
