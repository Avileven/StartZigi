"use client";

import ClientLayout from "./ClientLayout";
import Footer from "./Footer"; 
import { usePathname } from "next/navigation";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  // כל הדפים שצריכים להיראות כמו אתר אינטרנט רגיל (כולל פוטר)
  const publicPages = [
    "/",
    "/login",
    "/register",
    "/why-startzig",
    "/pricing",
    "/community",
    "/how-it-works",
    "/terms",           // נוסף
    "/privacypolicy",   // נוסף
    "/disclaimer"       // נוסף
  ];

  if (publicPages.includes(pathname)) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-900 text-white">
        <main className="flex-grow">
          {children}
        </main>
        {/* עכשיו הפוטר יופיע גם ב-Terms, Privacy ו-Disclaimer */}
        <Footer />
      </div>
    );
  }

  // דפי אפליקציה מחוברים (Dashboard) - ללא פוטר
  return <ClientLayout>{children}</ClientLayout>;
}