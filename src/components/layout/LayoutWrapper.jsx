// C:\STRARTZIG\src\components\layout\LayoutWrapper v1226
"use client";

import ClientLayout from "./ClientLayout";
import { usePathname } from "next/navigation";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  // ✅ דפים ציבוריים שמחוץ לדשבורד - לא יקבלו את ה-ClientLayout
  const publicPages = [
    "/",
    "/login",
    "/register",
    "/why-startzig",
    "/pricing",
    "/community"
  ];

  if (publicPages.includes(pathname)) {
    return <>{children}</>;
  }

  return <ClientLayout>{children}</ClientLayout>;
}