"use client";

import ClientLayout from "./ClientLayout";
import Footer from "./Footer"; 
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
    "/disclaimer"
  ];

  // דפי כניסה/הרשמה - נשארים נקיים לגמרי כמו במקור (בלי לעטוף ב-DIV)
  if (pathname === "/login" || pathname === "/register") {
    return <>{children}</>;
  }

  // דפי שיווק - מקבלים פוטר אבל נשארים בחוץ (כמו המקור שלך)
  if (marketingPages.includes(pathname)) {
    return (
      <>
        {children}
        <Footer />
      </>
    );
  }

  // כל השאר (Dashboard)
  return <ClientLayout>{children}</ClientLayout>;
}