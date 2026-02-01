"use client";

import ClientLayout from "./ClientLayout";
import Footer from "./Footer"; 
import { usePathname } from "next/navigation";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  const publicPages = [
    "/",
    "/login",
    "/register",
    "/why-startzig",
    "/pricing",
    "/community",
    "/how-it-works" // התווסף לרשימה
  ];

  if (publicPages.includes(pathname)) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-900">
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  return <ClientLayout>{children}</ClientLayout>;
}